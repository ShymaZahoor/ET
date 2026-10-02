"""
MovementPrediction: the output of the movement_prediction module for a
Track at a point in time. One Track accumulates many predictions as it
moves (re-run periodically or on-demand); the latest one per track is what
the frontend's Predictive Intelligence page shows.
"""
import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MovementPrediction(Base):
    __tablename__ = "movement_predictions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    track_id: Mapped[str] = mapped_column(ForeignKey("tracks.id"), nullable=False, index=True)
    target_zone_id: Mapped[str | None] = mapped_column(ForeignKey("human_zones.id"), nullable=True)

    predicted_destination: Mapped[str] = mapped_column(String, nullable=False)
    eta_seconds: Mapped[float] = mapped_column(Float, nullable=False)
    entry_probability: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    confidence: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)  # 0-100

    # Ordered list of predicted waypoints:
    # [{step, name, lat, lng, time, risk}, ...] -- matches frontend Prediction.movementPath
    movement_path: Mapped[list] = mapped_column(JSON, default=list)

    model_name: Mapped[str] = mapped_column(String, default="kinematic-v0")  # swap to "lstm-v1" etc later
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    track: Mapped["Track"] = relationship(back_populates="predictions")
