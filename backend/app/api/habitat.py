"""
Habitat data has no real sensor/weather feed yet (that's a later
integration -- a weather API + satellite NDVI feed per the project plan).
For now this returns plausible, lightly-varying values for the configured
region so the Habitat page has something real to render against. Swap
`_get_habitat_snapshot` for a real data source later; the route and schema
don't need to change.
"""
import random

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.zone import HumanZone
from app.schemas.misc import HabitatDataOut

router = APIRouter(prefix="/habitat", tags=["habitat"])


@router.get("", response_model=HabitatDataOut)
def get_habitat_data(db: Session = Depends(get_db)):
    zone = db.execute(select(HumanZone)).scalars().first()
    region = zone.name if zone else "Configured Region"

    return HabitatDataOut(
        region=region,
        temperature=round(random.uniform(24, 34), 1),
        humidity=round(random.uniform(35, 65), 1),
        rainfall=round(random.uniform(0, 12), 1),
        ndvi=round(random.uniform(0.35, 0.72), 2),
        condition=random.choice(["Clear", "Partly Cloudy", "Dry Spell", "Post-Monsoon"]),
        waterSources=random.randint(3, 9),
        corridorIntegrity=random.choice(["Stable", "Fragmented", "Improving"]),
    )
