import type { KnowledgeSource } from "../types";

export interface ResearchService {
  initiate(
    caseId: number,
    requesterId: number,
    query: string
  ): Promise<{ researchRunId: number; status: "PENDING" }>;
  discover(caseId: number, query: string): Promise<KnowledgeSource[]>;
}
