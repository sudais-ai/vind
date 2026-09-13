export type RecommendationKind =
  | "classification"
  | "fact_extraction"
  | "research_question"
  | "strategy"
  | "draft_response"
  | "risk_assessment";

export type KnowledgeSource = {
  id: number;
  title: string;
  authority: string | null;
  reference: string | null;
  url: string | null;
  sourceType: string;
  freshness: string;
  excerpt: string;
  provenance: {
    table: "researchSources" | "policyClauses" | "evidence";
    recordId: number;
  };
};

export type RetrievalRequest = {
  caseId: number;
  query: string;
  limit?: number;
};
export type AdvisoryRequest = {
  caseId: number;
  kind: RecommendationKind;
  question: string;
};
export type AdvisoryResult = {
  kind: RecommendationKind;
  recommendation: string;
  citations: KnowledgeSource[];
  model: string;
  advisoryOnly: true;
};

export interface KnowledgeRetriever {
  retrieve(request: RetrievalRequest): Promise<KnowledgeSource[]>;
}

export interface AdvisoryModel {
  recommend(
    input: AdvisoryRequest,
    sources: KnowledgeSource[]
  ): Promise<{ recommendation: string; model: string }>;
}
