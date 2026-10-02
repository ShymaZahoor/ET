"""
Central application configuration.

All values are overridable via environment variables / .env file.
Keeping this in one place means every module (db, cors, simulation) reads
settings the same way instead of scattering os.getenv() calls around.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- App ---
    APP_NAME: str = "EcoTwin API"
    ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # --- Database ---
    # PostgreSQL + PostGIS. Example:
    # postgresql+psycopg://ecotwin:ecotwin@localhost:5432/ecotwin
    DATABASE_URL: str = "postgresql+psycopg://ecotwin:ecotwin@localhost:5433/ecotwin"

    # --- CORS ---
    # Vite dev server default port is 3000 per the frontend's package.json
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://172.16.22.108:3000",
        "http://192.168.192.1:3000"
    ]

    # --- Digital Twin Simulation ---
    SIMULATION_ENABLED: bool = True
    SIMULATION_TICK_SECONDS: float = 2.0  # how often the simulated leopard moves
    SIMULATION_SPEED_MULTIPLIER: float = 1.0

    # --- Threat Engine ---
    # Distance (meters) inside which an animal is considered "in conflict" with a zone
    CONFLICT_DISTANCE_METERS: float = 150.0

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
