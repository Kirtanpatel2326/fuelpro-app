"""Points history + admin manual adjustment."""
from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_current_user, get_admin_user
from models import PointsAdjustIn
from services import award_points

router = APIRouter(prefix="/points", tags=["points"])


@router.get("/history")
async def history(user: dict = Depends(get_current_user), limit: int = 50):
    from server import db
    cursor = db.points_transactions.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(limit)
    return {"success": True, "data": await cursor.to_list(limit)}


@router.post("/adjust")
async def adjust(payload: PointsAdjustIn, _: dict = Depends(get_admin_user)):
    from server import db
    target = await db.users.find_one({"id": payload.user_id})
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
        
    if target.get("total_points", 0) + payload.points < 0:
        raise HTTPException(status_code=400, detail="Cannot deduct more points than user has")
        
    txn = await award_points(db, payload.user_id, payload.points, "BONUS", payload.reason)
    return {"success": True, "data": txn}
