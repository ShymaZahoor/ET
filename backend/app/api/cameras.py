from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.converters import camera_to_out, detection_to_out
from app.core.database import get_db
from app.models.camera import Camera, Detection
from app.schemas.camera import CameraOut
from app.schemas.wildlife import DetectionOut

router = APIRouter(tags=["cameras"])


@router.get("/cameras", response_model=list[CameraOut])
def list_cameras(db: Session = Depends(get_db)):
    cameras = db.execute(select(Camera)).scalars().all()
    out = []
    for cam in cameras:
        count = db.execute(
            select(func.count(Detection.id)).where(Detection.camera_id == cam.id)
        ).scalar_one()
        latest = db.execute(
            select(Detection).where(Detection.camera_id == cam.id).order_by(Detection.timestamp.desc())
        ).scalars().first()
        out.append(
            camera_to_out(
                cam,
                animals_detected=count,
                last_confidence=latest.confidence if latest else 0.0,
                active_species=latest.species if latest else None,
            )
        )
    return out


@router.get("/detections", response_model=list[DetectionOut])
def list_detections(db: Session = Depends(get_db)):
    detections = db.execute(select(Detection).order_by(Detection.timestamp.desc()).limit(100)).scalars().all()
    out = []
    for d in detections:
        camera = db.get(Camera, d.camera_id)
        out.append(detection_to_out(d, camera.name if camera else "Unknown Camera"))
    return out
