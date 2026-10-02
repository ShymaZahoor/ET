import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.converters import prediction_to_out
from app.core.database import get_db
from app.core.geo import latlng_from_geometry
from app.models.prediction import MovementPrediction
from app.models.wildlife import Track
from app.models.zone import HumanZone
from app.movement_prediction.predictor import predict_trajectory
from app.schemas.misc import PredictionOut

router = APIRouter(prefix="/predictions", tags=["predictions"])


class RunPredictionRequest(BaseModel):
    track_id: str = Field(validation_alias="trackId")


@router.get("", response_model=PredictionOut)
def get_latest_prediction(db: Session = Depends(get_db)):
    prediction = db.execute(
        select(MovementPrediction).order_by(MovementPrediction.created_at.desc())
    ).scalars().first()
    if not prediction:
        raise HTTPException(status_code=404, detail="No predictions available yet")
    track = db.execute(
        select(Track).options(joinedload(Track.animal)).where(Track.id == prediction.track_id)
    ).scalars().first()
    return prediction_to_out(prediction, track)


@router.post("/run", response_model=PredictionOut)
def run_new_prediction(body: RunPredictionRequest, db: Session = Depends(get_db)):
    track = db.execute(
        select(Track).options(joinedload(Track.animal)).where(Track.id == body.track_id)
    ).scalars().first()
    if not track:
        raise HTTPException(status_code=404, detail="Track not found")

    zone = db.execute(select(HumanZone)).scalars().first()
    if not zone:
        raise HTTPException(status_code=404, detail="No human zone configured")

    lat, lng = latlng_from_geometry(track.current_location)
    zone_lat, zone_lng = latlng_from_geometry(zone.centroid)

    result = predict_trajectory(
        current_lat=lat,
        current_lng=lng,
        speed_mps=track.speed_mps,
        bearing_deg=track.direction_deg,
        target_lat=zone_lat,
        target_lng=zone_lng,
        target_name=zone.name,
    )

    prediction = MovementPrediction(
        id=str(uuid.uuid4()),
        track_id=track.id,
        target_zone_id=zone.id,
        predicted_destination=zone.name,
        eta_seconds=result.eta_seconds,
        entry_probability=result.entry_probability,
        confidence=result.confidence,
        risk_score=result.entry_probability,  # pre-ML approximation until threat engine runs on next tick
        movement_path=[
            {
                "step": wp.step,
                "name": wp.name,
                "lat": wp.lat,
                "lng": wp.lng,
                "time": (datetime.utcnow() + timedelta(seconds=wp.time_offset_seconds)).strftime("%H:%M:%S"),
                "risk": wp.risk,
            }
            for wp in result.movement_path
        ],
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction_to_out(prediction, track)
