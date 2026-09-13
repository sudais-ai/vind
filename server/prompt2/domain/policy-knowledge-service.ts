import type { SourceMetadata } from "./source";

export interface PolicyKnowledgeService {
  listActive(
    jurisdictionId: number | null,
    at?: Date
  ): Promise<SourceMetadata[]>;
  getVersion(policyId: number, version: number): Promise<SourceMetadata | null>;
}
