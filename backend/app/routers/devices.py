# ============================================================
#  Devices Router — ESP32 device management
# ============================================================

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.device import Device
from app.models.user import User
from app.schemas.device import DeviceCreate, DeviceOut, DeviceWithKey
from app.utils.security import get_current_user, generate_api_key

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/devices", tags=["Devices"])


@router.get("", response_model=list[DeviceOut])
async def list_devices(
    _user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all registered devices."""
    result = await db.execute(
        select(Device).order_by(Device.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=DeviceWithKey, status_code=201)
async def create_device(
    body: DeviceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Register a new ESP32 device.
    Returns the generated API key — save it, it cannot be retrieved again.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can register devices",
        )

    api_key = generate_api_key()

    device = Device(
        name=body.name,
        location=body.location,
        api_key=api_key,
    )
    db.add(device)
    await db.flush()

    logger.info("Device registered | name=%s by=%s", body.name, current_user.email)

    return DeviceWithKey(
        id=device.id,
        name=device.name,
        location=device.location,
        is_active=device.is_active,
        api_key=api_key,
        created_at=device.created_at,
        updated_at=device.updated_at,
    )


@router.patch("/{device_id}/deactivate", response_model=DeviceOut)
async def deactivate_device(
    device_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Deactivate a device — its API key will no longer work."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can deactivate devices",
        )

    result = await db.execute(select(Device).where(Device.id == device_id))
    device = result.scalar_one_or_none()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    device.is_active = False
    await db.flush()

    logger.info("Device deactivated | name=%s", device.name)
    return device
