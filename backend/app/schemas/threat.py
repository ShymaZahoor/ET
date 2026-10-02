from pydantic import BaseModel, ConfigDict, Field


class ThreatOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    track_id: str = Field(alias="trackId")
    species: str
    image: str
    location: str
    risk_score: float = Field(alias="riskScore")
    entry_probability: float = Field(alias="entryProbability")
    eta: str
    status: str  # Critical|High|Warning|Watch
    distance_to_zone: str = Field(alias="distanceToZone")
    zone_name: str = Field(alias="zoneName")
    direction: str
    speed: str
    coordinates: tuple[float, float]
