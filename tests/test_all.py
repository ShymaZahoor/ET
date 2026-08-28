import os
import sys
import pytest
import sqlite3
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from digital_twin.twin_state import twin
from simulation.simulate import run_whatif_simulation
from edge.edge_runner import edge_runner
from backend.app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_database_seeded():
    db_path = os.path.join(PROJECT_ROOT, "data", "ecotwin.db")
    assert os.path.exists(db_path), "Database file ecotwin.db must exist."
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM sensor_data")
    count = cur.fetchone()[0]
    conn.close()
    assert count > 0, "Sensor data table must be populated."

def test_digital_twin_state():
    state = twin.sync_from_database()
    assert isinstance(state, dict), "Current state must be a dict."
    snapshot = twin.full_snapshot()
    assert "current_state" in snapshot
    assert "historical_state" in snapshot
    assert "predicted_state" in snapshot
    assert "simulated_state" in snapshot

def test_whatif_simulation():
    baseline = {
        "temperature": 28.0, "humidity": 60.0, "soil_moisture": 35.0,
        "rainfall": 10.0, "light": 500.0, "acoustic": 40.0, "motion": 1, "season": "summer"
    }
    result = run_whatif_simulation(baseline, {"rainfall": -0.30})
    assert "habitat_suitable" in result
    assert "suitability_confidence" in result
    assert "simulated_state" in result
    assert result["simulated_state"]["rainfall"] == 7.0

def test_edge_intelligence():
    reading = {
        "temperature": 48.0, "humidity": 10.0, "soil_moisture": 5.0,
        "rainfall": 0.0, "light": 900.0, "acoustic": 95.0
    }
    result = edge_runner.evaluate_telemetry(reading)
    assert "is_anomaly" in result
    assert isinstance(result["is_anomaly"], bool)

def test_backend_api_endpoints(client):
    res_test = client.get("/test")
    assert res_test.status_code == 200

    res_latest = client.get("/latest")
    assert res_latest.status_code == 200

    res_habitat = client.get("/habitat")
    assert res_habitat.status_code in [200, 404]

    res_twin = client.get("/digital-twin")
    assert res_twin.status_code == 200

    res_health = client.get("/system-health")
    assert res_health.status_code == 200
