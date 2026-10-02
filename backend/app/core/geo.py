"""
Small geo helpers so the rest of the codebase never has to remember that
PostGIS stores points as (x=lng, y=lat) while the frontend (and Leaflet)
use [lat, lng] tuples. Convert at the edges; everywhere else just use
(lat, lng) or WKT as appropriate.
"""
from __future__ import annotations

import math

from geoalchemy2.elements import WKTElement
from geoalchemy2.shape import to_shape
from shapely.geometry import Point


def point_from_latlng(lat: float, lng: float, srid: int = 4326) -> WKTElement:
    """Build a PostGIS-ready point from (lat, lng) -- note PostGIS wants (lng, lat)."""
    return WKTElement(Point(lng, lat).wkt, srid=srid)


def latlng_from_geometry(geom) -> tuple[float, float]:
    """Convert a GeoAlchemy2 geometry column value back to (lat, lng)."""
    shapely_point = to_shape(geom)
    return (shapely_point.y, shapely_point.x)  # y=lat, x=lng


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in meters. Good enough at the scale of a single
    district/forest range; PostGIS geography casts are used for anything
    that needs to be done inside a DB query instead."""
    r = 6_371_000  # Earth radius, meters
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)
    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def bearing_degrees(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Initial compass bearing (0=N, 90=E) from point 1 to point 2."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_lambda = math.radians(lng2 - lng1)
    x = math.sin(d_lambda) * math.cos(phi2)
    y = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(d_lambda)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


def destination_point(lat: float, lng: float, bearing_deg: float, distance_m: float) -> tuple[float, float]:
    """Project a new (lat, lng) from a start point, bearing, and distance."""
    r = 6_371_000
    phi1, lambda1 = math.radians(lat), math.radians(lng)
    theta = math.radians(bearing_deg)
    phi2 = math.asin(
        math.sin(phi1) * math.cos(distance_m / r) + math.cos(phi1) * math.sin(distance_m / r) * math.cos(theta)
    )
    lambda2 = lambda1 + math.atan2(
        math.sin(theta) * math.sin(distance_m / r) * math.cos(phi1),
        math.cos(distance_m / r) - math.sin(phi1) * math.sin(phi2),
    )
    return (math.degrees(phi2), math.degrees(lambda2))
