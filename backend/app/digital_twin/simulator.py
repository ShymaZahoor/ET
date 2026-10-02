"""
The digital twin's simulation loop -- this IS the first vertical slice:

    simulated leopard moves on the map
      -> movement_prediction estimates trajectory + time-to-conflict
      -> threat_engine scores the threat and picks severity
      -> an Alert/Incident is raised (or updated) when it matters
      -> a responder is recommended
      -> the incident is tracked tick-over-tick until risk drops and it
         auto-resolves

Everything here talks to the DB through plain SQLAlchemy sessions so the
exact same read paths the API uses (app/api/*) see live, persisted state --
there is no separate in-memory simulation state to keep in sync.

Swap point: once real camera/sensor ingestion exists, that ingestion path
writes Observations the same way `tick()` does below, and the prediction +
threat + incident logic downstream of "a new Observation arrived" is
reused unchanged.
"""
from __future__ import annotations

import asyncio
import logging
import random
import uuid
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.database import SessionLocal
from app.core.geo import bearing_degrees, destination_point, haversine_meters, latlng_from_geometry, point_from_latlng
from app.models.enums import AlertStatus, AnimalRiskLevel, IncidentStatus, NotificationCategory, RiskLevel, TrackStatus
from app.models.historical import Notification
from app.models.incident import Incident
from app.models.prediction import MovementPrediction
from app.models.responder import ResponseAction
from app.models.threat import Alert, ThreatAssessment
from app.models.wildlife import Animal, Observation, Track
from app.models.zone import HumanZone
from app.movement_prediction.predictor import predict_trajectory
from app.threat_engine.responder_matcher import recommend_responder
from app.threat_engine.scorer import score_threat
from app.wildlife.species import get_species_profile

logger = logging.getLogger("ecotwin.digital_twin")
settings = get_settings()

_RISK_TO_ANIMAL_RISK = {
    RiskLevel.CRITICAL: AnimalRiskLevel.CRITICAL,
    RiskLevel.HIGH: AnimalRiskLevel.HIGH,
    RiskLevel.WARNING: AnimalRiskLevel.MONITORING,
    RiskLevel.WATCH: AnimalRiskLevel.MONITORING,
    RiskLevel.NORMAL: AnimalRiskLevel.NORMAL,
}

# Resolve an incident once risk has stayed below this for a while
RESOLVE_RISK_THRESHOLD = 20.0


