# VindicAI Phase 3 — Steps 13–16 Report

## Scope completed

This chunk extended the existing authentication and tenant-security boundaries with domain-service contracts, a deterministic case lifecycle state machine, a thin CaseService orchestration layer, and explicit AI authority controls. No frontend changes, audit/pagination/validation work, or full AI swarm implementation was added.

## Domain service layer

`backend/app/services/boundaries.py` defines contracts for UserService, OrganizationService, CaseService, EvidenceService, PolicyService, ResearchService, ApprovalService, ActionService, and NotificationService. ResearchService and AIRecommendationService are interfaces only, as requested; they do not execute research or call a model.

`backend/app/services/cases.py` defines `CaseService` with thin orchestration methods for create, list, retrieve, permitted metadata updates, state transitions, and close. The service delegates persistence and tenant enforcement to a repository contract. Metadata is restricted to permitted case fields; arbitrary control fields cannot be passed through the metadata update boundary.

## Case lifecycle state machine

`backend/app/domain/case_state.py` implements the deterministic lifecycle:

`NEW → INGESTING → FACTS_EXTRACTED → EVIDENCE_VERIFIED → RESEARCHING → STRATEGY_READY → DRAFT_READY → AWAITING_APPROVAL → SENT → WAITING_RESPONSE → RESPONSE_RECEIVED → REANALYZING → ESCALATION_READY → RESOLVED → CLOSED`

Only explicit transitions are accepted. Terminal `CLOSED` has no outgoing transitions. The implementation supports the defined alternative paths from `RESPONSE_RECEIVED` and `REANALYZING` while rejecting all unspecified jumps.

## Deterministic AI controls

`backend/app/domain/ai_controls.py` restricts AI outputs to recommendation categories: classification, fact extraction, research questions, strategy, draft response, and risk assessment. It explicitly rejects authority requests involving permission escalation, cross-tenant access, irreversible deletion, external sending, approval bypass, policy authority changes, disabling security controls, or audit mutation.

## Verification

The direct state-machine test passed:

- Invalid `NEW → RESEARCHING` was rejected with a clear error explaining that the required prior lifecycle step was incomplete.
- Valid `NEW → INGESTING → FACTS_EXTRACTED → EVIDENCE_VERIFIED → RESEARCHING` was accepted.
- An AI recommendation attempting `external_send` authority was rejected.
- Python compilation passed for the complete backend tree.
- The previously established live two-organization tenant-isolation proof was rerun and passed: Org A remained unable to read or write Org B cases, evidence, research, policies, or audit records; suspended membership and viewer delete permission were also denied.

## Deliberately deferred

This chunk does not build domain route handlers, database-backed CaseRepository implementation, pagination, validation, audit service, real OAuth integration, or AI execution. The next chunk should connect these service contracts to versioned APIs only after the API request/response validation and audit requirements are approved.
