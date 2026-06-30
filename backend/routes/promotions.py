"""Promotions admin endpoints + customer feed."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from auth_utils import get_admin_user, get_current_user
from models import PromotionCreate, PromotionUpdate

router = APIRouter(prefix="/promotions", tags=["promotions"])


@router.get("")
async def list_active(user: dict = Depends(get_current_user)):
    from server import db
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor = db.promotions.find(
        {"is_active": True, "starts_at": {"$lte": now_iso}, "expires_at": {"$gt": now_iso}},
        {"_id": 0},
    ).sort("starts_at", -1)
    return {"success": True, "data": await cursor.to_list(100)}


admin_router = APIRouter(prefix="/admin/promotions", tags=["admin-promotions"])


@admin_router.get("")
async def admin_list(_: dict = Depends(get_admin_user)):
    from server import db
    cursor = db.promotions.find({}, {"_id": 0}).sort("starts_at", -1)
    return {"success": True, "data": await cursor.to_list(500)}


@admin_router.post("")
async def admin_create(payload: PromotionCreate, _: dict = Depends(get_admin_user)):
    from server import db
    now_iso = datetime.now(timezone.utc).isoformat()
    is_active = payload.starts_at <= now_iso <= payload.expires_at
    doc = {
        "id": str(uuid.uuid4()),
        **payload.model_dump(),
        "is_active": is_active,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.promotions.insert_one(doc)
    doc.pop("_id", None)
    return {"success": True, "data": doc}


@admin_router.patch("/{promo_id}")
async def admin_update(promo_id: str, payload: PromotionUpdate, _: dict = Depends(get_admin_user)):
    from server import db
    updates = {k: v for k, v in payload.model_dump().items() if v is not None}
    if updates:
        await db.promotions.update_one({"id": promo_id}, {"$set": updates})
    p = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"success": True, "data": p}


@admin_router.delete("/{promo_id}")
async def admin_delete(promo_id: str, _: dict = Depends(get_admin_user)):
    from server import db
    res = await db.promotions.delete_one({"id": promo_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return {"success": True}
