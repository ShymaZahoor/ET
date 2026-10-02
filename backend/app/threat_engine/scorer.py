"""
Threat scoring, v0: a transparent weighted formula rather than a black-box
model. Same reasoning as movement_prediction -- this is a heuristic
baseline for the first working prototype, with the interface shaped so a
trained risk-prediction model can replace `score_threat()` later without
touching the digital_twin loop or the API layer that calls it.
"""
from dataclasses import dataclass

from app.models.enums import RiskLevel
from app.wildlife.species import get_species_profile


@dataclass
class ThreatScoreResult:
    risk_score: float  # 0-100
    severity: RiskLevel


def score_threat(
    *,
    species: str,
    distance_meters: float,
    eta_seconds: float,
    entry_probability: float,
    zone_risk_baseline: float = 1.0,
    conflict_distance_meters: float = 150.0,
) -> ThreatScoreResult:
    """
    Weighted blend of:
      - proximity   (closer => higher risk)
      - urgency     (sooner ETA => higher risk)
      - likelihood  (entry_probability from the movement predictor)
      - species danger factor
      - the zone's own baseline risk multiplier (e.g. a school scores
        higher than open farmland for the same animal distance)
    """
    profile = get_species_profile(species)

    proximity_score = max(0.0, 1 - min(distance_meters / 3000, 1))  # within 3km scales 0-1
    # Urgency: anything under 10 minutes is treated as maximally urgent
    urgency_score = max(0.0, 1 - min(eta_seconds / 600, 1))
    likelihood_score = entry_probability / 100

    raw = (
        0.35 * proximity_score
        + 0.25 * urgency_score
        + 0.25 * likelihood_score
        + 0.15 * profile.danger_factor
    )
    risk_score = round(min(100.0, raw * 100 * zone_risk_baseline), 1)

    if distance_meters <= conflict_distance_meters or risk_score >= 85:
        severity = RiskLevel.CRITICAL
    elif risk_score >= 65:
        severity = RiskLevel.HIGH
    elif risk_score >= 40:
        severity = RiskLevel.WARNING
    elif risk_score >= 20:
        severity = RiskLevel.WATCH
    else:
        severity = RiskLevel.NORMAL

    return ThreatScoreResult(risk_score=risk_score, severity=severity)
