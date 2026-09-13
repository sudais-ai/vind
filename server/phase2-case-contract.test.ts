import { describe, expect, it } from "vitest";
import { caseStatusValues, evidenceTypeValues, permissionDomainValues } from "../drizzle/schema";

describe("Phase 2 Case and Evidence contract", () => {
  it("preserves the exact required Case status sequence", () => {
    expect(caseStatusValues).toEqual([
      "NEW",
      "INGESTING",
      "FACTS_EXTRACTED",
      "EVIDENCE_VERIFIED",
      "RESEARCHING",
      "STRATEGY_READY",
      "DRAFT_READY",
      "AWAITING_APPROVAL",
      "SENT",
      "WAITING_RESPONSE",
      "RESPONSE_RECEIVED",
      "REANALYZING",
      "ESCALATION_READY",
      "RESOLVED",
      "CLOSED",
    ]);
  });

  it("supports every requested Evidence type without binary storage in SQL", () => {
    expect(evidenceTypeValues).toEqual(["EMAIL", "PDF", "DOCUMENT", "IMAGE", "SCREENSHOT", "ATTACHMENT", "FORM", "OTHER"]);
    expect(evidenceTypeValues).not.toContain("BINARY");
  });

  it("keeps research and policy domains available for later phases without creating their models", () => {
    expect(permissionDomainValues).toContain("RESEARCH");
    expect(permissionDomainValues).toContain("POLICIES");
  });
});
