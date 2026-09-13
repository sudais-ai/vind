import { evidenceClaims, evidenceFacts, evidenceRecords, intelligencePanels, policyVersions, researchResults, timelineEvents } from "@/mocks/intelligence";
import { caseDetails } from "@/mocks/workspace";
import type { EvidenceClaim, EvidenceFact, EvidenceRecord, ResearchResult, TimelineEvent } from "@/mocks/intelligence";
import { actionRecords, approvalRecords, draftRecords, responseThreads } from "@/mocks/final-phase";
import type { ActionRecord, ApprovalRecord, DraftRecord, ResponseThread } from "@/mocks/final-phase";
import type { CaseSummary } from "@/types/vindicai";
import superjson from "superjson";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";

type ServiceResult<T> = { data: T; source: "mock"; generatedAt: string };
const wrap = <T,>(data: T): ServiceResult<T> => ({ data, source: "mock", generatedAt: new Date().toISOString() });

export type ApprovalDecision = { status: "pending" | "approved" | "rejected"; reviewer?: string; reason?: string; decidedAt?: string };
export type StrategyRecord = { caseId: string; title: string; summary: string; risk: "low" | "medium" | "high" | "critical"; steps: string[]; citations: string[]; approvalId?: string; draftId?: string };
type CaseScope = { evidence: { records: EvidenceRecord[]; facts: EvidenceFact[]; claims: EvidenceClaim[] }; timeline: TimelineEvent[]; research: ResearchResult[]; drafts: DraftRecord[]; approvals: ApprovalRecord[]; actions: ActionRecord[]; responses: ResponseThread[]; strategy: StrategyRecord };

const scopes = new Map<string, CaseScope>();
const decisions = new Map<string, ApprovalDecision>();
if (typeof window !== "undefined") {
  const storedScopes = window.localStorage.getItem("vindicai:case-scopes");
  if (storedScopes) { try { (JSON.parse(storedScopes) as [string, CaseScope][]).forEach(([id, scope]) => scopes.set(id, scope)); } catch { window.localStorage.removeItem("vindicai:case-scopes"); } }
}
const persistScopes = () => { if (typeof window !== "undefined") window.localStorage.setItem("vindicai:case-scopes", JSON.stringify(Array.from(scopes.entries()))); };

const seededApprovals = approvalRecords.map((item) => ({ ...item, status: "pending" as const }));
const seededActions = actionRecords.map((item) => ({ ...item }));

function getDecision(id: string): ApprovalDecision { if (decisions.has(id)) return decisions.get(id)!; if (typeof window !== "undefined") { const stored = window.localStorage.getItem(`vindicai:approval:${id}`); if (stored) { const parsed = JSON.parse(stored) as ApprovalDecision; decisions.set(id, parsed); return parsed; } } return { status: "pending" }; }
function scopedOr<T>(caseId: string | undefined, scoped: (scope: CaseScope) => T, seeded: T): T {
  const scope = caseId ? scopes.get(caseId) : undefined;
  return scope ? scoped(scope) : seeded;
}

