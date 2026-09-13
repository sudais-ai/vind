export type SourceCategory =
  | "government"
  | "regulator"
  | "court"
  | "legislation"
  | "official_company_policy"
  | "contract_policy"
  | "internal_evidence"
  | "secondary_research";
export type VerificationStatus =
  | "UNVERIFIED"
  | "IN_REVIEW"
  | "VERIFIED"
  | "REJECTED";
export type SourceStatus = "ACTIVE" | "ARCHIVED" | "SUPERSEDED" | "EXPIRED";

export type SourceMetadata = {
  sourceUrl: string | null;
  title: string;
  authority: string | null;
  type: SourceCategory;
  publisher: string | null;
  jurisdictionId: number | null;
  publicationDate: Date | null;
  effectiveDate: Date | null;
  expirationDate: Date | null;
  supersededAt: Date | null;
  retrievedAt: Date;
  contentHash: string | null;
  version: number;
  status: SourceStatus;
  confidence: number;
  verificationStatus: VerificationStatus;
};

export type RankedSource<T = SourceMetadata> = {
  source: T;
  authorityScore: number;
  freshnessScore: number;
  totalScore: number;
};

export const AUTHORITY_RANK: Readonly<Record<SourceCategory, number>> = {
  government: 100,
  regulator: 95,
  court: 95,
  legislation: 100,
  official_company_policy: 80,
  contract_policy: 75,
  internal_evidence: 70,
  secondary_research: 40,
};

export function rankSource(
  source: SourceMetadata,
  now = new Date()
): RankedSource {
  const ageDays = Math.max(
    0,
    (now.getTime() - source.retrievedAt.getTime()) / 86_400_000
  );
  const freshnessScore = Math.max(0, 100 - Math.min(ageDays, 100));
  const verificationBonus =
    source.verificationStatus === "VERIFIED"
      ? 10
      : source.verificationStatus === "IN_REVIEW"
        ? 3
        : 0;
  const authorityScore = AUTHORITY_RANK[source.type] + verificationBonus;
  return {
    source,
    authorityScore,
    freshnessScore,
    totalScore: authorityScore * 0.7 + freshnessScore * 0.3,
  };
}
