# EcoTwin: Digital Twin of Wildlife Habitats using AIoT and Edge Intelligence
## A Comprehensive Beginner-to-Finish B.Tech Engineering Handbook

---

# Table of Contents
1. [Part 0 — Project Architectural Foundations & Digital Twin Theory](#part-0)
2. [Part 1 — Setting Up an Empty Windows Laptop from Scratch](#part-1)
3. [Part 2 — Professional Scalable Folder & Directory Structure](#part-2)
4. [Part 3 — Database Schema & Data Ingestion Pipeline](#part-3)
5. [Part 4 — Building the True Digital Twin Engine (4-State Architecture)](#part-4)
6. [Part 5 — Habitat Suitability Prediction (Random Forest & XGBoost)](#part-5)
7. [Part 6 — Environmental Anomaly & Stress Detection (Isolation Forest)](#part-6)
8. [Part 7 — Multi-Horizon Time Series Forecasting (LSTM Deep Learning)](#part-7)
9. [Part 8 — Real Edge Intelligence & TinyML Optimization](#part-8)
10. [Part 9 — AIoT Communication Layer (MQTT Mosquitto Protocol)](#part-9)
11. [Part 10 — Counterfactual "What-If" Simulation Engine](#part-10)
12. [Part 11 — Unified Flask REST API Backend Architecture](#part-11)
13. [Part 12 — Multi-Page Glassmorphic Dashboard & Leaflet GIS Mapping](#part-12)
14. [Part 13 — Cloud, Local & Hybrid Deployment Strategies](#part-13)
15. [Part 14 — Automated Testing, Code Quality & Best Practices](#part-14)
16. [Part 15 — Exhaustive File-by-File Technical Directory Reference](#part-15)
17. [Part 16 — 8-Week Step-by-Step Implementation Roadmap](#part-16)

---

<a name="part-0"></a>
# Part 0 — Project Architectural Foundations & Digital Twin Theory

## 0.1 What is a Digital Twin?
A **Digital Twin** is a living, continuously-synchronized virtual model of a physical asset, process, or ecological system. Unlike traditional static models, a Digital Twin maintains an ongoing, dynamic two-way data feedback loop with its physical counterpart.

In the context of **EcoTwin**, the physical counterpart is a protected wildlife habitat (such as a national park or forest reserve) instrumented with AIoT edge sensor nodes.

## 0.2 IoT Dashboard vs. Digital Twin: The Critical Distinction

| Architectural Dimension | Traditional IoT Dashboard | EcoTwin Digital Twin Engine |
| :--- | :--- | :--- |
| **Data Scope** | Single stream of immediate raw sensor metrics. | 4-State synchronized state plane (Current, Historical, Predicted, Simulated). |
| **Temporal Perspective** | Present moment only (t = 0). | Past, Present, and Multi-Horizon Future (t - N to t + 24h). |
| **Reasoning Capacity** | Passive display of values. | Active ML inference (Suitability, Anomaly, LSTM Forecasting). |
| **Interactivity** | Read-only observation. | Counterfactual "What-If" scenario simulation engine. |
| **Edge Autonomy** | Dumb telemetry forwarding. | Local TinyML anomaly detection & offline caching. |

> [!IMPORTANT]
> **Viva / Project Defense Definition**: "An IoT dashboard merely displays telemetry numbers. EcoTwin is a Digital Twin because it maintains four continuously synchronized states of the habitat at all times: Current, Historical, Predicted Future (via LSTM), and Simulated ('What-If' scenarios)."

## 0.3 The 4-State Digital Twin Architecture
```
                  ┌─────────────────────────────────────────┐
                  │          PHYSICAL ENVIRONMENT           │
                  │   (Wildlife Habitat Sensors & Edge)     │
                  └────────────────────┬────────────────────┘
                                       │ (MQTT Telemetry)
                                       ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                          ECOTWIN DIGITAL TWIN                             │
│                                                                           │
│   ┌─────────────────────┐                 ┌───────────────────────────┐   │
│   │ 1. CURRENT STATE    │◄───────────────►│ 2. HISTORICAL STATE       │   │
│   │ Live Telemetry      │                 │ 2,500+ Time-Series Buffer │   │
│   └──────────┬──────────┘                 └─────────────┬─────────────┘   │
│              │                                          │                 │
│              ▼                                          ▼                 │
│   ┌─────────────────────┐                 ┌───────────────────────────┐   │
│   │ 3. PREDICTED STATE  │                 │ 4. SIMULATED STATE        │   │
│   │ LSTM 3h/12h/24h     │                 │ "What-If" Counterfactuals │   │
│   └─────────────────────┘                 └───────────────────────────┘   │
└──────────────────────────────────────┬────────────────────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       GLASSMORPHISM DASHBOARD UI        │
                  │    (Leaflet GIS, Charts, Sim Sliders)   │
                  └─────────────────────────────────────────┘
```

---

<a name="part-1"></a>
# Part 1 — Setting Up an Empty Windows Laptop from Scratch

Follow these instructions in exact chronological order on a fresh Windows laptop.

## 1.1 Python 3.11 Installation & Verification
1. Download Python 3.11 for Windows from [python.org/downloads](https://www.python.org/downloads/).
2. Launch installer. **CRITICAL STEP**: On the first screen, check **"Add python.exe to PATH"**.
3. Open Command Prompt (`cmd`) and verify installation:
```cmd
python --version
pip --version
```

## 1.2 Visual Studio Code & Extensions
1. Download VS Code from [code.visualstudio.com](https://code.visualstudio.com/).
2. Install recommended extensions: `Python` (Microsoft), `SQLite Viewer`, `Live Server`.

## 1.3 Git & Environment Setup
1. Download Git for Windows from [git-scm.com](https://git-scm.com/).
2. Verify in Command Prompt:
```cmd
git --version
```

## 1.4 Mosquitto MQTT Broker Installation
1. Download Mosquitto MQTT Broker from [mosquitto.org/download](https://mosquitto.org/download/).
2. Install with standard options. Mosquitto will start automatically as a Windows service on port `1883`.

---

<a name="part-2"></a>
# Part 2 — Professional Scalable Folder & Directory Structure

Run the following Windows terminal command inside your project root (`C:\Users\hp\Desktop\EcoTwin`):

```cmd
mkdir backend frontend iot edge digital_twin simulation forecasting habitat_prediction anomaly_detection database datasets api deployment docs reports images tests models
```

### Folder Responsibilities Breakdown
- **`backend/`**: Flask application core (`app.py`, `config.py`).
- **`frontend/`**: Web dashboard templates (`templates/index.html`) and static assets (`static/css/style.css`, `static/js/app.js`, `static/js/map.js`).
- **`digital_twin/`**: 4-State Digital Twin state engine (`twin_state.py`).
- **`simulation/`**: Counterfactual "What-If" scenario simulation module (`simulate.py`).
- **`habitat_prediction/`**: Machine learning classifiers for habitat suitability & animal presence (`train_habitat.py`).
- **`anomaly_detection/`**: Isolation Forest anomaly classifier (`train_anomaly.py`).
- **`forecasting/`**: Multi-horizon LSTM sequence forecasting (`train_forecast.py`).
- **`edge/`**: Edge inference engine (`edge_runner.py`), cache flusher (`flush_cache.py`), TFLite converter (`export_tflite.py`).
- **`iot/`**: Telemetry data generator (`data_generator.py`) and MQTT scripts (`mqtt_publisher.py`, `mqtt_subscriber.py`).
- **`database/`**: Database schema (`schema.sql`) and connection module (`database.py`).
- **`models/`**: Saved trained model artifacts (`.pkl`, `.h5`, `.tflite`).
- **`tests/`**: Pytest automated test suite (`test_all.py`).

---

<a name="part-3"></a>
# Part 3 — Database Schema & Data Ingestion Pipeline

## 3.1 Database Schema Definition (`database/schema.sql`)
The database persists raw IoT telemetry, edge anomaly logs, multi-horizon forecasts, and simulation records:

```sql
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
```

## 3.2 Executing Telemetry Generation
Run the telemetry generator script to seed 2,500 historical telemetry observations into SQLite (`data/ecotwin.db`):
```cmd
.\venv\Scripts\python.exe iot/data_generator.py
```

---

<a name="part-4"></a>
# Part 4 — Building the True Digital Twin Engine

The Digital Twin state engine (`digital_twin/twin_state.py`) encapsulates all state logic in a single class:

```python
class HabitatDigitalTwin:
    def __init__(self, db_path=DB_PATH):
        self.current_state = {}
        self.historical_state = []
        self.predicted_state = {}
        self.simulated_state = {}

    def sync_from_database(self, history_limit=50):
        # Synchronizes current and historical states from SQLite
        ...
```

---

<a name="part-5"></a>
# Part 5 — Habitat Suitability Prediction (Random Forest & XGBoost)

Habitat suitability classification evaluates multi-dimensional environmental conditions (Temperature, Humidity, Soil Moisture, Rainfall, Light, Acoustic Decibels, Motion, Season) to compute a **Habitat Suitability Score** and **Animal Presence Probability**.

## 5.1 Training Command
```cmd
.\venv\Scripts\python.exe habitat_prediction/train_habitat.py
```
Outputs trained models: `models/habitat_model.pkl` (Random Forest) and `models/habitat_model_xgb.pkl` (XGBoost).

---

<a name="part-6"></a>
# Part 6 — Environmental Anomaly & Stress Detection

An **Isolation Forest** model identifies microclimate deviations (extreme heatwaves, dry soil loss, acoustic disturbances):

```cmd
.\venv\Scripts\python.exe anomaly_detection/train_anomaly.py
```
Output artifact: `models/anomaly_model.pkl`.

---

<a name="part-7"></a>
# Part 7 — Multi-Horizon Time Series Forecasting (LSTM)

An LSTM (Long Short-Term Memory) neural network processes 24-hour lookback sequences of temperature, humidity, soil moisture, and rainfall to predict future states at 3-hour, 12-hour, and 24-hour horizons.

```cmd
.\venv\Scripts\python.exe forecasting/train_forecast.py
```
Output artifacts: `models/forecast_lstm_3h.h5`, `models/forecast_lstm_12h.h5`, `models/forecast_lstm_24h.h5`, `models/forecast_scaler.pkl`.

---

<a name="part-8"></a>
# Part 8 — Real Edge Intelligence & TinyML Optimization

## 8.1 TensorFlow Lite Export
Convert Keras LSTM model for embedded device deployment:
```cmd
.\venv\Scripts\python.exe edge/export_tflite.py
```
Output artifact: `models/forecast_lstm_3h.tflite`.

## 8.2 Offline Mode & Bandwidth Optimization
Normal sensor readings are batched locally in `edge/local_cache.jsonl` to conserve network bandwidth. Only detected environmental anomalies are uploaded immediately. Flush offline cache when connectivity resumes:
```cmd
.\venv\Scripts\python.exe edge/flush_cache.py
```

---

<a name="part-9"></a>
# Part 9 — AIoT Communication Layer (MQTT Mosquitto Protocol)

Launch subscriber and publisher in separate terminal windows:
```cmd
# Terminal 1: Subscriber
.\venv\Scripts\python.exe iot/mqtt_subscriber.py

# Terminal 2: Publisher
.\venv\Scripts\python.exe iot/mqtt_publisher.py
```

---

<a name="part-10"></a>
# Part 10 — Counterfactual "What-If" Simulation Engine

The simulation engine (`simulation/simulate.py`) accepts scenario adjustments (e.g. -30% rainfall, +15% temperature) and re-evaluates habitat suitability without altering actual live sensor records.

---

<a name="part-11"></a>
# Part 11 — Unified Flask REST API Backend Architecture

Launch the backend server:
```cmd
.\venv\Scripts\python.exe backend/app.py
```
Server opens at `http://127.0.0.1:5000`.

---

<a name="part-12"></a>
# Part 12 — Multi-Page Glassmorphic Dashboard & Leaflet GIS Mapping

Access the interactive dashboard in your browser:
`http://127.0.0.1:5000/dashboard`

Includes views for Home, Live Telemetry, Digital Twin Engine, Habitat Suitability, LSTM Forecasts, Counterfactual Simulation, and Leaflet GIS Map with animal sighting hotspots.

---

<a name="part-13"></a>
# Part 13 — Cloud, Local & Hybrid Deployment Strategies

Deploy using Docker or Render cloud service using `deployment/Dockerfile` and `deployment/render.yaml`.

---

<a name="part-14"></a>
# Part 14 — Automated Testing, Code Quality & Best Practices

Run the Pytest suite to verify system integrity:
```cmd
.\venv\Scripts\python.exe -m pytest tests/
```

---

<a name="part-15"></a>
# Part 15 — Exhaustive File-by-File Technical Directory Reference

- **`backend/app.py`**: Unified REST API backend exposing endpoints `/latest`, `/history`, `/habitat`, `/anomaly`, `/forecast/<horizon>`, `/digital-twin`, `/simulate`, `/system-health`.
- **`digital_twin/twin_state.py`**: 4-State Digital Twin state manager object.
- **`simulation/simulate.py`**: Counterfactual scenario execution engine.
- **`edge/edge_runner.py`**: Local anomaly check & JSONL caching logic.
- **`iot/data_generator.py`**: Synthetic telemetry simulator.

---

<a name="part-16"></a>
# Part 16 — 8-Week Step-by-Step Implementation Roadmap

- **Week 1**: Environment setup, folder skeleton creation, database initialization.
- **Week 2**: Data generator seeding & historical dataset assembly.
- **Week 3**: Machine learning classifiers training (Random Forest & XGBoost).
- **Week 4**: Isolation Forest anomaly model & edge decision runner setup.
- **Week 5**: LSTM time-series forecasting training for 3h, 12h, 24h horizons.
- **Week 6**: MQTT Mosquitto broker setup, publisher, subscriber implementation.
- **Week 7**: Multi-page glassmorphic dashboard & Leaflet GIS interactive map construction.
- **Week 8**: Testing, cloud deployment setup, final viva report preparation.
