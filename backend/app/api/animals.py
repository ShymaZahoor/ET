from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.converters import track_to_animal
from app.core.database import get_db
from app.models.wildlife import Track
from app.schemas.wildlife import AnimalOut

router = APIRouter(prefix="/animals", tags=["animals"])


@router.get("", response_model=list[AnimalOut])
def list_animals(db: Session = Depends(get_db)):
    tracks = db.execute(select(Track).options(joinedload(Track.animal))).scalars().unique().all()
    return [track_to_animal(t) for t in tracks]


@router.get("/{id_or_track_id}", response_model=AnimalOut)
def get_animal(id_or_track_id: str, db: Session = Depends(get_db)):
    track = db.execute(
        select(Track)
        .options(joinedload(Track.animal))
        .where((Track.id == id_or_track_id) | (Track.animal_id == id_or_track_id))
    ).scalars().first()
    if not track:
        raise HTTPException(status_code=404, detail="Animal not found")
    return track_to_animal(track)
