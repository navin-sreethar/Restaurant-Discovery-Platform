from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "Restaurant Discovery Platform"

    class Config:
        env_file = ".env"


# Create one global settings object — import this everywhere
settings = Settings()
