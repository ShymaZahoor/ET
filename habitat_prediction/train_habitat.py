import os
import sqlite3
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")
MODELS_DIR = os.path.join(BASE_DIR, "models")

def train_habitat_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    df = pd.read_sql("SELECT * FROM sensor_data", conn)
    conn.close()

    # Rule-based domain bootstrapping for habitat suitability score & animal presence
    df["suitable"] = (
        (df["temperature"].between(18, 34)) &
        (df["soil_moisture"] > 20) &
        (df["acoustic"] < 75) &
        (df["rainfall"] <= 55)
    ).astype(int)

    # Encode season feature
    season_map = {"summer": 0, "monsoon": 1, "winter": 2}
    df["season_code"] = df["season"].map(season_map).fillna(0).astype(int)

    feature_cols = ["temperature", "humidity", "soil_moisture", "rainfall", "light", "acoustic", "motion", "season_code"]
    X = df[feature_cols]
    y = df["suitable"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # 1. Random Forest Classifier
    rf_model = RandomForestClassifier(n_estimators=200, max_depth=8, random_state=42)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_preds)
    print(f"[+] Random Forest Habitat Suitability Model Accuracy: {rf_acc * 100:.2f}%")

    rf_path = os.path.join(MODELS_DIR, "habitat_model.pkl")
    joblib.dump(rf_model, rf_path)
    print(f"[+] Saved Random Forest habitat model to {rf_path}")

    # 2. XGBoost Classifier (if available)
    try:
        from xgboost import XGBClassifier
        xgb_model = XGBClassifier(n_estimators=150, max_depth=4, learning_rate=0.05, eval_metric="logloss", random_state=42)
        xgb_model.fit(X_train, y_train)
        xgb_preds = xgb_model.predict(X_test)
        xgb_acc = accuracy_score(y_test, xgb_preds)
        print(f"[+] XGBoost Habitat Suitability Model Accuracy: {xgb_acc * 100:.2f}%")

        xgb_path = os.path.join(MODELS_DIR, "habitat_model_xgb.pkl")
        joblib.dump(xgb_model, xgb_path)
        print(f"[+] Saved XGBoost habitat model to {xgb_path}")
    except ImportError:
        print("[-] XGBoost not installed, skipping XGBoost training (Random Forest model generated).")

if __name__ == "__main__":
    train_habitat_models()
