# ============================================================
#  SensorReading ORM Model — time-series weather data
# ============================================================

import uuid
from datetime import datetime, timezone
from sqlalchemy import Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class SensorReading(Base):
    __tablename__ = "sensor_data"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    device_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("devices.id"), nullable=False
    )
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    humidity: Mapped[float] = mapped_column(Float, nullable=False)
    pressure: Mapped[float] = mapped_column(Float, nullable=False)
    lux: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )
    received_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
    )

    # Relationship back to device
    device = relationship("Device", back_populates="readings")

    # Composite indexes for common query patterns
    __table_args__ = (
        Index("idx_sensor_data_device_time", "device_id", recorded_at.desc()),
        Index("idx_sensor_data_recorded_at", recorded_at.desc()),
    )

    def __repr__(self) -> str:
        return f"<SensorReading device={self.device_id} at={self.recorded_at}>"
