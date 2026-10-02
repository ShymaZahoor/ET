"""
SQLAlchemy engine, session factory, and declarative base.

Uses PostgreSQL + PostGIS. GeoAlchemy2 plugs into the same Base so geometry
columns (animal positions, zone polygons, camera points) are first-class
columns we can query spatially (ST_DWithin, ST_Distance, etc.) instead of
doing geo-math in Python.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import get_settings

settings = get_settings()

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator:
    """FastAPI dependency: yields a DB session and guarantees it closes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
