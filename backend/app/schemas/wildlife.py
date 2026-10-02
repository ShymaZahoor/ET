"""
Response schemas mirroring the frontend's TypeScript interfaces field for
field (see frontend/src/types/index.ts). Keeping field names in exact sync
(camelCase, via alias) means the frontend's api.ts swap-in is a pure
find-and-replace of the mock calls with fetch calls -- no reshaping needed.
"""
from pydantic import BaseModel, ConfigDict, Field


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class DetectionOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    camera_id: str = Field(alias="cameraId")
    camera_name: str = Field(alias="cameraName")
    species: str
    confidence: float
    timestamp: str
    bounding_box: BoundingBox = Field(alias="boundingBox")
    track_id: str = Field(alias="trackId")
    image: str
    movement_direction: str | None = Field(default=None, alias="movementDirection")


class AnimalOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    track_id: str = Field(alias="trackId")
    species: str
    image: str
    location: str
    speed: str
    direction: str
    last_seen: str = Field(alias="lastSeen")
    risk_level: str = Field(alias="riskLevel")  # Critical|High|Monitoring|Normal
    status: str  # Active|Monitoring|Resolved
    coordinates: tuple[float, float]  # [lat, lng]
