from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from app.models import User
from app.schemas.auth_schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.middleware.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user.
    - Checks email isn't already taken
    - Hashes the password before saving (NEVER store plain passwords)
    - Returns the new user's info
    """
    # Check if email already exists
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user with hashed password
    user = User(
        email=body.email,
        username=body.username,
        password_hash=hash_password(body.password),
        role=body.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    Login and get a JWT token.
    - Finds user by email
    - Verifies password against the stored hash
    - Returns a JWT token (valid for 60 mins by default)
    """
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Embed user_id and role in the token payload
    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "token_type": "bearer", "role": user.role}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get the currently logged-in user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    return current_user
