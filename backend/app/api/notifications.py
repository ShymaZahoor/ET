from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.api.converters import notification_to_out
from app.core.database import get_db
from app.models.historical import Notification
from app.schemas.misc import NotificationOut

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=list[NotificationOut])
def list_notifications(db: Session = Depends(get_db)):
    notifications = db.execute(select(Notification).order_by(Notification.created_at.desc())).scalars().all()
    return [notification_to_out(n) for n in notifications]


@router.patch("/{notification_id}/read", status_code=204)
def mark_read(notification_id: str, db: Session = Depends(get_db)):
    notification = db.get(Notification, notification_id)
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    notification.read = True
    db.commit()


@router.post("/read-all", status_code=204)
def mark_all_read(db: Session = Depends(get_db)):
    db.execute(update(Notification).values(read=True))
    db.commit()