class DigitalTwinSimulator:
    """Owns the asyncio background loop. One instance per process."""

    def __init__(self) -> None:
        self._task: asyncio.Task | None = None
        self._running = False

    async def start(self) -> None:
        if self._task is not None:
            return
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("Digital twin simulation started (tick=%ss)", settings.SIMULATION_TICK_SECONDS)

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            self._task = None

    async def _run_loop(self) -> None:
        while self._running:
            try:
                await asyncio.to_thread(self._tick_sync)
            except Exception:  # pragma: no cover - defensive: one bad tick shouldn't kill the loop
                logger.exception("Simulation tick failed")
            await asyncio.sleep(settings.SIMULATION_TICK_SECONDS)

    # -- the actual tick, run in a worker thread so it never blocks the API event loop --
    def _tick_sync(self) -> None:
        db = SessionLocal()
        try:
            zone = db.execute(select(HumanZone)).scalars().first()
            if zone is None:
                logger.warning("No HumanZone seeded yet -- simulation idle. Run the seed script.")
                return

            track = self._get_or_create_track(db, zone)
            self._advance_track(db, track, zone)
            self._run_prediction_and_threat(db, track, zone)
            db.commit()
        finally:
            db.close()

    # -- setup: make sure there is a leopard track heading toward the configured zone --
    def _get_or_create_track(self, db: Session, zone: HumanZone) -> Track:
        existing = db.execute(
            select(Track).where(Track.status == TrackStatus.ACTIVE)
        ).scalars().first()
        if existing:
            return existing

        animal = Animal(id=str(uuid.uuid4()), species="Leopard", image="leopard.jpg")
        db.add(animal)

        zone_lat, zone_lng = latlng_from_geometry(zone.centroid)
        # Spawn ~2.5km out from the village at a random bearing, heading inward.
        spawn_bearing = random.uniform(0, 360)
        spawn_lat, spawn_lng = destination_point(zone_lat, zone_lng, spawn_bearing, 2500)
        heading = bearing_degrees(spawn_lat, spawn_lng, zone_lat, zone_lng)

        track = Track(
            id=str(uuid.uuid4()),
            animal_id=animal.id,
            status=TrackStatus.ACTIVE,
            risk_level=AnimalRiskLevel.NORMAL,
            current_location=point_from_latlng(spawn_lat, spawn_lng),
            location_name="Forest Buffer Zone",
            speed_mps=get_species_profile("Leopard").avg_speed_mps,
            direction_deg=heading,
        )
        db.add(track)
        db.flush()
        logger.info("Spawned simulated leopard track %s heading toward %s", track.id, zone.name)
        return track

    # -- movement: step the animal forward, with a chance to retreat once close (so incidents actually resolve) --
    def _advance_track(self, db: Session, track: Track, zone: HumanZone) -> None:
        lat, lng = latlng_from_geometry(track.current_location)
        zone_lat, zone_lng = latlng_from_geometry(zone.centroid)
        distance = haversine_meters(lat, lng, zone_lat, zone_lng)

        bearing_to_zone = bearing_degrees(lat, lng, zone_lat, zone_lng)

        if distance <= settings.CONFLICT_DISTANCE_METERS and random.random() < 0.3:
            # Close enough to "notice" the village -- turn away with some jitter,
            # simulating the animal retreating back toward the forest.
            track.direction_deg = (bearing_to_zone + 180 + random.uniform(-40, 40)) % 360
        else:
            # Mostly head toward the zone, with natural wander
            track.direction_deg = (bearing_to_zone + random.uniform(-25, 25)) % 360

        step_distance = track.speed_mps * settings.SIMULATION_TICK_SECONDS * settings.SIMULATION_SPEED_MULTIPLIER
        new_lat, new_lng = destination_point(lat, lng, track.direction_deg, step_distance)

        track.current_location = point_from_latlng(new_lat, new_lng)
        track.location_name = (
            f"{haversine_meters(new_lat, new_lng, zone_lat, zone_lng):.0f}m from {zone.name}"
        )
        track.last_seen_at = datetime.utcnow()

        db.add(
            Observation(
                id=str(uuid.uuid4()),
                track_id=track.id,
                location=track.current_location,
                speed_mps=track.speed_mps,
                direction_deg=track.direction_deg,
                source="simulation",
                observed_at=track.last_seen_at,
            )
        )

    # -- prediction + scoring + incident lifecycle --
    def _run_prediction_and_threat(self, db: Session, track: Track, zone: HumanZone) -> None:
        lat, lng = latlng_from_geometry(track.current_location)
        zone_lat, zone_lng = latlng_from_geometry(zone.centroid)
        distance = haversine_meters(lat, lng, zone_lat, zone_lng)

        prediction = predict_trajectory(
            current_lat=lat,
            current_lng=lng,
            speed_mps=track.speed_mps,
            bearing_deg=track.direction_deg,
            target_lat=zone_lat,
            target_lng=zone_lng,
            target_name=zone.name,
        )

        threat = score_threat(
            species=track.animal.species if track.animal else "Leopard",
            distance_meters=distance,
            eta_seconds=prediction.eta_seconds,
            entry_probability=prediction.entry_probability,
            zone_risk_baseline=zone.risk_baseline,
            conflict_distance_meters=settings.CONFLICT_DISTANCE_METERS,
        )

        track.risk_level = _RISK_TO_ANIMAL_RISK[threat.severity]

        db.add(
            MovementPrediction(
                id=str(uuid.uuid4()),
                track_id=track.id,
                target_zone_id=zone.id,
                predicted_destination=zone.name,
                eta_seconds=prediction.eta_seconds,
                entry_probability=prediction.entry_probability,
                confidence=prediction.confidence,
                risk_score=threat.risk_score,
                movement_path=[
                    {
                        "step": wp.step,
                        "name": wp.name,
                        "lat": wp.lat,
                        "lng": wp.lng,
                        "time": (datetime.utcnow() + timedelta(seconds=wp.time_offset_seconds)).strftime("%H:%M:%S"),
                        "risk": wp.risk,
                    }
                    for wp in prediction.movement_path
                ],
            )
        )

        assessment = ThreatAssessment(
            id=str(uuid.uuid4()),
            track_id=track.id,
            zone_id=zone.id,
            risk_score=threat.risk_score,
            entry_probability=prediction.entry_probability,
            eta_seconds=prediction.eta_seconds,
            distance_meters=distance,
            severity=threat.severity,
        )
        db.add(assessment)
        db.flush()

        self._sync_incident(db, track, zone, assessment, lat, lng)

    def _sync_incident(
        self,
        db: Session,
        track: Track,
        zone: HumanZone,
        assessment: ThreatAssessment,
        lat: float,
        lng: float,
    ) -> None:
        open_incident = db.execute(
            select(Incident).where(
                Incident.track_id == track.id,
                Incident.status != IncidentStatus.RESOLVED,
            )
        ).scalars().first()

        should_be_open = assessment.severity in (RiskLevel.CRITICAL, RiskLevel.HIGH, RiskLevel.WARNING)

        if open_incident is None and should_be_open:
            incident = Incident(
                id=str(uuid.uuid4()),
                track_id=track.id,
                zone_id=zone.id,
                threat_assessment_id=assessment.id,
                species=track.animal.species if track.animal else "Leopard",
                severity=assessment.severity,
                status=IncidentStatus.ACTIVE,
                location=point_from_latlng(lat, lng),
                location_name=track.location_name,
                risk_score=assessment.risk_score,
                entry_probability=assessment.entry_probability,
                eta_seconds=assessment.eta_seconds,
                distance_to_settlement_meters=assessment.distance_meters,
            )
            db.add(incident)
            db.flush()
            db.add(
                ResponseAction(
                    id=str(uuid.uuid4()),
                    incident_id=incident.id,
                    action_type="detected",
                    text=f"{incident.species} detected approaching {zone.name}",
                    badge="Detected",
                )
            )
            db.add(
                Alert(
                    id=str(uuid.uuid4()),
                    threat_assessment_id=assessment.id,
                    incident_id=incident.id,
                    title=f"{assessment.severity.value} threat: {incident.species} near {zone.name}",
                    description=(
                        f"Risk score {assessment.risk_score:.0f}, "
                        f"ETA {assessment.eta_seconds / 60:.0f} min to {zone.name}."
                    ),
                    severity=assessment.severity,
                    status=AlertStatus.OPEN,
                )
            )
            db.add(
                Notification(
                    id=str(uuid.uuid4()),
                    title=f"New {assessment.severity.value.lower()} threat near {zone.name}",
                    description=f"{incident.species} tracked {assessment.distance_meters:.0f}m away.",
                    category=NotificationCategory(assessment.severity.value if assessment.severity.value in
                                                   ("Critical", "High") else "Medium"),
                    read=False,
                    link=f"/incidents/{incident.id}",
                )
            )

            # Recommend (but do not auto-dispatch) the nearest responder
            responder = recommend_responder(db, incident_lat=lat, incident_lng=lng)
            if responder:
                db.add(
                    ResponseAction(
                        id=str(uuid.uuid4()),
                        incident_id=incident.id,
                        responder_id=responder.id,
                        action_type="recommended",
                        text=f"{responder.name} recommended as nearest available team",
                        badge="Recommended",
                    )
                )

        elif open_incident is not None:
            open_incident.risk_score = assessment.risk_score
            open_incident.entry_probability = assessment.entry_probability
            open_incident.eta_seconds = assessment.eta_seconds
            open_incident.distance_to_settlement_meters = assessment.distance_meters
            open_incident.severity = assessment.severity
            open_incident.location = point_from_latlng(lat, lng)
            open_incident.location_name = track.location_name

            if assessment.risk_score < RESOLVE_RISK_THRESHOLD and open_incident.status != IncidentStatus.RESOLVED:
                open_incident.status = IncidentStatus.RESOLVED
                open_incident.resolved_at = datetime.utcnow()
                db.add(
                    ResponseAction(
                        id=str(uuid.uuid4()),
                        incident_id=open_incident.id,
                        action_type="resolved",
                        text="Risk score dropped below threshold -- incident auto-resolved",
                        badge="Resolved",
                    )
                )
                track.status = TrackStatus.RESOLVED


simulator = DigitalTwinSimulator()
