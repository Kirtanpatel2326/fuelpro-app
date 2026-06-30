"""Seed initial data: tiers, sample coupons, and demo accounts."""
import os
import uuid
from datetime import datetime, timezone, timedelta
from auth_utils import hash_password


TIERS = [
    {"name": "Bronze",   "min_points": 0,     "multiplier": 1.0,  "color": "#CD7F32", "icon": "shield",
     "benefits": ["1x points on every purchase", "Welcome coupon", "Birthday bonus"]},
    {"name": "Silver",   "min_points": 1000,  "multiplier": 1.25, "color": "#C0C0C0", "icon": "award",
     "benefits": ["1.25x points multiplier", "Exclusive Silver coupons", "Priority support"]},
    {"name": "Gold",     "min_points": 5000,  "multiplier": 1.5,  "color": "#F5A623", "icon": "star",
     "benefits": ["1.5x points multiplier", "Free monthly car wash", "Double points weekends"]},
    {"name": "Platinum", "min_points": 15000, "multiplier": 2.0,  "color": "#E5E4E2", "icon": "crown",
     "benefits": ["2x points multiplier", "VIP fuel pricing", "Free premium coffee daily", "Birthday gift"]},
]


SAMPLE_COUPONS = [
    {"title": "10¢ Off Per Gallon", "description": "Save 10 cents on every gallon of regular fuel.", "type": "FUEL",
     "discount_type": "FIXED", "discount_value": 0.10, "fuel_grade": "regular", "min_purchase": None,
     "max_uses": None, "per_user_limit": 3, "is_active": True,
     "terms_conditions": "Valid for regular grade fuel only. Limit 3 redemptions.",
     "image_url": "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800"},
    {"title": "Free Coffee with Fill-up", "description": "Get a free medium coffee with any fuel purchase over $20.",
     "type": "COFFEE", "discount_type": "FREE_ITEM", "discount_value": 0, "fuel_grade": None,
     "min_purchase": 20.0, "max_uses": 500, "per_user_limit": 1, "is_active": True,
     "terms_conditions": "Min $20 fuel purchase. Medium size only.",
     "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800"},
    {"title": "$5 Off Car Wash", "description": "Save $5 on our Premium Shine car wash.",
     "type": "CARWASH", "discount_type": "FIXED", "discount_value": 5.0, "min_purchase": None,
     "max_uses": None, "per_user_limit": 2, "is_active": True,
     "terms_conditions": "Valid on Premium Shine package only.",
     "image_url": "https://images.unsplash.com/photo-1605164599901-db7f68c4b1bb?w=800"},
    {"title": "20% Off Snacks", "description": "20% off all in-store snacks and beverages.",
     "type": "STORE", "discount_type": "PERCENTAGE", "discount_value": 20.0, "min_purchase": 5.0,
     "max_uses": None, "per_user_limit": 1, "is_active": True,
     "terms_conditions": "Excludes tobacco and alcohol. Min $5 purchase.",
     "image_url": "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800"},
    {"title": "BOGO Energy Drinks", "description": "Buy one energy drink, get one free.",
     "type": "BOGO", "discount_type": "FREE_ITEM", "discount_value": 0, "min_purchase": None,
     "max_uses": 200, "per_user_limit": 1, "is_active": True,
     "terms_conditions": "Equal or lesser value. Selected brands only.",
     "image_url": "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=800"},
    {"title": "5% Cashback on Premium Fuel", "description": "Earn 5% back in points on premium grade fuel.",
     "type": "CASHBACK", "discount_type": "PERCENTAGE", "discount_value": 5.0, "fuel_grade": "premium",
     "min_purchase": None, "max_uses": None, "per_user_limit": 10, "is_active": True,
     "terms_conditions": "Premium grade only. Points credited within 24h.",
     "image_url": "https://images.unsplash.com/photo-1611162616305-c69b3037f77c?w=800"},
    {"title": "Free Donut Tuesday", "description": "Free glazed donut every Tuesday with any purchase.",
     "type": "STORE", "discount_type": "FREE_ITEM", "discount_value": 0, "min_purchase": 1.0,
     "max_uses": None, "per_user_limit": 1, "is_active": True,
     "terms_conditions": "Tuesdays only. Glazed donut only.",
     "image_url": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800"},
    {"title": "$10 Off Diesel Fill-up", "description": "Save $10 on any diesel purchase over $50.",
     "type": "FUEL", "discount_type": "FIXED", "discount_value": 10.0, "fuel_grade": "diesel",
     "min_purchase": 50.0, "max_uses": 300, "per_user_limit": 1, "is_active": True,
     "terms_conditions": "Diesel only. Min $50 purchase.",
     "image_url": "https://images.unsplash.com/photo-1626078436082-732cbc8bd1b3?w=800"},
    {"title": "Plus Grade Bonus Points", "description": "Earn 2x points on Plus grade fuel this week.",
     "type": "FUEL", "discount_type": "PERCENTAGE", "discount_value": 0, "fuel_grade": "plus",
     "min_purchase": None, "max_uses": None, "per_user_limit": 5, "is_active": True,
     "terms_conditions": "Plus grade only. While supplies last.",
     "image_url": "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?w=800"},
    {"title": "Welcome Bonus: $3 Off Anything", "description": "Welcome to FuelPro! $3 off your next visit.",
     "type": "STORE", "discount_type": "FIXED", "discount_value": 3.0, "min_purchase": 3.0,
     "max_uses": None, "per_user_limit": 1, "is_active": True,
     "terms_conditions": "New members only.",
     "image_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"},
]


async def seed_tiers(db) -> dict:
    """Returns map of tier name -> tier id."""
    out = {}
    for t in TIERS:
        existing = await db.tiers.find_one({"name": t["name"]})
        if existing:
            out[t["name"]] = existing["id"]
        else:
            tid = str(uuid.uuid4())
            doc = {"id": tid, **t}
            await db.tiers.insert_one(doc)
            out[t["name"]] = tid
    return out


async def seed_coupons(db) -> None:
    count = await db.coupons.count_documents({})
    if count > 0:
        return
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=60)
    for c in SAMPLE_COUPONS:
        doc = {
            "id": str(uuid.uuid4()),
            **c,
            "used_count": 0,
            "starts_at": now.isoformat(),
            "expires_at": expires.isoformat(),
            "created_at": now.isoformat(),
        }
        await db.coupons.insert_one(doc)


