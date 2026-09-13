export type EvidenceType = "Email" | "PDF" | "Image";
export type EvidenceStatus = "verified" | "review" | "conflicted";
export type IntelligenceKind = "Fact" | "Policy" | "Law / Rule" | "AI Inference";
export type ResearchStatus = "VALID" | "STALE" | "CONFLICTED" | "REQUIRES REVIEW";

export interface EvidenceRecord { id: string; title: string; source: string; timestamp: string; provenance: string; status: EvidenceStatus; type: EvidenceType; size: string; preview: string; factIds: string[]; claimIds: string[]; }
export interface EvidenceFact { id: string; text: string; evidenceIds: string[]; claimIds: string[]; verified: boolean; }
export interface EvidenceClaim { id: string; text: string; factIds: string[]; confidence: number; state: "supported" | "unresolved"; }
export interface TimelineEvent { id: string; date: string; time: string; title: string; detail: string; state: "complete" | "review" | "current"; source?: string; }
export interface ResearchResult { id: string; title: string; kind: IntelligenceKind; source: string; authority: string; effectiveDate: string; confidence: number; status: ResearchStatus; citations: string[]; detail: string; }
export interface PolicyVersion { id: string; policy: string; version: string; effectiveDate: string; owner: string; summary: string; changedSections: { section: string; before: string; after: string; impact: "material" | "clarifying" | "administrative" }[]; affectedCases: string[]; }
export interface IntelligencePanel { id: string; label: string; eyebrow: string; tone: "sage" | "amber" | "red" | "blue" | "neutral"; items: string[]; detail?: string; }

export const evidenceRecords: EvidenceRecord[] = [
  { id: "ev-1048-1", title: "August statement · NW-1048", source: "Northwind billing portal", timestamp: "Sep 02, 2026 · 09:18", provenance: "Uploaded by Alex Morgan · billing export", status: "verified", type: "PDF", size: "2.4 MB", preview: "INVOICE NW-1048\nService period: Aug 01–31\nEnterprise platform fee: $9,210.00", factIds: ["fact-1"], claimIds: ["claim-1"] },
  { id: "ev-1048-2", title: "September statement · NW-1048", source: "Northwind billing portal", timestamp: "Sep 08, 2026 · 14:02", provenance: "Uploaded by Alex Morgan · billing export", status: "verified", type: "PDF", size: "2.1 MB", preview: "INVOICE NW-1048\nService period: Aug 01–31\nEnterprise platform fee: $9,210.00", factIds: ["fact-1"], claimIds: ["claim-1"] },
  { id: "ev-1048-3", title: "Billing migration note", source: "Finance operations inbox", timestamp: "Sep 09, 2026 · 11:44", provenance: "Forwarded email · sender identity verified", status: "review", type: "Email", size: "48 KB", preview: "We may have seen duplicate line items during the August migration.\nPlease confirm against the ledger before issuing a credit.", factIds: ["fact-2"], claimIds: ["claim-2"] },
  { id: "ev-1048-4", title: "Statement comparison capture", source: "Evidence desk", timestamp: "Sep 10, 2026 · 16:31", provenance: "Generated comparison image · source-linked", status: "verified", type: "Image", size: "812 KB", preview: "[AUG] $9,210.00  ─────────\n[SEP] $9,210.00  ─────────\nMATCH: service period + amount", factIds: ["fact-1"], claimIds: ["claim-1"] },
  { id: "ev-1041-1", title: "Renewal order form", source: "Asteria contract vault", timestamp: "Aug 27, 2026 · 10:03", provenance: "Imported from contract vault · signed", status: "verified", type: "PDF", size: "1.8 MB", preview: "RENEWAL CAP\nAnnual uplift not to exceed 4%\nSignature: procurement@asteria.cloud", factIds: ["fact-3"], claimIds: ["claim-3"] },
  { id: "ev-1041-2", title: "Renewal notice email", source: "Legal operations inbox", timestamp: "Sep 01, 2026 · 08:52", provenance: "Email thread · sender verified", status: "conflicted", type: "Email", size: "72 KB", preview: "The renewal will reflect a 12% uplift effective October 1.\nPlease confirm acceptance by September 15.", factIds: ["fact-4"], claimIds: ["claim-3"] },
];

