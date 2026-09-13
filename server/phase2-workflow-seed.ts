import { and, asc, eq } from "drizzle-orm";
import {
  actions,
  approvals,
  auditLogs,
  cases,
  deadlines,
  integrations,
  memberships,
  notifications,
  oauthConnections,
  organizations,
  responses,
  roles,
  users,
  workspaces,
} from "../drizzle/schema";
import { ACCESS_ROLES } from "../shared/access-control";
import { appendAuditLog, getCaseAuditTrail, getDb } from "./db";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available");

  const suffix = Date.now().toString(36);
  const openId = `phase2-workflow-seed-${suffix}`;
  const organizationSlug = `phase2-workflow-org-${suffix}`;
  const workspaceSlug = `phase2-workflow-workspace-${suffix}`;
  const correlationId = `phase2-correlation-${suffix}`;
  let userId: number | undefined;
  let organizationId: number | undefined;
  let workspaceId: number | undefined;
  let membershipId: number | undefined;
  let caseId: number | undefined;
  let integrationId: number | undefined;
  let auditIds: number[] = [];

  try {
    await db.insert(users).values({ openId, email: `${suffix}@workflow-seed.invalid`, name: "Phase 2 Workflow Seed User", status: "ACTIVE", role: "user" });
    const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (!user) throw new Error("Seed user was not created");
    userId = user.id;

    await db.insert(organizations).values({ name: "Phase 2 Workflow Seed Organization", slug: organizationSlug, status: "ACTIVE" });
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)).limit(1);
    if (!organization) throw new Error("Seed organization was not created");
    organizationId = organization.id;

    await db.insert(workspaces).values({ organizationId, name: "Phase 2 Workflow Seed Workspace", slug: workspaceSlug, status: "ACTIVE" });
    const [workspace] = await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organizationId), eq(workspaces.slug, workspaceSlug))).limit(1);
    if (!workspace) throw new Error("Seed workspace was not created");
    workspaceId = workspace.id;

    const [ownerRole] = await db.select().from(roles).where(eq(roles.code, ACCESS_ROLES[0])).limit(1);
    if (!ownerRole) throw new Error("OWNER role is not seeded");
    await db.insert(memberships).values({ userId, organizationId, workspaceId, roleId: ownerRole.id, status: "ACTIVE" });
    const [membership] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId))).limit(1);
    if (!membership) throw new Error("Seed membership was not created");
    membershipId = membership.id;

    await db.insert(cases).values({ workspaceId, title: "Approval workflow verification case", description: "Temporary workflow foundation verification case.", company: "Northwind", category: "BILLING", priority: "HIGH", risk: "HIGH", status: "AWAITING_APPROVAL", desiredOutcome: "Verify workflow persistence before any real execution.", owner: userId });
    const [caseRow] = await db.select().from(cases).where(and(eq(cases.workspaceId, workspaceId), eq(cases.title, "Approval workflow verification case"))).limit(1);
    if (!caseRow) throw new Error("Seed case was not created");
    caseId = caseRow.id;

    const approvalId = (await db.insert(approvals).values({ caseId, requestedBy: userId, reviewer: userId, action: "SEND_EMAIL", risk: "HIGH", status: "APPROVED", reason: "Verified response draft is ready for human review.", reviewedAt: new Date() }).$returningId())[0]?.id;
    if (!approvalId) throw new Error("Seed approval was not created");
    auditIds.push((await appendAuditLog({ actor: userId, organizationId, workspaceId, action: "APPROVAL_REQUESTED", resourceType: "Approval", resourceId: approvalId, caseId, metadata: { status: "PENDING", requestedAction: "SEND_EMAIL" }, requestCorrelationId: correlationId })).id);
    auditIds.push((await appendAuditLog({ actor: userId, organizationId, workspaceId, action: "APPROVAL_RECORDED", resourceType: "Approval", resourceId: approvalId, caseId, metadata: { status: "APPROVED", reviewer: userId }, requestCorrelationId: correlationId })).id);

    const actionId = (await db.insert(actions).values({ caseId, type: "SEND_EMAIL", status: "APPROVED", requestedBy: userId, approvalId, payloadMetadata: { execution: "deferred", provider: "GMAIL" } }).$returningId())[0]?.id;
    if (!actionId) throw new Error("Seed action was not created");
    auditIds.push((await appendAuditLog({ actor: userId, organizationId, workspaceId, action: "ACTION_CREATED", resourceType: "Action", resourceId: actionId, caseId, metadata: { type: "SEND_EMAIL", status: "APPROVED" }, requestCorrelationId: correlationId })).id);

    const responseId = (await db.insert(responses).values({ caseId, actionId, externalReference: "gmail-thread-placeholder", status: "RECEIVED", receivedAt: new Date(), contentMetadata: { provider: "GMAIL", execution: "future-integration" } }).$returningId())[0]?.id;
    if (!responseId) throw new Error("Seed response was not created");
    auditIds.push((await appendAuditLog({ actor: userId, organizationId, workspaceId, action: "RESPONSE_TRACKED", resourceType: "Response", resourceId: responseId, caseId, metadata: { status: "RECEIVED", externalReference: "gmail-thread-placeholder" }, requestCorrelationId: correlationId })).id);

    const deadlineId = (await db.insert(deadlines).values({ caseId, type: "FOLLOW_UP", dueAt: new Date(Date.now() + 86400000), source: "workflow-seed", status: "OPEN", priority: "HIGH" }).$returningId())[0]?.id;
    if (!deadlineId) throw new Error("Seed deadline was not created");
    auditIds.push((await appendAuditLog({ actor: userId, organizationId, workspaceId, action: "DEADLINE_CREATED", resourceType: "Deadline", resourceId: deadlineId, caseId, metadata: { type: "FOLLOW_UP", priority: "HIGH" }, requestCorrelationId: correlationId })).id);

    const notificationId = (await db.insert(notifications).values({ recipient: userId, workspaceId, type: "APPROVAL", title: "Workflow approval recorded", description: "The approved action and follow-up deadline are ready for future execution.", severity: "INFO", readState: "UNREAD", relatedResourceType: "Case", relatedResourceId: caseId }).$returningId())[0]?.id;
    if (!notificationId) throw new Error("Seed notification was not created");
    auditIds.push((await appendAuditLog({ actor: userId, organizationId, workspaceId, action: "NOTIFICATION_CREATED", resourceType: "Notification", resourceId: notificationId, caseId, metadata: { recipient: userId, readState: "UNREAD" }, requestCorrelationId: correlationId })).id);

    await db.insert(integrations).values({ workspaceId, provider: "GMAIL", status: "DISCONNECTED", connectedBy: userId });
    const [integration] = await db.select().from(integrations).where(and(eq(integrations.workspaceId, workspaceId), eq(integrations.provider, "GMAIL"))).limit(1);
    if (!integration) throw new Error("Seed integration was not created");
    integrationId = integration.id;
    await db.insert(oauthConnections).values({ integrationId, provider: "GMAIL", accountReference: "account-placeholder", scopes: ["gmail.readonly"], tokenStatus: "PENDING", tokenMetadata: { execution: "future-server-only" }, encryptedSecretRef: `secret-manager://vindicai/${suffix}` });

    const [approval] = await db.select().from(approvals).where(eq(approvals.id, approvalId)).limit(1);
    const [action] = await db.select().from(actions).where(eq(actions.id, actionId)).limit(1);
    const [response] = await db.select().from(responses).where(eq(responses.id, responseId)).limit(1);
    const [deadline] = await db.select().from(deadlines).where(eq(deadlines.id, deadlineId)).limit(1);
    const auditTrail = await getCaseAuditTrail(caseId);
    const [oauth] = await db.select().from(oauthConnections).where(eq(oauthConnections.integrationId, integrationId)).limit(1);
    if (!approval || approval.status !== "APPROVED" || !action || action.approvalId !== approvalId || action.status !== "APPROVED" || !response || response.actionId !== actionId || response.status !== "RECEIVED" || !deadline || deadline.caseId !== caseId || !oauth || oauth.encryptedSecretRef.startsWith("raw:") || auditTrail.length !== 6 || auditTrail.every((entry) => !entry.timestamp) || auditTrail.some((entry) => !auditIds.includes(entry.id))) {
      throw new Error("Approval -> Action -> Response -> Deadline -> Notification or immutable-style audit chain failed");
    }

    console.log(JSON.stringify({ ok: true, chain: "Approval -> Action -> Response -> Deadline -> Notification", auditEntries: auditTrail.length, auditActions: auditTrail.map((entry) => entry.action), auditMode: "append-only helper; no update/delete path", oauth: "server-side encrypted secret reference only; provider disconnected" }, null, 2));
  } finally {
    if (caseId) await db.delete(auditLogs).where(eq(auditLogs.caseId, caseId));
    if (integrationId) await db.delete(integrations).where(eq(integrations.id, integrationId));
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
