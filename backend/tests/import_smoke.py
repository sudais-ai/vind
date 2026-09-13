import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.core.settings import Settings
from app.integrations.cache import NoopCache
from app.main import app


async def main() -> None:
    settings = Settings(database_url="mysql://example", environment="test")
    assert settings.database_authority == "existing Drizzle/MySQL-TiDB schema"
    cache = NoopCache()
    await cache.set("smoke", "ok")
    assert await cache.get("smoke") == "ok"
    with TestClient(app) as client:
        health_response = client.get("/health", headers={"X-Request-ID": "smoke-request"})
        assert health_response.status_code == 200
        assert health_response.json()["status"] == "ok"
        assert health_response.headers["X-Request-ID"] == "smoke-request"
        missing_response = client.get("/api/v1/does-not-exist")
        assert missing_response.status_code == 404
        missing_body = missing_response.json()["error"]
        assert missing_body["code"] == "NOT_FOUND"
        assert "traceback" not in str(missing_body).lower()
        readiness_response = client.get("/api/v1/health/ready")
        assert readiness_response.status_code in {200, 503}
        assert readiness_response.headers.get("X-Request-ID")
        assert "/api/v1/health" in app.openapi()["paths"]
    print("backend import smoke: passed")


if __name__ == "__main__":
    asyncio.run(main())