export const evidenceFacts: EvidenceFact[] = [
  { id: "fact-1", text: "Two statements repeat the same service period and $9,210 fee.", evidenceIds: ["ev-1048-1", "ev-1048-2", "ev-1048-4"], claimIds: ["claim-1"], verified: true },
  { id: "fact-2", text: "A billing migration is mentioned but not supported by a ledger record.", evidenceIds: ["ev-1048-3"], claimIds: ["claim-2"], verified: false },
  { id: "fact-3", text: "The signed order form caps annual renewal uplift at 4%.", evidenceIds: ["ev-1041-1"], claimIds: ["claim-3"], verified: true },
  { id: "fact-4", text: "The renewal notice requests a 12% uplift.", evidenceIds: ["ev-1041-2"], claimIds: ["claim-3"], verified: true },
];

export const evidenceClaims: EvidenceClaim[] = [
  { id: "claim-1", text: "Northwind was charged twice for one service period.", factIds: ["fact-1"], confidence: 94, state: "supported" },
  { id: "claim-2", text: "A migration created the duplicate charge.", factIds: ["fact-2"], confidence: 41, state: "unresolved" },
  { id: "claim-3", text: "Asteria's renewal notice conflicts with the controlling order form.", factIds: ["fact-3", "fact-4"], confidence: 90, state: "supported" },
];

export const timelineEvents: TimelineEvent[] = [
  { id: "tl-1", date: "Sep 02, 2026", time: "09:18", title: "Evidence uploaded", detail: "August statement added from the Northwind billing portal.", state: "complete", source: "NW-1048 PDF" },
  { id: "tl-2", date: "Sep 03, 2026", time: "12:06", title: "Facts extracted", detail: "Service period and amount matched across the source record.", state: "complete", source: "Evidence desk" },
  { id: "tl-3", date: "Sep 04, 2026", time: "15:40", title: "Billing policy identified", detail: "Section 4.2 mapped as the relevant correction and credit policy.", state: "complete", source: "Billing terms v3" },
  { id: "tl-4", date: "Sep 09, 2026", time: "11:44", title: "Causal note added", detail: "Migration explanation surfaced but remains unverified.", state: "review", source: "Finance operations email" },
  { id: "tl-5", date: "Sep 10, 2026", time: "16:31", title: "AI strategy prepared", detail: "Correction request drafted with verified citations and an approval gate.", state: "current", source: "VindicAI analysis" },
];

export const researchResults: ResearchResult[] = [
  { id: "rs-1", title: "Billing correction and credit policy", kind: "Policy", source: "Enterprise Billing Terms v3.2", authority: "Finance Operations", effectiveDate: "Jul 01, 2026", confidence: 96, status: "VALID", citations: ["§4.2 Duplicate charges", "§7.1 Credit memo controls"], detail: "Requires source matching before issuing a credit memo and owner approval for exceptions." },
  { id: "rs-2", title: "Contract renewal cap", kind: "Policy", source: "Asteria Order Form · executed", authority: "Procurement + Legal", effectiveDate: "Jan 15, 2026", confidence: 91, status: "VALID", citations: ["Commercial terms · Renewal cap"], detail: "Annual renewal uplift is capped at 4% unless a signed amendment controls." },
  { id: "rs-3", title: "Refund exception authority", kind: "Policy", source: "Customer Terms v7.1", authority: "Customer Operations", effectiveDate: "Mar 20, 2026", confidence: 88, status: "STALE", citations: ["§7.1 Discretionary credits"], detail: "A newer draft was circulated, but the effective date of the replacement is not confirmed." },
  { id: "rs-4", title: "Notice and cure framework", kind: "Law / Rule", source: "Uniform Commercial Code reference", authority: "External authority", effectiveDate: "Jan 01, 2026", confidence: 63, status: "REQUIRES REVIEW", citations: ["UCC §2-609", "Commentary 4"], detail: "May inform the escalation posture, but jurisdiction and contract choice-of-law need review." },
  { id: "rs-5", title: "Causal explanation for duplicate charge", kind: "AI Inference", source: "Evidence graph · 14 sources", authority: "VindicAI analysis", effectiveDate: "Sep 10, 2026", confidence: 41, status: "CONFLICTED", citations: ["Finance operations email", "Statement comparison"], detail: "Migration is plausible but not established by a system ledger or migration log." },
];

