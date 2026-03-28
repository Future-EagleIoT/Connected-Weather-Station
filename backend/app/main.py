# ============================================================
#  Connected Weather Station — FastAPI Application
#  Production-ready backend for IoT sensor data.
# ============================================================

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import engine, Base
from app.routers import data, auth, devices
from app.utils.logging_config import setup_logging
from app.utils.security import hash_password
from app.models import User
from sqlalchemy import select
from app.database import AsyncSessionLocal

settings = get_settings()
logger = logging.getLogger(__name__)


async def seed_admin_user():
    """Create default admin user if none exists."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).limit(1))
        if result.scalar_one_or_none() is None:
            admin = User(
                email="admin@eagle-iot.com",
                hashed_password=hash_password("admin123"),
                is_admin=True,
            )
            session.add(admin)
            await session.commit()
            logger.info("Default admin user created: admin@eagle-iot.com")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    setup_logging("DEBUG" if settings.DEBUG else "INFO")
    logger.info("Starting %s", settings.APP_NAME)

    # Create tables (use Alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables verified")

    # Seed default admin
    await seed_admin_user()

    yield

    # Shutdown
    await engine.dispose()
    logger.info("Shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="REST API for IoT weather station data ingestion and querying.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---- CORS ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers ----
app.include_router(data.router)
app.include_router(auth.router)
app.include_router(devices.router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for load balancers and monitoring."""
    return {"status": "healthy", "service": settings.APP_NAME}
