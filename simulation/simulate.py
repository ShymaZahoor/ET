import os
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
HABITAT_MODEL_PATH = os.path.join(MODELS_DIR, "habitat_model.pkl")
ANOMALY_MODEL_PATH = os.path.join(MODELS_DIR, "anomaly_model.pkl")

def run_whatif_simulation(current_reading: dict, percentage_changes: dict) -> dict:
    """
    Simulates environmental scenario modifications on current habitat state.
    
    current_reading: dict of baseline sensor telemetry
    percentage_changes: e.g. {"rainfall": -0.30, "temperature": 0.15, "humidity": -0.10}
    """
    simulated_values = dict(current_reading)

    for field, factor in percentage_changes.items():
        if field in simulated_values and isinstance(simulated_values[field], (int, float)):
            simulated_values[field] = round(simulated_values[field] * (1.0 + float(factor)), 2)

    # Encode season
    season_code = {"summer": 0, "monsoon": 1, "winter": 2}.get(simulated_values.get("season", "summer"), 0)

    # Prepare features for ML evaluation
    features = pd.DataFrame([{
        "temperature": simulated_values.get("temperature", 25.0),
        "humidity": simulated_values.get("humidity", 50.0),
        "soil_moisture": simulated_values.get("soil_moisture", 30.0),
        "rainfall": simulated_values.get("rainfall", 5.0),
        "light": simulated_values.get("light", 400.0),
        "acoustic": simulated_values.get("acoustic", 45.0),
        "motion": simulated_values.get("motion", 0),
        "season_code": season_code
    }])

    habitat_suitable = True
    suitability_confidence = 85.0
    animal_presence_probability = 60.0
    stress_detected = False

    if os.path.exists(HABITAT_MODEL_PATH):
        model = joblib.load(HABITAT_MODEL_PATH)
        pred = model.predict(features)[0]
        probas = model.predict_proba(features)[0]
        habitat_suitable = bool(pred == 1)
        suitability_confidence = round(float(probas[1 if habitat_suitable else 0]) * 100, 2)
        animal_presence_probability = round(float(probas[1]) * 100, 2)

    if os.path.exists(ANOMALY_MODEL_PATH):
        anomaly_features = features[["temperature", "humidity", "soil_moisture", "rainfall", "light", "acoustic"]]
        iso_model = joblib.load(ANOMALY_MODEL_PATH)
        anom_pred = iso_model.predict(anomaly_features)[0]
        stress_detected = bool(anom_pred == -1)

    return {
        "scenario_adjustments": percentage_changes,
        "baseline_state": current_reading,
        "simulated_state": simulated_values,
        "habitat_suitable": habitat_suitable,
        "suitability_confidence": suitability_confidence,
        "animal_presence_probability": animal_presence_probability,
        "stress_detected": stress_detected,
        "impact_summary": (
            "Habitat stress and degraded suitability predicted under scenario."
            if (not habitat_suitable or stress_detected)
            else "Habitat parameters remain optimal for wildlife under simulated scenario."
        )
    }

if __name__ == "__main__":
    sample_baseline = {
        "temperature": 28.0, "humidity": 60.0, "soil_moisture": 35.0,
        "rainfall": 10.0, "light": 500.0, "acoustic": 40.0, "motion": 1, "season": "summer"
    }
    result = run_whatif_simulation(sample_baseline, {"rainfall": -0.40, "temperature": 0.20})
    print("Simulation Output:", result)