async def seed_users(db, tier_map: dict) -> None:
    admin_email = os.environ["ADMIN_EMAIL"]
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing_admin = await db.users.find_one({"email": admin_email})
    if not existing_admin:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "FuelPro Admin",
            "phone": None,
            "avatar_url": None,
            "birthday": None,
            "referral_code": "ADMIN-" + str(uuid.uuid4())[:8].upper(),
            "referred_by_id": None,
            "tier_id": tier_map["Platinum"],
            "total_points": 0,
            "lifetime_points": 0,
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    else:
        # Update hash if password changed
        from auth_utils import verify_password
        if not verify_password(admin_password, existing_admin["password_hash"]):
            await db.users.update_one(
                {"email": admin_email},
                {"$set": {"password_hash": hash_password(admin_password)}},
            )

    test_email = os.environ["TEST_EMAIL"]
    test_password = os.environ["TEST_PASSWORD"]
    existing_test = await db.users.find_one({"email": test_email})
    if not existing_test:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "email": test_email,
            "password_hash": hash_password(test_password),
            "name": "Alex Rivers",
            "phone": "+15551234567",
            "avatar_url": None,
            "birthday": "1990-06-15",
            "referral_code": "ALEX-" + str(uuid.uuid4())[:8].upper(),
            "referred_by_id": None,
            "tier_id": tier_map["Silver"],
            "total_points": 1240,
            "lifetime_points": 1240,
            "role": "user",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })


