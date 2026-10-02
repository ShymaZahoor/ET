"""
ThreatAssessment: the threat_engine's scored output for a Track against a
specific HumanZone at a point in time -- this is what powers the "Active
Threats" page.

Alert: a notification-worthy event raised off the back of a threat
crossing a severity threshold. One ThreatAssessment can raise zero or one
Alert (we don't re-alert every tick, only on meaningful state changes).
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AlertStatus, RiskLevel


class ThreatAssessment(Base):
    __tablename__ = "threat_assessments"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    track_id: Mapped[str] = mapped_column(ForeignKey("tracks.id"), nullable=False, index=True)
    zone_id: Mapped[str] = mapped_column(ForeignKey("human_zones.id"), nullable=False, index=True)

    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    entry_probability: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    eta_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    distance_meters: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    track: Mapped["Track"] = relationship(back_populates="threat_assessments")
    alerts: Mapped[list["Alert"]] = relationship(back_populates="threat_assessment")


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    threat_assessment_id: Mapped[str] = mapped_column(ForeignKey("threat_assessments.id"), nullable=False)
    incident_id: Mapped[str | None] = mapped_column(ForeignKey("incidents.id"), nullable=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)
    status: Mapped[AlertStatus] = mapped_column(Enum(AlertStatus), default=AlertStatus.OPEN)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    threat_assessment: Mapped["ThreatAssessment"] = relationship(back_populates="alerts")
