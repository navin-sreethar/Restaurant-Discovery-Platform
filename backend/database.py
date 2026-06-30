from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings

# Create the database engine (the "connection" to MySQL)
engine = create_engine(settings.DATABASE_URL)

# SessionLocal is a factory — call it to get a DB session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Base class that all our database models will inherit from
class Base(DeclarativeBase):
    pass


# Dependency — used in FastAPI routes to get a DB session
# "yield" gives the session to the route, then closes it after the request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
