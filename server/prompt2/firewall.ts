import type { SourceMetadata } from "./domain/source";

export type FirewallDecision = "VALID" | "STALE" | "CONFLICTED";
export type FirewallResult = {
  decision: FirewallDecision;
  reasons: string[];
  proceedToAgent: boolean;
  requiresHumanReview: boolean;
};

export type FirewallInput = {
  source: SourceMetadata;
  now?: Date;
  conflictDetected?: boolean;
};

export function evaluateSource(input: FirewallInput): FirewallResult {
  const now = input.now ?? new Date();
  const reasons: string[] = [];
  const source = input.source;
  if (input.conflictDetected)
    return {
      decision: "CONFLICTED",
      reasons: ["conflict signal requires human review"],
      proceedToAgent: false,
      requiresHumanReview: true,
    };
  if (
    source.status === "ARCHIVED" ||
    source.status === "SUPERSEDED" ||
    source.status === "EXPIRED"
  )
    reasons.push(`source status is ${source.status}`);
  if (source.expirationDate && source.expirationDate <= now)
    reasons.push("source is past expiration date");
  if (source.supersededAt && source.supersededAt <= now)
    reasons.push("source has been superseded");
  if (source.effectiveDate && source.effectiveDate > now)
    reasons.push("source is not effective yet");
  if (source.verificationStatus !== "VERIFIED")
    reasons.push(`verification status is ${source.verificationStatus}`);
  if (!source.authority) reasons.push("source authority is missing");
  if (reasons.length > 0)
    return {
      decision: "STALE",
      reasons,
      proceedToAgent: false,
      requiresHumanReview: false,
    };
  return {
    decision: "VALID",
    reasons: [],
    proceedToAgent: true,
    requiresHumanReview: false,
  };
}
