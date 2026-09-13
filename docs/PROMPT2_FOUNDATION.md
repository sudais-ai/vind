# VindicAI Prompt 2 Foundation

## Authoritative stack

VindicAI uses exactly one authoritative database: the managed **MySQL/TiDB database accessed through Drizzle ORM**. The source schema is `drizzle/schema.ts`, migrations are under `drizzle/`, and Prompt 2 introduces no second database, PostgreSQL, Prisma, or competing schema.

The existing tenant isolation, RBAC, authorization, migration history, and all previously passed tests remain unchanged by this Prompt 2 foundation.

## Knowledge and retrieval

`server/prompt2/retrieval.ts` adds a Drizzle-backed `KnowledgeRetriever` over existing `researchRuns` and `researchSources` records. Retrieval is bounded to 20 results, restricted to the requested case, filtered to active sources, ordered deterministically by source creation time, and returns explicit provenance references. An in-memory retriever exists only for isolated tests.

This is deliberately a provenance-first foundation. The existing `embeddingMetadata` table remains provider-neutral metadata storage; no unimplemented vector search is claimed and no vector database is introduced in this step.

## Controlled AI orchestration

`server/prompt2/orchestrator.ts` adds a server-side `AdvisoryOrchestrator` and a built-in LLM adapter using the existing `invokeLLM` helper. The adapter requests strict structured JSON and uses a low reasoning budget. Model calls remain server-side, and the model receives only retrieved source summaries.

`server/prompt2/policy.ts` permits only classification, fact extraction, research-question, strategy, draft-response, and risk-assessment recommendations. AI cannot authorize permission escalation, cross-tenant access, irreversible deletion, external sending, approval bypass, policy-authority changes, security-control disabling, or audit mutation. Every successful result is explicitly marked `advisoryOnly: true` and includes source citations.

## Verification

`server/prompt2.test.ts` verifies provenance-backed advisory output and rejects forbidden `external_send` authority. The implementation is compatible with the existing research, artifact, agent-run, draft, and embedding metadata schema relationships. No full AI swarm, autonomous agent loop, external communication, or approval bypass was built.

## Next controlled increment

The next implementation should add authenticated research-run creation and persistence against the existing Drizzle tables, source ingestion/provenance normalization, embedding job state transitions, and human approval checkpoints before any recommendation can influence a case state or outbound action.
