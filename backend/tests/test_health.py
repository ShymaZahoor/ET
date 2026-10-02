"""
Phase 1 acceptance test: the API boots, the health check responds, and the
Swagger/OpenAPI docs are reachable. This is deliberately the first test in
the suite -- if this fails, nothing else matters yet.
"""


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "service" in body


def test_root(client):
    response = client.get("/")
    assert response.status_code == 200


def test_swagger_docs_available(client):
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]


def test_openapi_schema_available(client):
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "EcoTwin API"
    # Spot-check that the key resource paths are actually registered
    assert "/api/v1/animals" in schema["paths"]
    assert "/api/v1/incidents" in schema["paths"]
    assert "/api/v1/threats" in schema["paths"]
