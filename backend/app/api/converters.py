"""
DB model -> frontend-shaped schema converters. Isolated here so routers
stay thin (fetch + convert + return) and every place that renders, say, an
Incident does it the same way.
"""
from app.core.format import format_distance, format_eta, format_relative_time, format_speed_kmh
from app.core.geo import latlng_from_geometry
from app.models.camera import Camera, Detection
from app.models.historical import Notification
from app.models.incident import Incident
from app.models.prediction import MovementPrediction
from app.models.responder import Responder
from app.models.threat import ThreatAssessment
from app.models.wildlife import Track
from app.models.zone import HumanZone
from app.schemas.camera import CameraOut
from app.schemas.incident import IncidentEvidenceOut, IncidentOut, IncidentTimelineEventOut
from app.schemas.misc import MovementPathPoint, NotificationOut, PredictionOut
from app.schemas.responder import ResponderTeamOut
from app.schemas.threat import ThreatOut
from app.schemas.wildlife import AnimalOut, BoundingBox, DetectionOut


def track_to_animal(track: Track) -> AnimalOut:
    lat, lng = latlng_from_geometry(track.current_location)
    return AnimalOut(
        id=track.animal_id,
        trackId=track.id,
        species=track.animal.species if track.animal else "Unknown",
        image=track.animal.image if track.animal else "animal.jpg",
        location=track.location_name,
        speed=format_speed_kmh(track.speed_mps),
        direction=_bearing_to_compass(track.direction_deg),
        lastSeen=format_relative_time(track.last_seen_at),
        riskLevel=track.risk_level.value,
        status=track.status.value,
        coordinates=(lat, lng),
    )


def assessment_to_threat(assessment: ThreatAssessment, track: Track, zone: HumanZone) -> ThreatOut:
    lat, lng = latlng_from_geometry(track.current_location)
    return ThreatOut(
        id=assessment.id,
        trackId=track.id,
        species=track.animal.species if track.animal else "Unknown",
        image=track.animal.image if track.animal else "animal.jpg",
        location=track.location_name,
        riskScore=assessment.risk_score,
        entryProbability=assessment.entry_probability,
        eta=format_eta(assessment.eta_seconds),
        status=assessment.severity.value,
        distanceToZone=format_distance(assessment.distance_meters),
        zoneName=zone.name,
        direction=_bearing_to_compass(track.direction_deg),
        speed=format_speed_kmh(track.speed_mps),
        coordinates=(lat, lng),
    )


def incident_to_out(incident: Incident, team_name: str | None) -> IncidentOut:
    lat, lng = latlng_from_geometry(incident.location)
    return IncidentOut(
        id=incident.id,
        type=incident.incident_type,
        species=incident.species,
        location=incident.location_name,
        severity=incident.severity.value,
        created=format_relative_time(incident.created_at),
        assignedTeamId=incident.assigned_team_id,
        assignedTeamName=team_name,
        status=incident.status.value,
        trackId=incident.track_id,
        riskScore=incident.risk_score,
        entryProbability=incident.entry_probability,
        eta=format_eta(incident.eta_seconds),
        distanceToSettlement=format_distance(incident.distance_to_settlement_meters),
        timeline=[
            IncidentTimelineEventOut(
                time=format_clock_from_action(a.occurred_at), text=a.text, badge=a.badge, type=a.action_type
            )
            for a in incident.timeline
        ],
        evidence=[
            IncidentEvidenceOut(
                id=e.id,
                type=e.evidence_type,
                title=e.title,
                timestamp=format_relative_time(e.timestamp),
                cameraId=e.camera_id or "",
                confidence=e.confidence,
                image=e.image or "",
            )
            for e in incident.evidence
        ],
        coordinates=(lat, lng),
    )


def format_clock_from_action(dt) -> str:
    return dt.strftime("%H:%M")


def responder_to_out(responder: Responder, *, distance_meters: float | None = None, eta_seconds: float | None = None) -> ResponderTeamOut:
    lat, lng = latlng_from_geometry(responder.location)
    return ResponderTeamOut(
        id=responder.id,
        name=responder.name,
        region=responder.region,
        status=responder.status.value,
        distance=format_distance(distance_meters) if distance_meters is not None else "--",
        eta=format_eta(eta_seconds) if eta_seconds is not None else "--",
        currentAssignment=responder.current_assignment,
        membersCount=responder.members_count,
        leader=responder.leader,
        coordinates=(lat, lng),
        contactChannel=responder.contact_channel,
    )


def camera_to_out(camera: Camera, *, animals_detected: int, last_confidence: float, active_species: str | None) -> CameraOut:
    lat, lng = latlng_from_geometry(camera.location)
    return CameraOut(
        id=camera.id,
        name=camera.name,
        zone=camera.zone,
        status=camera.status.value,
        animalsDetected=animals_detected,
        lastConfidence=last_confidence,
        direction=_bearing_to_compass(camera.direction_deg),
        coordinates=(lat, lng),
        thumbnail=camera.thumbnail or "",
        activeSpecies=active_species,
    )


def detection_to_out(detection: Detection, camera_name: str) -> DetectionOut:
    return DetectionOut(
        id=detection.id,
        cameraId=detection.camera_id,
        cameraName=camera_name,
        species=detection.species,
        confidence=detection.confidence,
        timestamp=format_relative_time(detection.timestamp),
        boundingBox=BoundingBox(**detection.bounding_box),
        trackId=detection.track_id or "",
        image=detection.image or "",
        movementDirection=detection.movement_direction,
    )


def prediction_to_out(prediction: MovementPrediction, track: Track) -> PredictionOut:
    lat, lng = latlng_from_geometry(track.current_location)
    return PredictionOut(
        trackId=track.id,
        species=track.animal.species if track.animal else "Unknown",
        image=track.animal.image if track.animal else "animal.jpg",
        currentLocation=track.location_name,
        predictedDestination=prediction.predicted_destination,
        etaToZone=format_eta(prediction.eta_seconds),
        entryProbability=prediction.entry_probability,
        predictionConfidence=prediction.confidence,
        riskScore=prediction.risk_score,
        movementPath=[MovementPathPoint(**wp) for wp in prediction.movement_path],
    )


def notification_to_out(n: Notification) -> NotificationOut:
    return NotificationOut(
        id=n.id,
        title=n.title,
        description=n.description,
        time=format_relative_time(n.created_at),
        category=n.category.value,
        read=n.read,
        link=n.link,
    )


def _bearing_to_compass(deg: float) -> str:
    directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    idx = round(deg / 45) % 8
    return directions[idx]
