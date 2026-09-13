import type { SourceMetadata } from "./domain/source";

export type StatementClassification =
  | "FACT"
  | "LAW"
  | "POLICY"
  | "SOURCE_STATEMENT"
  | "INFERENCE"
  | "RECOMMENDATION"
  | "UNKNOWN";
export type GroundedClaim = {
  claimId: number;
  statement: string;
  statementType: StatementClassification;
  confidence: number;
  citations: GroundingCitation[];
};
export type GroundingCitation = {
  citationId: number;
  sourceId: number;
  sourceRetrievedAt: Date;
  authority: string;
  confidence: number;
  excerpt: string;
  locator: string | null;
};

export function assertGroundedClaim(
  claim: GroundedClaim,
  sources: Map<number, SourceMetadata>
): void {
  if (claim.citations.length === 0)
    throw new Error("Every claim must have at least one citation");
  for (const citation of claim.citations) {
    const source = sources.get(citation.sourceId);
    if (!source)
      throw new Error(
        `Citation ${citation.citationId} references a missing source`
      );
    if (!citation.excerpt.trim())
      throw new Error(`Citation ${citation.citationId} has no excerpt`);
    if (citation.sourceRetrievedAt.getTime() !== source.retrievedAt.getTime())
      throw new Error(
        `Citation ${citation.citationId} source timestamp does not match the source snapshot`
      );
    if (citation.authority !== source.authority)
      throw new Error(
        `Citation ${citation.citationId} authority does not match the source`
      );
  }
}

export function classifyStatement(
  statementType: StatementClassification
): StatementClassification {
  return statementType;
}
