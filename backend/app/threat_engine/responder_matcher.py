"""
Picks the best responder/team for an incident: nearest available team,
falling back to the nearest team of any status if none are free (so the
authority at least sees who to call/reassign).
"""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.geo import haversine_meters, latlng_from_geometry
from app.models.enums import TeamStatus
from app.models.responder import Responder


def recommend_responder(db: Session, *, incident_lat: float, incident_lng: float) -> Responder | None:
    responders = db.execute(select(Responder)).scalars().all()
    if not responders:
        return None

    def distance_to(r: Responder) -> float:
        r_lat, r_lng = latlng_from_geometry(r.location)
        return haversine_meters(incident_lat, incident_lng, r_lat, r_lng)

    available = [r for r in responders if r.status == TeamStatus.AVAILABLE]
    pool = available if available else responders
    return min(pool, key=distance_to)