export const policyVersions: PolicyVersion[] = [
  { id: "pol-1", policy: "Enterprise Billing Terms", version: "v3.2", effectiveDate: "Jul 01, 2026", owner: "Finance Operations", summary: "Adds a required ledger match before correction requests.", changedSections: [{ section: "§4.2 Duplicate charges", before: "Account owner may request a correction when duplicate billing is reported.", after: "Account owner may request a correction after two source records and a ledger match are attached.", impact: "material" }, { section: "§7.1 Credit memo controls", before: "Credits above $10,000 require finance review.", after: "Credits above $10,000 require finance review and an approval record.", impact: "clarifying" }], affectedCases: ["case-1048", "case-1029"] },
  { id: "pol-2", policy: "Customer Terms", version: "v7.1", effectiveDate: "Mar 20, 2026", owner: "Customer Operations", summary: "Clarifies discretionary refund authority for service outages.", changedSections: [{ section: "§7.1 Discretionary credits", before: "Service credits may be granted at the account team's discretion.", after: "Service credits may be granted by an owner when a verified outage overlaps the billing period.", impact: "material" }], affectedCases: ["case-1037"] },
];

export const intelligencePanels: IntelligencePanel[] = [
  { id: "verified", label: "Verified facts", eyebrow: "Source-backed", tone: "sage", items: ["August and September statements repeat the same service period.", "Both statements show a $9,210 enterprise platform fee.", "The billing terms require source matching before issuing a credit."] },
  { id: "supporting", label: "Supporting evidence", eyebrow: "14 indexed sources", tone: "blue", items: ["August statement · NW-1048", "September statement · NW-1048", "Statement comparison capture", "Billing terms v3.2 · §4.2"] },
  { id: "policies", label: "Applicable policies", eyebrow: "Effective context", tone: "neutral", items: ["Enterprise Billing Terms v3.2 · VALID", "Credit memo controls · approval required", "Case owner remains accountable for the correction record"] },
  { id: "inference", label: "AI inference", eyebrow: "Needs review", tone: "amber", items: ["Migration is a plausible cause for the duplicate charge.", "No ledger or migration log currently confirms causation."] , detail: "Inference is intentionally separated from verified facts." },
  { id: "recommendation", label: "Recommendation", eyebrow: "Human decision", tone: "sage", items: ["Request a written correction and credit memo.", "Attach the two matched statements as primary citations.", "Keep the response in approval until the account owner confirms the remedy."] },
  { id: "risks", label: "Risks", eyebrow: "Watch closely", tone: "red", items: ["Issuing credit without a ledger match would bypass v3.2 controls.", "A causal statement about migration could overstate the record."] },
  { id: "contradictions", label: "Contradictions", eyebrow: "1 active", tone: "amber", items: ["Finance email suggests migration; ledger evidence is absent.", "Billing portal statements are consistent with each other."] },
  { id: "missing", label: "Missing evidence", eyebrow: "Close the gap", tone: "neutral", items: ["Migration log for August billing run", "Written confirmation of correction window"] },
];
