import os
import sqlite3
import random
import pandas as pd
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "ecotwin.db")
DATASET_PATH = os.path.join(BASE_DIR, "datasets", "habitat_telemetry.csv")

def generate_sensor_record(ts, season="summer"):
    # Diurnal variation based on hour of day
    hour = ts.hour
    is_day = 6 <= hour <= 18
    
    if season == "summer":
        base_temp = 32 + (5 if is_day else -4)
        base_hum = 45 + (-10 if is_day else 15)
        base_rain = random.uniform(0, 5)
        base_soil = random.uniform(10, 35)
    elif season == "monsoon":
        base_temp = 26 + (3 if is_day else -2)
        base_hum = 85 + (-5 if is_day else 10)
        base_rain = random.uniform(10, 60)
        base_soil = random.uniform(50, 90)
    else:  # winter
        base_temp = 18 + (4 if is_day else -6)
        base_hum = 55 + (-10 if is_day else 15)
        base_rain = random.uniform(0, 2)
        base_soil = random.uniform(20, 45)
        
    temperature = round(base_temp + random.uniform(-3.0, 3.0), 2)
    humidity = round(max(10, min(100, base_hum + random.uniform(-8.0, 8.0))), 2)
    soil_moisture = round(max(0, min(100, base_soil + random.uniform(-5.0, 5.0))), 2)
    rainfall = round(max(0, base_rain + random.uniform(-2.0, 5.0)), 2)
    light = round(random.uniform(300, 1000) if is_day else random.uniform(0, 50), 2)
    acoustic = round(random.uniform(25.0, 85.0), 2)
    motion = 1 if (random.random() < 0.25) else 0

    # Inject periodic synthetic environmental stress / anomaly (5% chance)
    if random.random() < 0.05:
        temperature += random.choice([15.0, -15.0])
        humidity = max(5.0, humidity - random.uniform(30, 40))
        acoustic += random.uniform(25, 40)

    return {
        "temperature": temperature,
        "humidity": humidity,
        "soil_moisture": soil_moisture,
        "rainfall": rainfall,
        "light": light,
        "acoustic": acoustic,
        "motion": motion,
        "season": season,
        "timestamp": ts.isoformat()
    }

def seed_database(num_rows=2500):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    os.makedirs(os.path.dirname(DATASET_PATH), exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""CREATE TABLE IF NOT EXISTS sensor_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        temperature REAL, humidity REAL, soil_moisture REAL,
        rainfall REAL, light REAL, acoustic REAL, motion INTEGER,
        season TEXT, timestamp TEXT)""")
    cur.execute("DELETE FROM sensor_data")  # fresh clean seed

    start_time = datetime.utcnow() - timedelta(days=14)
    seasons = ["summer", "monsoon", "winter"]
    records = []

    for i in range(num_rows):
        ts = start_time + timedelta(minutes=8 * i)
        season = seasons[(i // 800) % len(seasons)]
        row = generate_sensor_record(ts, season=season)
        records.append(row)
        cur.execute("""INSERT INTO sensor_data 
            (temperature, humidity, soil_moisture, rainfall, light, acoustic, motion, season, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (row["temperature"], row["humidity"], row["soil_moisture"], row["rainfall"],
             row["light"], row["acoustic"], row["motion"], row["season"], row["timestamp"]))

    conn.commit()
    conn.close()

    df = pd.DataFrame(records)
    df.to_csv(DATASET_PATH, index=False)
    print(f"[+] Successfully seeded {num_rows} sensor telemetry records to {DB_PATH} & {DATASET_PATH}")

if __name__ == "__main__":
    seed_database()
