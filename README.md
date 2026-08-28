# EcoTwin — Digital Twin of Wildlife Habitats using AIoT and Edge Intelligence

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-10b981.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-38bdf8.svg)](https://flask.palletsprojects.com/)
[![TensorFlow](https://img.shields.io/badge/AI-TensorFlow%2FScikit--Learn-f59e0b.svg)](https://tensorflow.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

EcoTwin is a full-stack AIoT system that builds a live digital twin of a wildlife habitat. Instead of just displaying sensor readings like a typical IoT dashboard, EcoTwin maintains four continuously synchronized states of the habitat — **Current**, **Historical**, **Predicted (Forecasted)**, and **Simulated ("What-If")** — and uses machine learning to assess habitat suitability, detect environmental stress, and forecast future conditions.

---

## 🌿 Core Features

- **Real-Time AIoT Monitoring**: Ingests temperature, humidity, soil moisture, rainfall, light, acoustic decibels, and motion telemetry.
- **Habitat Suitability ML**: Random Forest & XGBoost classifiers predicting habitat suitability index and animal presence probability.
- **Edge Anomaly & Habitat Stress Detection**: Lightweight Isolation Forest running on edge layers to identify sudden microclimate anomalies.
- **Multi-Horizon LSTM Forecasting**: Deep Learning sequence model predicting 3h, 12h, and 24h future environmental trajectories.
- **Digital Twin 4-State Engine**: Maintains unified synchronization across Current, Historical, Predicted, and Simulated states.
- **"What-If" Counterfactual Simulation Engine**: Allows researchers to simulate environmental shifts (e.g. -30% rainfall) and observe predicted impact before occurrence.
- **Edge Intelligence & Local Caching**: Offline JSONL caching and bandwidth-optimized upload throttling.
- **GIS Habitat Mapping**: Interactive Leaflet.js map with forest boundaries, sensor nodes, and animal presence hotspots.

---

## 🏗 System Architecture

```
[IoT Sensor Nodes / Simulator]
          │ (Telemetry Payload)
          ▼
   [Edge Intelligence Layer] ──(Lightweight Anomaly Check)
          │                              │
          │ (Normal Heartbeat / Anomaly) │ (Offline JSONL Cache if disconnected)
          ▼                              ▼
    [MQTT Broker / Flask REST API Backend]
          │
          ▼
    [SQLite Persistent Storage] ◄──► [Machine Learning Pipeline]
                                      ├── Random Forest / XGBoost (Suitability)
                                      ├── Isolation Forest (Anomaly)
                                      └── LSTM Neural Network (3h/12h/24h Forecast)
          │
          ▼
    [Digital Twin State Manager] (Current, Historical, Predicted, Simulated)
          │
          ▼
    [Glassmorphism Dashboard UI] (Leaflet GIS, Chart.js, Simulation Sliders)
```

---

## 🚀 Quick Start Guide

### 1. Initialize Virtual Environment & Install Dependencies
```bash
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

### 2. Generate Sensor Telemetry & Train ML Models
```bash
python iot/data_generator.py
python habitat_prediction/train_habitat.py
python anomaly_detection/train_anomaly.py
python forecasting/train_forecast.py
python edge/export_tflite.py
```

### 3. Run Backend & Open Dashboard
```bash
python backend/app.py
```
Open your browser and navigate to `http://127.0.0.1:5000` to interact with the multi-page Digital Twin dashboard.

### 4. Run Automated Test Suite
```bash
pytest tests/
```

---

## 📂 Project Structure

```
EcoTwin/
├── anomaly_detection/    # Isolation Forest anomaly classifier training
├── backend/              # Flask REST API server, routes, and config
├── database/             # SQLite schema.sql and database initializer
├── datasets/             # Generated sensor telemetry CSV dataset
├── deployment/           # Dockerfile & Render.yaml cloud deployment configs
├── digital_twin/         # 4-State Digital Twin state manager engine
├── docs/                 # ECOTWIN_MASTER_GUIDE.md book reference
├── edge/                 # Edge runner, offline caching, and TFLite export
├── forecasting/          # Multi-horizon LSTM sequence forecasting
├── frontend/             # Multi-page HTML templates, CSS glassmorphism, JS & Leaflet GIS
├── habitat_prediction/   # Random Forest & XGBoost habitat suitability classifiers
├── iot/                  # Data generator & MQTT publisher/subscriber scripts
├── models/               # Saved PKL, H5, and TFLite trained model artifacts
├── simulation/           # "What-If" counterfactual scenario simulation engine
└── tests/                # Pytest automated test suite
```

---

## 📝 License
This project is open-source under the MIT License.
