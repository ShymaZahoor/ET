import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    # TestClient triggers the lifespan context (starts/stops the simulator)
    # exactly like a real app startup, so this also smoke-tests that wiring.
    with TestClient(app) as c:
        yield c
