# Prompt 2 Chunk Report — Knowledge Domain and Source Model

## Confirmed authoritative stack

The sole authoritative database is the existing managed MySQL/TiDB database accessed through Drizzle ORM. No duplicate entity model, second database, migration, PostgreSQL, Prisma, or vector extension was introduced in this chunk.

## Step 1 inspection findings

The existing schema already contains the required core relationships under these names:

| Requested concept                | Existing authoritative entity                                       |
| -------------------------------- | ------------------------------------------------------------------- |
| LegalSource / external knowledge | `researchSources`, linked to `researchRuns`                         |
| Jurisdiction                     | `jurisdictions`                                                     |
| Regulator / authority            | `researchSources.authority` and `jurisdictions.regulatoryAuthority` |
| Policy                           | `policies`                                                          |
| Policy version                   | `policyVersions`                                                    |
| Policy clause                    | `policyClauses`                                                     |
| Evidence / documents             | `evidence` and `storedFiles`                                        |
| Research run                     | `researchRuns`                                                      |
| Agent run                        | `agentRuns`                                                         |
| Agent artifact                   | `artifacts`                                                         |
| Claims                           | `claims`                                                            |
| Citations                        | `citations` linking claims to evidence and facts                    |
| Outcomes / workflow results      | `approvals`, `actions`, `responses`, `deadlines`, `notifications`   |
| Audit logs                       | append-only `auditLogs`                                             |

Prompt 1 already supplied a bounded retrieval adapter over active `researchSources`, an advisory orchestrator, provenance references, and an AI authority policy. Tenant isolation already scopes cases, evidence, research, policies, claims, citations, approvals, actions, notifications, and audit data through the existing authorization path.

## Step 2 domain boundaries added

The following separate TypeScript interfaces were added under `server/prompt2/domain/`:

- `KnowledgeService`
- `ResearchService`
- `SourceService`
- `CitationService`
- `ClaimService`
- `PolicyKnowledgeService`
- `JurisdictionService`

These are ports/contracts only in this chunk. They do not bypass authorization, write directly from the LLM, or create duplicate persistence entities.

## Step 3 source model added

`server/prompt2/domain/source.ts` defines structured `SourceMetadata` with URL, title, authority, category, publisher, jurisdiction, publication/effective/expiration/supersession dates, retrieval time, content hash, version, status, confidence, and verification status.

The supported categories are government, regulator, court, legislation, official company policy, contract/policy, internal evidence, and secondary research. `AUTHORITY_RANK` is a deterministic configurable ranking table. `rankSource()` combines category authority, verification status, and bounded retrieval age into a deterministic score. It is a ranking primitive, not a freshness or temporal-validity decision.

The current Phase 2 `researchSources` table does not yet persist every new metadata field as first-class columns. Existing fields remain authoritative, and this chunk intentionally avoids a schema migration or duplicate source table. Persistence mapping and any additive migration must be designed in a later approved chunk.

## Verification

The new domain files import through the TypeScript compiler, and the source-domain tests verify deterministic authority ranking and verification bonuses. The existing Prompt 2 tests and all prior Phase 2 tests remain in the test suite. Tenant isolation and RBAC are not modified.

## Explicitly deferred

The Staleness Firewall was **not built**. Freshness validation, temporal validation, authority validation, conflict detection, structured claims/citations persistence, live source ingestion, vector retrieval, and the full multi-agent swarm remain later work.
