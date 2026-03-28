# ============================================================
#  Sensor Data Pydantic Schemas
#  Validates data from ESP32 devices + API query params.
# ============================================================

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class SensorDataIn(BaseModel):
    """Incoming sensor reading from ESP32. Validated on ingestion."""

    device_id: str = Field(..., min_length=1, max_length=100)
    temperature: float = Field(..., ge=-40.0, le=85.0, description="°C")
    humidity: float = Field(..., ge=0.0, le=100.0, description="%")
    pressure: float = Field(..., ge=300.0, le=1100.0, description="hPa")
    lux: float = Field(..., ge=0.0, le=65535.0, description="lx")
    timestamp: int | None = Field(None, description="Device uptime in seconds")


class SensorDataOut(BaseModel):
    """Sensor reading returned to the dashboard."""

    id: int
    device_id: UUID
    device_name: str | None = None
    temperature: float
    humidity: float
    pressure: float
    lux: float
    recorded_at: datetime
    received_at: datetime

    model_config = {"from_attributes": True}


class SensorDataQuery(BaseModel):
    """Query parameters for historical data."""

    device_id: UUID | None = None
    start: datetime | None = None
    end: datetime | None = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)
