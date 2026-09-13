import superjson from "superjson";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../server/routers";
import type { CaseDetail, CaseService, CaseStatus, CaseSummary, CreateCaseInput, RiskLevel, ServiceResult } from "@/types/vindicai";

const client = createTRPCProxyClient<AppRouter>({
  links: [httpBatchLink({
    url: "/api/trpc",
    transformer: superjson,
    fetch(url, options) {
      return fetch(url, { ...options, credentials: "include" });
    },
  })],
});

const result = <T,>(data: T): ServiceResult<T> => ({ data, source: "api", generatedAt: new Date().toISOString() });
const statusMap: Record<string, CaseStatus> = { NEW: "draft", INGESTING: "active", FACTS_EXTRACTED: "active", EVIDENCE_VERIFIED: "verified", RESEARCHING: "active", STRATEGY_READY: "active", DRAFT_READY: "active", AWAITING_APPROVAL: "pending-approval", SENT: "active", WAITING_RESPONSE: "active", RESPONSE_RECEIVED: "active", REANALYZING: "active", ESCALATION_READY: "blocked", RESOLVED: "resolved", CLOSED: "resolved" };
const riskMap: Record<string, RiskLevel> = { LOW: "low", MEDIUM: "medium", HIGH: "high", CRITICAL: "critical" };
const categoryMap: Record<string, CaseSummary["category"]> = { BILLING: "billing", CONTRACT: "contract", REFUND: "refund", SERVICE: "service", COMPLIANCE: "compliance", OTHER: "contract" };
const formatDate = (value: Date | null | undefined) => value ? new Date(value).toLocaleDateString() : "—";

async function scope() {
  return client.tenant.defaultScope.query();
}

function toSummary(row: { id: number; title: string; company: string | null; status: string; risk: string; updatedAt: Date; createdAt: Date; category: string; description: string | null; desiredOutcome: string | null }, evidenceCount: number): CaseSummary {
  return {
    id: `case-${row.id}`,
    title: row.title,
    counterparty: row.company ?? "Unknown counterparty",
    status: statusMap[row.status] ?? "active",
    risk: riskMap[row.risk] ?? "medium",
    confidence: evidenceCount ? 80 : 0,
    updatedAt: formatDate(row.updatedAt),
    evidenceCount,
    category: categoryMap[row.category] ?? "contract",
    description: row.description ?? undefined,
    desiredOutcome: row.desiredOutcome ?? undefined,
    owner: "Workspace owner",
    openedAt: formatDate(row.createdAt),
  };
}

export const databaseCaseService: CaseService = {
  async listCases() {
    const activeScope = await scope();
    const graph = await client.tenant.caseGraph.query(activeScope);
    return result(graph.cases.map((row) => toSummary(row, graph.evidence.filter((item) => item.caseId === row.id).length)));
  },
  async getCase(id) {
    const numericId = Number(id.replace(/^case-/, ""));
    if (!Number.isInteger(numericId)) return result<CaseDetail | undefined>(undefined);
    const activeScope = await scope();
    const graph = await client.tenant.caseGraph.query(activeScope);
    const row = graph.cases.find((item) => item.id === numericId);
    if (!row) return result<CaseDetail | undefined>(undefined);
    const summary = toSummary(row, graph.evidence.filter((item) => item.caseId === row.id).length);
    const caseClaims = graph.claims.filter((item) => item.caseId === row.id);
    const detail: CaseDetail = {
      ...summary,
      owner: "Workspace owner",
      openedAt: formatDate(row.createdAt),
      lastActivity: formatDate(row.updatedAt),
      verifiedFacts: [],
      openQuestions: [],
      aiRecommendation: "Review the tenant-scoped evidence and approval records before taking action.",
      milestones: [{ label: "Case loaded", detail: "Records loaded through the protected data service.", state: "verified" }],
      claims: caseClaims.map((claim) => ({ label: claim.statement, detail: "Tenant-scoped claim", confidence: claim.confidence ?? 0, state: claim.status === "SUPPORTED" ? "verified" : "unverified" })),
      nextActions: graph.actions.filter((item) => item.caseId === row.id).map((action) => ({ label: action.type, detail: "Protected action record", owner: "Workspace owner", state: action.status === "APPROVED" ? "ready" : "approval" })),
      drafts: [],
    };
    return result(detail);
  },
  async createCase(input) {
    const activeScope = await scope();
    const created = await client.tenant.createCase.mutate({
      ...activeScope,
      title: input.title,
      company: input.company,
      category: input.category.toUpperCase() as "BILLING" | "CONTRACT" | "REFUND" | "SERVICE" | "COMPLIANCE",
      description: input.description,
      desiredOutcome: input.desiredOutcome,
    });
    const summary: CaseSummary = { id: `case-${created.id}`, title: input.title, counterparty: input.company, status: "draft", risk: "medium", confidence: 0, updatedAt: "Just now", evidenceCount: input.evidence.length, category: input.category, description: input.description, desiredOutcome: input.desiredOutcome, owner: "Workspace owner", openedAt: "Today" };
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("vindicai:case-created", { detail: { id: summary.id } }));
    return result(summary);
  },
};
