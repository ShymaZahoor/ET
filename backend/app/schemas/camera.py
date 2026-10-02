from pydantic import BaseModel, ConfigDict, Field


class CameraOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    zone: str
    status: str  # Live|Standby|Offline
    animals_detected: int = Field(alias="animalsDetected")
    last_confidence: float = Field(alias="lastConfidence")
    direction: str
    coordinates: tuple[float, float]
    thumbnail: str
    active_species: str | None = Field(default=None, alias="activeSpecies")
