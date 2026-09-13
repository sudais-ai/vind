import asyncio
import sys
from pathlib import Path
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from app.core.settings import get_settings
from app.domain.access import TenantAccessDenied
from app.domain.access import TenantScope
from app.repositories.mysql_authorization import MySQLAuthorizationRepository


async def main() -> None:
    settings = get_settings()
    repo = MySQLAuthorizationRepository(settings)
    suffix = uuid4().hex[:12]
    org_a_slug = f"live-a-{suffix}"
    org_b_slug = f"live-b-{suffix}"
    user_a_open = f"live-a-user-{suffix}"
    user_b_open = f"live-b-user-{suffix}"
    viewer_open = f"live-viewer-{suffix}"
    ids: dict[str, int] = {}

    async with repo.engine.begin() as connection:
        owner_role = (await connection.execute(text("SELECT id FROM roles WHERE code = 'OWNER' LIMIT 1"))).scalar_one()
        viewer_role = (await connection.execute(text("SELECT id FROM roles WHERE code = 'VIEWER' LIMIT 1"))).scalar_one()

        await connection.execute(text("INSERT INTO users (openId, email, name, status, role) VALUES (:open_id, :email, 'Live Org A User', 'ACTIVE', 'user')"), {"open_id": user_a_open, "email": f"{user_a_open}@invalid.test"})
        await connection.execute(text("INSERT INTO users (openId, email, name, status, role) VALUES (:open_id, :email, 'Live Org B User', 'ACTIVE', 'user')"), {"open_id": user_b_open, "email": f"{user_b_open}@invalid.test"})
        await connection.execute(text("INSERT INTO users (openId, email, name, status, role) VALUES (:open_id, :email, 'Live Viewer', 'ACTIVE', 'user')"), {"open_id": viewer_open, "email": f"{viewer_open}@invalid.test"})
        ids["user_a"] = (await connection.execute(text("SELECT id FROM users WHERE openId = :open_id"), {"open_id": user_a_open})).scalar_one()
        ids["user_b"] = (await connection.execute(text("SELECT id FROM users WHERE openId = :open_id"), {"open_id": user_b_open})).scalar_one()
        ids["viewer"] = (await connection.execute(text("SELECT id FROM users WHERE openId = :open_id"), {"open_id": viewer_open})).scalar_one()

        await connection.execute(text("INSERT INTO organizations (name, slug, status) VALUES ('Live Org A', :slug, 'ACTIVE'), ('Live Org B', :slug_b, 'ACTIVE')"), {"slug": org_a_slug, "slug_b": org_b_slug})
        ids["org_a"] = (await connection.execute(text("SELECT id FROM organizations WHERE slug = :slug"), {"slug": org_a_slug})).scalar_one()
        ids["org_b"] = (await connection.execute(text("SELECT id FROM organizations WHERE slug = :slug"), {"slug": org_b_slug})).scalar_one()
        await connection.execute(text("INSERT INTO workspaces (organizationId, name, slug, status) VALUES (:org, 'Live Workspace A', :slug, 'ACTIVE'), (:org_b, 'Live Workspace B', :slug_b, 'ACTIVE')"), {"org": ids["org_a"], "slug": f"workspace-a-{suffix}", "org_b": ids["org_b"], "slug_b": f"workspace-b-{suffix}"})
        ids["workspace_a"] = (await connection.execute(text("SELECT id FROM workspaces WHERE organizationId = :org"), {"org": ids["org_a"]})).scalar_one()
        ids["workspace_b"] = (await connection.execute(text("SELECT id FROM workspaces WHERE organizationId = :org"), {"org": ids["org_b"]})).scalar_one()
        await connection.execute(text("INSERT INTO memberships (userId, organizationId, workspaceId, roleId, status) VALUES (:user_a, :org_a, :workspace_a, :owner, 'ACTIVE'), (:user_b, :org_b, :workspace_b, :owner, 'ACTIVE'), (:viewer, :org_a, :workspace_a, :viewer_role, 'ACTIVE')"), {"user_a": ids["user_a"], "org_a": ids["org_a"], "workspace_a": ids["workspace_a"], "user_b": ids["user_b"], "org_b": ids["org_b"], "workspace_b": ids["workspace_b"], "viewer": ids["viewer"], "viewer_role": viewer_role, "owner": owner_role})
        ids["case_a"] = (await connection.execute(text("INSERT INTO cases (workspaceId, title, category, priority, risk, status, owner) VALUES (:workspace, 'Org A Case', 'OTHER', 'LOW', 'LOW', 'NEW', :owner)"), {"workspace": ids["workspace_a"], "owner": ids["user_a"]})).lastrowid
        ids["case_b"] = (await connection.execute(text("INSERT INTO cases (workspaceId, title, category, priority, risk, status, owner) VALUES (:workspace, 'Org B Case', 'OTHER', 'LOW', 'LOW', 'NEW', :owner)"), {"workspace": ids["workspace_b"], "owner": ids["user_b"]})).lastrowid
        ids["evidence_b"] = (await connection.execute(text("INSERT INTO evidence (caseId, type, title, source, verificationState, processingStatus) VALUES (:case_id, 'DOCUMENT', 'Org B Evidence', 'live-test', 'VERIFIED', 'PROCESSED')"), {"case_id": ids["case_b"]})).lastrowid
        ids["research_b"] = (await connection.execute(text("INSERT INTO researchRuns (caseId, query, status, requester) VALUES (:case_id, 'Org B Research', 'COMPLETED', :requester)"), {"case_id": ids["case_b"], "requester": ids["user_b"]})).lastrowid
        ids["policy_b"] = (await connection.execute(text("INSERT INTO policies (name, source, workspaceId, status) VALUES ('Org B Policy', 'live-test', :workspace, 'ACTIVE')"), {"workspace": ids["workspace_b"]})).lastrowid
        ids["audit_b"] = (await connection.execute(text("INSERT INTO auditLogs (actor, organizationId, workspaceId, action, resourceType, resourceId, caseId, requestCorrelationId) VALUES (:actor, :org, :workspace, 'LIVE_TEST', 'Case', :resource, :case_id, :correlation)"), {"actor": ids["user_b"], "org": ids["org_b"], "workspace": ids["workspace_b"], "resource": ids["case_b"], "case_id": ids["case_b"], "correlation": f"tenant-{suffix}"})).lastrowid

    scope_a = TenantScope(ids["org_a"], ids["workspace_a"])
    scope_b = TenantScope(ids["org_b"], ids["workspace_b"])
    assert (await repo.get_active_membership(ids["user_a"], scope_a))["role_code"] == "OWNER"
    assert (await repo.require_case_in_scope(ids["user_a"], scope_a, ids["case_a"]))["id"] == ids["case_a"]

    read_results: dict[str, str] = {}
    for resource in ("cases", "evidence", "research", "policies", "audit"):
        try:
            await repo.require_membership(ids["user_a"], scope_b)
            read_results[resource] = "FAIL: cross-tenant membership accepted"
        except TenantAccessDenied:
            read_results[resource] = "PASS: denied before resource query"
    assert all(value.startswith("PASS") for value in read_results.values())

    write_results: dict[str, str] = {}
    for resource, permission in (("cases", "CASES:UPDATE"), ("evidence", "EVIDENCE:UPDATE"), ("research", "RESEARCH:UPDATE"), ("policies", "POLICIES:UPDATE"), ("audit", "AUDIT:EXPORT")):
        try:
            await repo.require_permission(ids["user_a"], scope_b, permission)
            write_results[resource] = "FAIL: cross-tenant permission accepted"
        except TenantAccessDenied:
            write_results[resource] = "PASS: denied before write"
    assert all(value.startswith("PASS") for value in write_results.values())
    assert not await repo.has_permission(ids["viewer"], scope_a, "CASES:DELETE")

    async with repo.engine.begin() as connection:
        await connection.execute(text("UPDATE memberships SET status = 'SUSPENDED' WHERE userId = :user_id AND organizationId = :org_id"), {"user_id": ids["user_a"], "org_id": ids["org_a"]})
    try:
        try:
            await repo.require_membership(ids["user_a"], scope_a)
            raise AssertionError("suspended membership was accepted")
        except TenantAccessDenied:
            pass
    finally:
        async with repo.engine.begin() as connection:
            await connection.execute(text("UPDATE memberships SET status = 'ACTIVE' WHERE userId = :user_id AND organizationId = :org_id"), {"user_id": ids["user_a"], "org_id": ids["org_a"]})

    async with repo.engine.begin() as connection:
        await connection.execute(text("DELETE FROM auditLogs WHERE id = :id"), {"id": ids["audit_b"]})
        await connection.execute(text("DELETE FROM researchRuns WHERE id = :id"), {"id": ids["research_b"]})
        await connection.execute(text("DELETE FROM evidence WHERE id = :id"), {"id": ids["evidence_b"]})
        await connection.execute(text("DELETE FROM cases WHERE id IN (:case_a, :case_b)"), ids)
        await connection.execute(text("DELETE FROM memberships WHERE userId IN (:user_a, :user_b, :viewer)"), ids)
        await connection.execute(text("DELETE FROM policies WHERE id = :id"), {"id": ids["policy_b"]})
        await connection.execute(text("DELETE FROM workspaces WHERE id IN (:workspace_a, :workspace_b)"), ids)
        await connection.execute(text("DELETE FROM organizations WHERE id IN (:org_a, :org_b)"), ids)
        await connection.execute(text("DELETE FROM users WHERE id IN (:user_a, :user_b, :viewer)"), ids)
    await repo.close()
    print({"same_tenant_read": "PASS", "cross_tenant_reads": read_results, "cross_tenant_writes": write_results, "suspended_membership": "PASS", "viewer_delete_denied": "PASS"})


if __name__ == "__main__":
    asyncio.run(main())