export function registerCaseScope(summary: CaseSummary, input: { title: string; company: string; description: string; desiredOutcome: string }) {
  const prefix = summary.id.replace("case-", "");
  const evidence: EvidenceRecord[] = [
    { id: `ev-${prefix}-1`, title: `${input.title} · intake summary`, source: `${input.company} operations inbox`, timestamp: "Sep 11, 2026 · 09:18", provenance: "Added during case intake · mock source", status: "verified", type: "Email", size: "42 KB", preview: `CASE INTAKE\n${input.description}\n\nDesired outcome: ${input.desiredOutcome}`, factIds: [`fact-${prefix}-1`], claimIds: [`claim-${prefix}-1`] },
    { id: `ev-${prefix}-2`, title: `${input.title} · requested record`, source: `${input.company} shared workspace`, timestamp: "Sep 11, 2026 · 09:24", provenance: "Awaiting counterparty confirmation · mock source", status: "review", type: "PDF", size: "640 KB", preview: `REQUESTED RECORD\n${input.company}\nPending source confirmation for this dispute.`, factIds: [`fact-${prefix}-2`], claimIds: [`claim-${prefix}-2`] },
  ];
  const facts: EvidenceFact[] = [{ id: `fact-${prefix}-1`, text: input.description, evidenceIds: [evidence[0].id], claimIds: [`claim-${prefix}-1`], verified: true }, { id: `fact-${prefix}-2`, text: `The requested outcome is: ${input.desiredOutcome}`, evidenceIds: [evidence[1].id], claimIds: [`claim-${prefix}-2`], verified: false }];
  const claims: EvidenceClaim[] = [{ id: `claim-${prefix}-1`, text: `The intake record describes a live ${input.company} dispute.`, factIds: [facts[0].id], confidence: 82, state: "supported" }, { id: `claim-${prefix}-2`, text: "The requested remedy still needs supporting source records.", factIds: [facts[1].id], confidence: 54, state: "unresolved" }];
  const timeline: TimelineEvent[] = [{ id: `tl-${prefix}-1`, date: "Sep 11, 2026", time: "09:18", title: "Case created", detail: `${input.title} was opened for ${input.company}.`, state: "complete", source: "Case intake" }, { id: `tl-${prefix}-2`, date: "Sep 11, 2026", time: "09:19", title: "Issue summary captured", detail: input.description, state: "complete", source: "Intake form" }, { id: `tl-${prefix}-3`, date: "Sep 11, 2026", time: "09:20", title: "Source request prepared", detail: "Starting records are ready for human review.", state: "review", source: "Evidence desk" }, { id: `tl-${prefix}-4`, date: "Sep 11, 2026", time: "09:21", title: "Strategy awaiting evidence", detail: "The next recommendation will be refined when source records arrive.", state: "current", source: "VindicAI analysis" }];
  const research: ResearchResult[] = [{ id: `rs-${prefix}-1`, title: `${input.title} · intake context`, kind: "Fact", source: `${input.company} intake record`, authority: "Case owner", effectiveDate: "Sep 11, 2026", confidence: 82, status: "VALID", citations: [evidence[0].title], detail: input.description }, { id: `rs-${prefix}-2`, title: `${input.title} · remedy requirement`, kind: "Policy", source: "Workspace review controls", authority: "Operations", effectiveDate: "Sep 11, 2026", confidence: 76, status: "REQUIRES REVIEW", citations: [evidence[1].title], detail: `${input.desiredOutcome} requires source confirmation and human approval.` }, { id: `rs-${prefix}-3`, title: `${input.title} · open question`, kind: "AI Inference", source: "VindicAI analysis", authority: "Mock intelligence", effectiveDate: "Sep 11, 2026", confidence: 48, status: "STALE", citations: [evidence[1].title], detail: "The record is incomplete; do not treat the suggested path as a verified conclusion." }];
  const approval: ApprovalRecord = { id: `approval-${prefix}`, title: `Review ${input.title}`, caseId: summary.id, counterparty: input.company, requestedBy: "Alex Morgan", risk: summary.risk, requestedAt: "Sep 11, 2026 · 09:22", due: "Due this week", recommendation: `${input.desiredOutcome} after the source record is reviewed.`, riskChecks: [{ label: "Intake record attached", state: "pass", detail: evidence[0].title }, { label: "Supporting source required", state: "review", detail: evidence[1].title }, { label: "Human decision required", state: "pass", detail: "No action executes automatically" }], reviewerReasoning: "Review the source context before approving the proposed next move.", actionLabel: `Approve ${input.title}` };
  const draft: DraftRecord = { id: `draft-${prefix}`, title: `${input.title} · review draft`, caseId: summary.id, counterparty: input.company, content: `Subject: ${input.title}\n\nHello ${input.company} team,\n\n${input.description}\n\nRequested outcome: ${input.desiredOutcome}\n\nThis draft remains subject to human review.`, versions: [{ id: `v-${prefix}-1`, label: "Version 1", author: "VindicAI", updatedAt: "Sep 11, 2026 · 09:23", state: "current", excerpt: "Initial source-aware draft for review." }], citations: [{ id: `cit-${prefix}-1`, label: evidence[0].title, source: evidence[0].source, excerpt: input.description, kind: "evidence" }, { id: `cit-${prefix}-2`, label: research[1].title, source: research[1].source, excerpt: input.desiredOutcome, kind: "research" }], warnings: ["Confirm the supporting record before making a consequential statement.", "Human approval is required before any action."], confidence: 71 };
  const action: ActionRecord = { id: `action-${prefix}`, label: `Prepare ${input.title}`, caseId: summary.id, counterparty: input.company, type: "Send email", state: "AWAITING_APPROVAL", owner: "Alex Morgan", detail: `Review ${input.desiredOutcome}`, createdAt: "Sep 11, 2026", requiresApproval: true };
  const response: ResponseThread = { id: `thread-${prefix}`, caseId: summary.id, counterparty: input.company, subject: `${input.title} · response thread`, channel: "Email", state: "prepared", lastEvent: "Draft prepared Sep 11, 2026", followUp: "Follow-up after human approval", owner: "Alex Morgan", events: [{ label: "Draft prepared", date: "Sep 11 · 09:23", state: "prepared" }], preview: `The draft for ${input.title} is ready for review. No message has been sent.` };
  scopes.set(summary.id, { evidence: { records: evidence, facts, claims }, timeline, research, drafts: [draft], approvals: [approval], actions: [action], responses: [response], strategy: { caseId: summary.id, title: `${input.title} · proposed strategy`, summary: `Build a source-backed path toward: ${input.desiredOutcome}`, risk: summary.risk, steps: [`Preserve the intake record for ${input.company}.`, "Request and verify the supporting source record.", "Bring the proposed remedy to a human reviewer before drafting or acting."], citations: [evidence[0].title, evidence[1].title, research[1].title], approvalId: approval.id, draftId: draft.id } });
  persistScopes();
}

