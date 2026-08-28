import sqlite3
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib



# Load database

conn = sqlite3.connect(
    "data/ecotwin.db"
)


df = pd.read_sql(
    "SELECT * FROM readings",
    conn
)


conn.close()



# Create habitat labels

def habitat_condition(row):

    score = 0


    if row["temperature"] >= 20 and row["temperature"] <= 32:
        score += 1


    if row["humidity"] >= 50:
        score += 1


    if row["soil_moisture"] >= 30:
        score += 1


    if row["rainfall"] > 5:
        score += 1


    if row["motion"] == 1:
        score += 1



    if score >= 3:
        return "Suitable Habitat"

    else:
        return "Low Suitability"



df["habitat"] = df.apply(
    habitat_condition,
    axis=1
)



# Features

X = df[
[
"temperature",
"humidity",
"soil_moisture",
"rainfall",
"light",
"acoustic",
"motion"
]
]


y = df["habitat"]



# Train model

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)


model.fit(
    X,
    y
)



# Save model

joblib.dump(
    model,
    "models/habitat_model.pkl"
)


print("Habitat model trained successfully")

print(
    df["habitat"].value_counts()
)