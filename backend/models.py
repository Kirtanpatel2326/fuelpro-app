"""Pydantic request/response models for FuelPro API."""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime

# ---------- Locations & Devices ----------
class LocationCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    phone: str
    latitude: float
    longitude: float
    has_carwash: bool = False
    has_coffee: bool = True
    has_subway: bool = False
    is_active: bool = True

class FuelPriceUpdate(BaseModel):
    grade: str  # regular, plus, premium, diesel
    price: float

class ScannerDeviceRegister(BaseModel):
    location_id: str
    device_name: str


# ---------- Auth ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)
    phone: Optional[str] = None
    birthday: Optional[str] = None  # ISO date string YYYY-MM-DD
    referral_code: Optional[str] = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


# ---------- User ----------
class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    birthday: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None  # admin, owner, store_manager, staff, customer
    location_ids: Optional[List[str]] = None


# ---------- Coupons ----------
class CouponCreate(BaseModel):
    title: str
    description: str
    type: str  # FUEL | STORE | CARWASH | COFFEE | BOGO | CASHBACK
    discount_type: str  # PERCENTAGE | FIXED | FREE_ITEM
    discount_value: float
    fuel_grade: Optional[str] = None
    min_purchase: Optional[float] = None
    max_uses: Optional[int] = None
    per_user_limit: int = 1
    is_active: bool = True
    starts_at: str  # ISO
    expires_at: str  # ISO
    image_url: Optional[str] = None
    terms_conditions: str = ""
    valid_location_ids: List[str] = []  # Empty means all locations


class CouponUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    fuel_grade: Optional[str] = None
    min_purchase: Optional[float] = None
    max_uses: Optional[int] = None
    per_user_limit: Optional[int] = None
    is_active: Optional[bool] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None
    image_url: Optional[str] = None
    terms_conditions: Optional[str] = None
    valid_location_ids: Optional[List[str]] = None


# ---------- Redemptions ----------
class ScanIn(BaseModel):
    token: str
    location_id: Optional[str] = None


# ---------- Purchases ----------
class PurchaseCreate(BaseModel):
    amount: float = Field(gt=0)
    type: str  # FUEL | STORE | CARWASH | COFFEE
    gallons: Optional[float] = None
    fuel_grade: Optional[str] = None
    location_id: Optional[str] = None


# ---------- Points ----------
class PointsAdjustIn(BaseModel):
    user_id: str
    points: int
    reason: str


# ---------- Notifications ----------
class NotificationSendIn(BaseModel):
    title: str = Field(max_length=80)
    body: str = Field(max_length=200)
    target_tier: Optional[str] = None  # tier name or None for all


# ---------- Promotions ----------
class PromotionCreate(BaseModel):
    title: str
    description: str
    type: str  # HOLIDAY | FLASH | SEASONAL | BIRTHDAY | REFERRAL
    starts_at: str
    expires_at: str
    image_url: Optional[str] = None
    coupon_ids: List[str] = []


class PromotionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    starts_at: Optional[str] = None
    expires_at: Optional[str] = None
    image_url: Optional[str] = None
    coupon_ids: Optional[List[str]] = None
    is_active: Optional[bool] = None


# ---------- Gamification ----------
class SpinWheelPlayCreate(BaseModel):
    user_id: str
    reward_points: int
    is_jackpot: bool = False

class ScratchCardCreate(BaseModel):
    user_id: str
    reward_points: int
    is_revealed: bool = False
    expires_at: str

class ScratchCardReveal(BaseModel):
    card_id: str

class PunchCardCreate(BaseModel):
    title: str
    description: str
    required_punches: int
    reward_points: int
    target_type: str  # e.g., 'COFFEE', 'CARWASH'

class PunchCardProgressUpdate(BaseModel):
    user_id: str
    punch_card_id: str
    punches_to_add: int = 1


# ---------- Tiers ----------
class TierConfig(BaseModel):
    name: str  # Bronze, Silver, Gold, Platinum
    min_points: int
    multiplier: float
    perks: List[str] = []
