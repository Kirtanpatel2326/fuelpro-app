"""User endpoints: profile, tier progress, referral."""
from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_current_user
from models import UserUpdate
from services import clean_doc

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me")
async def get_me(user: dict = Depends(get_current_user)):
    from server import db
    tier = await db.tiers.find_one({"id": user["tier_id"]}, {"_id": 0})
    user["tier"] = tier
    return {"success": True, "data": user}


@router.patch("/me")
async def update_me(payload: UserUpdate, user: dict = Depends(get_current_user)):
    from server import db
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"success": True, "data": updated}


@router.get("/me/tier-progress")
async def tier_progress(user: dict = Depends(get_current_user)):
    from server import db
    tiers = await db.tiers.find({}, {"_id": 0}).sort("min_points", 1).to_list(100)
    current_idx = next((i for i, t in enumerate(tiers) if t["id"] == user["tier_id"]), 0)
    current = tiers[current_idx]
    next_tier = tiers[current_idx + 1] if current_idx + 1 < len(tiers) else None
    lifetime = user["lifetime_points"]
    if next_tier:
        span = next_tier["min_points"] - current["min_points"]
        progress = max(0, min(100, ((lifetime - current["min_points"]) / span) * 100)) if span > 0 else 100
        remaining = max(0, next_tier["min_points"] - lifetime)
    else:
        progress = 100
        remaining = 0
    return {
        "success": True,
        "data": {
            "current": current,
            "next": next_tier,
            "progress_pct": round(progress, 1),
            "points_to_next": remaining,
            "lifetime_points": lifetime,
            "all_tiers": tiers,
        },
    }


@router.get("/me/referral-stats")
async def referral_stats(user: dict = Depends(get_current_user)):
    from server import db
    count = await db.users.count_documents({"referred_by_id": user["id"]})
    return {"success": True, "data": {"code": user["referral_code"], "friends_joined": count}}