const legacyMockIntelligenceService = {
  async getCaseContext(caseId?: string) {
    if (!caseId) return wrap<{ title: string; counterparty: string } | undefined>(undefined);
    const detail = caseDetails.find((item) => item.id === caseId);
    if (detail) return wrap({ title: detail.title, counterparty: detail.counterparty });
    const scope = scopes.get(caseId);
    const intake = scope?.evidence.records[0];
    if (!intake) return wrap<{ title: string; counterparty: string } | undefined>(undefined);
    return wrap({ title: intake.title.replace(/ · intake summary$/, ""), counterparty: intake.source.replace(/ operations inbox$/, "") });
  },
  async getEvidence(caseId?: string) { return wrap(scopedOr(caseId, (scope) => scope.evidence, { records: evidenceRecords, facts: evidenceFacts, claims: evidenceClaims })); },
  async getTimeline(caseId?: string) { return wrap(scopedOr(caseId, (scope) => scope.timeline, timelineEvents)); },
  async getResearch(caseId?: string) { return wrap(scopedOr(caseId, (scope) => scope.research, researchResults)); },
  async getPolicies() { return wrap(policyVersions); },
  async getCaseIntelligence(caseId?: string) {
    const scope = caseId ? scopes.get(caseId) : undefined;
    if (!scope) return wrap(intelligencePanels);
    const verifiedFacts = scope.evidence.facts.filter((fact) => fact.verified).map((fact) => fact.text);
    const unresolvedClaims = scope.evidence.claims.filter((claim) => claim.state !== "supported").map((claim) => claim.text);
    const reviewEvidence = scope.evidence.records.filter((record) => record.status !== "verified").map((record) => record.title);
    const policyItems = scope.research.filter((item) => item.kind === "Policy" || item.kind === "Law / Rule").map((item) => `${item.title} · ${item.status}`);
    return wrap([
      { id: "verified", label: "Verified facts", eyebrow: "Source-backed", tone: "sage" as const, items: verifiedFacts.length ? verifiedFacts : ["No verified facts yet; attach source records to begin."] },
      { id: "supporting", label: "Supporting evidence", eyebrow: `${scope.evidence.records.length} indexed sources`, tone: "blue" as const, items: scope.evidence.records.map((record) => record.title) },
      { id: "policies", label: "Applicable policies", eyebrow: "Effective context", tone: "neutral" as const, items: policyItems.length ? policyItems : ["No policy context has been mapped yet."] },
      { id: "inference", label: "AI inference", eyebrow: "Needs review", tone: "amber" as const, items: unresolvedClaims.length ? unresolvedClaims : ["No unresolved inference is currently recorded."], detail: "Inference is intentionally separated from verified facts." },
      { id: "recommendation", label: "Recommendation", eyebrow: "Human decision", tone: "sage" as const, items: scope.strategy.steps.length ? scope.strategy.steps : [scope.strategy.summary] },
      { id: "risks", label: "Risks", eyebrow: "Watch closely", tone: "red" as const, items: scope.approvals[0]?.riskChecks.filter((check) => check.state !== "pass").map((check) => check.detail) ?? ["No risk checks are recorded yet."] },
      { id: "contradictions", label: "Contradictions", eyebrow: `${unresolvedClaims.length} active`, tone: "amber" as const, items: unresolvedClaims.length ? unresolvedClaims : ["No contradictions are currently recorded."] },
      { id: "missing", label: "Missing evidence", eyebrow: "Close the gap", tone: "neutral" as const, items: reviewEvidence.length ? reviewEvidence : ["No additional source records are currently requested."] },
    ]);
  },
  async getStrategy(caseId?: string) { return wrap(caseId && scopes.get(caseId)?.strategy ? scopes.get(caseId)!.strategy : { caseId: "case-1048", title: "Protect the record before the negotiation", summary: "Lead with verified facts, keep unverified causes separate, and make the approval boundary explicit.", risk: "high" as const, steps: ["Anchor on source-backed facts.", "Keep the ask narrow and reviewable.", "Do not imply causality until verified."], citations: ["August statement · NW-1048", "September statement · NW-1048", "Enterprise Billing Terms v3.2 · §4.2"], approvalId: "approval-1", draftId: "draft-1048" }); },
  async getDrafts(caseId?: string) { return wrap(scopedOr(caseId, (scope) => scope.drafts, draftRecords)); },
  async getApprovals(caseId?: string) { const data = scopedOr(caseId, (scope) => scope.approvals, seededApprovals).map((item) => { const decision = getDecision(item.id); return { ...item, ...decision, decisionReason: decision.reason }; }); return wrap(data); },
  async getActions(caseId?: string) { const data = scopedOr(caseId, (scope) => scope.actions, seededActions).map((item) => ({ ...item })); for (const item of data) { const approval = [...seededApprovals, ...Array.from(scopes.values()).flatMap((scope) => scope.approvals)].find((entry) => entry.caseId === item.caseId && entry.id.replace(/^approval-/, "action-") === item.id); if (approval && getDecision(approval.id).status === "rejected") item.state = "REJECTED" as ActionRecord["state"]; } return wrap(data); },
  async getResponses(caseId?: string) { return wrap(scopedOr(caseId, (scope) => scope.responses, responseThreads)); },
  async decideApproval(id: string, decision: { status: "approved" | "rejected"; reviewer: string; reason?: string }) { const next = { ...decision, decidedAt: new Date().toISOString() }; decisions.set(id, next); if (typeof window !== "undefined") window.localStorage.setItem(`vindicai:approval:${id}`, JSON.stringify(next)); Array.from(scopes.values()).forEach((scope: CaseScope) => { const approval = scope.approvals.find((item: ApprovalRecord) => item.id === id); if (approval && decision.status === "rejected") scope.actions = scope.actions.map((item: ActionRecord) => item.id === approval.id.replace(/^approval-/, "action-") ? { ...item, state: "REJECTED" as ActionRecord["state"] } : item); }); return wrap(next); },
  registerCaseScope,
};

export const mockIntelligenceService = legacyMockIntelligenceService;
