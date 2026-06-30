from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
import uuid

from auth_utils import get_admin_user

router = APIRouter(tags=["fraud"])

@router.get("/")
async def get_fraud_flags(admin: dict = Depends(get_admin_user)):
    """Get all fraud flags."""
    from server import db
    cursor = db.fraud_flags.find({})
    flags = await cursor.to_list(length=100)
    for flag in flags:
        flag.pop("_id", None)
    return {"success": True, "data": flags}

@router.get("/stats")
async def get_fraud_stats(admin: dict = Depends(get_admin_user)):
    """Get statistics for fraud flags."""
    from server import db
    # In a real app we'd aggregate from db.fraud_flags
    # For now, return basic stats
    total = await db.fraud_flags.count_documents({})
    critical = await db.fraud_flags.count_documents({"severity": "High"})
    suspended = await db.fraud_flags.count_documents({"status": "Suspended"})
    resolved = await db.fraud_flags.count_documents({"status": "Resolved"})
    
    return {
        "success": True,
        "data": {
            "critical_flags": critical,
            "accounts_suspended": suspended,
            "resolved_flags": resolved,
            "total_flags": total
        }
    }

class FraudFlagUpdate(BaseModel):
    status: str

@router.put("/{flag_id}")
async def update_fraud_flag(flag_id: str, update: FraudFlagUpdate, admin: dict = Depends(get_admin_user)):
    """Update a fraud flag (e.g. resolve it)."""
    from server import db
    result = await db.fraud_flags.update_one(
        {"id": flag_id}, 
        {"$set": {"status": update.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Fraud flag not found")
    return {"success": True, "message": "Fraud flag updated"}
