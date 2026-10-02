"""
Camera + Detection: supports the Live Detection page. Cameras are fixed
sensor points; Detections are individual classified frames which may (once
re-identified) be linked to a Track via track_id.
"""
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import JSON, DateTime, Enum, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import CameraStatus


class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    zone: Mapped[str] = mapped_column(String, default="Unassigned")
    status: Mapped[CameraStatus] = mapped_column(Enum(CameraStatus), default=CameraStatus.STANDBY)
    location: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    direction_deg: Mapped[float] = mapped_column(Float, default=0.0)
    thumbnail: Mapped[str | None] = mapped_column(String, nullable=True)

    detections: Mapped[list["Detection"]] = relationship(back_populates="camera")


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    camera_id: Mapped[str] = mapped_column(ForeignKey("cameras.id"), nullable=False, index=True)
    track_id: Mapped[str | None] = mapped_column(ForeignKey("tracks.id"), nullable=True, index=True)

    species: Mapped[str] = mapped_column(String, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    # {x, y, width, height} as percentages (0-100), matches frontend BoundingBox
    bounding_box: Mapped[dict] = mapped_column(JSON, nullable=False)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    movement_direction: Mapped[str | None] = mapped_column(String, nullable=True)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    camera: Mapped["Camera"] = relationship(back_populates="detections")
