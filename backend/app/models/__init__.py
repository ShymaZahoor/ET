"""
Import every model module here so that Base.metadata.create_all() (and
Alembic's autogenerate) discover all tables. Nothing else should need to
import individual model modules directly -- import from app.models instead.
"""
from app.models.camera import Camera, Detection
from app.models.historical import HistoricalConflict, Notification
from app.models.incident import Incident, IncidentEvidence
from app.models.prediction import MovementPrediction
from app.models.responder import Responder, ResponseAction
from app.models.threat import Alert, ThreatAssessment
from app.models.wildlife import Animal, Observation, Track
from app.models.zone import HumanZone

__all__ = [
    "Animal",
    "Observation",
    "Track",
    "HumanZone",
    "MovementPrediction",
    "ThreatAssessment",
    "Alert",
    "Incident",
    "IncidentEvidence",
    "Responder",
    "ResponseAction",
    "HistoricalConflict",
    "Camera",
    "Detection",
    "Notification",
]
