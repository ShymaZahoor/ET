"""
Incident: opened automatically when a ThreatAssessment crosses into
conflict range, tracked (with a timeline of ResponseActions and supporting
Evidence) until resolved. This is the central object the forest-authority
user interacts with.
"""
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import IncidentStatus, RiskLevel


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    track_id: Mapped[str] = mapped_column(ForeignKey("tracks.id"), nullable=False, index=True)
    zone_id: Mapped[str] = mapped_column(ForeignKey("human_zones.id"), nullable=False)
    threat_assessment_id: Mapped[str | None] = mapped_column(ForeignKey("threat_assessments.id"), nullable=True)

    incident_type: Mapped[str] = mapped_column(String, default="Wildlife Conflict Risk")
    species: Mapped[str] = mapped_column(String, nullable=False)
    severity: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)
    status: Mapped[IncidentStatus] = mapped_column(Enum(IncidentStatus), default=IncidentStatus.ACTIVE)

    location: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    location_name: Mapped[str] = mapped_column(String, default="Unknown")

    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    entry_probability: Mapped[float] = mapped_column(Float, nullable=False)
    eta_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    distance_to_settlement_meters: Mapped[float] = mapped_column(Float, nullable=False)

    assigned_team_id: Mapped[str | None] = mapped_column(ForeignKey("responders.id"), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    timeline: Mapped[list["ResponseAction"]] = relationship(
        back_populates="incident", cascade="all, delete-orphan", order_by="ResponseAction.occurred_at"
    )
    evidence: Mapped[list["IncidentEvidence"]] = relationship(
        back_populates="incident", cascade="all, delete-orphan"
    )


class IncidentEvidence(Base):
    __tablename__ = "incident_evidence"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(ForeignKey("incidents.id"), nullable=False, index=True)

    evidence_type: Mapped[str] = mapped_column(String, nullable=False)  # camera_frame | track_recording | sensor_log
    title: Mapped[str] = mapped_column(String, nullable=False)
    camera_id: Mapped[str | None] = mapped_column(ForeignKey("cameras.id"), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    image: Mapped[str | None] = mapped_column(String, nullable=True)

    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)

    incident: Mapped["Incident"] = relationship(back_populates="evidence")
