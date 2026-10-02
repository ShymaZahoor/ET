"""
HistoricalConflict: a closed-out record kept after an Incident resolves,
used for analytics/reporting (trend charts, species distribution) and later
as training data for the ML risk models -- deliberately a separate,
append-only table so analytics queries never lock against live incidents.

Notification: in-app notification feed shown on the Notifications page.
"""
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import NotificationCategory, RiskLevel


class HistoricalConflict(Base):
    __tablename__ = "historical_conflicts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(ForeignKey("incidents.id"), nullable=False)

    species: Mapped[str] = mapped_column(String, nullable=False, index=True)
    zone_id: Mapped[str] = mapped_column(ForeignKey("human_zones.id"), nullable=False)
    severity: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)
    location: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    response_time_seconds: Mapped[float | None] = mapped_column(Float, nullable=True)
    outcome: Mapped[str] = mapped_column(String, default="Resolved")  # Resolved | Escalated | False Alarm

    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    category: Mapped[NotificationCategory] = mapped_column(Enum(NotificationCategory), nullable=False)
    read: Mapped[bool] = mapped_column(Boolean, default=False)
    link: Mapped[str | None] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)
