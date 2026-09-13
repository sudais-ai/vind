import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from app.main import app

response = TestClient(app).get('/api/v1/health')
assert response.status_code == 200
for header in ('x-content-type-options', 'x-frame-options', 'referrer-policy', 'permissions-policy', 'content-security-policy'):
    assert response.headers.get(header), header
print('security headers: passed')
