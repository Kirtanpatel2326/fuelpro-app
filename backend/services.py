"""Business logic: points, tier upgrades, QR token generation."""
import math
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional


async def get_user_tier(db, tier_id: str) -> dict:
    return await db.tiers.find_one({"id": tier_id}, {"_id": 0})


async def compute_points(db, amount: float, tier_id: str) -> int:
    tier = await get_user_tier(db, tier_id)
    multiplier = tier["multiplier"] if tier else 1.0
    return math.floor(amount * 10 * multiplier)


async def check_tier_upgrade(db, user_id: str) -> Optional[dict]:
    """If user's lifetime points cross a higher tier, upgrade them. Returns new tier or None."""
    user = await db.users.find_one({"id": user_id})
    if not user:
        return None
    tiers = await db.tiers.find().sort("min_points", 1).to_list(100)
    new_tier = None
    for t in tiers:
        if user["lifetime_points"] >= t["min_points"]:
            new_tier = t
    if new_tier and new_tier["id"] != user["tier_id"]:
        await db.users.update_one({"id": user_id}, {"$set": {"tier_id": new_tier["id"]}})
        return new_tier
    return None


async def award_points(db, user_id: str, points: int, txn_type: str, description: str,
                       purchase_id: Optional[str] = None) -> dict:
    """Adds (or subtracts) points and records a transaction."""
    await db.users.update_one(
        {"id": user_id},
        {"$inc": {"total_points": points, "lifetime_points": max(points, 0)}},
    )
    txn = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "points": points,
        "type": txn_type,
        "description": description,
        "purchase_id": purchase_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.points_transactions.insert_one(txn)
    if points > 0:
        await check_tier_upgrade(db, user_id)
    txn.pop("_id", None)
    return txn


async def issue_qr_token(db, user_id: str, coupon_id: str) -> dict:
    """Creates a one-time QR redemption token with 15-min expiry."""
    token = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "coupon_id": coupon_id,
        "token": token,
        "status": "PENDING",
        "redeemed_at": None,
        "redeemed_by": None,
        "expires_at": (now + timedelta(minutes=15)).isoformat(),
        "created_at": now.isoformat(),
    }
    await db.redemptions.insert_one(doc)
    doc.pop("_id", None)
    return doc


def clean_doc(d: dict) -> dict:
    if not d:
        return d
    d.pop("_id", None)
    return d

def verify_staff_access(user: dict):
    from fastapi import HTTPException
    allowed = ["admin", "owner", "regional_manager", "store_manager", "staff"]
    if user.get("role") not in allowed:
        raise HTTPException(status_code=403, detail="Not authorized to use scanner")

async def process_redemption(db, token: str, staff_id: str, location_id: Optional[str] = None) -> tuple[dict, dict]:
    from fastapi import HTTPException
    
    redemption = await db.redemptions.find_one({"token": token})
    if not redemption:
        raise HTTPException(status_code=404, detail="Invalid code")

    if redemption["status"] == "REDEEMED":
        raise HTTPException(status_code=409, detail="Already redeemed")
    if redemption["status"] == "EXPIRED":
        raise HTTPException(status_code=410, detail="Code expired")

    # Check expiry
    if redemption.get("expires_at"):
        try:
            # Handle possible "Z" vs "+00:00" formats
            expires_at_str = redemption["expires_at"].replace("Z", "+00:00")
            exp = datetime.fromisoformat(expires_at_str)
            if datetime.now(timezone.utc) > exp:
                await db.redemptions.update_one({"id": redemption["id"]}, {"$set": {"status": "EXPIRED"}})
                raise HTTPException(status_code=410, detail="Code expired")
        except ValueError:
            pass

    # Find coupon and customer
    coupon = await db.coupons.find_one({"id": redemption["coupon_id"]}, {"_id": 0})
    customer = await db.users.find_one({"id": redemption["user_id"]}, {"_id": 0, "password_hash": 0})
    
    if not coupon or not customer:
        raise HTTPException(status_code=404, detail="Coupon or customer not found")

    # Mark redeemed
    now = datetime.now(timezone.utc).isoformat()
    await db.redemptions.update_one(
        {"id": redemption["id"]},
        {"$set": {
            "status": "REDEEMED", 
            "redeemed_at": now, 
            "redeemed_by": staff_id,
            "location_id": location_id
        }}
    )
    await db.coupons.update_one({"id": coupon["id"]}, {"$inc": {"used_count": 1}})
    
    # Reload redemption to get updated doc
    redemption["status"] = "REDEEMED"
    redemption["redeemed_at"] = now
    redemption["redeemed_by"] = staff_id
    redemption["location_id"] = location_id

    return redemption, coupon, customer