async def write_credentials_file() -> None:
    content = f"""# FuelPro Test Credentials

## Admin Account
- Email: {os.environ['ADMIN_EMAIL']}
- Password: {os.environ['ADMIN_PASSWORD']}
- Role: admin
- Access: /admin (all admin pages), /scanner

## Test Customer Account
- Email: {os.environ['TEST_EMAIL']}
- Password: {os.environ['TEST_PASSWORD']}
- Role: user
- Access: /  (customer mobile app)

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
- POST /api/auth/refresh

## Notes
- JWT tokens delivered via httpOnly cookies (access_token, refresh_token)
- Frontend must use `withCredentials: true` (axios) / `credentials: 'include'` (fetch)
- CORS origins are whitelisted (no wildcard)
"""
    import os as _os
    if _os.environ.get("ENV") != "development":
        return
    _os.makedirs("./memory", exist_ok=True)
    with open("./memory/test_credentials.md", "w") as f:
        f.write(content)


async def seed_locations(db) -> None:
    count = await db.locations.count_documents({})
    if count > 0:
        return
        
    locations = [
        {"name": "FuelPro Main St", "address": "120 Main St", "city": "Metropolis", "state": "NY", "zip_code": "10001", "phone": "555-0101", "latitude": 40.7128, "longitude": -74.0060, "has_carwash": True, "has_coffee": True, "has_subway": False, "is_active": True},
        {"name": "FuelPro Oak Ave", "address": "45 Oak Ave", "city": "Metropolis", "state": "NY", "zip_code": "10002", "phone": "555-0102", "latitude": 40.7150, "longitude": -74.0100, "has_carwash": False, "has_coffee": True, "has_subway": True, "is_active": True},
        {"name": "FuelPro Westside", "address": "789 Westside Blvd", "city": "Metropolis", "state": "NY", "zip_code": "10003", "phone": "555-0103", "latitude": 40.7200, "longitude": -74.0200, "has_carwash": False, "has_coffee": False, "has_subway": False, "is_active": True},
        {"name": "FuelPro Highway 99", "address": "Exit 42 Hwy 99", "city": "Metropolis", "state": "NY", "zip_code": "10004", "phone": "555-0104", "latitude": 40.7300, "longitude": -74.0300, "has_carwash": True, "has_coffee": True, "has_subway": True, "is_active": True},
        {"name": "FuelPro East", "address": "890 East Blvd", "city": "Metropolis", "state": "NY", "zip_code": "10005", "phone": "555-0105", "latitude": 40.7400, "longitude": -73.9900, "has_carwash": False, "has_coffee": True, "has_subway": False, "is_active": True},
        {"name": "FuelPro North", "address": "100 North Rd", "city": "Metropolis", "state": "NY", "zip_code": "10006", "phone": "555-0106", "latitude": 40.7500, "longitude": -73.9800, "has_carwash": False, "has_coffee": False, "has_subway": False, "is_active": True},
        {"name": "FuelPro South", "address": "200 South St", "city": "Metropolis", "state": "NY", "zip_code": "10007", "phone": "555-0107", "latitude": 40.7000, "longitude": -74.0100, "has_carwash": True, "has_coffee": True, "has_subway": False, "is_active": True},
        {"name": "FuelPro Airport", "address": "300 Airport Way", "city": "Metropolis", "state": "NY", "zip_code": "10008", "phone": "555-0108", "latitude": 40.6400, "longitude": -73.7800, "has_carwash": True, "has_coffee": True, "has_subway": True, "is_active": True},
    ]

    base_prices = {"regular": 3.49, "plus": 3.79, "premium": 4.09, "diesel": 3.99}
    now = datetime.now(timezone.utc).isoformat()
    
    for idx, loc in enumerate(locations):
        loc_id = str(uuid.uuid4())
        loc["id"] = loc_id
        loc["created_at"] = now
        await db.locations.insert_one(loc)
        
        # Add slight variation to fuel prices per location
        variation = (idx - 3) * 0.05
        for grade, price in base_prices.items():
            await db.fuel_prices.insert_one({
                "id": str(uuid.uuid4()),
                "location_id": loc_id,
                "grade": grade,
                "price": round(price + variation, 2),
                "updated_at": now,
                "updated_by_id": "seed"
            })


async def run_seed(db) -> None:
    tier_map = await seed_tiers(db)
    await seed_locations(db)
    await seed_coupons(db)
    await seed_users(db, tier_map)
    await write_credentials_file()
