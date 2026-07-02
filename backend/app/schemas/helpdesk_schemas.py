from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models import TicketStatus, TicketPriority

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: TicketPriority = TicketPriority.MEDIUM

class TicketUpdate(BaseModel):
    status: TicketStatus

class TicketResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    status: TicketStatus
    priority: TicketPriority
    created_at: datetime
    
    # Optional field to return the submitter's email
    user_email: Optional[str] = None

    class Config:
        from_attributes = True
