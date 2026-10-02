# EcoTwin Backend

Wildlife-human conflict early warning system. This is the backend + database
layer for the EcoTwin frontend: it simulates a leopard moving toward a
configured village, predicts its trajectory, scores the conflict threat,
raises alerts/incidents, recommends a responder, and tracks the incident
until the risk drops -- all persisted in PostgreSQL + PostGIS and served
over a REST API shaped to match `frontend/src/types/index.ts` exactly.

This has been built, tested against a live Postgres+PostGIS instance, and
verified end-to-end (health check, Swagger docs, the full simulation loop,
and every API endpoint the frontend calls).

## Project layout

```
ecotwin/
├── backend/
│   ├── app/
│   │   ├── core/              # config, DB session, geo helpers, formatting
│   │   ├── models/            # SQLAlchemy + PostGIS entities
│   │   ├── schemas/           # Pydantic response shapes (match frontend types)
│   │   ├── api/                # FastAPI routers + DB->schema converters
│   │   ├── digital_twin/      # the simulation loop (the vertical slice)
│   │   ├── movement_prediction/  # trajectory/ETA predictor (swappable)
│   │   ├── threat_engine/     # risk scoring + responder matching (swappable)
│   │   ├── wildlife/          # species config
│   │   └── seed/              # DB table creation + reference data seeding
│   ├── alembic/                # migration scaffolding (see note below)
│   ├── tests/                  # pytest: health/docs + predictor/scorer unit tests
│   ├── requirements.txt
│   ├── .env.example
│   └── pytest.ini
├── database/
│   └── docker-compose.yml      # Postgres 16 + PostGIS, local dev
└── docs/
```

## Quickstart

### 1. Start PostgreSQL + PostGIS

```bash
cd database
docker compose up -d
```

(Or point `DATABASE_URL` in `backend/.env` at any Postgres 14+ instance with
the PostGIS extension available -- the seed script runs
`CREATE EXTENSION IF NOT EXISTS postgis` style setup is NOT automatic, so
if you're not using the provided docker-compose, run
`CREATE EXTENSION postgis;` on your DB once before seeding.)

### 2. Install dependencies and configure

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # edit DATABASE_URL if needed
```

### 3. Create tables and seed reference data

```bash
python -m app.seed.seed_data
```

This creates all tables and seeds one `HumanZone` ("Rampura Village"),
three responder teams, and three cameras. The simulated leopard track
itself is created automatically by the digital twin on its first tick --
nothing to seed for that.

### 4. Run the API

```bash
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs (Swagger): http://localhost:8000/docs
- Health check: http://localhost:8000/health

The digital twin simulation starts automatically with the app (see
`SIMULATION_ENABLED` in `.env`) and ticks every `SIMULATION_TICK_SECONDS`
(default 2s), moving the simulated leopard, re-running the predictor and
threat scorer, and opening/updating/resolving an Incident as appropriate.

### 5. Connect the frontend

The frontend (`frontend/src/services/api.ts`) currently returns
hand-written mock data with no real network calls. To connect it to this
backend:

1. Point it at `http://localhost:8000/api/v1` (e.g. via a `VITE_API_URL`
   env var you add to the Vite project).
2. Replace each `ecotwinApi` method's body with a `fetch()`/`axios` call to
   the matching endpoint below -- the response shapes are already identical
   to the frontend's TypeScript interfaces, so no reshaping is needed.

| Frontend method | Endpoint |
|---|---|
| `getAnimals()` | `GET /animals` |
| `getAnimalById(id)` | `GET /animals/{id}` |
| `getCameras()` | `GET /cameras` |
| `getDetections()` | `GET /detections` |
| `getThreats()` | `GET /threats` |
| `getThreatByTrackId(trackId)` | `GET /threats/track/{trackId}` |
| `getIncidents()` | `GET /incidents` |
| `getIncidentById(id)` | `GET /incidents/{id}` |
| `assignTeamToIncident(incidentId, teamId)` | `POST /incidents/{id}/assign-team` `{teamId}` |
| `updateIncidentStatus(incidentId, status)` | `PATCH /incidents/{id}/status` `{status}` |
| `getResponderTeams()` | `GET /responder-teams` |
| `dispatchTeam(teamId, targetLocation)` | `POST /responder-teams/{id}/dispatch` `{targetLocation}` |
| `getPredictions()` | `GET /predictions` |
| `runNewPrediction(trackId)` | `POST /predictions/run` `{trackId}` |
| `getHabitatData()` | `GET /habitat` |
| `getModelStatus()` | `GET /ai-status` |
| `getAnalyticsData(timeRange)` | `GET /analytics?timeRange=...` |
| `getNotifications()` | `GET /notifications` |
| `markNotificationRead(id)` | `PATCH /notifications/{id}/read` |
| `markAllNotificationsRead()` | `POST /notifications/read-all` |

## Running tests

```bash
cd backend
pytest -v
```

The suite includes:
- `test_health.py` -- the Phase 1 acceptance test: app boots, `/health`
  responds, `/docs` and `/openapi.json` are reachable and list the
  expected routes.
- `test_movement_and_threat.py` -- unit tests for the trajectory predictor
  and threat scorer, independent of the database.

Note: `test_health.py` exercises the full app lifespan (including starting
the digital twin simulator), so it needs a reachable Postgres+PostGIS
instance with tables already created (`python -m app.seed.seed_data` first).

## Design notes / what's deliberately simple right now

This is Phase 1+2 of the plan: project structure, PostgreSQL+PostGIS setup,
and a working simulated vertical slice. A few things are intentionally
heuristic placeholders, each with a narrow, swappable interface so Phase 3
(real ML) can replace them without touching the API layer or simulation
loop:

- **`movement_prediction/predictor.py`** -- a kinematic (straight-line +
  bearing-blend) trajectory predictor. Swap point for a trained
  sequence/LSTM model consuming the full `Observation` history per track.
- **`threat_engine/scorer.py`** -- a transparent weighted formula (distance,
  urgency, entry likelihood, species danger factor, zone baseline). Swap
  point for a trained risk-classification model.
- **`app/api/habitat.py`** -- returns plausible simulated environmental
  data; no real weather/NDVI feed is wired up yet.
- **`app/api/ai_status.py`** -- honestly reports "Calibrating" rather than
  faking "Online", since no model has been trained yet.

## Database migrations

`alembic/` is configured and wired to `app.core.config` for the connection
string and to `app.models` for the schema. `app/seed/seed_data.py` uses
`Base.metadata.create_all()` directly for fast prototyping; once the schema
stabilizes, generate a real initial migration instead:

```bash
cd backend
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

## Next steps (Phase 3+)

1. Swap `movement_prediction/predictor.py` for a trained model fed by
   accumulated `Observation` history.
2. Swap `threat_engine/scorer.py` for a trained risk classifier; keep the
   same `score_threat()` signature.
3. Real camera/sensor ingestion writing into `Observation`/`Detection`
   the same way the simulator does now (see `digital_twin/simulator.py`'s
   docstring for the intended swap point).
4. Real weather/NDVI data source behind `app/api/habitat.py`.
5. Training pipeline + dataset management under a new `app/training/` (or
   top-level `models/` per the original plan) once real/labeled data exists.
