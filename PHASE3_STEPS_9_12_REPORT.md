# VindicAI Phase 3 — Steps 9–12 Security Report

## Scope completed

This security-critical chunk extended the existing Phase 3 backend foundation without rebuilding earlier chunks, changing the frontend, deleting data, or replacing Drizzle/MySQL-TiDB. Authentication remains explicitly incomplete and is represented through a provider boundary rather than a fake login implementation.

## Authentication boundary

`backend/app/core/auth.py` defines a pluggable `AuthenticationProvider` protocol and immutable `Identity` model with provider, subject, and optional internal user ID. `RequestIdentityProvider` reads an identity only from request context and does not pretend to authenticate users. This leaves a clean seam for Manus OAuth/session integration later without requiring each endpoint to be rewritten.

## Authorization and tenant isolation

`backend/app/domain/access.py` defines `TenantScope`, a generic `TenantAccessDenied` error, and a separate same-tenant `TenantResourceNotFound` error. Cross-tenant denials use a generic public message so callers cannot learn whether a resource exists in another organization.

`backend/app/repositories/mysql_authorization.py` provides a SQLAlchemy async read/authorization adapter over the existing Drizzle schema. It verifies active user, organization, workspace, and membership state before permission or resource checks. Case access is constrained by both workspace and organization. Managed TiDB SSL query parameters are normalized into a secure SSL context.

`backend/app/services/authorization.py` provides deterministic reusable helpers for membership and permission checks. The LLM is not involved in any authorization decision. Unknown permission keys are denied rather than accepted.

`backend/app/domain/permissions.py` mirrors the actual Phase 2 source of truth: `OWNER`, `ADMIN`, `MANAGER`, `REVIEWER`, `MEMBER`, and `VIEWER`, along with the existing permission domains and actions. The database role/permission records remain authoritative at runtime; the Python matrix is a vocabulary and validation boundary, not a replacement schema.

## Live test

`backend/tests/tenant_isolation_live.py` created temporary records for two organizations, two workspaces, two users, a viewer, cases, evidence, research, a policy, and an audit record in the existing managed database. It then cleaned up all temporary records.

The proof passed:

| Check | Result |
|---|---|
| Same-tenant Org A case access | PASS |
| Org A user reading Org B cases | DENIED before resource query |
| Org A user reading Org B evidence | DENIED before resource query |
| Org A user reading Org B research | DENIED before resource query |
| Org A user reading Org B policies | DENIED before resource query |
| Org A user reading Org B audit data | DENIED before resource query |
| Org A user writing Org B cases | DENIED before write |
| Org A user writing Org B evidence | DENIED before write |
| Org A user writing Org B research | DENIED before write |
| Org A user writing Org B policies | DENIED before write |
| Org A user writing Org B audit data | DENIED before write |
| Suspended membership | DENIED |
| Viewer attempting `CASES:DELETE` | DENIED |

The smoke suite and Python compilation also passed. Temporary test data was removed after verification.

## Deliberately deferred

This chunk does not add domain/service workflows, authentication provider integration, route-level business APIs, or frontend changes. The next chunk can build domain services only after these deterministic security helpers are used by those services.
