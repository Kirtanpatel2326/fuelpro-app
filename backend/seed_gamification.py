import asyncio
import os
import uuid
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

async def seed_gamification():
    client = AsyncIOMotorClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    db = client[os.environ.get("DB_NAME", "fuelpro_dev")]

    challenges = [
        {
            "id": str(uuid.uuid4()),
            "title": "Weekend Warrior",
            "points": 500,
            "requirement": "Visit 3 times this weekend",
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Premium Pumper",
            "points": 1000,
            "requirement": "Fill up with Premium gas",
            "status": "Active",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Early Bird",
            "points": 250,
            "requirement": "Visit between 5AM and 8AM",
            "status": "Inactive",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]

    await db.challenges.delete_many({})
    await db.challenges.insert_many(challenges)
    print("Seeded gamification challenges.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_gamification())
