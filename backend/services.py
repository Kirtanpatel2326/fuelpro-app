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
