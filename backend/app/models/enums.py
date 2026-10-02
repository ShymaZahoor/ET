"""
Shared enums. Kept as plain Python str-Enums (stored as VARCHAR) rather than
native Postgres ENUM types so adding a new value later is a code change, not
a migration that rewrites a DB type.
"""
import enum


class RiskLevel(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    WARNING = "Warning"
    WATCH = "Watch"
    NORMAL = "Normal"


class AnimalRiskLevel(str, enum.Enum):
    """Animal.riskLevel in the frontend has a slightly different vocabulary
    than Threat/Incident severity (no 'Warning'/'Watch', has 'Monitoring')."""
    CRITICAL = "Critical"
    HIGH = "High"
    MONITORING = "Monitoring"
    NORMAL = "Normal"


class TrackStatus(str, enum.Enum):
    ACTIVE = "Active"
    MONITORING = "Monitoring"
    RESOLVED = "Resolved"


class IncidentStatus(str, enum.Enum):
    ACTIVE = "Active"
    MONITORING = "Monitoring"
    ASSIGNED = "Assigned"
    RESOLVED = "Resolved"


class TeamStatus(str, enum.Enum):
    AVAILABLE = "Available"
    ON_MISSION = "On Mission"
    EN_ROUTE = "En Route"
    OFFLINE = "Offline"


class CameraStatus(str, enum.Enum):
    LIVE = "Live"
    STANDBY = "Standby"
    OFFLINE = "Offline"


class AlertStatus(str, enum.Enum):
    OPEN = "Open"
    ACKNOWLEDGED = "Acknowledged"
    CLOSED = "Closed"


class NotificationCategory(str, enum.Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFO = "Info"
