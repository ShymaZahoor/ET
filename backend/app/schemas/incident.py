from pydantic import BaseModel, ConfigDict, Field


class IncidentTimelineEventOut(BaseModel):
    time: str
    text: str
    badge: str | None = None
    type: str | None = None  # detected|classified|assigned|enroute|monitoring|resolved


class IncidentEvidenceOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    type: str  # camera_frame|track_recording|sensor_log
    title: str
    timestamp: str
    camera_id: str = Field(alias="cameraId")
    confidence: float
    image: str


class IncidentOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    type: str
    species: str
    location: str
    severity: str  # Critical|High|Warning|Watch
    created: str
    assigned_team_id: str | None = Field(default=None, alias="assignedTeamId")
    assigned_team_name: str | None = Field(default=None, alias="assignedTeamName")
    status: str  # Active|Monitoring|Assigned|Resolved
    track_id: str = Field(alias="trackId")
    risk_score: float = Field(alias="riskScore")
    entry_probability: float = Field(alias="entryProbability")
    eta: str
    distance_to_settlement: str = Field(alias="distanceToSettlement")
    timeline: list[IncidentTimelineEventOut]
    evidence: list[IncidentEvidenceOut]
    coordinates: tuple[float, float]


class AssignTeamRequest(BaseModel):
    team_id: str = Field(validation_alias="teamId")


class UpdateIncidentStatusRequest(BaseModel):
    status: str = Field(validation_alias="status")
