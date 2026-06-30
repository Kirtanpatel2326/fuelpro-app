"""Purchases: log a purchase, auto-award points."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from auth_utils import get_current_user
from models import PurchaseCreate
from services import compute_points, award_points

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.post("")
async def create_purchase(payload: PurchaseCreate, user: dict = Depends(get_current_user)):
    from server import db
    points = await compute_points(db, payload.amount, user["tier_id"])
    purchase = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount": payload.amount,
        "type": payload.type,
        "gallons": payload.gallons,
        "fuel_grade": payload.fuel_grade,
        "points_earned": points,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.purchases.insert_one(purchase)
    desc = f"Earned {points} pts on ${payload.amount:.2f} {payload.type.lower()} purchase"
    await award_points(db, user["id"], points, "PURCHASE", desc, purchase_id=purchase["id"])

    # Referral bonus: if this is user's first purchase AND they were referred
    if user.get("referred_by_id"):
        prior = await db.purchases.count_documents({"user_id": user["id"]})
        if prior == 1:  # this is the first
            await award_points(db, user["id"], 200, "REFERRAL", "Referral bonus: welcome reward!")
            await award_points(db, user["referred_by_id"], 200, "REFERRAL",
                               f"Friend {user['name']} made their first purchase!")

    purchase.pop("_id", None)
    return {"success": True, "data": purchase}


@router.get("/history")
async def history(user: dict = Depends(get_current_user), limit: int = 50):
    from server import db
    cursor = db.purchases.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return {"success": True, "data": await cursor.to_list(limit)}
