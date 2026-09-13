import { and, eq } from "drizzle-orm";
import { cases, citations, claims, evidence, facts, memberships, organizations, storedFiles, timelineEvents, users, workspaces } from "../drizzle/schema";
import { getCaseTraceability, getDb } from "./db";
import { ACCESS_ROLES } from "../shared/access-control";
import { roles } from "../drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available");

  const suffix = Date.now().toString(36);
  const openId = `phase2-case-seed-${suffix}`;
  const organizationSlug = `phase2-case-org-${suffix}`;
  const workspaceSlug = `phase2-case-workspace-${suffix}`;
  let userId: number | undefined;
  let organizationId: number | undefined;
  let workspaceId: number | undefined;
  let membershipId: number | undefined;
  let caseId: number | undefined;

  try {
    await db.insert(users).values({ openId, email: `${suffix}@case-seed.invalid`, name: "Phase 2 Case Seed User", status: "ACTIVE", role: "user" });
    const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (!user) throw new Error("Seed user was not created");
    userId = user.id;

    await db.insert(organizations).values({ name: "Phase 2 Case Seed Organization", slug: organizationSlug, status: "ACTIVE" });
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)).limit(1);
    if (!organization) throw new Error("Seed organization was not created");
    organizationId = organization.id;

    await db.insert(workspaces).values({ organizationId, name: "Phase 2 Case Seed Workspace", slug: workspaceSlug, status: "ACTIVE" });
    const [workspace] = await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organizationId), eq(workspaces.slug, workspaceSlug))).limit(1);
    if (!workspace) throw new Error("Seed workspace was not created");
    workspaceId = workspace.id;

    const [ownerRole] = await db.select().from(roles).where(eq(roles.code, ACCESS_ROLES[0])).limit(1);
    if (!ownerRole) throw new Error("OWNER role is not seeded");
    await db.insert(memberships).values({ userId, organizationId, workspaceId, roleId: ownerRole.id, status: "ACTIVE" });
    const [membership] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId))).limit(1);
    if (!membership) throw new Error("Seed membership was not created");
    membershipId = membership.id;

    await db.insert(cases).values({ workspaceId, title: "Duplicate charge review", description: "Verify the disputed invoice against the source record.", company: "Northwind", category: "BILLING", priority: "HIGH", risk: "HIGH", status: "EVIDENCE_VERIFIED", desiredOutcome: "Confirm and resolve the billing discrepancy.", owner: userId });
    const [caseRow] = await db.select().from(cases).where(and(eq(cases.workspaceId, workspaceId), eq(cases.title, "Duplicate charge review"))).limit(1);
    if (!caseRow) throw new Error("Seed case was not created");
    caseId = caseRow.id;

    await db.insert(evidence).values({ caseId, type: "PDF", title: "September invoice", description: "Source invoice for the disputed charge.", source: "Northwind billing portal", sourceIdentifier: "invoice://NW-2026-09", verificationState: "VERIFIED", captureTime: new Date(), uploadedBy: userId, originalFilename: "september-invoice.pdf", checksum: "sha256:seed-invoice", processingStatus: "PROCESSED" });
    const [evidenceRow] = await db.select().from(evidence).where(and(eq(evidence.caseId, caseId), eq(evidence.title, "September invoice"))).limit(1);
    if (!evidenceRow) throw new Error("Seed evidence was not created");

    await db.insert(storedFiles).values({ evidenceId: evidenceRow.id, storageProvider: "s3-compatible", storageKey: `cases/${caseId}/evidence/september-invoice.pdf`, mimeType: "application/pdf", sizeBytes: 2048, checksum: "sha256:seed-invoice", filename: "september-invoice.pdf", uploadedBy: userId });
    await db.insert(timelineEvents).values({ caseId, eventType: "EVIDENCE_VERIFIED", title: "Invoice verified", description: "The September invoice was verified against its source identifier.", actor: userId, source: "Evidence desk", relatedEvidence: evidenceRow.id, metadata: { verification: "manual" } });
    const [fact] = await db.insert(facts).values({ caseId, statement: "The September invoice contains the disputed duplicate charge.", status: "VERIFIED", createdBy: userId }).$returningId();
    if (!fact?.id) throw new Error("Seed fact was not created");
    const [claim] = await db.insert(claims).values({ caseId, statement: "Northwind should credit the duplicate charge after review.", status: "SUPPORTED", confidence: 91, createdBy: userId }).$returningId();
    if (!claim?.id) throw new Error("Seed claim was not created");
    const [citation] = await db.insert(citations).values({ claimId: claim.id, evidenceId: evidenceRow.id, factId: fact.id, excerpt: "Duplicate charge line item appears on the September invoice.", locator: "page=1#line=14" }).$returningId();
    if (!citation?.id) throw new Error("Seed citation was not created");

    const trace = await getCaseTraceability(caseId);
    const timeline = await db.select().from(timelineEvents).where(eq(timelineEvents.caseId, caseId));
    if (trace.length !== 1 || trace[0]?.case.id !== caseId || trace[0]?.evidence.id !== evidenceRow.id || trace[0]?.fact.id !== fact.id || trace[0]?.claim.id !== claim.id || trace[0]?.citation.id !== citation.id || timeline.length !== 1) {
      throw new Error("Case relationship chain did not resolve correctly");
    }
    console.log(JSON.stringify({ ok: true, caseId, evidenceId: evidenceRow.id, timelineEvents: timeline.length, chain: "Case -> Evidence -> Fact -> Claim -> Citation", storage: "metadata-only S3-compatible reference" }, null, 2));
  } finally {
    if (caseId) await db.delete(cases).where(eq(cases.id, caseId));
    if (membershipId) await db.delete(memberships).where(eq(memberships.id, membershipId));
    if (workspaceId) await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
    if (organizationId) await db.delete(organizations).where(eq(organizations.id, organizationId));
    if (userId) await db.delete(users).where(eq(users.id, userId));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
