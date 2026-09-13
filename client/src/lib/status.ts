import type { AIProcessingState, CaseStatus, ConfidenceLevel, RiskLevel } from "@/types/vindicai";

export const caseStatusMeta: Record<CaseStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border-slate-300 bg-slate-50 text-slate-700" },
  active: { label: "Active", className: "border-blue-200 bg-blue-50 text-blue-800" },
  "pending-approval": { label: "Pending approval", className: "border-amber-200 bg-amber-50 text-amber-900" },
  verified: { label: "Verified", className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  resolved: { label: "Resolved", className: "border-teal-200 bg-teal-50 text-teal-800" },
  blocked: { label: "Blocked", className: "border-rose-200 bg-rose-50 text-rose-800" },
};

export const riskMeta: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low risk", className: "bg-emerald-50 text-emerald-800" },
  medium: { label: "Medium risk", className: "bg-amber-50 text-amber-900" },
  high: { label: "High risk", className: "bg-orange-50 text-orange-900" },
  critical: { label: "Critical risk", className: "bg-rose-50 text-rose-900" },
};

export const confidenceMeta: Record<ConfidenceLevel, { label: string; className: string }> = {
  low: { label: "Low confidence", className: "text-rose-800" },
  medium: { label: "Moderate confidence", className: "text-amber-900" },
  high: { label: "High confidence", className: "text-emerald-800" },
};

export const aiStateMeta: Record<AIProcessingState, { label: string; detail: string }> = {
  idle: { label: "Standing by", detail: "Ready for a controlled analysis" },
  analyzing: { label: "Analyzing evidence", detail: "AI is mapping claims to source material" },
  researching: { label: "Researching policy", detail: "AI is checking the relevant rule set" },
  ready: { label: "Ready for review", detail: "Analysis is complete; human approval remains required" },
  "needs-review": { label: "Needs human review", detail: "A decision or missing source requires your attention" },
};
