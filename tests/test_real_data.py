import os
import sys
import pytest
import sqlite3
import pandas as pd

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from preprocessing.real_data_fetcher import fetch_open_meteo_live, fetch_and_cache_all, DB_PATH
from preprocessing.fetch_gbif_occurrences import fetch_gbif_occurrences_for_species, fetch_and_save_gbif_dataset, OUTPUT_CSV


def test_open_meteo_live_fetch():
    """Verifies live Open-Meteo API connection for Dachigam coordinates."""
    data = fetch_open_meteo_live("Dachigam National Park", 34.1378, 74.9356)
    assert data["location_name"] == "Dachigam National Park"
    assert isinstance(data["temperature"], float)
    assert isinstance(data["humidity"], float)
    assert isinstance(data["soil_moisture"], float)
    assert isinstance(data["rainfall"], float)
    assert "fetched_at" in data


def test_open_meteo_caching_and_db():
    """Verifies data caching into SQLite database real_weather_cache."""
    results = fetch_and_cache_all()
    assert len(results) == 3

    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM real_weather_cache")
    cache_count = cur.fetchone()[0]
    conn.close()
    assert cache_count >= 3


def test_gbif_occurrences_fetch():
    """Verifies fetching real occurrence records from GBIF REST API or cached CSV."""
    recs = fetch_gbif_occurrences_for_species("Cervus hanglu", limit=5)
    if not recs and os.path.exists(OUTPUT_CSV):
        df_cache = pd.read_csv(OUTPUT_CSV)
        recs = df_cache.head(5).to_dict(orient="records")
    assert len(recs) > 0
    first = recs[0]
    assert "latitude" in first
    assert "longitude" in first


def test_gbif_dataset_file_exists():
    """Verifies datasets/jk_wildlife_occurrences.csv is generated and non-empty."""
    df = fetch_and_save_gbif_dataset()
    assert os.path.exists(OUTPUT_CSV)
    assert len(df) > 0
    assert "latitude" in df.columns
    assert "longitude" in df.columns
    assert "scientific_name" in df.columns
