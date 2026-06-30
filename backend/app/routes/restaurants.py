from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from math import ceil
from database import get_db
from app.models import Restaurant, AuditLog, User
from app.schemas.restaurant_schemas import (
    RestaurantCreate, RestaurantUpdate, RestaurantResponse, PaginatedRestaurants
)
from app.middleware.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/v1/restaurants", tags=["Restaurants"])


# ─────────────────────────────────────────
# GET /api/v1/restaurants
# Search, filter, and paginate restaurants
# ─────────────────────────────────────────

@router.get("", response_model=PaginatedRestaurants)
def list_restaurants(
    # Search filters — all optional, passed as query params like ?city=Atlanta
    city: str = Query(None, description="Filter by city"),
    cuisine: str = Query(None, description="Filter by cuisine type"),
    min_rating: float = Query(None, description="Minimum rating (0-5)"),
    name: str = Query(None, description="Search by restaurant name"),
    lead_status: str = Query(None, description="Filter by lead status"),
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=100, description="Results per page"),
    db: Session = Depends(get_db)
):
    """
    List all restaurants with optional filtering and pagination.
    No authentication required — public endpoint.
    """
    query = db.query(Restaurant)

    # Apply filters only if the parameter was provided
    if city:
        query = query.filter(Restaurant.city.ilike(f"%{city}%"))
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    if min_rating is not None:
        query = query.filter(Restaurant.rating >= min_rating)
    if name:
        query = query.filter(Restaurant.name.ilike(f"%{name}%"))
    if lead_status:
        query = query.filter(Restaurant.lead_status == lead_status)

    # Count total matching results (before pagination)
    total = query.count()

    # Apply pagination — skip records from previous pages
    offset = (page - 1) * per_page
    restaurants = query.offset(offset).limit(per_page).all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": ceil(total / per_page) if total > 0 else 0,
        "data": restaurants
    }


# ─────────────────────────────────────────
# GET /api/v1/restaurants/{id}
# Get a single restaurant by ID
# ─────────────────────────────────────────

@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(restaurant_id: int, db: Session = Depends(get_db)):
    """Get details for a single restaurant."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")
    return restaurant


# ─────────────────────────────────────────
# POST /api/v1/restaurants
# Create a new restaurant (Admin only)
# ─────────────────────────────────────────

@router.post("", response_model=RestaurantResponse, status_code=201)
def create_restaurant(
    body: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)   # 403 if not admin
):
    """Create a new restaurant. Admin only."""
    restaurant = Restaurant(**body.model_dump(), created_by=current_user.id)
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)

    # Write audit log — track who created what
    log = AuditLog(
        user_id=current_user.id,
        action="CREATE",
        resource="restaurant",
        resource_id=restaurant.id
    )
    db.add(log)
    db.commit()

    return restaurant


# ─────────────────────────────────────────
# PUT /api/v1/restaurants/{id}
# Update a restaurant (Admin only)
# ─────────────────────────────────────────

@router.put("/{restaurant_id}", response_model=RestaurantResponse)
def update_restaurant(
    restaurant_id: int,
    body: RestaurantUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Update a restaurant's details. Admin only."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Only update fields that were actually sent (not None)
    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(restaurant, field, value)

    db.commit()
    db.refresh(restaurant)

    # Audit log
    log = AuditLog(user_id=current_user.id, action="UPDATE", resource="restaurant", resource_id=restaurant_id)
    db.add(log)
    db.commit()

    return restaurant


# ─────────────────────────────────────────
# DELETE /api/v1/restaurants/{id}
# Delete a restaurant (Admin only)
# ─────────────────────────────────────────

@router.delete("/{restaurant_id}", status_code=204)
def delete_restaurant(
    restaurant_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a restaurant. Admin only. Returns 204 No Content on success."""
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    # Audit log before deleting
    log = AuditLog(user_id=current_user.id, action="DELETE", resource="restaurant", resource_id=restaurant_id)
    db.add(log)
    db.commit()

    db.delete(restaurant)
    db.commit()
