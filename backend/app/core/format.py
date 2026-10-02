"""
The frontend's types model several fields as display-ready strings
(eta: "32 min", distance: "420m", speed: "2.1 km/h") rather than raw
numbers -- these helpers keep that formatting in one place instead of
repeated ad hoc f-strings through the API layer.
"""
from datetime import datetime, timezone


def _as_utc(dt: datetime) -> datetime:
    """DB columns are timezone-aware (DateTime(timezone=True)); anything
    constructed with the bare datetime.utcnow() is naive. Normalize both to
    aware UTC before doing arithmetic so this never raises again."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def format_eta(seconds: float) -> str:
    minutes = seconds / 60
    if minutes < 1:
        return f"{seconds:.0f} sec"
    return f"{minutes:.0f} min"


def format_distance(meters: float) -> str:
    if meters >= 1000:
        return f"{meters / 1000:.1f} km"
    return f"{meters:.0f}m"


def format_speed_kmh(mps: float) -> str:
    return f"{mps * 3.6:.1f} km/h"


def format_relative_time(dt: datetime) -> str:
    dt = _as_utc(dt)
    delta = datetime.now(timezone.utc) - dt
    seconds = delta.total_seconds()
    if seconds < 60:
        return "just now"
    if seconds < 3600:
        return f"{int(seconds // 60)} min ago"
    if seconds < 86400:
        return f"{int(seconds // 3600)} hr ago"
    return dt.strftime("%b %d, %H:%M")


def format_clock(dt: datetime) -> str:
    return dt.strftime("%H:%M")
