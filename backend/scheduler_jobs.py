"""Background scheduler: birthday rewards, promo activation, QR expiry."""
import asyncio
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler


async def expire_pending_qr_tokens(db):
    now_iso = datetime.now(timezone.utc).isoformat()
    res = await db.redemptions.update_many(
        {"status": "PENDING", "expires_at": {"$ne": None, "$lt": now_iso}},
        {"$set": {"status": "EXPIRED"}},
    )
    if res.modified_count:
        print(f"[scheduler] expired {res.modified_count} QR tokens")


async def toggle_promotions(db):
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.promotions.update_many(
        {"is_active": False, "starts_at": {"$lte": now_iso}, "expires_at": {"$gt": now_iso}},
        {"$set": {"is_active": True}},
    )
    await db.promotions.update_many(
        {"is_active": True, "expires_at": {"$lt": now_iso}},
        {"$set": {"is_active": False}},
    )


async def award_birthday_bonuses(db):
    today = datetime.now(timezone.utc).strftime("%m-%d")
    users = await db.users.find({"birthday": {"$ne": None}}, {"_id": 0}).to_list(10000)
    awarded = 0
    for u in users:
        bday = u.get("birthday")
        if not bday or len(bday) < 10:
            continue
        if bday[5:10] == today:
            # Idempotent: check if today's birthday txn already exists
            today_iso_prefix = datetime.now(timezone.utc).date().isoformat()
            existing = await db.points_transactions.find_one({
                "user_id": u["id"], "type": "BIRTHDAY",
                "created_at": {"$gte": today_iso_prefix},
            })
            if existing:
                continue
            from services import award_points
            await award_points(db, u["id"], 50, "BIRTHDAY", "Happy Birthday! Enjoy 50 bonus points.")
            awarded += 1
    if awarded:
        print(f"[scheduler] awarded birthday points to {awarded} users")


def start_scheduler(db):
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(expire_pending_qr_tokens, "interval", minutes=5, args=[db])
    scheduler.add_job(toggle_promotions, "interval", minutes=15, args=[db])
    scheduler.add_job(award_birthday_bonuses, "cron", hour=8, minute=0, args=[db])
    scheduler.start()
    return scheduler
