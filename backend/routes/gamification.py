from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import random
from datetime import datetime, timedelta, timezone
import uuid

from auth_utils import get_current_user
from services import award_points

router = APIRouter(tags=["gamification"])

@router.post("/scratch-cards/generate")
async def generate_scratch_card(user: dict = Depends(get_current_user)):
    """Generate a daily scratch card for the user."""
    from server import db
    card_id = str(uuid.uuid4())
    reward_points = random.choice([10, 20, 50, 100])
    expires_at = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    
    card = {
        "id": card_id,
        "user_id": user["id"],
        "reward_points": reward_points,
        "expires_at": expires_at,
        "is_revealed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.scratch_cards.insert_one(card)
    card.pop("_id", None)
    
    return {
        "success": True, 
        "data": {
            "card_id": card_id,
            "reward_points": reward_points,
            "expires_at": expires_at,
            "is_revealed": False
        }
    }

@router.post("/scratch-cards/{card_id}/reveal")
async def reveal_scratch_card(card_id: str, user: dict = Depends(get_current_user)):
    """Reveal the scratch card and award points."""
    from server import db
    card = await db.scratch_cards.find_one({"id": card_id, "user_id": user["id"]})
    if not card:
        raise HTTPException(status_code=404, detail="Scratch card not found")
    if card.get("is_revealed"):
        raise HTTPException(status_code=400, detail="Card already revealed")
        
    expires_at = datetime.fromisoformat(card["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=400, detail="Card expired")
        
    # Mark revealed
    await db.scratch_cards.update_one({"id": card_id}, {"$set": {"is_revealed": True}})
    
    # Award points
    points = card["reward_points"]
    await award_points(db, user["id"], points, "GAMIFICATION", "Scratch Card Reward")
    
    return {"success": True, "message": "Card revealed!", "points_awarded": points}

@router.post("/spin-wheel/spin")
async def spin_wheel(user: dict = Depends(get_current_user)):
    """Spin the wheel for a prize."""
    from server import db
    
    # Check if user spun recently (e.g. daily limit). For simplicity, we just award points.
    # We could query db.points_transactions to restrict it if needed.
    
    prize = random.choices(
        population=[10, 50, 100, 500],
        weights=[0.6, 0.3, 0.09, 0.01],
        k=1
    )[0]
    
    await award_points(db, user["id"], prize, "GAMIFICATION", "Spin the Wheel Reward")
    
    return {"success": True, "prize": prize, "is_jackpot": prize == 500}
