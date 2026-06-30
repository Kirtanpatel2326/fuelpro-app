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
    # Staff must be admin or have staff role (we treat admin as staff for v1)
    if staff.get("role") not in ("admin", "staff"):
        raise HTTPException(status_code=403, detail="Staff access required")

    redemption = await db.redemptions.find_one({"token": payload.token})
    if not redemption:
        raise HTTPException(status_code=404, detail="Invalid code")

    if redemption["status"] == "REDEEMED":
        raise HTTPException(status_code=409, detail="Already redeemed")
    if redemption["status"] == "EXPIRED":
        raise HTTPException(status_code=410, detail="Code expired")

    # Check expiry if set
    if redemption.get("expires_at"):
        try:
            exp = datetime.fromisoformat(redemption["expires_at"])
            if datetime.now(timezone.utc) > exp:
                await db.redemptions.update_one({"id": redemption["id"]}, {"$set": {"status": "EXPIRED"}})
                raise HTTPException(status_code=410, detail="Code expired")
        except ValueError:
            pass

    # Look up coupon and customer
    coupon = await db.coupons.find_one({"id": redemption["coupon_id"]}, {"_id": 0})
    customer = await db.users.find_one({"id": redemption["user_id"]}, {"_id": 0, "password_hash": 0})
    if not coupon or not customer:
        raise HTTPException(status_code=404, detail="Coupon or customer not found")

    # Mark redeemed
    now = datetime.now(timezone.utc).isoformat()
    await db.redemptions.update_one(
        {"id": redemption["id"]},
        {"$set": {"status": "REDEEMED", "redeemed_at": now, "redeemed_by": staff["id"]}},
    )
    await db.coupons.update_one({"id": coupon["id"]}, {"$inc": {"used_count": 1}})

    return {
        "success": True,
        "data": {
            "redemption_id": redemption["id"],
            "coupon": coupon,
            "customer": {"id": customer["id"], "name": customer["name"], "email": customer["email"],
                         "avatar_url": customer.get("avatar_url")},
            "redeemed_at": now,
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
