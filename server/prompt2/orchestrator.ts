import { invokeLLM } from "../_core/llm";
import { assertAIRecommendationType } from "./policy";
import type {
  AdvisoryModel,
  AdvisoryRequest,
  AdvisoryResult,
  KnowledgeRetriever,
} from "./types";

const responseSchema = {
  type: "json_schema" as const,
  json_schema: {
    name: "vindicai_advisory_recommendation",
    strict: true,
    schema: {
      type: "object",
      properties: { recommendation: { type: "string" } },
      required: ["recommendation"],
      additionalProperties: false,
    },
  },
};

export class BuiltInAdvisoryModel implements AdvisoryModel {
  async recommend(
    input: AdvisoryRequest,
    sources: { title: string; excerpt: string; reference: string | null }[]
  ) {
    const response = await invokeLLM({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content:
            "You provide advisory dispute-analysis recommendations only. Never authorize, send, delete, escalate permissions, bypass approval, or modify audit records. Use only the supplied sources and say when evidence is insufficient. Return JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify({
            kind: input.kind,
            question: input.question,
            sources,
          }),
        },
      ],
      response_format: responseSchema,
      reasoning: { effort: "low" },
      maxTokens: 1200,
    });
    const content = response.choices[0]?.message.content;
    const parsed =
      typeof content === "string"
        ? (JSON.parse(content) as { recommendation: string })
        : null;
    if (!parsed?.recommendation)
      throw new Error("Advisory model returned no recommendation");
    return { recommendation: parsed.recommendation, model: response.model };
  }
}

export class AdvisoryOrchestrator {
  constructor(
    private readonly retriever: KnowledgeRetriever,
    private readonly model: AdvisoryModel
  ) {}

  async recommend(input: AdvisoryRequest): Promise<AdvisoryResult> {
    assertAIRecommendationType(input.kind);
    const citations = await this.retriever.retrieve({
      caseId: input.caseId,
      query: input.question,
      limit: 8,
    });
    const result = await this.model.recommend(input, citations);
    return {
      kind: input.kind,
      recommendation: result.recommendation,
      citations,
      model: result.model,
      advisoryOnly: true,
    };
  }
}
