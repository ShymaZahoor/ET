"""
Reports the state of the three model slots (detection, tracking,
risk-prediction). While we're in the simulated-data phase (no trained
weights yet), status is honestly reported as "Calibrating" rather than
faking "Online" -- once real models are trained (Phase 3+), this should
read their actual metrics/checkpoints instead of this static config.
"""
from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.database import get_db
from app.models.camera import Detection
from app.schemas.misc import (
    AIModelStatusOut,
    ClassStats,
    DatasetStats,
    DetectionModelStatus,
    RiskPredictionModelStatus,
    TrackingModelStatus,
)
from app.wildlife.species import SPECIES_PROFILES

router = APIRouter(prefix="/ai-status", tags=["ai"])


@router.get("", response_model=AIModelStatusOut)
def get_model_status(db: Session = Depends(get_db)):
    species_counts = {name: 0 for name in SPECIES_PROFILES}
    for d in db.execute(select(Detection)).scalars().all():
        species_counts[d.species] = species_counts.get(d.species, 0) + 1
    total = sum(species_counts.values()) or 1

    return AIModelStatusOut(
        detection=DetectionModelStatus(
            name="EcoTwin Detector",
            architecture="YOLOv8 (planned)",
            status="Calibrating",
            map50=0.0,
            precision=0.0,
            recall=0.0,
            lastUpdated="not yet trained",
        ),
        tracking=TrackingModelStatus(
            name="EcoTwin Tracker",
            architecture="ByteTrack (planned)",
            status="Calibrating",
            activeTracks=0,
            trackingFps=0.0,
            lastUpdated="not yet trained",
        ),
        riskPrediction=RiskPredictionModelStatus(
            name="EcoTwin Risk Model",
            architecture="Kinematic heuristic (v0) -> LSTM (planned)",
            status="Calibrating",
            accuracy=0.0,
            lastUpdated="heuristic baseline active",
        ),
        dataset=DatasetStats(
            totalImages=0,
            speciesCount=len(SPECIES_PROFILES),
            trainingImages=0,
            validationImages=0,
            testImages=0,
        ),
        classes=[
            ClassStats(id=name.lower().replace(" ", "-"), name=name, samples=count, f1Score=0.0, precision=0.0, recall=0.0)
            for name, count in species_counts.items()
        ],
    )
