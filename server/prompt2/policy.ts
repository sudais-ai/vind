import type { RecommendationKind } from "./types";

const allowed = new Set<RecommendationKind>([
  "classification",
  "fact_extraction",
  "research_question",
  "strategy",
  "draft_response",
  "risk_assessment",
]);
const forbidden = new Set([
  "permission_escalation",
  "cross_tenant_access",
  "irreversible_deletion",
  "external_send",
  "approval_bypass",
  "policy_authority_change",
  "security_control_disable",
  "audit_mutation",
]);

export function assertAIRecommendationType(
  kind: string
): asserts kind is RecommendationKind {
  if (!allowed.has(kind as RecommendationKind))
    throw new Error(
      "AI action is outside the advisory recommendation boundary"
    );
}

export function assertNoAIExecutionAuthority(authority: string): never {
  if (forbidden.has(authority))
    throw new Error(`AI cannot exercise authority: ${authority}`);
  throw new Error("Unknown AI authority request");
}
