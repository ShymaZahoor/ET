import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest

# Load processed data
df = pd.read_csv("data/processed_readings.csv")

# Features for anomaly detection
features = df[
    [
        "temperature_z",
        "humidity_z",
        "soil_moisture_z",
        "rainfall_z",
        "light_z",
        "acoustic_z",
        "motion",
        "hour"
    ]
]

# Train Isolation Forest
model = IsolationForest(
    contamination=0.05,
    random_state=42
)

model.fit(features)

# Save the trained model
joblib.dump(model, "models/anomaly_model.pkl")

# Predict anomalies
df["anomaly"] = model.predict(features)

# Save results
df.to_csv("data/anomaly_results.csv", index=False)

print("\nTraining Complete!\n")

print("Total Records:", len(df))
print("Normal Records:", (df["anomaly"] == 1).sum())
print("Anomalies:", (df["anomaly"] == -1).sum())

print("\nDetected Anomalies:\n")
print(df[df["anomaly"] == -1].head())