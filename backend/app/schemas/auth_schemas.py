from pydantic import BaseModel, EmailStr
from app.models import UserRole


# ── Register (what the user sends when signing up) ──
class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    role: UserRole = UserRole.USER   # defaults to USER if not provided


# ── Login (what the user sends to log in) ──
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ── Token Response (what we send back after login) ──
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


# ── User info response (for GET /auth/me) ──
class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_approved: bool
    is_active: bool

    class Config:
        from_attributes = True   # allows converting SQLAlchemy model → this schema
