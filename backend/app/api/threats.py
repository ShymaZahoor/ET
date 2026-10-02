from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.converters import assessment_to_threat
from app.core.database import get_db
from app.models.threat import ThreatAssessment
from app.models.wildlife import Track
from app.models.zone import HumanZone
from app.schemas.threat import ThreatOut

router = APIRouter(prefix="/threats", tags=["threats"])


def _latest_assessment_per_track(db: Session) -> list[ThreatAssessment]:
    """One row per active track: its most recent ThreatAssessment."""
    all_latest: dict[str, ThreatAssessment] = {}
    rows = db.execute(
        select(ThreatAssessment).order_by(ThreatAssessment.created_at.desc())
    ).scalars().all()
    for row in rows:
        if row.track_id not in all_latest:
            all_latest[row.track_id] = row
    return list(all_latest.values())


@router.get("", response_model=list[ThreatOut])
def list_threats(db: Session = Depends(get_db)):
    assessments = _latest_assessment_per_track(db)
    out = []
    for a in assessments:
        track = db.execute(
            select(Track).options(joinedload(Track.animal)).where(Track.id == a.track_id)
        ).scalars().first()
        zone = db.get(HumanZone, a.zone_id)
        if track and zone:
            out.append(assessment_to_threat(a, track, zone))
    return out


@router.get("/track/{track_id}", response_model=ThreatOut)
def get_threat_by_track(track_id: str, db: Session = Depends(get_db)):
    assessment = db.execute(
        select(ThreatAssessment)
        .where(ThreatAssessment.track_id == track_id)
        .order_by(ThreatAssessment.created_at.desc())
    ).scalars().first()
    if not assessment:
        raise HTTPException(status_code=404, detail="No threat assessment for this track")
    track = db.execute(
        select(Track).options(joinedload(Track.animal)).where(Track.id == track_id)
    ).scalars().first()
    zone = db.get(HumanZone, assessment.zone_id)
    return assessment_to_threat(assessment, track, zone)
