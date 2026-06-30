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

def verify_staff_access(user: dict):
    allowed = ["admin", "owner", "regional_manager", "store_manager", "staff"]
    if user.get("role") not in allowed:
        raise HTTPException(status_code=403, detail="Not authorized to use scanner")

@router.post("/redeem")
async def redeem_coupon(req: RedeemRequest, user: dict = Depends(get_current_user)):
    from server import db
    verify_staff_access(user)
        
    redemption = await db.redemptions.find_one({"token": req.token, "status": "PENDING"})
    if not redemption:
        raise HTTPException(status_code=404, detail="Invalid or already used QR code")
        
    # Check expiry
    if redemption.get("expires_at"):
        expires_at = datetime.fromisoformat(redemption["expires_at"].replace("Z", "+00:00"))
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="QR code has expired")
            
    # Find the coupon
    coupon = await db.coupons.find_one({"id": redemption["coupon_id"]}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Associated coupon not found")

    # Mark as redeemed
    await db.redemptions.update_one(
        {"id": redemption["id"]},
        {"$set": {
            "status": "REDEEMED",
            "redeemed_at": datetime.now(timezone.utc).isoformat(),
            "redeemed_by": user["id"],
            "location_id": req.location_id
        }}
    )
    
    # Increment coupon usage
    await db.coupons.update_one(
        {"id": redemption["coupon_id"]}, 
        {"$inc": {"used_count": 1}}
    )
    
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
