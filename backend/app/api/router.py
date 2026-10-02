from fastapi import APIRouter

from app.api import (
    ai_status,
    analytics,
    animals,
    cameras,
    habitat,
    incidents,
    notifications,
    predictions,
    responders,
    threats,
)

api_router = APIRouter()
api_router.include_router(animals.router)
api_router.include_router(cameras.router)
api_router.include_router(threats.router)
api_router.include_router(incidents.router)
api_router.include_router(responders.router)
api_router.include_router(predictions.router)
api_router.include_router(habitat.router)
api_router.include_router(ai_status.router)
api_router.include_router(analytics.router)
api_router.include_router(notifications.router)
