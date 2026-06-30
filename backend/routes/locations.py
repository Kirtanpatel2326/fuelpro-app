from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import LocationCreate, FuelPriceUpdate, ScannerDeviceRegister
from auth_utils import get_current_user, require_admin
import datetime
import uuid
import server

router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("")
@router.get("/")
async def list_locations():
    cursor = server.db.locations.find({}, {"_id": 0})
    locations = await cursor.to_list(100)
    
    # Attach fuel prices to each location for convenience
    for loc in locations:
        prices_cursor = server.db.fuel_prices.find({"location_id": loc["id"]}, {"_id": 0})
        loc["fuel_prices"] = await prices_cursor.to_list(10)
        
    return {"success": True, "data": locations}

@router.post("", dependencies=[Depends(require_admin)])
@router.post("/", dependencies=[Depends(require_admin)])
async def create_location(data: LocationCreate):
    loc_doc = data.model_dump()
    loc_doc["id"] = str(uuid.uuid4())
    loc_doc["created_at"] = datetime.datetime.utcnow().isoformat()
    
    await server.db.locations.insert_one(loc_doc.copy())
    return {"success": True, "data": loc_doc}

@router.put("/{location_id}/fuel-prices", dependencies=[Depends(require_admin)])
async def update_fuel_prices(location_id: str, prices: List[FuelPriceUpdate], current_user=Depends(get_current_user)):
    # Check if location exists
    loc = await server.db.locations.find_one({"id": location_id})
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
        
    updated_prices = []
    for price_update in prices:
        price_doc = {
            "id": str(uuid.uuid4()),
            "location_id": location_id,
            "grade": price_update.grade,
            "price": price_update.price,
            "updated_at": datetime.datetime.utcnow().isoformat(),
            "updated_by_id": current_user["id"]
        }
        
        # Upsert by location_id and grade
        await server.db.fuel_prices.update_one(
            {"location_id": location_id, "grade": price_update.grade},
            {"$set": price_doc},
            upsert=True
        )
        updated_prices.append(price_doc)
        
    return {"success": True, "message": "Fuel prices updated", "data": updated_prices}

@router.post("/{location_id}/scanner-devices")
async def register_scanner_device(location_id: str, data: ScannerDeviceRegister, current_user=Depends(get_current_user)):
    # Staff must be logged in to register a device
    loc = await server.db.locations.find_one({"id": location_id})
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
        
    device_doc = {
        "id": str(uuid.uuid4()),
        "location_id": location_id,
        "device_name": data.device_name,
        "registered_at": datetime.datetime.utcnow().isoformat(),
        "registered_by_id": current_user["id"],
        "last_seen_at": datetime.datetime.utcnow().isoformat()
    }
    
    await server.db.scanner_devices.insert_one(device_doc.copy())
    return {"success": True, "data": device_doc}
