import { describe, expect, it } from "vitest";
import { AdvisoryOrchestrator } from "./prompt2/orchestrator";
import { InMemoryKnowledgeRetriever } from "./prompt2/retrieval";
import { assertNoAIExecutionAuthority } from "./prompt2/policy";
import type { AdvisoryModel, KnowledgeSource } from "./prompt2/types";

const sources: KnowledgeSource[] = [
  {
    id: 11,
    title: "Billing policy",
    authority: "Example Authority",
    reference: "REG-2026",
    url: "https://example.invalid/source",
    sourceType: "REGULATORY",
    freshness: "FRESH",
    excerpt: "Verify billing evidence before response",
    provenance: { table: "researchSources", recordId: 11 },
  },
];

const model: AdvisoryModel = {
  async recommend() {
    return {
      recommendation: "Review the billing evidence before drafting a response.",
      model: "test-advisory-model",
    };
  },
};

describe("Prompt 2 controlled orchestration", () => {
  it("returns provenance-backed advisory output", async () => {
    const result = await new AdvisoryOrchestrator(
      new InMemoryKnowledgeRetriever(sources),
      model
    ).recommend({ caseId: 1, kind: "strategy", question: "billing" });
    expect(result.advisoryOnly).toBe(true);
    expect(result.citations[0]?.provenance).toEqual({
      table: "researchSources",
      recordId: 11,
    });
    expect(result.recommendation).toContain("evidence");
  });

  it("rejects authority outside the AI boundary", () => {
    expect(() => assertNoAIExecutionAuthority("external_send")).toThrow(
      /cannot exercise authority/
    );
  });
});
