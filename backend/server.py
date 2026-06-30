"""FuelPro Rewards backend — FastAPI + MongoDB."""
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import logging
import certifi
from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.coupons import router as coupons_router, admin_router as admin_coupons_router
from routes.redemptions import router as redemptions_router
from routes.points import router as points_router
from routes.purchases import router as purchases_router
from routes.promotions import router as promotions_router, admin_router as admin_promotions_router
from routes.notifications import router as notifications_router
from routes.analytics import router as analytics_router
from routes.gamification import router as gamification_router
from routes.locations import router as locations_router
from routes.scanner import router as scanner_router
from routes.fraud import router as fraud_router
from seed import run_seed
from scheduler_jobs import start_scheduler

client = AsyncIOMotorClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"), tlsCAFile=certifi.where())
db = client[os.environ.get("DB_NAME", "fuelpro_dev")]

app = FastAPI(title="FuelPro Rewards API")
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"message": "FuelPro Rewards API", "version": "1.0"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(coupons_router)
api_router.include_router(admin_coupons_router)
api_router.include_router(redemptions_router)
api_router.include_router(points_router)
api_router.include_router(purchases_router)
api_router.include_router(promotions_router)
api_router.include_router(admin_promotions_router)
api_router.include_router(notifications_router)
api_router.include_router(analytics_router)
api_router.include_router(gamification_router)
api_router.include_router(locations_router)
api_router.include_router(scanner_router)
api_router.include_router(fraud_router)

@api_router.get("/tiers")
async def list_tiers():
    cursor = db.tiers.find({}, {"_id": 0}).sort("min_points", 1)
    return {"success": True, "data": await cursor.to_list(100)}


app.include_router(api_router)

# CORS — explicit origins required for cookie auth
origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]
if not origins:
    origins = [
        "https://fuelpro-app-theta-eight.vercel.app",
        "http://localhost:3000"
    ]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

_scheduler = None


from seed import run_seed

@app.on_event("startup")
async def startup():
    # Vercel serverless environment check - skip background jobs and heavy seeds on cold start
    if os.environ.get("VERCEL") == "1":
        logger.info("Running in Vercel Serverless mode - skipping db index creation and background jobs")
        return

    # Indexes
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("referral_code", unique=True)
        await db.redemptions.create_index("token", unique=True)
        await db.redemptions.create_index("claim_key", unique=True, sparse=True)
        await db.login_attempts.create_index("key")
        await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    except Exception as e:
        logger.error(f"Index creation failed: {e}")

    # Seed data
    try:
        if os.environ.get("ADMIN_EMAIL"):
            await run_seed(db)
    except Exception as e:
        logger.error(f"Seed failed: {e}")

    # Background jobs
    global _scheduler
    _scheduler = start_scheduler(db)
    logger.info("FuelPro backend ready")


@app.on_event("shutdown")
async def shutdown():
    if _scheduler:
        _scheduler.shutdown()
    client.close()
