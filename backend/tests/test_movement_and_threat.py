"""
Unit tests for the two core algorithms, independent of the DB/API --
these should stay fast and deterministic since they're the logic most
likely to change as the heuristics get replaced with trained models.
"""
from app.models.enums import RiskLevel
from app.movement_prediction.predictor import predict_trajectory
from app.threat_engine.scorer import score_threat


def test_predict_trajectory_heading_straight_at_target():
    # Animal 1km due south of the target, heading due north (bearing 0) -> straight at it
    result = predict_trajectory(
        current_lat=26.000,
        current_lng=76.500,
        speed_mps=2.0,
        bearing_deg=0,
        target_lat=26.009,  # roughly 1km north
        target_lng=76.500,
        target_name="Test Village",
    )
    assert result.eta_seconds > 0
    assert 0 <= result.entry_probability <= 100
    assert 0 <= result.confidence <= 100
    assert len(result.movement_path) == 5
    # Heading straight at a close target should produce high entry probability
    assert result.entry_probability > 50


def test_predict_trajectory_heading_away_from_target():
    result = predict_trajectory(
        current_lat=26.000,
        current_lng=76.500,
        speed_mps=2.0,
        bearing_deg=180,  # heading south, away from a target to the north
        target_lat=26.009,
        target_lng=76.500,
        target_name="Test Village",
    )
    # Heading away should score a lower entry probability than heading toward
    toward = predict_trajectory(
        current_lat=26.000,
        current_lng=76.500,
        speed_mps=2.0,
        bearing_deg=0,
        target_lat=26.009,
        target_lng=76.500,
        target_name="Test Village",
    )
    assert result.entry_probability < toward.entry_probability


def test_score_threat_close_distance_is_critical():
    result = score_threat(
        species="Leopard",
        distance_meters=50,  # inside conflict range
        eta_seconds=60,
        entry_probability=90,
        conflict_distance_meters=150,
    )
    assert result.severity == RiskLevel.CRITICAL


def test_score_threat_far_distance_is_low_risk():
    result = score_threat(
        species="Deer",  # low danger factor
        distance_meters=5000,
        eta_seconds=3600,
        entry_probability=10,
        conflict_distance_meters=150,
    )
    assert result.severity in (RiskLevel.NORMAL, RiskLevel.WATCH)
    assert result.risk_score < 40


def test_score_threat_species_danger_factor_matters():
    shared_kwargs = dict(distance_meters=1000, eta_seconds=600, entry_probability=50, conflict_distance_meters=150)
    leopard = score_threat(species="Leopard", **shared_kwargs)
    deer = score_threat(species="Deer", **shared_kwargs)
    assert leopard.risk_score > deer.risk_score
