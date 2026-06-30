import asyncio
import os
import uuid
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

async def seed_fraud():
    client = AsyncIOMotorClient(os.environ.get("MONGODB_URI", "mongodb://localhost:27017"))
    db = client[os.environ.get("DB_NAME", "fuelpro_dev")]

    flags = [
        {
            "id": str(uuid.uuid4()),
            "name": "Suspicious User 1",
            "email": "hacker1@example.com",
            "reason": "Multiple failed logins",
            "severity": "High",
            "status": "Pending Review",
            "date": (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Jane Doe",
            "email": "jane@example.com",
            "reason": "Unusual coupon redemption pattern",
            "severity": "Medium",
            "status": "Under Investigation",
            "date": (datetime.now(timezone.utc) - timedelta(days=2)).strftime("%Y-%m-%d")
        },
        {
            "id": str(uuid.uuid4()),
            "name": "John Smith",
            "email": "john.smith@example.com",
            "reason": "Account accessed from multiple countries",
            "severity": "High",
            "status": "Suspended",
            "date": (datetime.now(timezone.utc) - timedelta(days=5)).strftime("%Y-%m-%d")
        }
    ]

    await db.fraud_flags.delete_many({})
    await db.fraud_flags.insert_many(flags)
    print("Seeded fraud flags.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_fraud())
