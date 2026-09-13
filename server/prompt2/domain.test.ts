import { describe, expect, it } from "vitest";
import {
  AUTHORITY_RANK,
  rankSource,
  type SourceMetadata,
} from "./domain/source";

const source = (
  type: SourceMetadata["type"],
  verificationStatus: SourceMetadata["verificationStatus"] = "VERIFIED"
): SourceMetadata => ({
  sourceUrl: "https://example.invalid",
  title: type,
  authority: "Test Authority",
  type,
  publisher: "Test Publisher",
  jurisdictionId: 1,
  publicationDate: new Date("2026-01-01"),
  effectiveDate: new Date("2026-01-01"),
  expirationDate: null,
  supersededAt: null,
  retrievedAt: new Date("2026-09-12"),
  contentHash: "sha256:test",
  version: 1,
  status: "ACTIVE",
  confidence: 0.9,
  verificationStatus,
});

describe("Prompt 2 source domain", () => {
  it("uses deterministic configurable authority ranking", () => {
    expect(AUTHORITY_RANK.government).toBeGreaterThan(
      AUTHORITY_RANK.secondary_research
    );
    expect(rankSource(source("government")).totalScore).toBeGreaterThan(
      rankSource(source("secondary_research")).totalScore
    );
  });

  it("gives verified sources a deterministic bonus without changing category authority", () => {
    expect(
      rankSource(source("regulator", "VERIFIED")).totalScore
    ).toBeGreaterThan(rankSource(source("regulator", "UNVERIFIED")).totalScore);
  });
});
