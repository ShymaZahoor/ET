import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.converters import incident_to_out
from app.core.database import get_db
from app.models.enums import IncidentStatus, TeamStatus
from app.models.incident import Incident
from app.models.responder import Responder, ResponseAction
from app.schemas.incident import AssignTeamRequest, IncidentOut, UpdateIncidentStatusRequest

router = APIRouter(prefix="/incidents", tags=["incidents"])


def _team_name(db: Session, team_id: str | None) -> str | None:
    if not team_id:
        return None
    team = db.get(Responder, team_id)
    return team.name if team else None


@router.get("", response_model=list[IncidentOut])
def list_incidents(db: Session = Depends(get_db)):
    incidents = db.execute(
        select(Incident).options(joinedload(Incident.timeline), joinedload(Incident.evidence))
        .order_by(Incident.created_at.desc())
    ).scalars().unique().all()
    return [incident_to_out(i, _team_name(db, i.assigned_team_id)) for i in incidents]


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.execute(
        select(Incident)
        .options(joinedload(Incident.timeline), joinedload(Incident.evidence))
        .where(Incident.id == incident_id)
    ).scalars().unique().first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident_to_out(incident, _team_name(db, incident.assigned_team_id))


@router.post("/{incident_id}/assign-team", response_model=IncidentOut)
def assign_team(incident_id: str, body: AssignTeamRequest, db: Session = Depends(get_db)):
    incident = db.get(Incident, incident_id)
    team = db.get(Responder, body.team_id)
    if not incident or not team:
        raise HTTPException(status_code=404, detail="Incident or team not found")

    incident.assigned_team_id = team.id
    incident.status = IncidentStatus.ASSIGNED

    team.status = TeamStatus.ON_MISSION
    team.current_assignment = f"{incident.id} ({incident.location_name})"

    db.add(
        ResponseAction(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            responder_id=team.id,
            action_type="assigned",
            text=f"{team.name} assigned to coordinate response",
            badge="Assigned",
            occurred_at=datetime.utcnow(),
        )
    )
    db.commit()
    db.refresh(incident)
    return incident_to_out(incident, team.name)


@router.patch("/{incident_id}/status", response_model=IncidentOut)
def update_incident_status(incident_id: str, body: UpdateIncidentStatusRequest, db: Session = Depends(get_db)):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    try:
        new_status = IncidentStatus(body.status)
    except ValueError:
        raise HTTPException(status_code=422, detail=f"Invalid status: {body.status}")

    incident.status = new_status
    if new_status == IncidentStatus.RESOLVED:
        incident.resolved_at = datetime.utcnow()

    db.add(
        ResponseAction(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            action_type="resolved" if new_status == IncidentStatus.RESOLVED else "monitoring",
            text=f"Incident status updated to {new_status.value}",
            badge=new_status.value,
            occurred_at=datetime.utcnow(),
        )
    )
    db.commit()
    db.refresh(incident)
    return incident_to_out(incident, _team_name(db, incident.assigned_team_id))
