import type { SourceMetadata, RankedSource, SourceCategory } from "./source";

export interface SourceService {
  register(metadata: SourceMetadata): Promise<SourceMetadata>;
  getById(sourceId: number): Promise<SourceMetadata | null>;
  listForCase(
    caseId: number,
    categories?: SourceCategory[]
  ): Promise<RankedSource[]>;
  verify(
    sourceId: number,
    status: "IN_REVIEW" | "VERIFIED" | "REJECTED"
  ): Promise<SourceMetadata>;
}
