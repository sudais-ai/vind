# VindicAI Phase 2 Live Test Report

**Test date:** 2026-09-12  
**Project:** `vindicai-live-site`  
**Database:** Managed MySQL/TiDB database used by the WebDev project  
**Scope:** Database, authentication foundation, authorization, tenant isolation, seed data, integrity, security review, and frontend smoke checks. No Phase 3/4 business logic or real external provider execution was added.

## Executive result

Phase 2 database foundations are operational after a non-destructive migration repair. All existing automated tests passed, all available Phase 2 seed scripts passed against the live database, and the mandatory tenant-isolation test passed. The result is **not a claim that every requested production authentication flow is complete**: the email/password sign-up, sign-in, and password-recovery screens are explicitly mock preview flows, while the real authentication path is Manus OAuth.

## Confirmed working

- **TypeScript and production build:** `pnpm check` and `pnpm build` completed successfully. The build emitted a non-blocking bundle-size warning for the main client chunk.
- **Automated test suite:** 7 test files and 16 tests passed, including logout, case/research/workflow contracts, retention/vector contracts, access-control catalog, and the live tenant-isolation test.
- **Migration state:** The project officially uses **Drizzle ORM with the managed MySQL/TiDB database**. PostgreSQL and Prisma are not part of this project. The initial database contained the framework `users` migration but had a partial/misaligned Phase 2 migration state. A non-destructive repair applied the existing Phase 2 migrations in order, added missing `users` columns/indexes, recorded repaired migration hashes, and `pnpm drizzle-kit migrate` now exits cleanly with no pending migration error.
- **Catalog seed:** The live seed resolved `User -> Organization -> Workspace -> Membership`, selected the `OWNER` role, and confirmed `ADMINISTRATION:MANAGE` permission resolution.
- **Case foundation seed:** The live case seed passed `Case -> Evidence -> Fact -> Claim -> Citation`, created a timeline event, and used a metadata-only S3-compatible storage reference.
- **Research foundation seed:** The live research seed passed `ResearchRun -> ResearchSource -> PolicyVersion -> AgentRun -> Artifact -> Draft`. It preserved draft versions 1 and 2 while keeping current version 2. Agent execution was correctly recorded as foundation-only and not actually executed.
- **Workflow foundation seed:** The live workflow seed passed `Approval -> Action -> Response -> Deadline -> Notification`, created six audit events, and used a server-side encrypted-secret reference for OAuth metadata while the provider remained disconnected.
- **Coherent full-chain seed:** The coherent seed passed with one organization, one workspace, two evidence records, three timeline events, one traceability row, two draft versions, eight audit events, and legal-hold evidence records.
- **Tenant isolation:** The real test created separate Org A and Org B data. Org A received only Org A case-graph records; the graph contained no Org B values. An Org A user attempting Org B’s organization/workspace scope was rejected with `FORBIDDEN`. The graph query covers cases, evidence, facts, timeline events, research runs/sources, claims, citations, approvals, actions, notifications, audit logs, and policies.
- **Authorization catalog:** All six roles are present: `OWNER`, `ADMIN`, `MANAGER`, `REVIEWER`, `MEMBER`, and `VIEWER`. All nine required domains and eight action types are represented. The OWNER matrix covers the full catalog, and VIEWER is read-only in the tested matrix.
- **Data integrity:** The live reversible integrity probe confirmed that invalid case enum data, orphan evidence, and duplicate organization slugs are rejected. Deleting the seeded case behaves as designed with cascading related records; the test rolled back the transaction so seeded data was not removed.
- **Vector foundation:** `embeddingMetadata` exists with source type/id, provider, model, dimensions, status, checksum, and metadata fields. This is provider-neutral metadata storage; no separate vector database is introduced.
- **Storage foundation:** The tested seed stores file/object references as metadata rather than forcing large binary content into database columns.
- **OAuth secret handling:** OAuth records use `encryptedSecretRef`, token status, and metadata fields. The workflow seed rejected raw-token-style references and confirmed a server-side secret-manager reference. No literal API key or OAuth secret was found in source code.
- **Audit path:** The application exposes an append/read helper for audit logs and no normal update/delete helper or route was found. Workflow seed output confirmed append-only helper usage.
- **Frontend smoke checks:** Dashboard, Case List, and Case Room routes rendered without a build or TypeScript error in the live preview. The screenshots showed the shell and route surfaces successfully.

