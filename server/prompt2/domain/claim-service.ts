export interface ClaimService {
  propose(
    caseId: number,
    statement: string,
    confidence: number,
    createdBy: number
  ): Promise<{ claimId: number; status: "PROPOSED" }>;
  verify(
    claimId: number,
    status: "SUPPORTED" | "CONTRADICTED" | "REJECTED"
  ): Promise<void>;
}
