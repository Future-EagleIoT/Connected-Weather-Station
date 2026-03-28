# ============================================================
#  Data Router — ESP32 sensor data ingestion + historical queries
# ============================================================

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models.device import Device
from app.models.sensor_data import SensorReading
from app.models.user import User
from app.schemas.sensor_data import SensorDataIn, SensorDataOut, SensorDataQuery
from app.utils.security import validate_api_key, get_current_user
from app.middleware.rate_limiter import rate_limiter, get_client_ip
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/data", tags=["Sensor Data"])


@router.post("", status_code=201)
async def ingest_data(
    payload: SensorDataIn,
    request: Request,
    device: Device = Depends(validate_api_key),
    db: AsyncSession = Depends(get_db),
):
    """
    Receive sensor data from an ESP32 device.
    Authenticated via X-API-Key header.
    """
    # Rate limit by device API key
    rate_limiter.check(
        key=f"data:{device.api_key}",
        max_requests=settings.RATE_LIMIT_DATA_PER_MIN,
    )

    reading = SensorReading(
        device_id=device.id,
        temperature=payload.temperature,
        humidity=payload.humidity,
        pressure=payload.pressure,
        lux=payload.lux,
        recorded_at=datetime.now(timezone.utc),
        received_at=datetime.now(timezone.utc),
    )
    db.add(reading)
    await db.flush()

    logger.info(
        "Data ingested | device=%s temp=%.1f hum=%.1f pres=%.1f lux=%.1f",
        device.name, payload.temperature, payload.humidity,
        payload.pressure, payload.lux,
    )

    return {"status": "ok", "id": reading.id}


@router.get("", response_model=list[SensorDataOut])
async def get_data(
    device_id: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = 100,
    offset: int = 0,
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Query historical sensor data. Authenticated via JWT.
    Supports filtering by device, time range, and pagination.
    """
    query = select(SensorReading).options(joinedload(SensorReading.device))

    if device_id:
        query = query.where(SensorReading.device_id == device_id)
    if start:
        query = query.where(SensorReading.recorded_at >= start)
    if end:
        query = query.where(SensorReading.recorded_at <= end)

    query = query.order_by(SensorReading.recorded_at.desc())
    query = query.limit(min(limit, 1000)).offset(offset)

    result = await db.execute(query)
    readings = result.scalars().all()

    return [
        SensorDataOut(
            id=r.id,
            device_id=r.device_id,
            device_name=r.device.name if r.device else None,
            temperature=r.temperature,
            humidity=r.humidity,
            pressure=r.pressure,
            lux=r.lux,
            recorded_at=r.recorded_at,
            received_at=r.received_at,
        )
        for r in readings
    ]


@router.get("/latest", response_model=list[SensorDataOut])
async def get_latest(
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the latest reading from each active device."""
    # Subquery: max recorded_at per device
    subq = (
        select(
            SensorReading.device_id,
            func.max(SensorReading.recorded_at).label("max_time"),
        )
        .group_by(SensorReading.device_id)
        .subquery()
    )

    query = (
        select(SensorReading)
        .options(joinedload(SensorReading.device))
        .join(
            subq,
            (SensorReading.device_id == subq.c.device_id)
            & (SensorReading.recorded_at == subq.c.max_time),
        )
    )

    result = await db.execute(query)
    readings = result.scalars().all()

    return [
        SensorDataOut(
            id=r.id,
            device_id=r.device_id,
            device_name=r.device.name if r.device else None,
            temperature=r.temperature,
            humidity=r.humidity,
            pressure=r.pressure,
            lux=r.lux,
            recorded_at=r.recorded_at,
            received_at=r.received_at,
        )
        for r in readings
    ]
