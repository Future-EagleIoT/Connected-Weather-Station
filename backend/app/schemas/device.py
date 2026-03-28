# ============================================================
#  Device Pydantic Schemas
# ============================================================

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    """Create a new device — returns generated API key."""

    name: str = Field(..., min_length=1, max_length=100)
    location: str | None = Field(None, max_length=255)


class DeviceOut(BaseModel):
    """Device info returned from API."""

    id: UUID
    name: str
    location: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DeviceWithKey(DeviceOut):
    """Device + API key — only returned on creation."""

    api_key: str
