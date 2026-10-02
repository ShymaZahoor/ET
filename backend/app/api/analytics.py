from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.historical import HistoricalConflict
from app.models.incident import Incident
from app.models.threat import ThreatAssessment
from app.schemas.misc import AnalyticsOut, SpeciesDistributionSlice

router = APIRouter(prefix="/analytics", tags=["analytics"])

_SPECIES_COLORS = {
    "Leopard": "#FF5148",
    "Elephant": "#39A9FF",
    "Wild Boar": "#F4B740",
    "Deer": "#20D58A",
}


@router.get("", response_model=AnalyticsOut)
def get_analytics(time_range: str = Query(default="Last 24 Hours", alias="timeRange"), db: Session = Depends(get_db)):
    total_sightings = db.execute(select(func.count(ThreatAssessment.id))).scalar_one()
    threats_detected = db.execute(
        select(func.count(func.distinct(ThreatAssessment.track_id)))
    ).scalar_one()
    incidents_handled = db.execute(select(func.count(Incident.id))).scalar_one()
    resolved = db.execute(
        select(func.count(Incident.id)).where(Incident.status == "Resolved")
    ).scalar_one()
    response_success = round((resolved / incidents_handled * 100), 1) if incidents_handled else 0.0

    avg_response_seconds = db.execute(
        select(func.avg(HistoricalConflict.response_time_seconds))
    ).scalar_one()
    avg_response_time = f"{(avg_response_seconds or 0) / 60:.1f} min"

    # Species distribution from historical + active threat species
    species_counts: dict[str, int] = defaultdict(int)
    for inc in db.execute(select(Incident.species)).all():
        species_counts[inc.species] += 1
    species_total = sum(species_counts.values()) or 1
    species_distribution = [
        SpeciesDistributionSlice(
            name=name,
            value=round(count / species_total * 100),
            color=_SPECIES_COLORS.get(name, "#94A3B8"),
        )
        for name, count in species_counts.items()
    ] or [SpeciesDistributionSlice(name="No data yet", value=100, color="#94A3B8")]

    return AnalyticsOut(
        totalSightings=total_sightings,
        threatsDetected=threats_detected,
        incidentsHandled=incidents_handled,
        responseSuccess=response_success,
        avgResponseTime=avg_response_time,
        sightingsTrend=[],  # requires time-bucketed history; populate once enough data has accumulated
        speciesDistribution=species_distribution,
        timeRange=time_range,
    )
