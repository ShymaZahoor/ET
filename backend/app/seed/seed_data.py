"""
Seeds the database with the fixed reference data the simulation and API
need to produce something meaningful: the configured village (HumanZone),
a few responder teams, and a few cameras. The simulated leopard Track
itself is created lazily by the digital twin on its first tick, not here.

Run with:  python -m app.seed.seed_data
(safe to re-run -- it checks for existing rows first)
"""
import logging
import uuid

from sqlalchemy import select

import app.models  # noqa: F401 -- registers all models on Base.metadata
from app.core.database import Base, SessionLocal, engine
from app.core.geo import point_from_latlng
from app.models.camera import Camera
from app.models.enums import CameraStatus, TeamStatus
from app.models.responder import Responder
from app.models.zone import HumanZone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ecotwin.seed")

# Jaipur-area coordinates, matching the frontend's existing mock data region
VILLAGE_LAT, VILLAGE_LNG = 26.0175, 76.5025


def create_tables() -> None:
    """Dev/prototype convenience. In a real deployment, use Alembic
    migrations (see alembic/) instead of create_all so schema changes are
    tracked and reversible."""
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created (if not already present).")


def seed() -> None:
    db = SessionLocal()
    try:
        if db.execute(select(HumanZone)).scalars().first() is None:
            # Build a small square polygon (~800m across) around the village point as its boundary
            d = 0.004  # ~400m in degrees at this latitude
            boundary_wkt = (
                f"POLYGON(("
                f"{VILLAGE_LNG - d} {VILLAGE_LAT - d}, "
                f"{VILLAGE_LNG + d} {VILLAGE_LAT - d}, "
                f"{VILLAGE_LNG + d} {VILLAGE_LAT + d}, "
                f"{VILLAGE_LNG - d} {VILLAGE_LAT + d}, "
                f"{VILLAGE_LNG - d} {VILLAGE_LAT - d}))"
            )
            from geoalchemy2.elements import WKTElement

            zone = HumanZone(
                id=str(uuid.uuid4()),
                name="Rampura Village",
                zone_type="village",
                population=1200,
                boundary=WKTElement(boundary_wkt, srid=4326),
                centroid=point_from_latlng(VILLAGE_LAT, VILLAGE_LNG),
                risk_baseline=1.1,
            )
            db.add(zone)
            logger.info("Seeded human zone: %s", zone.name)

        if db.execute(select(Responder)).scalars().first() is None:
            teams = [
                ("Rapid Response Alpha", "Rampura Range", 26.03, 76.49, TeamStatus.AVAILABLE, "R. Meena", 6),
                ("Forest Rescue Unit 2", "Northern Buffer", 26.045, 76.51, TeamStatus.AVAILABLE, "S. Sharma", 4),
                ("Wildlife Vet Team", "District HQ", 26.01, 76.52, TeamStatus.AVAILABLE, "Dr. A. Rathore", 3),
            ]
            for name, region, lat, lng, status, leader, count in teams:
                db.add(
                    Responder(
                        id=str(uuid.uuid4()),
                        name=name,
                        region=region,
                        leader=leader,
                        members_count=count,
                        contact_channel="radio+phone",
                        status=status,
                        location=point_from_latlng(lat, lng),
                    )
                )
            logger.info("Seeded %d responder teams.", len(teams))

        if db.execute(select(Camera)).scalars().first() is None:
            cameras = [
                ("Buffer Cam North", "Northern Buffer", 26.03, 76.50),
                ("Buffer Cam East", "Eastern Trail", 26.018, 76.515),
                ("Village Perimeter Cam", "Rampura Village", 26.019, 76.503),
            ]
            for name, zone_name, lat, lng in cameras:
                db.add(
                    Camera(
                        id=str(uuid.uuid4()),
                        name=name,
                        zone=zone_name,
                        status=CameraStatus.LIVE,
                        location=point_from_latlng(lat, lng),
                        direction_deg=0.0,
                    )
                )
            logger.info("Seeded %d cameras.", len(cameras))

        db.commit()
        logger.info("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    create_tables()
    seed()
