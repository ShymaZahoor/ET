"""
HumanZone: a village, settlement, or other human-risk area. Stored as a
polygon so proximity/entry checks are real geometry operations
(ST_Distance / ST_DWithin / ST_Contains) rather than naive lat/lng math.
"""
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class HumanZone(Base):
    __tablename__ = "human_zones"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    zone_type: Mapped[str] = mapped_column(String, default="village")  # village | farmland | school | ...
    population: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Polygon boundary of the zone (SRID 4326 = WGS84 lat/lng, same as GPS)
    boundary: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POLYGON", srid=4326), nullable=False)
    # Centroid, kept denormalized for quick map pins / distance-sorting without ST_Centroid on every read
    centroid: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    risk_baseline: Mapped[float] = mapped_column(Float, default=1.0)  # multiplier the threat engine applies

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
