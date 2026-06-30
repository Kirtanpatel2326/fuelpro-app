"""Scanner: Routes for POS terminal redemptions and offline syncing."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from auth_utils import get_current_user

router = APIRouter(prefix="/scanner", tags=["scanner"])

class RedeemRequest(BaseModel):
    token: str
    location_id: Optional[str] = None

class SyncScan(BaseModel):
    token: str
    locationId: Optional[str] = None
    timestamp: str

class SyncRequest(BaseModel):
    scans: List[SyncScan]

from services import verify_staff_access, process_redemption

@router.post("/redeem")
async def redeem_coupon(req: RedeemRequest, user: dict = Depends(get_current_user)):
    from server import db
    
    verify_staff_access(user)
    redemption, coupon, customer = await process_redemption(db, req.token, user["id"], req.location_id)
    
    return {"success": True, "message": "Coupon applied successfully!", "coupon": coupon}

@router.post("/sync")
async def sync_offline_scans(req: SyncRequest, user: dict = Depends(get_current_user)):
    from server import db
    verify_staff_access(user)
        
    processed = 0
    for scan in req.scans:
        redemption = await db.redemptions.find_one({"token": scan.token, "status": "PENDING"})
        if redemption:
            # We don't check strict expiry on offline syncs to allow leeway for network drops
            await db.redemptions.update_one(
                {"id": redemption["id"]},
                {"$set": {
                    "status": "REDEEMED",
                    "redeemed_at": scan.timestamp,
                    "redeemed_by": user["id"],
                    "location_id": scan.locationId
                }}
            )
            await db.coupons.update_one(
                {"id": redemption["coupon_id"]}, 
                {"$inc": {"used_count": 1}}
            )
            processed += 1
            
    return {"success": True, "processed": processed}
