export type CaseStatus = "draft" | "active" | "pending-approval" | "verified" | "resolved" | "blocked";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type ConfidenceLevel = "low" | "medium" | "high";
export type AIProcessingState = "idle" | "analyzing" | "researching" | "ready" | "needs-review";
export type NavigationSection = "overview" | "cases" | "evidence" | "research" | "approvals" | "actions" | "settings";
export type CaseRoomTab = "info" | "timeline" | "evidence" | "research" | "intelligence" | "strategy" | "drafts" | "actions";
export type CaseCategory = "billing" | "contract" | "refund" | "service" | "compliance";
export type CaseFilterStatus = CaseStatus | "all";
export type CaseFilterRisk = RiskLevel | "all";
export type CaseFilterDate = "all" | "week" | "month";
export type ViewMode = "table" | "cards";
export type FormStep = 0 | 1 | 2 | 3 | 4 | 5;

export interface CaseSummary { id: string; title: string; counterparty: string; status: CaseStatus; risk: RiskLevel; confidence: number; updatedAt: string; evidenceCount: number; category?: CaseCategory; description?: string; desiredOutcome?: string; amount?: string; owner?: string; openedAt?: string; }
export interface CaseDetail extends CaseSummary { owner: string; openedAt: string; lastActivity: string; verifiedFacts: string[]; openQuestions: string[]; aiRecommendation: string; milestones: { label: string; detail: string; state: "verified" | "review" | "open" }[]; claims: { label: string; detail: string; confidence: number; state: "verified" | "unverified" }[]; nextActions: { label: string; detail: string; owner: string; state: "ready" | "approval" | "blocked" }[]; drafts: { title: string; detail: string; state: "ready" | "review" | "archived" }[]; }
export interface DashboardMetric { label: string; value: string; detail: string; trend?: string; }
export interface ActivityItem { id: string; title: string; detail: string; timestamp: string; state: "verified" | "review" | "analysis"; caseId?: string; }
export interface ApprovalItem { id: string; title: string; caseId: string; counterparty: string; requestedBy: string; due: string; impact: "low" | "medium" | "high"; }
export interface NavigationItem { id: NavigationSection; label: string; description: string; }
export interface ServiceResult<T> { data: T; source: "mock" | "api"; generatedAt: string; }
export interface CreateCaseInput { title: string; company: string; category: CaseCategory; description: string; desiredOutcome: string; evidence: { name: string; size: number; type: string }[]; }
export interface CaseService { listCases(): Promise<ServiceResult<CaseSummary[]>>; getCase(id: string): Promise<ServiceResult<CaseDetail | undefined>>; createCase(input: CreateCaseInput): Promise<ServiceResult<CaseSummary>>; }
export interface DashboardData { metrics: DashboardMetric[]; approvals: ApprovalItem[]; activity: ActivityItem[]; }
export interface StatusOption<T extends string> { value: T; label: string; description: string; }
export const caseCategoryLabels: Record<CaseCategory, string> = { billing: "SaaS billing", contract: "B2B contract", refund: "Complex refund", service: "Service level", compliance: "Compliance" };
export const caseStatusLabels: Record<CaseStatus, string> = { draft: "Draft", active: "Active", "pending-approval": "Pending approval", verified: "Verified", resolved: "Resolved", blocked: "Blocked" };
export const riskLabels: Record<RiskLevel, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };
export const createEmptyCase = (): CreateCaseInput => ({ title: "", company: "", category: "contract", description: "", desiredOutcome: "", evidence: [] });
export const statusOptions: StatusOption<CaseStatus>[] = Object.entries(caseStatusLabels).map(([value, label]) => ({ value: value as CaseStatus, label, description: label }));
export const riskOptions: StatusOption<RiskLevel>[] = Object.entries(riskLabels).map(([value, label]) => ({ value: value as RiskLevel, label, description: label }));
export type CaseFilterValue = { status: CaseFilterStatus; risk: CaseFilterRisk; date: CaseFilterDate };
export type CaseAction = CaseDetail["nextActions"][number];
export type CaseDraft = CaseDetail["drafts"][number];
export type CaseClaim = CaseDetail["claims"][number];
export type CaseMilestone = CaseDetail["milestones"][number];
export type EvidenceFile = CreateCaseInput["evidence"][number];
export type FormState = "idle" | "saving" | "complete" | "error";
export type UserProfile = { name: string; initials: string; role: string; email: string };
export type WorkspaceName = "North America operations" | "EMEA operations";
export type ResearchState = "deferred" | "ready";
export type FeatureState = "available" | "deferred";
export type CaseRoomTabMeta = { value: CaseRoomTab; label: string; deferred?: boolean };
