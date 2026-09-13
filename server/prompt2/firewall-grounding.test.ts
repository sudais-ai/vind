import { describe, expect, it } from "vitest";
import { evaluateSource } from "./firewall";
import { assertGroundedClaim, type GroundedClaim } from "./grounding";
import type { SourceMetadata } from "./domain/source";

const now = new Date("2026-09-12T00:00:00Z");
const stale: SourceMetadata = {
  sourceUrl: "https://example.invalid/old",
  title: "Expired billing rule",
  authority: "Example Regulator",
  type: "regulator",
  publisher: "Example Regulator",
  jurisdictionId: 1,
  publicationDate: new Date("2024-01-01"),
  effectiveDate: new Date("2024-02-01"),
  expirationDate: new Date("2026-01-01"),
  supersededAt: null,
  retrievedAt: new Date("2026-09-11"),
  contentHash: "sha256:old",
  version: 1,
  status: "ACTIVE",
  confidence: 80,
  verificationStatus: "VERIFIED",
};
const current: SourceMetadata = {
  ...stale,
  title: "Current billing rule",
  sourceUrl: "https://example.invalid/current",
  expirationDate: null,
  retrievedAt: now,
  contentHash: "sha256:current",
};

describe("Prompt 2 Staleness Firewall and grounding", () => {
  it("flags an expired sample source as STALE and blocks agent progression", () => {
    const result = evaluateSource({ source: stale, now });
    expect(result.decision).toBe("STALE");
    expect(result.proceedToAgent).toBe(false);
  });

  it("routes an explicit conflict signal to human review", () => {
    const result = evaluateSource({
      source: current,
      now,
      conflictDetected: true,
    });
    expect(result.decision).toBe("CONFLICTED");
    expect(result.requiresHumanReview).toBe(true);
  });

  it("accepts a claim only when its citation points to a real source and matching snapshot metadata", () => {
    const claim: GroundedClaim = {
      claimId: 7,
      statement: "The current billing rule requires evidence.",
      statementType: "LAW",
      confidence: 90,
      citations: [
        {
          citationId: 9,
          sourceId: 2,
          sourceRetrievedAt: now,
          authority: "Example Regulator",
          confidence: 90,
          excerpt: "Evidence is required before response.",
          locator: "section 4.2",
        },
      ],
    };
    expect(() =>
      assertGroundedClaim(claim, new Map([[2, current]]))
    ).not.toThrow();
    expect(() => assertGroundedClaim(claim, new Map())).toThrow(
      /missing source/
    );
  });
});
