import os
import sqlite3
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")

class HabitatDigitalTwin:
    """
    State Manager for EcoTwin Digital Twin.
    Maintains continuous synchronization across four core state planes:
    1. current_state: Latest telemetry readings & live inference metrics.
    2. historical_state: Last N telemetry readings from persistent storage.
    3. predicted_state: Multi-horizon forecasts (3h, 12h, 24h) from LSTM model.
    4. simulated_state: Environmental 'What-If' scenario simulation outputs.
    """

    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.current_state = {}
        self.historical_state = []
        self.predicted_state = {}
        self.simulated_state = {}
        self.wildlife_sightings = []   # Part D: simulated camera-trap events
        self.last_synced_at = None

    def sync_from_database(self, history_limit=50):
        """Pulls latest reading and last N readings from database to sync current & historical state."""
        if not os.path.exists(self.db_path):
            return self.current_state

        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()

        cur.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT 1")
        latest = cur.fetchone()

        cur.execute("SELECT * FROM sensor_data ORDER BY id DESC LIMIT ?", (history_limit,))
        history = cur.fetchall()
        conn.close()

        if latest:
            self.current_state = dict(latest)
        
        self.historical_state = [dict(row) for row in reversed(history)]
        self.last_synced_at = datetime.now(timezone.utc).isoformat()
        return self.current_state

    def update_predicted_state(self, horizon: str, forecast_dict: dict):
        """Updates the predicted future state for a specific horizon (3h, 12h, 24h)."""
        self.predicted_state[horizon] = forecast_dict

    def update_simulated_state(self, simulation_result: dict):
        """Updates the 'What-If' simulated habitat state."""
        self.simulated_state = simulation_result

    def update_wildlife_sightings(self, sightings: list):
        """Part D: Stores the latest simulated camera-trap sighting events."""
        self.wildlife_sightings = sightings

    def full_snapshot(self):
        """Returns unified snapshot of all five twin states for frontend rendering."""
        return {
            "current_state": self.current_state,
            "historical_state": self.historical_state,
            "predicted_state": self.predicted_state,
            "simulated_state": self.simulated_state,
            "wildlife_sightings": self.wildlife_sightings,
            "last_synced_at": self.last_synced_at or datetime.now(timezone.utc).isoformat()
        }

# Global Singleton Instance shared across backend services
twin = HabitatDigitalTwin()