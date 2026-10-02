from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.converters import responder_to_out
from app.core.database import get_db
from app.core.geo import haversine_meters, latlng_from_geometry
from app.models.enums import TeamStatus
from app.models.responder import Responder
from app.schemas.responder import DispatchTeamRequest, ResponderTeamOut

router = APIRouter(prefix="/responder-teams", tags=["responders"])


@router.get("", response_model=list[ResponderTeamOut])
def list_responder_teams(db: Session = Depends(get_db)):
    teams = db.execute(select(Responder)).scalars().all()
    return [responder_to_out(t) for t in teams]


@router.post("/{team_id}/dispatch", response_model=ResponderTeamOut)
def dispatch_team(team_id: str, body: DispatchTeamRequest, db: Session = Depends(get_db)):
    team = db.get(Responder, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    team.status = TeamStatus.EN_ROUTE
    team.current_assignment = f"Dispatched to {body.target_location}"
    db.commit()
    db.refresh(team)
    return responder_to_out(team)
