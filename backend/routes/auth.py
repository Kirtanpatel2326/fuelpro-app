"""Auth endpoints: register, login, logout, me, refresh."""
import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from models import RegisterIn, LoginIn
from auth_utils import (
    hash_password, verify_password, create_access_token, create_refresh_token,
    set_auth_cookies, clear_auth_cookies, get_current_user, decode_token,
)

router = APIRouter(prefix="/auth", tags=["auth"])

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


async def _check_lockout(db, ip: str, email: str):
    key = f"{ip}:{email.lower()}"
    rec = await db.login_attempts.find_one({"key": key})
    if rec and rec.get("count", 0) >= MAX_FAILED_ATTEMPTS:
        locked_until = rec.get("locked_until")
        if locked_until:
            try:
                lu = datetime.fromisoformat(locked_until)
                if datetime.now(timezone.utc) < lu:
                    raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in a few minutes.")
            except ValueError:
                pass
        await db.login_attempts.delete_one({"key": key})


async def _record_failed(db, ip: str, email: str):
    from datetime import timedelta
    key = f"{ip}:{email.lower()}"
    rec = await db.login_attempts.find_one({"key": key})
    count = (rec["count"] if rec else 0) + 1
    update = {"key": key, "count": count}
    if count >= MAX_FAILED_ATTEMPTS:
        update["locked_until"] = (datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)).isoformat()
    await db.login_attempts.update_one({"key": key}, {"$set": update}, upsert=True)


async def _clear_failed(db, ip: str, email: str):
    await db.login_attempts.delete_one({"key": f"{ip}:{email.lower()}"})


def _user_response(user: dict) -> dict:
    safe = {k: v for k, v in user.items() if k not in ("password_hash", "_id")}
    return safe


@router.post("/register")
async def register(payload: RegisterIn, request: Request, response: Response):
    from server import db
    email = payload.email.lower()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Determine tier (Bronze for new users)
    bronze = await db.tiers.find_one({"name": "Bronze"})
    if not bronze:
        raise HTTPException(status_code=500, detail="Tiers not seeded")

    # Handle referral
    referred_by_id = None
    if payload.referral_code:
        referrer = await db.users.find_one({"referral_code": payload.referral_code.upper()})
        if referrer:
            referred_by_id = referrer["id"]

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": email,
        "password_hash": hash_password(payload.password),
        "name": payload.name,
        "phone": payload.phone,
        "avatar_url": None,
        "birthday": payload.birthday,
        "referral_code": (payload.name.split()[0][:4] + "-" + str(uuid.uuid4())[:6]).upper(),
        "referred_by_id": referred_by_id,
        "tier_id": bronze["id"],
        "total_points": 100,  # welcome bonus
        "lifetime_points": 100,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)

    # Welcome points transaction
    await db.points_transactions.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "points": 100,
        "type": "WELCOME",
        "description": "Welcome to FuelPro! Here's 100 bonus points.",
        "purchase_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    # Auto-assign the "Welcome Bonus" coupon as a claimed redemption (pending)
    welcome_coupon = await db.coupons.find_one({"title": {"$regex": "^Welcome Bonus"}})
    if welcome_coupon:
        await db.redemptions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "coupon_id": welcome_coupon["id"],
            "token": str(uuid.uuid4()),
            "status": "PENDING",
            "redeemed_at": None,
            "redeemed_by": None,
            "expires_at": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    access = create_access_token(user_id, email, "user")
    refresh = create_refresh_token(user_id)
    set_auth_cookies(response, access, refresh)
    return {"success": True, "data": _user_response(user_doc)}


@router.post("/login")
async def login(payload: LoginIn, request: Request, response: Response):
    from server import db
    ip = request.client.host if request.client else "unknown"
    email = payload.email.lower()
    await _check_lockout(db, ip, email)
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        await _record_failed(db, ip, email)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await _clear_failed(db, ip, email)
    access = create_access_token(user["id"], email, user.get("role", "user"))
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"success": True, "data": _user_response(user)}


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookies(response)
    return {"success": True}


@router.get("/me")
async def me(user: dict = Depends(get_current_user)):
    return {"success": True, "data": user}


@router.post("/refresh")
async def refresh_token(request: Request, response: Response):
    from server import db
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        payload = decode_token(token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"id": payload["sub"]})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        access = create_access_token(user["id"], user["email"], user.get("role", "user"))
        new_refresh = create_refresh_token(user["id"])
        set_auth_cookies(response, access, new_refresh)
        return {"success": True}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/social")
async def social_login(payload: dict, request: Request, response: Response):
    from server import db
    
    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required from social provider")
    email = email.lower()
    
    user = await db.users.find_one({"email": email})
    if not user:
        # Determine tier (Bronze for new users)
        bronze = await db.tiers.find_one({"name": "Bronze"})
        
        user_id = str(uuid.uuid4())
        user = {
            "id": user_id,
            "email": email,
            "password_hash": "", # No password for social login
            "name": payload.get("name", email.split("@")[0]),
            "phone": None,
            "avatar_url": payload.get("picture"),
            "birthday": None,
            "referral_code": (email.split("@")[0][:4] + "-" + str(uuid.uuid4())[:6]).upper(),
            "referred_by_id": None,
            "tier_id": bronze["id"] if bronze else "bronze",
            "total_points": 100,  # welcome bonus
            "lifetime_points": 100,
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user)
        
    access = create_access_token(user["id"], email, user.get("role", "user"))
    refresh = create_refresh_token(user["id"])
    set_auth_cookies(response, access, refresh)
    return {"success": True, "data": _user_response(user)}
