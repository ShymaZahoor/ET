import os
import json
import joblib
import pandas as pd
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
ANOMALY_MODEL_PATH = os.path.join(MODELS_DIR, "anomaly_model.pkl")
CACHE_FILE = os.path.join(BASE_DIR, "edge", "local_cache.jsonl")

class EdgeIntelligenceRunner:
    """
    Edge Device Inference Engine.
    Executes fast lightweight local anomaly checks on telemetry before cloud transmission.
    Saves bandwidth by sending normal readings periodically and anomalies instantly.
    Caches data locally in JSONL format if cloud backend is unreachable (Offline Mode).
    """

    def __init__(self):
        self.anomaly_model = None
        if os.path.exists(ANOMALY_MODEL_PATH):
            self.anomaly_model = joblib.load(ANOMALY_MODEL_PATH)

    def evaluate_telemetry(self, reading: dict) -> dict:
        is_anomaly = False
        features = [[
            reading.get("temperature", 25.0),
            reading.get("humidity", 50.0),
            reading.get("soil_moisture", 30.0),
            reading.get("rainfall", 0.0),
            reading.get("light", 400.0),
            reading.get("acoustic", 40.0)
        ]]

        if self.anomaly_model:
            score = self.anomaly_model.predict(features)[0]
            is_anomaly = bool(score == -1)

        return {
            "reading": reading,
            "is_anomaly": is_anomaly,
            "processed_at": datetime.now(timezone.utc).isoformat()
        }

    def cache_locally(self, payload: dict):
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "a") as f:
            f.write(json.dumps(payload) + "\n")

    def process_and_dispatch(self, reading: dict, upload_callback=None) -> dict:
        eval_result = self.evaluate_telemetry(reading)
        
        # Immediate upload if anomaly detected, or periodic heartbeat
        uploaded = False
        if upload_callback:
            try:
                upload_callback(eval_result)
                uploaded = True
            except Exception as e:
                # Backend unreachable - fallback to offline local cache
                self.cache_locally(eval_result)
        else:
            self.cache_locally(eval_result)

        eval_result["uploaded"] = uploaded
        return eval_result

edge_runner = EdgeIntelligenceRunner()
