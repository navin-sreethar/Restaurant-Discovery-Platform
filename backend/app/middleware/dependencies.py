from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from app.models import User, UserRole
from app.services.auth_service import decode_access_token

# This tells FastAPI to expect a "Bearer <token>" in the Authorization header
bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency: Extracts the JWT from the request header,
    verifies it, and returns the logged-in User object.
    Use this on any route that requires login.
    """
    token = credentials.credentials
    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists"
        )

    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency: Checks that the logged-in user is an ADMIN.
    Use this on routes that only admins can access.
    Returns 403 Forbidden if they're just a regular USER.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
