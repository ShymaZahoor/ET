import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.metrics import classification_report
df = pd.read_csv("data/processed_readings.csv")

print(df.head())


def habitat_status(row):

    if (
        20 <= row["temperature"] <= 30 and
        row["humidity"] >= 60 and
        row["soil_moisture"] >= 40 and
        row["rainfall"] >= 2
    ):
        return "Suitable"

    elif (
        row["temperature"] > 34 or
        row["temperature"] < 18 or
        row["soil_moisture"] < 25 or
        row["humidity"] < 35
    ):
        return "Unsuitable"

    else:
        return "Moderate"


df["habitat_status"] = df.apply(habitat_status, axis=1)

print(df["habitat_status"].value_counts())


X = df[
    [
        "temperature",
        "humidity",
        "soil_moisture",
        "rainfall",
        "light",
        "acoustic",
        "motion",
        "hour"
    ]
]

y = df["habitat_status"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

model.fit(X_train, y_train)


predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print()

print("Accuracy:", accuracy)

print()

print(classification_report(
    y_test,
    predictions
))


joblib.dump(
    model,
    "models/habitat_model.pkl"
)

print()

print("Model Saved Successfully")


df["prediction"] = model.predict(X)

df.to_csv(
    "data/habitat_predictions.csv",
    index=False
)

print()

print("Predictions Saved")