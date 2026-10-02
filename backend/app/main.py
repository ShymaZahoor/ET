"""
EcoTwin API entrypoint.

Wires together: CORS (so the Vite frontend on :3000 can call this), the
versioned API router, a health check, and the digital twin's background
simulation loop (started/stopped via FastAPI's lifespan).
"""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.digital_twin.simulator import simulator

logging.basicConfig(level=logging.INFO)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.SIMULATION_ENABLED:
        await simulator.start()
    yield
    if settings.SIMULATION_ENABLED:
        await simulator.stop()


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Wildlife-human conflict early warning system: tracks animal movement, "
        "predicts conflict risk against human settlements, and coordinates response."
    ),
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["system"])
def health_check():
    """Liveness/readiness probe. Returns 200 the moment the app can serve requests."""
    return {"status": "ok", "service": settings.APP_NAME, "env": settings.ENV}


@app.get("/", tags=["system"])
def root():
    return {"message": "EcoTwin API is running. See /docs for the interactive API reference."}
