import { and, eq, inArray } from "drizzle-orm";
import {
  actions,
  approvals,
  auditLogs,
  cases,
  citations,
  claims,
  deadlines,
  evidence,
  facts,
  notifications,
  memberships,
  organizations,
  policies,
  researchRuns,
  researchSources,
  timelineEvents,
  workspaces,
} from "../drizzle/schema";
import { DataLayerError } from "./data-errors";
import { getDb, getWorkspaceMembership } from "./db";

export async function getDefaultTenantScope(userId: number) {
  const db = await getDb();
  if (!db) throw new DataLayerError("DATABASE_ERROR", "Data service is unavailable.");
  const [membership] = await db
    .select({ organizationId: memberships.organizationId, workspaceId: memberships.workspaceId })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
    .where(and(eq(memberships.userId, userId), eq(memberships.status, "ACTIVE"), eq(organizations.status, "ACTIVE"), eq(workspaces.status, "ACTIVE")))
    .limit(1);
  if (!membership) throw new DataLayerError("NOT_FOUND", "No active workspace is available for this account.");
  return membership;
}

export async function getTenantCaseGraph(userId: number, organizationId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new DataLayerError("DATABASE_ERROR", "Data service is unavailable.");
  const membership = await getWorkspaceMembership(userId, organizationId, workspaceId);
  if (!membership) throw new DataLayerError("FORBIDDEN", "You do not have access to this workspace.");

  const workspaceCases = await db.select().from(cases).where(eq(cases.workspaceId, workspaceId));
  const caseIds = workspaceCases.map((row) => row.id);
  if (!caseIds.length) {
    return { cases: [], evidence: [], facts: [], timelineEvents: [], researchRuns: [], researchSources: [], claims: [], citations: [], approvals: [], actions: [], notifications: [], auditLogs: [], policies: [] };
  }

  const [workspaceEvidence, workspaceFacts, workspaceTimelineEvents, workspaceResearch, workspaceClaims, workspaceApprovals, workspaceActions, workspaceNotifications, workspaceAuditLogs, workspacePolicies] = await Promise.all([
    db.select().from(evidence).where(inArray(evidence.caseId, caseIds)),
    db.select().from(facts).where(inArray(facts.caseId, caseIds)),
    db.select().from(timelineEvents).where(inArray(timelineEvents.caseId, caseIds)),
    db.select().from(researchRuns).where(inArray(researchRuns.caseId, caseIds)),
    db.select().from(claims).where(inArray(claims.caseId, caseIds)),
    db.select().from(approvals).where(inArray(approvals.caseId, caseIds)),
    db.select().from(actions).where(inArray(actions.caseId, caseIds)),
    db.select().from(notifications).where(eq(notifications.workspaceId, workspaceId)),
    db.select().from(auditLogs).where(and(eq(auditLogs.organizationId, organizationId), eq(auditLogs.workspaceId, workspaceId))),
    db.select().from(policies).where(eq(policies.workspaceId, workspaceId)),
  ]);
  const researchIds = workspaceResearch.map((row) => row.id);
  const claimIds = workspaceClaims.map((row) => row.id);
  const evidenceIds = workspaceEvidence.map((row) => row.id);
  const [workspaceSources, workspaceCitations] = await Promise.all([
    researchIds.length ? db.select().from(researchSources).where(inArray(researchSources.researchRunId, researchIds)) : Promise.resolve([]),
    claimIds.length && evidenceIds.length ? db.select().from(citations).where(and(inArray(citations.claimId, claimIds), inArray(citations.evidenceId, evidenceIds))) : Promise.resolve([]),
  ]);

  return {
    cases: workspaceCases,
    evidence: workspaceEvidence,
    facts: workspaceFacts,
    timelineEvents: workspaceTimelineEvents,
    researchRuns: workspaceResearch,
    researchSources: workspaceSources,
    claims: workspaceClaims,
    citations: workspaceCitations,
    approvals: workspaceApprovals,
    actions: workspaceActions,
    notifications: workspaceNotifications,
    auditLogs: workspaceAuditLogs,
    policies: workspacePolicies,
  };
}
