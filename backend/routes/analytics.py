"""Admin analytics endpoints."""
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from auth_utils import get_admin_user
from collections import defaultdict

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
async def overview(_: dict = Depends(get_admin_user)):
    from server import db
    total_customers = await db.users.count_documents({"role": {"$ne": "admin"}})
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    active_week = len(await db.purchases.distinct("user_id", {"created_at": {"$gte": week_ago}}))
    coupons_redeemed = await db.redemptions.count_documents({"status": "REDEEMED"})
    revenue_agg = await db.purchases.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    revenue = revenue_agg[0]["total"] if revenue_agg else 0
    points_issued_agg = await db.points_transactions.aggregate([
        {"$match": {"points": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$points"}}}
    ]).to_list(1)
    points_issued = points_issued_agg[0]["total"] if points_issued_agg else 0

    return {"success": True, "data": {
        "total_customers": total_customers,
        "active_this_week": active_week,
        "coupons_redeemed": coupons_redeemed,
        "revenue": round(revenue, 2),
        "points_issued": points_issued,
    }}


@router.get("/customer-growth")
async def customer_growth(_: dict = Depends(get_admin_user), days: int = 14):
    from server import db
    start = datetime.now(timezone.utc) - timedelta(days=days)
    users = await db.users.find(
        {"role": {"$ne": "admin"}, "created_at": {"$gte": start.isoformat()}},
        {"_id": 0, "created_at": 1},
    ).to_list(10000)
    buckets = defaultdict(int)
    for u in users:
        try:
            d = datetime.fromisoformat(u["created_at"]).date().isoformat()
        except Exception:
            continue
        buckets[d] += 1
    # Fill in all days
    out = []
    for i in range(days, -1, -1):
        d = (datetime.now(timezone.utc) - timedelta(days=i)).date().isoformat()
        out.append({"date": d, "count": buckets.get(d, 0)})
    return {"success": True, "data": out}


@router.get("/coupon-performance")
async def coupon_performance(_: dict = Depends(get_admin_user)):
    from server import db
    coupons = await db.coupons.find({}, {"_id": 0}).to_list(500)
    out = []
    for c in coupons:
        cnt = await db.redemptions.count_documents({"coupon_id": c["id"], "status": "REDEEMED"})
        out.append({"id": c["id"], "title": c["title"], "type": c["type"], "redemptions": cnt})
    out.sort(key=lambda x: x["redemptions"], reverse=True)
    return {"success": True, "data": out[:10]}


@router.get("/tier-distribution")
async def tier_distribution(_: dict = Depends(get_admin_user)):
    from server import db
    tiers = await db.tiers.find({}, {"_id": 0}).to_list(100)
    out = []
    for t in tiers:
        cnt = await db.users.count_documents({"tier_id": t["id"], "role": {"$ne": "admin"}})
        out.append({"name": t["name"], "count": cnt, "color": t["color"]})
    return {"success": True, "data": out}


@router.get("/weekly-redemptions")
async def weekly_redemptions(_: dict = Depends(get_admin_user)):
    from server import db
    out = []
    for i in range(6, -1, -1):
        day_start = (datetime.now(timezone.utc) - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        cnt = await db.redemptions.count_documents({
            "status": "REDEEMED",
            "redeemed_at": {"$gte": day_start.isoformat(), "$lt": day_end.isoformat()},
        })
        out.append({"date": day_start.date().isoformat(), "redemptions": cnt})
    return {"success": True, "data": out}


@router.get("/customers")
async def customers(_: dict = Depends(get_admin_user)):
    from server import db
    cursor = db.users.find({"role": {"$ne": "admin"}}, {"_id": 0, "password_hash": 0}).sort("created_at", -1)
    users = await cursor.to_list(2000)
    tiers = {t["id"]: t for t in await db.tiers.find({}, {"_id": 0}).to_list(100)}
    for u in users:
        u["tier"] = tiers.get(u["tier_id"])
        u["visits"] = await db.purchases.count_documents({"user_id": u["id"]})
    return {"success": True, "data": users}
