-- Database Schema for EcoTwin: Digital Twin of Wildlife Habitats

CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    soil_moisture REAL NOT NULL,
    rainfall REAL NOT NULL,
    light REAL NOT NULL,
    acoustic REAL NOT NULL,
    motion INTEGER NOT NULL DEFAULT 0,
    season TEXT NOT NULL DEFAULT 'summer',
    timestamp TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS edge_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reading_timestamp TEXT NOT NULL,
    is_anomaly INTEGER NOT NULL,
    upload_status TEXT NOT NULL, -- 'uploaded' or 'cached'
    processed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    horizon_hours INTEGER NOT NULL,
    temperature REAL,
    humidity REAL,
    soil_moisture REAL,
    rainfall REAL,
    habitat_suitability_score REAL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS simulation_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    scenario_params TEXT NOT NULL,
    suitable INTEGER NOT NULL,
    confidence REAL NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sensor_ts ON sensor_data(timestamp);
