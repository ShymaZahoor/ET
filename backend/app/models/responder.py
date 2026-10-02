"""
Responder: a forest-department / rescue team, positioned on the map so the
threat_engine can recommend the nearest available one for a given incident.

ResponseAction: an audit-trail row for anything a responder/team does on an
incident (dispatched, arrived, resolved, ...). Incident.timeline in the
frontend is a serialized view of these rows.
"""
import uuid
from datetime import datetime

from geoalchemy2 import Geometry
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import TeamStatus


class Responder(Base):
    __tablename__ = "responders"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False)
    region: Mapped[str] = mapped_column(String, default="Unassigned")
    leader: Mapped[str] = mapped_column(String, default="Unknown")
    members_count: Mapped[int] = mapped_column(Integer, default=1)
    contact_channel: Mapped[str] = mapped_column(String, default="radio")

    status: Mapped[TeamStatus] = mapped_column(Enum(TeamStatus), default=TeamStatus.AVAILABLE)
    location: Mapped[Geometry] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    current_assignment: Mapped[str | None] = mapped_column(String, nullable=True)

    actions: Mapped[list["ResponseAction"]] = relationship(back_populates="responder")


class ResponseAction(Base):
    __tablename__ = "response_actions"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str] = mapped_column(ForeignKey("incidents.id"), nullable=False, index=True)
    responder_id: Mapped[str | None] = mapped_column(ForeignKey("responders.id"), nullable=True)

    action_type: Mapped[str] = mapped_column(String, nullable=False)  # assigned | enroute | resolved | ...
    text: Mapped[str] = mapped_column(String, nullable=False)
    badge: Mapped[str | None] = mapped_column(String, nullable=True)

    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, index=True)

    incident: Mapped["Incident"] = relationship(back_populates="timeline")
    responder: Mapped["Responder"] = relationship(back_populates="actions")
