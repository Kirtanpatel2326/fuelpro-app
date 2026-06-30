"""Push notifications: send (admin) + customer inbox."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_admin_user, get_current_user
from models import NotificationSendIn

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/send")
async def send_notification(payload: NotificationSendIn, _: dict = Depends(get_admin_user)):
    from server import db
    # Determine targets
    query = {"role": {"$ne": "admin"}}
    if payload.target_tier:
        tier = await db.tiers.find_one({"name": payload.target_tier})
        if not tier:
            raise HTTPException(status_code=404, detail="Tier not found")
        query["tier_id"] = tier["id"]
    targets = await db.users.find(query, {"_id": 0, "id": 1}).to_list(10000)

    notif_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    await db.push_notifications.insert_one({
        "id": notif_id,
        "title": payload.title,
        "body": payload.body,
        "target_tier": payload.target_tier,
        "sent_at": now,
        "sent_count": len(targets),
        "open_count": 0,
        "created_at": now,
    })
    # Fan out user_notifications
    if targets:
        docs = [{
            "id": str(uuid.uuid4()),
            "user_id": t["id"],
            "notification_id": notif_id,
            "is_read": False,
            "opened_at": None,
            "created_at": now,
        } for t in targets]
        await db.user_notifications.insert_many(docs)

    return {"success": True, "data": {"sent_count": len(targets), "notification_id": notif_id}}


@router.get("/history")
async def history(_: dict = Depends(get_admin_user)):
    from server import db
    cursor = db.push_notifications.find({}, {"_id": 0}).sort("sent_at", -1).limit(100)
    return {"success": True, "data": await cursor.to_list(100)}


@router.get("/inbox")
async def inbox(user: dict = Depends(get_current_user)):
    from server import db
    cursor = db.user_notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).limit(50)
    items = await cursor.to_list(50)
    out = []
    for it in items:
        n = await db.push_notifications.find_one({"id": it["notification_id"]}, {"_id": 0})
        if n:
            it["notification"] = n
            out.append(it)
    return {"success": True, "data": out}


@router.post("/inbox/{user_notif_id}/read")
async def mark_read(user_notif_id: str, user: dict = Depends(get_current_user)):
    from server import db
    now = datetime.now(timezone.utc).isoformat()
    res = await db.user_notifications.find_one_and_update(
        {"id": user_notif_id, "user_id": user["id"]},
        {"$set": {"is_read": True, "opened_at": now}},
    )
    if res:
        await db.push_notifications.update_one({"id": res["notification_id"]}, {"$inc": {"open_count": 1}})
    return {"success": True}
