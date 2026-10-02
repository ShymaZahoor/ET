from pydantic import BaseModel, ConfigDict, Field


class ResponderTeamOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    region: str
    status: str  # Available|On Mission|En Route|Offline
    distance: str
    eta: str
    current_assignment: str | None = Field(default=None, alias="currentAssignment")
    members_count: int = Field(alias="membersCount")
    leader: str
    coordinates: tuple[float, float]
    contact_channel: str = Field(alias="contactChannel")


class DispatchTeamRequest(BaseModel):
    target_location: str = Field(validation_alias="targetLocation")
