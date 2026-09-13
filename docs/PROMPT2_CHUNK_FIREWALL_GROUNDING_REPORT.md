# Prompt 2 Chunk Report — Staleness Firewall and Claim Grounding

## Scope completed

This chunk extends the existing MySQL/TiDB + Drizzle Prompt 2 foundation without rebuilding Prompt 1, duplicating entities, deleting data, weakening authorization, or introducing a second database.

## Staleness Firewall

`server/prompt2/firewall.ts` implements a deterministic source decision pipeline:

`Retrieved Source -> Freshness/Status Check -> Effective-Date Check -> Authority/Verification Check -> Decision`

The result is one of:

- `VALID`: the source may proceed to an agent.
- `STALE`: the source is blocked and must be re-researched; the implementation never silently treats an old, expired, superseded, future-effective, unverified, or authority-less source as current.
- `CONFLICTED`: reserved for an explicit conflict signal and routed to human review. Contradiction detection itself was not built in this chunk.

The source decision tracks status, expiration, supersession, effective date, verification state, and authority presence. It does not allow the LLM to become an authority.

## Source snapshots and metadata

The existing `researchSources` entity was extended additively with retrieval time, expiration date, supersession pointer, version, confidence, and verification status. A new `sourceSnapshots` table stores immutable source hash, retrieval timestamp, normalized content reference, and version metadata. The implementation stores references and hashes rather than copying external content unnecessarily.

`server/prompt2/snapshots.ts` provides database-backed snapshot recording and retrieval through the existing Drizzle database boundary.

## Claim-level grounding

Existing `claims` and `citations` entities were extended rather than duplicated. Claims now require a persisted `statementType` from:

`FACT`, `LAW`, `POLICY`, `SOURCE_STATEMENT`, `INFERENCE`, `RECOMMENDATION`, or `UNKNOWN`.

Citations now support a research-source link plus source retrieval timestamp, authority snapshot, and confidence. `server/prompt2/grounding.ts` rejects dangling citations, missing excerpts, mismatched source timestamps, and mismatched authority snapshots. This enforces claim-level traceability rather than relying on a bibliography at the bottom of an AI response.

## Migration safety

An additive Drizzle migration was generated as `0009_greedy_silver_samurai.sql`, reviewed, applied to the managed database, and recorded in the Drizzle migration metadata. No tables or existing records were deleted. The migration bookkeeping check completes cleanly.

## Verification

The required real examples pass:

1. An expired sample source is classified `STALE` and `proceedToAgent` is false.
2. An explicit conflict signal is classified `CONFLICTED` and requires human review.
3. A sample claim is accepted only when its citation points to a real source with matching retrieval timestamp and authority; a missing source is rejected.

The full project checks pass: 10 Vitest files and 23 tests, TypeScript check, production build, formatting, and migration verification. The build emits a non-blocking large-chunk warning from the existing frontend bundle.

## Explicitly deferred

Contradiction detection, source ingestion, live re-research orchestration, vector retrieval, and the full multi-agent swarm were not built.
