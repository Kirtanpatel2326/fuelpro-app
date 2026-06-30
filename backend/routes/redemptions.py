"""Redemptions: staff QR scan + history."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_current_user, get_admin_user
from models import ScanIn

router = APIRouter(prefix="/redemptions", tags=["redemptions"])


@router.post("/scan")
async def scan_qr(payload: ScanIn, staff: dict = Depends(get_current_user)):
    """Staff scans a QR code: validates and redeems."""
    from server import db
    from services import verify_staff_access, process_redemption
    
    verify_staff_access(staff)
    redemption, coupon, customer = await process_redemption(db, payload.token, staff["id"])

    return {
        "success": True,
        "data": {
            "redemption_id": redemption["id"],
            "coupon": coupon,
            "customer": {"id": customer["id"], "name": customer["name"], "email": customer["email"],
                         "avatar_url": customer.get("avatar_url")},
            "redeemed_at": redemption["redeemed_at"],
        },
    }


@router.get("/history")
async def history(_: dict = Depends(get_admin_user), limit: int = 50):
    from server import db
    cursor = db.redemptions.find({"status": "REDEEMED"}, {"_id": 0}).sort("redeemed_at", -1).limit(limit)
    items = await cursor.to_list(limit)
    # Decorate with coupon + customer
    out = []
    for r in items:
        c = await db.coupons.find_one({"id": r["coupon_id"]}, {"_id": 0})
        u = await db.users.find_one({"id": r["user_id"]}, {"_id": 0, "password_hash": 0})
        r["coupon"] = c
        r["customer"] = {"name": u["name"], "email": u["email"]} if u else None
        out.append(r)
    return {"success": True, "data": out}


@router.get("/today-count")
async def today_count(staff: dict = Depends(get_current_user)):
    from server import db
    if staff.get("role") not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Staff access required")
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    count = await db.redemptions.count_documents({"status": "REDEEMED", "redeemed_at": {"$gte": today_start}})
    return {"success": True, "data": {"count": count}}
