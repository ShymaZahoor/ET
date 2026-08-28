import sqlite3
import pandas as pd

# Connect to SQLite database
conn = sqlite3.connect("data/ecotwin.db")

# Read all data
df = pd.read_sql("SELECT * FROM readings", conn)

# Remove duplicates
df = df.drop_duplicates()

# Remove missing values
df = df.dropna()

# Convert timestamp to datetime
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Sort by timestamp
df = df.sort_values("timestamp")

# Create hour feature
df["hour"] = df["timestamp"].dt.hour

# Normalize sensor values using z-score
columns = [
    "temperature",
    "humidity",
    "soil_moisture",
    "rainfall",
    "light",
    "acoustic"
]

for col in columns:
    df[col + "_z"] = (df[col] - df[col].mean()) / df[col].std()

# Save processed data
df.to_csv("data/processed_readings.csv", index=False)

# Save normalized data
normalized = df[[c for c in df.columns if c.endswith("_z")]]
normalized.to_csv("data/normalized_readings.csv", index=False)

print("\nCleaning Complete!\n")
print(df.head())

print("\nSummary Statistics:\n")
print(df.describe())