import type {
  CaseDetail,
  CaseService,
  CaseSummary,
  CreateCaseInput,
  ServiceResult,
} from "@/types/vindicai";

const result = <T>(data: T): ServiceResult<T> => ({
  data,
  source: "api",
  generatedAt: new Date().toISOString(),
});
const baseUrl =
  (import.meta.env.VITE_VINDICAI_API_URL as string | undefined) ?? "/api/v1";
const enabled =
  (import.meta.env.VITE_VINDICAI_API_MODE as string | undefined) === "fastapi";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok)
    throw new Error(`VindicAI API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

const toSummary = (item: {
  id: number;
  title: string;
  metadata?: Record<string, unknown>;
  state: string;
}): CaseSummary => ({
  id: `case-${item.id}`,
  title: item.title,
  counterparty: String(item.metadata?.company ?? "Unknown counterparty"),
  status:
    item.state === "CLOSED" || item.state === "RESOLVED"
      ? "resolved"
      : item.state === "AWAITING_APPROVAL"
        ? "pending-approval"
        : "active",
  risk: String(
    item.metadata?.risk ?? "medium"
  ).toLowerCase() as CaseSummary["risk"],
  confidence: 0,
  updatedAt: "Just now",
  evidenceCount: 0,
  description: String(item.metadata?.description ?? ""),
  desiredOutcome: String(item.metadata?.desired_outcome ?? ""),
});

export const fastApiCaseService: CaseService = {
  async listCases() {
    if (!enabled) return result([]);
    const page = await request<{
      items: Array<{
        id: number;
        title: string;
        metadata?: Record<string, unknown>;
        state: string;
      }>;
    }>("/cases?limit=100");
    return result(page.items.map(toSummary));
  },
  async getCase(id) {
    if (!enabled) return result<CaseDetail | undefined>(undefined);
    const item = await request<{
      id: number;
      title: string;
      metadata?: Record<string, unknown>;
      state: string;
    }>(`/cases/${encodeURIComponent(id.replace(/^case-/, ""))}`);
    return result({
      ...toSummary(item),
      owner: "Workspace owner",
      openedAt: "Just now",
      lastActivity: "Just now",
      verifiedFacts: [],
      openQuestions: [],
      aiRecommendation: "AI recommendations remain advisory.",
      milestones: [],
      claims: [],
      nextActions: [],
      drafts: [],
    });
  },
  async createCase(input) {
    if (!enabled)
      return result<CaseSummary>({
        id: "case-unavailable",
        title: input.title,
        counterparty: input.company,
        status: "draft",
        risk: "medium",
        confidence: 0,
        updatedAt: "Just now",
        evidenceCount: input.evidence.length,
        category: input.category,
        description: input.description,
        desiredOutcome: input.desiredOutcome,
      });
    const item = await request<{
      id: number;
      title: string;
      metadata?: Record<string, unknown>;
      state: string;
    }>("/cases", {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        company: input.company,
        category: input.category.toUpperCase(),
        description: input.description,
        desired_outcome: input.desiredOutcome,
      }),
    });
    return result(toSummary(item));
  },
};
