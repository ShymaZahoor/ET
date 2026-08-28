import os
import sqlite3
import joblib
import pandas as pd
from sklearn.ensemble import IsolationForest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def train_anomaly_model():
    os.makedirs(MODELS_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM sensor_data", conn)
    conn.close()

    features = ["temperature", "humidity", "soil_moisture", "rainfall", "light", "acoustic"]
    X = df[features]

    # Isolation Forest with 5% expected contamination rate
    iso_model = IsolationForest(contamination=0.05, n_estimators=150, random_state=42)
    iso_model.fit(X)

    model_path = os.path.join(MODELS_DIR, "anomaly_model.pkl")
    joblib.dump(iso_model, model_path)
    print(f"[+] Saved Isolation Forest anomaly detection model to {model_path}")

if __name__ == "__main__":
    train_anomaly_model()
