from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from app.models import SupportTicket, User, UserRole
from app.schemas.helpdesk_schemas import TicketCreate, TicketUpdate, TicketResponse
from app.middleware.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/helpdesk", tags=["Helpdesk"])

@router.post("/tickets", response_model=TicketResponse, status_code=201)
def create_ticket(
    body: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new support ticket."""
    ticket = SupportTicket(
        user_id=current_user.id,
        title=body.title,
        description=body.description,
        priority=body.priority
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    
    # Return with user email
    response = TicketResponse.model_validate(ticket)
    response.user_email = current_user.email
    return response


@router.get("/tickets/me", response_model=List[TicketResponse])
def get_my_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tickets created by the current user."""
    tickets = db.query(SupportTicket).filter(SupportTicket.user_id == current_user.id).order_by(SupportTicket.created_at.desc()).all()
    
    responses = []
    for t in tickets:
        r = TicketResponse.model_validate(t)
        r.user_email = current_user.email
        responses.append(r)
    return responses


@router.get("/tickets", response_model=List[TicketResponse])
def get_all_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all tickets across the platform (ADMIN ONLY)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
        
    tickets = db.query(SupportTicket).join(User).order_by(SupportTicket.created_at.desc()).all()
    
    responses = []
    for t in tickets:
        r = TicketResponse.model_validate(t)
        r.user_email = t.user.email
        responses.append(r)
    return responses


@router.patch("/tickets/{ticket_id}/status", response_model=TicketResponse)
def update_ticket_status(
    ticket_id: int,
    body: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update ticket status (ADMIN ONLY)."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
        
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    ticket.status = body.status
    db.commit()
    db.refresh(ticket)
    
    r = TicketResponse.model_validate(ticket)
    r.user_email = ticket.user.email
    return r