## Found broken or incomplete

- **Migration repair:** The project’s authoritative stack is MySQL/TiDB + Drizzle. Running the standard `drizzle-kit push --force` exposed a real partial-migration problem: the database already had the framework `users` table, while the Phase 2 migration chain expected additional columns and tables. This was repaired without dropping tables.
- **Authentication screens are mock-only:** `SignUp.tsx`, `SignIn.tsx`, and `PasswordRecovery.tsx` explicitly display mock success messages and navigate locally. They do not create accounts, verify email, issue password sessions, expire password sessions, or send reset emails. Therefore account creation, email/password login, password reset, and email verification could not be honestly reported as live production authentication.
- **Real authentication is OAuth-based:** The implemented server path is Manus OAuth with state/nonce validation, user upsert, a server-issued session token, secure cookie settings, and logout. Full external OAuth completion was not executed in this test because it requires an interactive logged-in OAuth provider session.
- **Frontend live-data session coverage is incomplete:** The route smoke test rendered the UI, but a fully authenticated user session was not available for browser click-through of live case data. The Case List showed an empty state and Case Room remained in its loading state in the unauthenticated preview. This is not reported as a tenant leak; it is an unresolved authenticated-adapter verification gap.
- **Formatter/lint status:** The package has no lint script. `pnpm exec prettier --check client server shared drizzle` reports existing formatting differences across 123 files. TypeScript and production build pass; no broad formatting rewrite was performed because it would modify unrelated scaffold and UI files without changing runtime behavior.
- **Redis:** No Redis client or runtime integration is used. The dependency lockfile contains an indirect Upstash Redis reference, but no application code references Redis. The current foundation therefore intentionally uses database persistence without a cache.
- **Production providers are deferred:** No real Gmail sync/send, external AI agent execution, LangGraph, or production deployment was exercised, consistent with the Phase 2 boundary.

## Fixed

- Added the missing `users.avatar`, `users.status`, and `users.deletedAt` fields plus their required indexes and unique `openId` index.
- Applied the existing Phase 2 schema objects and later migration changes without dropping current tables or data.
- Recorded the repaired migration hashes in `__drizzle_migrations`; a subsequent `pnpm drizzle-kit migrate` completed cleanly.
- Added an idempotent repair utility at `scripts/repair-migrations.mjs` so the exact non-destructive recovery can be reviewed and repeated in a controlled environment.
- Added a reversible integrity probe at `scripts/live-integrity-check.mjs` used to verify enum, foreign-key, unique-constraint, cascade, and vector-foundation behavior.

## Still unresolved / not claimed complete

The following are deliberately not claimed as complete: real email/password account creation, real password reset, email verification, authenticated browser click-through with a live user session, Redis caching, pgvector extension activation, Gmail execution, real AI-agent execution, and production deployment. These require Phase 3/4 implementation, interactive credentials, or infrastructure decisions outside the tested Phase 2 foundation.

## Reproduction commands

```bash
pnpm check
pnpm build
pnpm test
pnpm drizzle-kit migrate
pnpm db:seed:phase2
pnpm db:seed:phase2-case
pnpm db:seed:phase2-research
pnpm db:seed:phase2-workflow
pnpm db:seed:phase2-coherent
node scripts/live-integrity-check.mjs
```

The project remains available in the live WebDev preview at:

<https://3000-iyb3ehcs73c3z5owwuu6a-32d897b3.us1.manus.computer>
