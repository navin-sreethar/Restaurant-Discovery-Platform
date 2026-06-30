from datetime import datetime, timedelta
from jose import JWTError, jwt
import bcrypt
from config import settings

# ─────────────────────────────────────────
# PASSWORD HASHING
# ─────────────────────────────────────────

def hash_password(plain_password: str) -> str:
    """Turn a plain password into a hashed string for safe DB storage."""
    password_bytes = plain_password.encode("utf-8")
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if a plain password matches the stored hash."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )


# ─────────────────────────────────────────
# JWT TOKEN CREATION & VERIFICATION
# ─────────────────────────────────────────

def create_access_token(data: dict) -> str:
    """
    Create a JWT token.
    - data: dictionary of info to embed (e.g. user_id, role)
    - adds an expiry time automatically
    - signs it with SECRET_KEY so we can verify it wasn't tampered with
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Verify and decode a JWT token.
    Returns the payload (user info) if valid, None if invalid/expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
