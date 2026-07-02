from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import User, UserRole, Restaurant, AISummary, SupportTicket, TicketStatus, LeadStatus
from app.schemas.auth_schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.middleware.dependencies import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Regular users are created with is_approved=False and must wait for admin approval.
    - Admins are approved automatically (for bootstrapping).
    """
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Admins are auto-approved; regular users need admin approval
    auto_approve = (body.role == UserRole.ADMIN)

    user = User(
        email=body.email,
        username=body.username,
        password_hash=hash_password(body.password),
        role=body.role,
        is_approved=auto_approve,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Login and get a JWT token.
    - Checks credentials
    - Checks if user is approved by admin
    - Returns a JWT token on success
    """
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Contact an administrator."
        )

    if not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please check back later."
        )

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged-in user's profile."""
    return current_user


# ─────────────────────────────────────────
# ADMIN — User Management Endpoints
# ─────────────────────────────────────────

class ApprovalAction(BaseModel):
    is_approved: bool

@router.get("/users/pending", response_model=List[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users pending approval. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(User).filter(User.is_approved == False, User.role == UserRole.USER).all()


@router.get("/users/all", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all users. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(User).filter(User.role == UserRole.USER).all()


@router.patch("/users/{user_id}/approve")
def approve_user(
    user_id: int,
    action: ApprovalAction,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve or reject a user. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_approved = action.is_approved
    db.commit()
    return {"message": f"User {'approved' if action.is_approved else 'rejected'} successfully", "user_id": user_id}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a user. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.get("/admin/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complex dashboard statistics. Admin only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    total_users = db.query(User).filter(User.role == UserRole.USER).count()
    pending_users = db.query(User).filter(User.role == UserRole.USER, User.is_approved == False).count()
    active_users = total_users - pending_users

    total_restaurants = db.query(Restaurant).count()
    
    # Lead breakdown
    leads_cold = db.query(Restaurant).filter(Restaurant.lead_status == LeadStatus.COLD).count()
    leads_contacted = db.query(Restaurant).filter(Restaurant.lead_status == LeadStatus.CONTACTED).count()
    leads_interested = db.query(Restaurant).filter(Restaurant.lead_status == LeadStatus.INTERESTED).count()
    leads_converted = db.query(Restaurant).filter(Restaurant.lead_status == LeadStatus.CONVERTED).count()
    leads_not_interested = db.query(Restaurant).filter(Restaurant.lead_status == LeadStatus.NOT_INTERESTED).count()

    total_ai_summaries = db.query(AISummary).count()

    # Ticket breakdown
    total_tickets = db.query(SupportTicket).count()
    open_tickets = db.query(SupportTicket).filter(SupportTicket.status == TicketStatus.OPEN).count()
    resolved_tickets = db.query(SupportTicket).filter(SupportTicket.status == TicketStatus.RESOLVED).count()

    return {
        "users": {
            "total": total_users,
            "pending": pending_users,
            "active": active_users
        },
        "restaurants": {
            "total": total_restaurants,
            "leads": {
                "cold": leads_cold,
                "contacted": leads_contacted,
                "interested": leads_interested,
                "converted": leads_converted,
                "not_interested": leads_not_interested
            }
        },
        "ai_summaries": {
            "total": total_ai_summaries
        },
        "tickets": {
            "total": total_tickets,
            "open": open_tickets,
            "resolved": resolved_tickets
        }
    }
