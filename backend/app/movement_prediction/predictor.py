"""
Movement prediction, v0: straight-line kinematic projection.

This deliberately has the narrowest possible interface --
`predict(current_lat, current_lng, speed_mps, bearing_deg, target_lat, target_lng)
-> PredictionResult` -- so that Phase 3 (a trained LSTM/sequence model
consuming the Track's full Observation history) can be dropped in behind
the same function signature without touching callers in the threat engine
or API layer. Swap this module out; nothing upstream should need to change.
"""
from dataclasses import dataclass

from app.core.geo import bearing_degrees, destination_point, haversine_meters


@dataclass
class PredictionWaypoint:
    step: int
    name: str
    lat: float
    lng: float
    time_offset_seconds: float
    risk: float


@dataclass
class PredictionResult:
    predicted_destination: str
    eta_seconds: float
    entry_probability: float  # 0-100
    confidence: float  # 0-100
    movement_path: list[PredictionWaypoint]


def predict_trajectory(
    *,
    current_lat: float,
    current_lng: float,
    speed_mps: float,
    bearing_deg: float,
    target_lat: float,
    target_lng: float,
    target_name: str,
    steps: int = 5,
) -> PredictionResult:
    """
    v0 model: assumes the animal continues on its current bearing at its
    current speed, and blends in a pull toward the target zone (since in
    the simulated/early-data regime we don't yet have enough history to
    fit a real sequence model, but we do know which zone is nearest/most
    at-risk). Confidence is intentionally capped lower than a trained
    model would report, signalling "this is the heuristic baseline".
    """
    distance_to_target = haversine_meters(current_lat, current_lng, target_lat, target_lng)
    bearing_to_target = bearing_degrees(current_lat, current_lng, target_lat, target_lng)

    # How well-aligned is current heading with the direct path to the target?
    # 0 = heading straight at it, 180 = heading straight away.
    heading_delta = abs(((bearing_deg - bearing_to_target) + 180) % 360 - 180)
    alignment = max(0.0, 1 - heading_delta / 180)  # 1 = perfectly aligned, 0 = opposite

    effective_speed = max(speed_mps, 0.1)
    eta_seconds = distance_to_target / effective_speed

    # Entry probability: higher when closer and better-aligned with the zone
    proximity_factor = max(0.0, 1 - min(distance_to_target / 5000, 1))  # within 5km scales to 0-1
    entry_probability = round(min(98.0, max(5.0, (0.6 * alignment + 0.4 * proximity_factor) * 100)), 1)

    # Confidence: heuristic baseline, nudged by how much track history-like
    # signal we have (alignment itself is a reasonable proxy pre-ML).
    confidence = round(55 + 25 * alignment, 1)

    # Build a blended path: interpolate between "continue current bearing"
    # and "beeline to target", weighted more toward the target each step so
    # the projected path curves in, which is a reasonable prior before a
    # learned model replaces it.
    waypoints: list[PredictionWaypoint] = []
    lat, lng = current_lat, current_lng
    remaining = distance_to_target
    for step in range(1, steps + 1):
        pull = step / steps  # 0 -> 1, increasing pull toward target
        blended_bearing = (bearing_deg * (1 - pull)) + (bearing_to_target * pull)
        step_distance = max(remaining / (steps - step + 1), 1.0)
        lat, lng = destination_point(lat, lng, blended_bearing, step_distance)
        remaining = haversine_meters(lat, lng, target_lat, target_lng)
        risk_at_step = round(min(100.0, max(0.0, (1 - remaining / max(distance_to_target, 1)) * entry_probability)), 1)
        waypoints.append(
            PredictionWaypoint(
                step=step,
                name=f"Waypoint {step}" if step < steps else target_name,
                lat=round(lat, 6),
                lng=round(lng, 6),
                time_offset_seconds=round(eta_seconds * (step / steps), 1),
                risk=risk_at_step,
            )
        )

    return PredictionResult(
        predicted_destination=target_name,
        eta_seconds=eta_seconds,
        entry_probability=entry_probability,
        confidence=confidence,
        movement_path=waypoints,
    )
