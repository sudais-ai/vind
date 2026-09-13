import { and, asc, eq } from "drizzle-orm";
import { ACCESS_ROLES, PERMISSION_ACTIONS, PERMISSION_DOMAINS, ROLE_PERMISSION_MATRIX } from "../shared/access-control";
import {
  actions,
  approvals,
  artifacts,
  auditLogs,
  cases,
  citations,
  claims,
  deadlines,
  draftVersions,
  drafts,
  evidence,
  facts,
  integrations,
  jurisdictions,
  memberships,
  notifications,
  oauthConnections,
  organizations,
  permissions,
  policies,
  policyClauses,
  policyVersions,
  researchRuns,
  researchSources,
  retentionMetadata,
  responses,
  rolePermissions,
  roles,
  storedFiles,
  timelineEvents,
  users,
  workspaces,
} from "../drizzle/schema";
import { appendAuditLog, getCaseAuditTrail, getCaseTraceability, getDb } from "./db";

const roleDescriptions: Record<(typeof ACCESS_ROLES)[number], string> = {
  OWNER: "Full organization and workspace control.",
  ADMIN: "Administrative control across organization workspaces.",
  MANAGER: "Manages work and approvals without platform administration.",
  REVIEWER: "Reviews evidence, research, and approval-ready work.",
  MEMBER: "Creates and updates assigned workspace work.",
  VIEWER: "Read-only access to permitted workspace records.",
};

