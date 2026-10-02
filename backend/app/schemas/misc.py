from pydantic import BaseModel, ConfigDict, Field


class MovementPathPoint(BaseModel):
    step: int
    name: str
    lat: float
    lng: float
    time: str
    risk: float


class PredictionOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    track_id: str = Field(alias="trackId")
    species: str
    image: str
    current_location: str = Field(alias="currentLocation")
    predicted_destination: str = Field(alias="predictedDestination")
    eta_to_zone: str = Field(alias="etaToZone")
    entry_probability: float = Field(alias="entryProbability")
    prediction_confidence: float = Field(alias="predictionConfidence")
    risk_score: float = Field(alias="riskScore")
    movement_path: list[MovementPathPoint] = Field(alias="movementPath")


class HabitatDataOut(BaseModel):
    region: str
    temperature: float
    humidity: float
    rainfall: float
    ndvi: float
    condition: str
    water_sources: int = Field(alias="waterSources")
    corridor_integrity: str = Field(alias="corridorIntegrity")

    model_config = ConfigDict(populate_by_name=True)


class DetectionModelStatus(BaseModel):
    name: str
    architecture: str
    status: str
    map50: float
    precision: float
    recall: float
    last_updated: str = Field(alias="lastUpdated")

    model_config = ConfigDict(populate_by_name=True)


class TrackingModelStatus(BaseModel):
    name: str
    architecture: str
    status: str
    active_tracks: int = Field(alias="activeTracks")
    tracking_fps: float = Field(alias="trackingFps")
    last_updated: str = Field(alias="lastUpdated")

    model_config = ConfigDict(populate_by_name=True)


class RiskPredictionModelStatus(BaseModel):
    name: str
    architecture: str
    status: str
    accuracy: float
    last_updated: str = Field(alias="lastUpdated")

    model_config = ConfigDict(populate_by_name=True)


class DatasetStats(BaseModel):
    total_images: int = Field(alias="totalImages")
    species_count: int = Field(alias="speciesCount")
    training_images: int = Field(alias="trainingImages")
    validation_images: int = Field(alias="validationImages")
    test_images: int = Field(alias="testImages")

    model_config = ConfigDict(populate_by_name=True)


class ClassStats(BaseModel):
    id: str
    name: str
    samples: int
    f1_score: float = Field(alias="f1Score")
    precision: float
    recall: float

    model_config = ConfigDict(populate_by_name=True)


class AIModelStatusOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    detection: DetectionModelStatus
    tracking: TrackingModelStatus
    risk_prediction: RiskPredictionModelStatus = Field(alias="riskPrediction")
    dataset: DatasetStats
    classes: list[ClassStats]


class NotificationOut(BaseModel):
    id: str
    title: str
    description: str
    time: str
    category: str  # Critical|High|Medium|Low|Info
    read: bool
    link: str | None = None


class SightingsTrendPoint(BaseModel):
    time: str
    # species -> count; frontend reads this as a flexible row like
    # { time: '00:00', Leopard: 2, Elephant: 1, ... } so we pass through
    # a dict of species counts merged with the bucket label.
    model_config = ConfigDict(extra="allow")


class SpeciesDistributionSlice(BaseModel):
    name: str
    value: int
    color: str


class AnalyticsOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_sightings: int = Field(alias="totalSightings")
    threats_detected: int = Field(alias="threatsDetected")
    incidents_handled: int = Field(alias="incidentsHandled")
    response_success: float = Field(alias="responseSuccess")
    avg_response_time: str = Field(alias="avgResponseTime")
    sightings_trend: list[dict] = Field(alias="sightingsTrend")
    species_distribution: list[SpeciesDistributionSlice] = Field(alias="speciesDistribution")
    time_range: str = Field(alias="timeRange")
