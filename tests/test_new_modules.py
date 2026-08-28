import os
import sys
import pytest

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app
from change_detection.forest_change import get_sample_images, run_change_detection
from wildlife_vision.species_model import get_sample_image_array, classify_image, get_simulated_sightings


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_part_a_suitability_comparison_endpoint(client):
    res = client.get("/suitability-comparison")
    assert res.status_code == 200
    data = res.get_json()
    assert "rf_accuracy" in data
    assert "feature_importance" in data
    assert "recent_predictions" in data


def test_part_a_anomaly_alerts_endpoint(client):
    res = client.get("/anomaly-alerts")
    assert res.status_code == 200
    data = res.get_json()
    assert "total_anomalies" in data
    assert "anomaly_events" in data


def test_part_a_habitat_analytics_endpoint(client):
    res = client.get("/habitat-analytics")
    assert res.status_code == 200
    data = res.get_json()
    assert "summary_statistics" in data
    assert "daily_trends" in data
    assert "hourly_heatmap" in data


def test_part_b_hardware_status_endpoint(client):
    res = client.get("/hardware-status")
    assert res.status_code == 200
    data = res.get_json()
    assert data.get("simulated") is True
    assert "edge_gateway" in data
    assert "sensor_nodes" in data
    assert len(data["sensor_nodes"]) == 3


def test_part_c_change_detection():
    before, after = get_sample_images()
    assert before.shape == (256, 256, 3)
    assert after.shape == (256, 256, 3)

    result = run_change_detection(before, after)
    assert result.get("simulated") is True
    assert "change_percentage" in result
    assert "change_severity" in result
    assert "diff_image_b64" in result


def test_part_c_detect_change_endpoint(client):
    res = client.post("/detect-change")
    assert res.status_code == 200
    data = res.get_json()
    assert "change_percentage" in data


def test_part_d_wildlife_vision():
    img_arr = get_sample_image_array("bird")
    assert img_arr.shape == (224, 224, 3)

    sightings = get_simulated_sightings(5)
    assert len(sightings) == 5
    assert "species" in sightings[0]


def test_part_d_endpoints(client):
    res_traps = client.get("/camera-traps")
    assert res_traps.status_code == 200
    data_traps = res_traps.get_json()
    assert data_traps.get("simulated") is True
    assert "sightings" in data_traps

    res_classify = client.post("/classify-wildlife", data={"use_sample": "true", "sample_name": "bird"})
    assert res_classify.status_code == 200
    data_class = res_classify.get_json()
    assert "top_prediction" in data_class
    assert "top_confidence" in data_class


def test_nav_pages_load(client):
    pages = [
        "home", "live", "twin", "predictions", "forecast",
        "map", "alerts", "analytics", "simulation", "system_health",
        "hardware", "change_detection", "wildlife_vision"
    ]
    for p in pages:
        res = client.get(f"/dashboard?page={p}")
        assert res.status_code == 200, f"Page {p} failed to load."
