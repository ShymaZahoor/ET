"""
Core wildlife entities.

Animal      -> a known/tagged individual or species profile (long-lived)
Track       -> one continuous movement episode of an animal being monitored
                (opens when first detected, closes when it leaves risk range
                or goes quiet long enough)
Observation -> a single point-in-time sighting/detection that belongs to a
                Track (from a camera, simulated feed, or future sensor)

Separating Track from Observation lets one animal have many historical
tracks, and each track accumulate many observations -- which is exactly
what the trajectory predictor and threat engine consume.
"""
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AnimalRiskLevel, TrackStatus


class Animal(Base):
    __tablename__ = "animals"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    species: Mapped[str] = mapped_column(String, nullable=False, index=True)
    image: Mapped[str | None] = mapped_column(String, nullable=True)

    tracks: Mapped[list["Track"]] = relationship(back_populates="animal", cascade="all, delete-orphan")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Track(Base):
    """A single monitored movement episode -- maps to Animal + Threat in the
    frontend's vocabulary (trackId is the shared key across those views)."""

    __tablename__ = "tracks"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    animal_id: Mapped[str] = mapped_column(ForeignKey("animals.id"), nullable=False, index=True)

    status: Mapped[TrackStatus] = mapped_column(Enum(TrackStatus), default=TrackStatus.ACTIVE, nullable=False)
    risk_level: Mapped[AnimalRiskLevel] = mapped_column(
        Enum(AnimalRiskLevel), default=AnimalRiskLevel.NORMAL, nullable=False
    )

    # Current state, denormalized onto the track for fast dashboard reads
    # (updated every simulation/ingestion tick rather than recomputed from
    # the full observation history on every request).
    current_location: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    location_name: Mapped[str] = mapped_column(String, default="Unknown")
    speed_mps: Mapped[float] = mapped_column(Float, default=0.0)
    direction_deg: Mapped[float] = mapped_column(Float, default=0.0)  # compass bearing, 0=N

    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    animal: Mapped["Animal"] = relationship(back_populates="tracks")
    observations: Mapped[list["Observation"]] = relationship(
        back_populates="track", cascade="all, delete-orphan", order_by="Observation.observed_at"
    )
    predictions: Mapped[list["MovementPrediction"]] = relationship(back_populates="track")
    threat_assessments: Mapped[list["ThreatAssessment"]] = relationship(back_populates="track")


class Observation(Base):
    """One raw point in a track's movement history."""

    __tablename__ = "observations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    track_id: Mapped[str] = mapped_column(ForeignKey("tracks.id"), nullable=False, index=True)

    location: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    speed_mps: Mapped[float] = mapped_column(Float, default=0.0)
    direction_deg: Mapped[float] = mapped_column(Float, default=0.0)

    source: Mapped[str] = mapped_column(String, default="simulation")  # simulation | camera | sensor
    camera_id: Mapped[str | None] = mapped_column(ForeignKey("cameras.id"), nullable=True)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)

    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    track: Mapped["Track"] = relationship(back_populates="observations")
