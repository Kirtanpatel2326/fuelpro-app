"""Coupons: list, detail, claim, wallet, generate QR. Plus admin CRUD."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_current_user, get_admin_user
from models import CouponCreate, CouponUpdate
from services import issue_qr_token

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.get("")
async def list_coupons(user: dict = Depends(get_current_user)):
    from server import db
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor = db.coupons.find({"is_active": True, "expires_at": {"$gt": now_iso}}, {"_id": 0})
    coupons = await cursor.to_list(200)
    return {"success": True, "data": coupons}


@router.get("/wallet")
async def my_wallet(user: dict = Depends(get_current_user)):
    """Return the user's claimed coupons (pending redemptions)."""
    from server import db
    cursor = db.redemptions.find({"user_id": user["id"], "status": "PENDING"}, {"_id": 0}).sort("created_at", -1)
    redemptions = await cursor.to_list(500)
    # Attach coupon details
    out = []
    for r in redemptions:
        coupon = await db.coupons.find_one({"id": r["coupon_id"]}, {"_id": 0})
        if coupon:
            r["coupon"] = coupon
            out.append(r)
    return {"success": True, "data": out}


@router.get("/{coupon_id}")
async def get_coupon(coupon_id: str, user: dict = Depends(get_current_user)):
    from server import db
    c = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    if not c:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True, "data": c}


@router.post("/{coupon_id}/claim")
async def claim_coupon(coupon_id: str, user: dict = Depends(get_current_user)):
    from server import db
    c = await db.coupons.find_one({"id": coupon_id})
    if not c:
        raise HTTPException(status_code=404, detail="Coupon not found")
    # Check per-user limit
    used = await db.redemptions.count_documents({
        "user_id": user["id"],
        "coupon_id": coupon_id,
    })
    if used >= c.get("per_user_limit", 1):
        raise HTTPException(status_code=409, detail="You've already claimed this coupon")
    # Check max uses
    if c.get("max_uses") is not None and c.get("used_count", 0) >= c["max_uses"]:
        raise HTTPException(status_code=409, detail="Coupon fully redeemed")

    redemption = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "coupon_id": coupon_id,
        "token": str(uuid.uuid4()),
        "status": "PENDING",
        "redeemed_at": None,
        "redeemed_by": None,
        "expires_at": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.redemptions.insert_one(redemption)
    redemption.pop("_id", None)
    return {"success": True, "data": redemption}


@router.post("/{coupon_id}/generate-qr")
async def generate_qr(coupon_id: str, user: dict = Depends(get_current_user)):
    """Generate a one-time QR token (15-min expiry) for an already-claimed coupon."""
    from server import db
    # Find user's pending redemption for this coupon
    existing = await db.redemptions.find_one({
        "user_id": user["id"],
        "coupon_id": coupon_id,
        "status": "PENDING",
    })
    if not existing:
        raise HTTPException(status_code=404, detail="No claimed coupon found")
    # Refresh token and set 15-min expiry
    new_token = str(uuid.uuid4())
    from datetime import timedelta
    expires_at = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
    await db.redemptions.update_one(
        {"id": existing["id"]},
        {"$set": {"token": new_token, "expires_at": expires_at}},
    )
    return {"success": True, "data": {"token": new_token, "expires_at": expires_at, "redemption_id": existing["id"]}}


# -------- Admin CRUD --------
admin_router = APIRouter(prefix="/admin/coupons", tags=["admin-coupons"])


@admin_router.get("")
async def admin_list(_: dict = Depends(get_admin_user)):
    from server import db
    cursor = db.coupons.find({}, {"_id": 0}).sort("created_at", -1)
    return {"success": True, "data": await cursor.to_list(500)}


@admin_router.post("")
async def admin_create(payload: CouponCreate, _: dict = Depends(get_admin_user)):
    from server import db
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "used_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.coupons.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "data": doc}


@admin_router.patch("/{coupon_id}")
async def admin_update(coupon_id: str, payload: CouponUpdate, _: dict = Depends(get_admin_user)):
    from server import db
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.coupons.update_one({"id": coupon_id}, {"$set": updates})
    updated = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    if not updated:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True, "data": updated}


@admin_router.delete("/{coupon_id}")
async def admin_delete(coupon_id: str, _: dict = Depends(get_admin_user)):
    from server import db
    res = await db.coupons.delete_one({"id": coupon_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Coupon not found")
    return {"success": True}
