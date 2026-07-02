from sqlalchemy import (
    Column, Integer, String, Text, Enum, DECIMAL,
    TIMESTAMP, ForeignKey, func, Boolean
)
from sqlalchemy.orm import relationship
from database import Base
import enum


# ─────────────────────────────────────────
# ENUMS — fixed lists of allowed values
# ─────────────────────────────────────────

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class TicketPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"


class LeadStatus(str, enum.Enum):
    COLD = "COLD"
    CONTACTED = "CONTACTED"
    INTERESTED = "INTERESTED"
    NOT_INTERESTED = "NOT_INTERESTED"
    CONVERTED = "CONVERTED"


class Sentiment(str, enum.Enum):
    POSITIVE = "POSITIVE"
    NEUTRAL = "NEUTRAL"
    NEGATIVE = "NEGATIVE"


# ─────────────────────────────────────────
# USER MODEL — maps to the `users` table
# ─────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(180), nullable=False, unique=True)
    username = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.USER)
    # Approval system: new users must be approved by admin before logging in
    is_approved = Column(Boolean, nullable=False, default=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # One user can create many restaurants
    restaurants = relationship("Restaurant", back_populates="creator")
    # One user can have many audit log entries
    audit_logs = relationship("AuditLog", back_populates="user")
    # One user can have many support tickets
    tickets = relationship("SupportTicket", back_populates="user")


# ─────────────────────────────────────────
# RESTAURANT MODEL — maps to `restaurants`
# ─────────────────────────────────────────

class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    country = Column(String(100), nullable=False)
    phone = Column(String(50))
    email = Column(String(180))
    website = Column(String(255))
    cuisine = Column(String(100), nullable=False)
    rating = Column(DECIMAL(3, 2), nullable=False, default=0.00)
    opening_hours = Column(Text)
    notes = Column(Text)
    lead_status = Column(Enum(LeadStatus), nullable=False, default=LeadStatus.COLD)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="restaurants")
    reviews = relationship("RestaurantReview", back_populates="restaurant", cascade="all, delete")
    ai_summaries = relationship("AISummary", back_populates="restaurant", cascade="all, delete")


# ─────────────────────────────────────────
# REVIEW MODEL — maps to `restaurant_reviews`
# ─────────────────────────────────────────

class RestaurantReview(Base):
    __tablename__ = "restaurant_reviews"

    id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    review_text = Column(Text, nullable=False)
    rating = Column(DECIMAL(2, 1), nullable=False)
    sentiment = Column(Enum(Sentiment), default=Sentiment.NEUTRAL)
    created_at = Column(TIMESTAMP, server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="reviews")


# ─────────────────────────────────────────
# AI SUMMARY MODEL — stores Gemini results
# ─────────────────────────────────────────

class AISummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    summary_type = Column(String(50), nullable=False)   # "summary", "sentiment", "marketing", "outreach"
    prompt_used = Column(Text)                           # The exact prompt we sent to Gemini
    result = Column(Text)                               # Gemini's response
    created_at = Column(TIMESTAMP, server_default=func.now())

    restaurant = relationship("Restaurant", back_populates="ai_summaries")


# ─────────────────────────────────────────
# AUDIT LOG — tracks every write operation
# ─────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(50), nullable=False)         # "CREATE", "UPDATE", "DELETE"
    resource = Column(String(100), nullable=False)      # e.g., "restaurant", "user"
    resource_id = Column(Integer)                       # ID of the affected record
    ip_address = Column(String(45))
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="audit_logs")


# ─────────────────────────────────────────
# HELPDESK TICKET MODEL
# ─────────────────────────────────────────

class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(TicketStatus), nullable=False, default=TicketStatus.OPEN)
    priority = Column(Enum(TicketPriority), nullable=False, default=TicketPriority.MEDIUM)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="tickets")
