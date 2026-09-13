import type { KnowledgeSource } from "../types";
import type { RankedSource } from "./source";

export interface KnowledgeService {
  retrieve(
    caseId: number,
    query: string,
    limit?: number
  ): Promise<KnowledgeSource[]>;
  rank(sources: RankedSource[]): RankedSource[];
  attachProvenance<T extends object>(
    record: T,
    source: KnowledgeSource
  ): T & { provenance: KnowledgeSource["provenance"] };
}
