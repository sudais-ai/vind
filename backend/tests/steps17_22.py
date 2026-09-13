import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI, Query
from fastapi.testclient import TestClient
from app.core.pagination import paginate
from app.core.rate_limit import InMemoryRateLimitStore, RateLimitExceeded, RateLimiter, RateLimitSubject
from app.schemas.cases import PaginationParams
from app.services.audit import AuditEvent, AuditService, redact_sensitive


items = [{"id": index, "title": f"Case {index:03d}"} for index in range(250)]
api = FastAPI()


@api.get("/cases")
def list_cases(page: int = Query(default=1, ge=1), limit: int = Query(default=25, ge=1, le=100), search: str | None = Query(default=None, max_length=200)):
    params = PaginationParams(page=page, limit=limit, search=search)
    return paginate(items, params, key=lambda item: item["title"]).model_dump()


client = TestClient(api)
page = client.get("/cases?page=3&limit=100")
assert page.status_code == 200
assert page.json()["total"] == 250
assert len(page.json()["items"]) == 50
assert page.json()["has_previous"] is True
assert page.json()["has_next"] is False
assert client.get("/cases?limit=1000").status_code == 422
assert client.get("/cases?page=bad").status_code == 422
assert client.get("/cases?search=Case%20249").json()["total"] == 1


class Capture:
    def __init__(self):
        self.events = []

    async def append(self, event):
        self.events.append(event)


capture = Capture()
import asyncio
asyncio.run(AuditService(capture).record(AuditEvent(actor_id=1, scope=None, action="SECURITY_EVENT", resource_type="test", metadata={"token": "do-not-store", "nested": {"password": "hidden", "safe": "ok"}})))
assert capture.events[0].metadata == {"token": "[REDACTED]", "nested": {"password": "[REDACTED]", "safe": "ok"}}
assert redact_sensitive({"api_key": "secret"}) == {"api_key": "[REDACTED]"}

async def rate_test():
    limiter = RateLimiter(InMemoryRateLimitStore(), per_user=2, per_organization=10)
    subject = RateLimitSubject(user_id=7, organization_id=8, endpoint="expensive-research")
    await limiter.check(subject)
    await limiter.check(subject)
    try:
        await limiter.check(subject)
    except RateLimitExceeded:
        return
    raise AssertionError("rate limit did not reject the third request")

asyncio.run(rate_test())
print("steps 17-22: pagination endpoint, validation, audit redaction, and rate limit passed")
