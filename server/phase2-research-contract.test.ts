import { describe, expect, it } from "vitest";
import {
  agentRunStatusValues,
  artifactTypeValues,
  draftStatusValues,
  embeddingSourceTypeValues,
  jurisdictionTypeValues,
  policyVersionStatusValues,
  researchRunStatusValues,
} from "../drizzle/schema";

describe("Phase 2 Research and AI foundation contract", () => {
  it("supports lifecycle states for deferred ResearchRun and AgentRun records", () => {
    expect(researchRunStatusValues).toEqual(["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"]);
    expect(agentRunStatusValues).toEqual(["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"]);
  });

  it("supports historical policy versions and multiple jurisdiction types", () => {
    expect(policyVersionStatusValues).toEqual(["DRAFT", "ACTIVE", "EXPIRED", "RETIRED"]);
    expect(jurisdictionTypeValues).toEqual(["COUNTRY", "STATE_PROVINCE", "REGION", "REGULATORY_AUTHORITY", "OTHER"]);
  });

  it("keeps generic artifacts, immutable draft history, and provider-neutral embeddings extensible", () => {
    expect(artifactTypeValues).toContain("RESEARCH");
    expect(artifactTypeValues).toContain("VERIFICATION");
    expect(draftStatusValues).toContain("IN_REVIEW");
    expect(embeddingSourceTypeValues).toContain("POLICY_CLAUSE");
    expect(embeddingSourceTypeValues).toContain("ARTIFACT");
  });
});
