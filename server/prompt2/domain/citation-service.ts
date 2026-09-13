export interface CitationService {
  createClaimCitation(
    claimId: number,
    evidenceId: number,
    factId: number | null,
    excerpt: string,
    locator?: string
  ): Promise<{ citationId: number }>;
  listForClaim(claimId: number): Promise<
    Array<{
      citationId: number;
      excerpt: string | null;
      locator: string | null;
    }>
  >;
}
