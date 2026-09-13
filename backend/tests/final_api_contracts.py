import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.api_context import AuthenticatedContext, authenticated_context
from app.domain.access import TenantScope
from app.main import app

scope_a = TenantScope(101, 1001)
scope_b = TenantScope(202, 2002)
current = {"context": AuthenticatedContext(user_id=1, scope=scope_a)}

async def override_context():
    return current["context"]

app.dependency_overrides[authenticated_context] = override_context
client = TestClient(app)

unauthenticated = TestClient(app)
app.dependency_overrides.clear()
assert unauthenticated.get("/api/v1/cases").status_code == 401
app.dependency_overrides[authenticated_context] = override_context

created = client.post("/api/v1/cases", json={"title": "Tenant A Case", "company": "A Corp", "category": "CONTRACT"})
assert created.status_code == 201
case_id = created.json()["id"]
assert created.json()["state"] == "NEW"

assert client.get("/api/v1/cases?limit=1000").status_code == 422
assert client.post("/api/v1/cases", json={"title": "bad", "user_id": 999}).status_code == 422
assert client.post(f"/api/v1/cases/{case_id}/transitions", json={"target": "RESEARCHING"}).status_code == 409
assert client.get(f"/api/v1/cases/{case_id}").status_code == 200

current["context"] = AuthenticatedContext(user_id=2, scope=scope_b)
assert client.get(f"/api/v1/cases/{case_id}").status_code == 404
assert "Tenant A" not in client.get(f"/api/v1/cases/{case_id}").text

current["context"] = AuthenticatedContext(user_id=1, scope=scope_a)
for target in ("INGESTING", "FACTS_EXTRACTED", "EVIDENCE_VERIFIED", "RESEARCHING"):
    assert client.post(f"/api/v1/cases/{case_id}/transitions", json={"target": target}).status_code == 200
assert client.get("/openapi.json").status_code == 200
assert "/api/v1/cases" in client.get("/openapi.json").json()["paths"]

app.dependency_overrides.clear()
print("final API contracts: auth boundary, CRUD, tenant denial, validation, state transitions, errors, and OpenAPI passed")
