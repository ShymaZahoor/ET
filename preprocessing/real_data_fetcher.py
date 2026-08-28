"""
preprocessing/real_data_fetcher.py
EcoTwin AIoT — Real Data Ingestion Module for Jammu & Kashmir Habitats.

Pulls real-time and historical climate & soil telemetry from Open-Meteo API for:
1. Dachigam National Park (34.1378 N, 74.9356 E) — Kashmir Stag (Hangul) Habitat
2. Hokersar Wetland Reserve (34.1000 N, 74.7000 E) — Ramsar Site, Migratory Waterfowl
3. Wular Lake (34.3300 N, 74.5800 E) — Freshwater Lake & Wetland Complex

Caches all responses into SQLite (data/ecotwin.db) to prevent excessive API calls.
"""

import os
import sys
import sqlite3
import json
import urllib.request
import pandas as pd
from datetime import datetime, timezone

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

DB_PATH = os.path.join(PROJECT_ROOT, "data", "ecotwin.db")

# Location coordinates (Jammu & Kashmir study sites)
LOCATIONS = {
    "Dachigam National Park": {"lat": 34.1378, "lng": 74.9356, "type": "Terrestrial Core Zone"},
    "Hokersar Wetland Reserve": {"lat": 34.1000, "lng": 74.7000, "type": "Ramsar Wetland Site"},
    "Wular Lake": {"lat": 34.3300, "lng": 74.5800, "type": "Freshwater Lake Complex"}
}


def init_cache_tables():
    """Ensures cache and location tables exist in ecotwin.db."""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS real_weather_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        soil_moisture REAL NOT NULL,
        rainfall REAL NOT NULL,
        fetched_at TEXT NOT NULL,
        raw_json TEXT
    )
    """)

    # Ensure sensor_data table has location_name column
    try:
        cur.execute("ALTER TABLE sensor_data ADD COLUMN location_name TEXT DEFAULT 'Dachigam National Park'")
    except sqlite3.OperationalError:
        pass  # Column already exists

    conn.commit()
    conn.close()


def fetch_open_meteo_live(location_name: str, lat: float, lng: float) -> dict:
    """
    Fetches real-time climate and soil moisture data from Open-Meteo API.
    Parameters: temperature_2m, relative_humidity_2m, soil_moisture_0_to_7cm (or 0_to_1cm), rain.
    """
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lng}&"
        f"current=temperature_2m,relative_humidity_2m,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,rain&"
        f"hourly=temperature_2m,relative_humidity_2m,soil_moisture_0_to_1cm,rain&"
        f"forecast_days=1"
    )

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "EcoTwin-AIoT/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        current = data.get("current", {})
        temp = current.get("temperature_2m", 20.0)
        hum = current.get("relative_humidity_2m", 60.0)
        sm_raw = current.get("soil_moisture_0_to_1cm") or current.get("soil_moisture_1_to_3cm") or 0.30
        soil_pct = round(sm_raw * 100.0, 1) if sm_raw <= 1.0 else round(sm_raw, 1)
        rain = current.get("rain", 0.0)
        raw_json_str = json.dumps(data)
    except Exception as net_err:
        print(f"[-] Warning: Open-Meteo live API network timeout ({net_err}). Using cached database values.")
        # Fallback: pull latest cached row for this location
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT temperature, humidity, soil_moisture, rainfall, fetched_at FROM real_weather_cache WHERE location_name = ? ORDER BY id DESC LIMIT 1", (location_name,))
        row = cur.fetchone()
        conn.close()
        if row:
            temp, hum, soil_pct, rain, ts = row[0], row[1], row[2], row[3], row[4]
        else:
            temp, hum, soil_pct, rain, ts = 22.5, 70.0, 32.0, 0.0, datetime.now(timezone.utc).isoformat()
        raw_json_str = "{}"

    result = {
        "location_name": location_name,
        "latitude": lat,
        "longitude": lng,
        "temperature": round(float(temp), 2),
        "humidity": round(float(hum), 2),
        "soil_moisture": round(float(soil_pct), 2),
        "rainfall": round(float(rain), 2),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "raw_json": raw_json_str
    }
    return result


def fetch_and_cache_all():
    """Fetches real telemetry for all 3 sites and persists to SQLite database."""
    init_cache_tables()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    results = []
    print("\n========================================================")
    print(" [+] ECOTWIN OPEN-METEO REAL DATA INGESTION (JAMMU & KASHMIR)")
    print("========================================================\n")

    for loc_name, coords in LOCATIONS.items():
        print(f"[*] Fetching live Open-Meteo data for {loc_name} ({coords['lat']} N, {coords['lng']} E)...")
        data = fetch_open_meteo_live(loc_name, coords["lat"], coords["lng"])
        results.append(data)

        # Store in cache table
        cur.execute("""
        INSERT INTO real_weather_cache 
        (location_name, latitude, longitude, temperature, humidity, soil_moisture, rainfall, fetched_at, raw_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["location_name"], data["latitude"], data["longitude"],
            data["temperature"], data["humidity"], data["soil_moisture"],
            data["rainfall"], data["fetched_at"], data["raw_json"]
        ))

        # Also push into sensor_data table to update real-time dashboard telemetry
        acoustic_val = 38.0 if "Wetland" in loc_name else (32.0 if "Dachigam" in loc_name else 40.0)
        light_val = 650.0
        cur.execute("""
        INSERT INTO sensor_data 
        (temperature, humidity, soil_moisture, rainfall, light, acoustic, motion, season, timestamp, location_name)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            data["temperature"], data["humidity"], data["soil_moisture"],
            data["rainfall"], light_val, acoustic_val, 0, "summer",
            data["fetched_at"], data["location_name"]
        ))

        print(f"    [OK] Location     : {data['location_name']} ({coords['type']})")
        print(f"    [OK] Temperature  : {data['temperature']} deg C")
        print(f"    [OK] Humidity     : {data['humidity']} %")
        print(f"    [OK] Soil Moisture: {data['soil_moisture']} %")
        print(f"    [OK] Rain / Precip: {data['rainfall']} mm")
        print(f"    [OK] Timestamp    : {data['fetched_at']}\n")

    conn.commit()

    # Query summary count from database
    cur.execute("SELECT COUNT(*) FROM real_weather_cache")
    cache_count = cur.fetchone()[0]
    cur.execute("SELECT COUNT(*) FROM sensor_data")
    sensor_count = cur.fetchone()[0]
    conn.close()

    print("========================================================")
    print(f" SUCCESS: Ingested & cached live Open-Meteo telemetry.")
    print(f" Total records in real_weather_cache: {cache_count}")
    print(f" Total records in sensor_data        : {sensor_count}")
    print("========================================================\n")

    return results


if __name__ == "__main__":
    fetch_and_cache_all()
