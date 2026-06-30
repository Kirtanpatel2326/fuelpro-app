from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import random
from datetime import datetime, timedelta
import uuid

# In a real app we'd import get_current_user from auth_utils
from auth_utils import get_current_user

router = APIRouter(tags=["gamification"])

@router.post("/scratch-cards/generate")
async def generate_scratch_card(user: dict = Depends(get_current_user)):
    """Generate a daily scratch card for the user."""
    return {
        "success": True, 
        "data": {
            "card_id": str(uuid.uuid4()),
            "reward_points": random.choice([10, 20, 50, 100]),
            "expires_at": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "is_revealed": False
        }
    }

@router.post("/scratch-cards/{card_id}/reveal")
async def reveal_scratch_card(card_id: str, user: dict = Depends(get_current_user)):
    """Reveal the scratch card and award points."""
    return {"success": True, "message": "Card revealed!", "points_awarded": 50}

@router.post("/spin-wheel/spin")
async def spin_wheel(user: dict = Depends(get_current_user)):
    """Spin the wheel for a weekly prize."""
    prize = random.choices(
        population=[10, 50, 100, 500],
        weights=[0.6, 0.3, 0.09, 0.01],
        k=1
    )[0]
    return {"success": True, "prize": prize, "is_jackpot": prize == 500}
