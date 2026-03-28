# ============================================================
#  Connected Weather Station — Backend Configuration
#  All settings loaded from environment variables via pydantic.
# ============================================================

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings — sourced from .env or environment variables."""

    # ---- App ----
    APP_NAME: str = "Connected Weather Station API"
    DEBUG: bool = False

    # ---- Database ----
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@db:5432/weather_station"

    # ---- JWT ----
    JWT_SECRET_KEY: str = "CHANGE-ME-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # ---- Rate Limiting ----
    RATE_LIMIT_DATA_PER_MIN: int = 100   # ESP32 data ingestion
    RATE_LIMIT_API_PER_MIN: int = 30     # Dashboard API calls

    # ---- CORS ----
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    model_config = {"env_file": ".env", "case_sensitive": True}


@lru_cache
def get_settings() -> Settings:
    return Settings()
