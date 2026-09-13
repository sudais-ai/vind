import { describe, expect, it } from "vitest";
import { deletionStatusValues, embeddingSourceTypeValues, embeddingStatusValues } from "../drizzle/schema";

describe("Phase 2 retention and vector foundation contract", () => {
  it("models retention states without implying automatic deletion", () => {
    expect(deletionStatusValues).toEqual(["ACTIVE", "SCHEDULED", "LEGAL_HOLD", "DELETED"]);
    expect(deletionStatusValues).toContain("LEGAL_HOLD");
  });

  it("keeps vector metadata provider-neutral and source-addressable", () => {
    expect(embeddingSourceTypeValues).toContain("EVIDENCE");
    expect(embeddingSourceTypeValues).toContain("RESEARCH_SOURCE");
    expect(embeddingStatusValues).toEqual(["PENDING", "READY", "FAILED", "DELETED"]);
  });
});