async function seedAccessCatalog(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  for (const code of ACCESS_ROLES) {
    await db.insert(roles).values({ code, name: code[0] + code.slice(1).toLowerCase(), description: roleDescriptions[code], isSystem: true }).onDuplicateKeyUpdate({ set: { description: roleDescriptions[code], isSystem: true } });
  }
  for (const domain of PERMISSION_DOMAINS) {
    for (const action of PERMISSION_ACTIONS) {
      const permissionKey = `${domain}:${action}`;
      await db.insert(permissions).values({ domain, action, permissionKey, description: `${action} access for the ${domain.toLowerCase()} domain.` }).onDuplicateKeyUpdate({ set: { description: `${action} access for the ${domain.toLowerCase()} domain.` } });
    }
  }
  const roleRows = await db.select().from(roles);
  const permissionRows = await db.select().from(permissions);
  const roleIds = new Map(roleRows.map((row) => [row.code, row.id]));
  const permissionIds = new Map(permissionRows.map((row) => [row.permissionKey, row.id]));
  for (const code of ACCESS_ROLES) {
    const roleId = roleIds.get(code);
    if (!roleId) throw new Error(`Missing role: ${code}`);
    for (const permissionKey of ROLE_PERMISSION_MATRIX[code]) {
      const permissionId = permissionIds.get(permissionKey);
      if (!permissionId) throw new Error(`Missing permission: ${permissionKey}`);
      await db.insert(rolePermissions).values({ roleId, permissionId }).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
    }
  }
  return roleIds;
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available");
  const roleIds = await seedAccessCatalog(db);
  const suffix = Date.now().toString(36);
  const organizationSlug = `vindicai-coherent-org-${suffix}`;
  const workspaceSlug = `vindicai-coherent-workspace-${suffix}`;
  const correlationId = `coherent-seed-${suffix}`;
  const now = new Date();

  await db.insert(users).values([
    { openId: `coherent-owner-${suffix}`, email: `owner-${suffix}@vindicai.invalid`, name: "VindicAI Owner", status: "ACTIVE", role: "user" },
    { openId: `coherent-reviewer-${suffix}`, email: `reviewer-${suffix}@vindicai.invalid`, name: "VindicAI Reviewer", status: "ACTIVE", role: "user" },
  ]);
  const seededUsers = await db.select().from(users).where(eq(users.email, `owner-${suffix}@vindicai.invalid`));
  const [owner] = seededUsers;
  const [reviewer] = await db.select().from(users).where(eq(users.email, `reviewer-${suffix}@vindicai.invalid`)).limit(1);
  if (!owner || !reviewer) throw new Error("Coherent seed users were not created");

  await db.insert(organizations).values({ name: "VindicAI Coherent Organization", slug: organizationSlug, status: "ACTIVE" });
  const [organization] = await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)).limit(1);
  if (!organization) throw new Error("Coherent seed organization was not created");
  await db.insert(workspaces).values({ organizationId: organization.id, name: "Dispute Operations Workspace", slug: workspaceSlug, status: "ACTIVE" });
  const [workspace] = await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organization.id), eq(workspaces.slug, workspaceSlug))).limit(1);
  if (!workspace) throw new Error("Coherent seed workspace was not created");
  await db.insert(memberships).values([
    { userId: owner.id, organizationId: organization.id, workspaceId: workspace.id, roleId: roleIds.get("OWNER")!, status: "ACTIVE" },
    { userId: reviewer.id, organizationId: organization.id, workspaceId: workspace.id, roleId: roleIds.get("REVIEWER")!, status: "ACTIVE" },
  ]);

  await db.insert(cases).values({ workspaceId: workspace.id, title: "Northwind duplicate billing dispute", description: "Coherent Phase 2 dataset for evidence-led dispute resolution.", company: "Northwind", category: "BILLING", priority: "HIGH", risk: "HIGH", status: "AWAITING_APPROVAL", desiredOutcome: "Secure a corrected invoice and documented resolution.", owner: owner.id });
  const [caseRow] = await db.select().from(cases).where(and(eq(cases.workspaceId, workspace.id), eq(cases.title, "Northwind duplicate billing dispute"))).limit(1);
  if (!caseRow) throw new Error("Coherent seed case was not created");

  await db.insert(evidence).values([
    { caseId: caseRow.id, type: "EMAIL", title: "Customer duplicate-charge email", description: "Customer reports two charges for the same service period.", source: "GMAIL", sourceIdentifier: `gmail-message-${suffix}`, status: "ACTIVE", verificationState: "VERIFIED", captureTime: now, uploadedBy: owner.id, originalFilename: "customer-email.eml", checksum: `sha256:email-${suffix}`, processingStatus: "PROCESSED" },
    { caseId: caseRow.id, type: "PDF", title: "September invoice", description: "Invoice shows the duplicate line item.", source: "Billing system", sourceIdentifier: `invoice-${suffix}`, status: "ACTIVE", verificationState: "VERIFIED", captureTime: now, uploadedBy: owner.id, originalFilename: "september-invoice.pdf", checksum: `sha256:invoice-${suffix}`, processingStatus: "PROCESSED" },
  ]);
  const caseEvidence = await db.select().from(evidence).where(eq(evidence.caseId, caseRow.id)).orderBy(asc(evidence.id));
  const [emailEvidence, invoiceEvidence] = caseEvidence;
  if (!emailEvidence || !invoiceEvidence) throw new Error("Coherent seed evidence was not created");
  await db.insert(storedFiles).values({ evidenceId: invoiceEvidence.id, storageProvider: "s3-compatible", storageKey: `coherent/${suffix}/september-invoice.pdf`, mimeType: "application/pdf", sizeBytes: 24576, checksum: invoiceEvidence.checksum!, filename: "september-invoice.pdf", uploadedBy: owner.id });
  await db.insert(timelineEvents).values([
    { caseId: caseRow.id, eventType: "CASE_CREATED", timestamp: now, title: "Case opened", description: "Northwind duplicate billing dispute created.", actor: owner.id, source: "coherent-seed", metadata: { seed: true } },
    { caseId: caseRow.id, eventType: "EVIDENCE_CAPTURED", timestamp: now, title: "Invoice evidence captured", description: "The September invoice was indexed for review.", actor: owner.id, source: "Billing system", relatedEvidence: invoiceEvidence.id, metadata: { sourceIdentifier: invoiceEvidence.sourceIdentifier } },
    { caseId: caseRow.id, eventType: "EVIDENCE_VERIFIED", timestamp: now, title: "Email evidence verified", description: "The customer email corroborates the duplicate charge.", actor: reviewer.id, source: "GMAIL", relatedEvidence: emailEvidence.id, metadata: { verification: "human-reviewed" } },
  ]);

  await db.insert(facts).values({ caseId: caseRow.id, statement: "Northwind was charged twice for the September service period.", status: "VERIFIED", createdBy: reviewer.id });
  const [fact] = await db.select().from(facts).where(eq(facts.caseId, caseRow.id)).limit(1);
  if (!fact) throw new Error("Coherent seed fact was not created");
  await db.insert(claims).values({ caseId: caseRow.id, statement: "The duplicate charge should be reversed under the billing resolution policy.", status: "SUPPORTED", confidence: 96, createdBy: reviewer.id });
  const [claim] = await db.select().from(claims).where(eq(claims.caseId, caseRow.id)).limit(1);
  if (!claim) throw new Error("Coherent seed claim was not created");
  await db.insert(citations).values({ claimId: claim.id, evidenceId: invoiceEvidence.id, factId: fact.id, excerpt: "Duplicate service-period line item appears on the invoice.", locator: "page 1, line 4" });

  await db.insert(jurisdictions).values({ country: "United States", stateProvince: "California", region: "West", regulatoryAuthority: "California consumer authority", type: "STATE_PROVINCE", code: `US-CA-${suffix}`, name: "California" });
  const [jurisdiction] = await db.select().from(jurisdictions).where(eq(jurisdictions.code, `US-CA-${suffix}`)).limit(1);
  if (!jurisdiction) throw new Error("Coherent seed jurisdiction was not created");
  await db.insert(policies).values({ name: "Billing Resolution Policy", description: "Policy for evidence-backed billing corrections.", source: "VindicAI policy registry", workspaceId: workspace.id, jurisdictionId: jurisdiction.id, status: "ACTIVE" });
  const [policy] = await db.select().from(policies).where(and(eq(policies.name, "Billing Resolution Policy"), eq(policies.jurisdictionId, jurisdiction.id))).limit(1);
  if (!policy) throw new Error("Coherent seed policy was not created");
  await db.insert(policyVersions).values({ policyId: policy.id, versionNumber: 1, effectiveDate: now, source: "VindicAI policy registry", status: "ACTIVE", checksum: `sha256:policy-${suffix}` });
  const [policyVersion] = await db.select().from(policyVersions).where(and(eq(policyVersions.policyId, policy.id), eq(policyVersions.versionNumber, 1))).limit(1);
  if (!policyVersion) throw new Error("Coherent seed policy version was not created");
  await db.insert(policyClauses).values({ policyVersionId: policyVersion.id, clauseNumber: "4.2", title: "Reverse duplicate charges", text: "Verified duplicate charges must be reversed or escalated with a documented explanation.", checksum: `sha256:clause-${suffix}` });
  const [policyClause] = await db.select().from(policyClauses).where(eq(policyClauses.policyVersionId, policyVersion.id)).limit(1);
  if (!policyClause) throw new Error("Coherent seed policy clause was not created");

  await db.insert(researchRuns).values({ caseId: caseRow.id, query: "Applicable requirements for reversing duplicate billing charges", status: "COMPLETED", startedAt: now, completedAt: now, requester: reviewer.id, metadata: { seed: true, execution: "foundation-only" } });
  const [researchRun] = await db.select().from(researchRuns).where(eq(researchRuns.caseId, caseRow.id)).limit(1);
  if (!researchRun) throw new Error("Coherent seed research run was not created");
  await db.insert(researchSources).values({ researchRunId: researchRun.id, url: "https://example.invalid/california/billing", reference: "CA-BILL-2026", title: "Duplicate billing guidance", authority: "California consumer authority", publicationDate: now, effectiveDate: now, freshness: "FRESH", sourceType: "REGULATORY", status: "ACTIVE", jurisdictionId: jurisdiction.id, checksum: `sha256:source-${suffix}` });
  const [researchSource] = await db.select().from(researchSources).where(eq(researchSources.researchRunId, researchRun.id)).limit(1);
  if (!researchSource) throw new Error("Coherent seed research source was not created");
  await db.insert(artifacts).values({ caseId: caseRow.id, researchSourceId: researchSource.id, type: "RESEARCH", status: "FINAL", version: 1, content: "Research supports reversal of a verified duplicate charge.", author: reviewer.id, source: "CA-BILL-2026" });

  await db.insert(drafts).values({ caseId: caseRow.id, author: reviewer.id, status: "IN_REVIEW", title: "Northwind duplicate-charge resolution", currentVersion: 2 });
  const [draft] = await db.select().from(drafts).where(and(eq(drafts.caseId, caseRow.id), eq(drafts.title, "Northwind duplicate-charge resolution"))).limit(1);
  if (!draft) throw new Error("Coherent seed draft was not created");
  await db.insert(draftVersions).values([
    { draftId: draft.id, version: 1, author: reviewer.id, status: "DRAFT", content: "We identified a duplicate September charge and are reviewing the invoice record." },
    { draftId: draft.id, version: 2, author: reviewer.id, status: "IN_REVIEW", content: "We verified the duplicate charge and request reversal under clause 4.2." },
  ]);

  const approvalId = (await db.insert(approvals).values({ caseId: caseRow.id, requestedBy: reviewer.id, reviewer: owner.id, draftId: draft.id, action: "SEND_EMAIL", risk: "HIGH", status: "APPROVED", reason: "Draft is supported by verified invoice evidence, research, and policy clause.", reviewedAt: now }).$returningId())[0]?.id;
  if (!approvalId) throw new Error("Coherent seed approval was not created");
  const actionId = (await db.insert(actions).values({ caseId: caseRow.id, type: "SEND_EMAIL", status: "APPROVED", requestedBy: reviewer.id, approvalId, payloadMetadata: { draftId: draft.id, execution: "deferred", provider: "GMAIL" } }).$returningId())[0]?.id;
  if (!actionId) throw new Error("Coherent seed action was not created");
  await db.insert(responses).values({ caseId: caseRow.id, actionId, externalReference: `future-gmail-thread-${suffix}`, status: "PENDING", contentMetadata: { provider: "GMAIL", execution: "future-integration" } });
  const [response] = await db.select().from(responses).where(eq(responses.actionId, actionId)).limit(1);
  if (!response) throw new Error("Coherent seed response was not created");
  await db.insert(deadlines).values({ caseId: caseRow.id, type: "FOLLOW_UP", dueAt: new Date(Date.now() + 86400000), source: "policy clause 4.2", status: "OPEN", priority: "HIGH" });
  const [deadline] = await db.select().from(deadlines).where(eq(deadlines.caseId, caseRow.id)).limit(1);
  if (!deadline) throw new Error("Coherent seed deadline was not created");
  const notificationId = (await db.insert(notifications).values({ recipient: owner.id, workspaceId: workspace.id, type: "APPROVAL", title: "Draft approved for future dispatch", description: "The supported draft is ready for a future provider-backed action.", severity: "INFO", readState: "UNREAD", relatedResourceType: "Approval", relatedResourceId: approvalId }).$returningId())[0]?.id;
  if (!notificationId) throw new Error("Coherent seed notification was not created");

  await db.insert(integrations).values({ workspaceId: workspace.id, provider: "GMAIL", status: "DISCONNECTED", connectedBy: owner.id });
  const [integration] = await db.select().from(integrations).where(and(eq(integrations.workspaceId, workspace.id), eq(integrations.provider, "GMAIL"))).limit(1);
  if (!integration) throw new Error("Coherent seed integration was not created");
  await db.insert(oauthConnections).values({ integrationId: integration.id, provider: "GMAIL", accountReference: `northwind-account-${suffix}`, scopes: ["gmail.readonly"], tokenStatus: "PENDING", tokenMetadata: { execution: "future-server-only" }, encryptedSecretRef: `secret-manager://vindicai/coherent/${suffix}` });

  await db.insert(retentionMetadata).values([
    { organizationId: organization.id, resourceType: "Case", resourceId: caseRow.id, retentionDuration: 2555, organizationPolicy: "case-default-7-years", legalHold: false, deletionStatus: "ACTIVE" },
    { organizationId: organization.id, resourceType: "Evidence", resourceId: invoiceEvidence.id, retentionDuration: 3650, organizationPolicy: "evidence-legal-retention-10-years", legalHold: true, deletionStatus: "LEGAL_HOLD" },
  ]);

  const auditActions = [
    ["CASE_CREATED", "Case", caseRow.id],
    ["EVIDENCE_VERIFIED", "Evidence", invoiceEvidence.id],
    ["CLAIM_SUPPORTED", "Claim", claim.id],
    ["DRAFT_CREATED", "Draft", draft.id],
    ["APPROVAL_RECORDED", "Approval", approvalId],
    ["ACTION_CREATED", "Action", actionId],
    ["DEADLINE_CREATED", "Deadline", deadline.id],
    ["NOTIFICATION_CREATED", "Notification", notificationId],
  ] as const;
  for (const [action, resourceType, resourceId] of auditActions) {
    await appendAuditLog({ actor: owner.id, organizationId: organization.id, workspaceId: workspace.id, action, resourceType, resourceId, caseId: caseRow.id, metadata: { seed: "phase2-coherent", immutableStyle: true }, requestCorrelationId: correlationId });
  }

  const resolvedEvidence = await db.select().from(evidence).where(eq(evidence.caseId, caseRow.id));
  const resolvedTimeline = await db.select().from(timelineEvents).where(eq(timelineEvents.caseId, caseRow.id));
  const traceability = await getCaseTraceability(caseRow.id);
  const draftVersionsForCase = await db.select().from(draftVersions).where(eq(draftVersions.draftId, draft.id)).orderBy(asc(draftVersions.version));
  const auditTrail = await getCaseAuditTrail(caseRow.id);
  const retention = await db.select().from(retentionMetadata).where(eq(retentionMetadata.resourceId, invoiceEvidence.id)).limit(1);
  const [resolvedApproval] = await db.select().from(approvals).where(eq(approvals.id, approvalId)).limit(1);
  const [resolvedAction] = await db.select().from(actions).where(eq(actions.id, actionId)).limit(1);
  if (resolvedEvidence.length !== 2 || resolvedTimeline.length !== 3 || traceability.length !== 1 || traceability[0]?.claim.id !== claim.id || traceability[0]?.fact.id !== fact.id || traceability[0]?.evidence.id !== invoiceEvidence.id || draftVersionsForCase.length !== 2 || resolvedApproval?.draftId !== draft.id || resolvedAction?.approvalId !== approvalId || auditTrail.length !== auditActions.length || retention[0]?.legalHold !== true) {
    throw new Error("Coherent end-to-end Case -> Evidence -> Research -> Claims -> Approval -> Action chain did not resolve");
  }

  console.log(JSON.stringify({ ok: true, dataset: "Organization -> Workspace -> Users -> Roles -> Case -> Evidence -> Timeline -> Policies -> Research -> Claims -> Citations -> Drafts -> Approvals -> Actions -> Notifications -> Audit", organizationId: organization.id, workspaceId: workspace.id, caseId: caseRow.id, evidence: resolvedEvidence.length, timelineEvents: resolvedTimeline.length, traceabilityRows: traceability.length, draftVersions: draftVersionsForCase.map((version) => version.version), auditEvents: auditTrail.length, legalHoldEvidence: retention[0]?.resourceId, providerExecution: "none" }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
