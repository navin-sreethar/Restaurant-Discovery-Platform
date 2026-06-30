from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from decimal import Decimal
from datetime import datetime
from app.models import LeadStatus


# ── Create Restaurant (what admin sends to create one) ──
class RestaurantCreate(BaseModel):
    name: str
    address: str
    city: str
    state: str
    country: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    cuisine: str
    rating: Decimal
    opening_hours: Optional[str] = None
    notes: Optional[str] = None
    lead_status: LeadStatus = LeadStatus.COLD

    @field_validator("rating")
    @classmethod
    def rating_must_be_valid(cls, v):
        if v < 0 or v > 5:
            raise ValueError("Rating must be between 0 and 5")
        return v


# ── Update Restaurant (all fields optional — only send what you want to change) ──
class RestaurantUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    cuisine: Optional[str] = None
    rating: Optional[Decimal] = None
    opening_hours: Optional[str] = None
    notes: Optional[str] = None
    lead_status: Optional[LeadStatus] = None


# ── Restaurant Response (what we send back) ──
class RestaurantResponse(BaseModel):
    id: int
    name: str
    address: str
    city: str
    state: str
    country: str
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    cuisine: str
    rating: Decimal
    opening_hours: Optional[str]
    notes: Optional[str]
    lead_status: str
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


# ── Paginated List Response ──
class PaginatedRestaurants(BaseModel):
    total: int           # total number of matching restaurants
    page: int            # current page number
    per_page: int        # how many per page
    pages: int           # total number of pages
    data: list[RestaurantResponse]
