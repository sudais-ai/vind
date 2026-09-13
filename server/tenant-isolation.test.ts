import { and, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
  actions,
  approvals,
  auditLogs,
  cases,
  evidence,
  integrations,
  memberships,
  notifications,
  organizations,
  policies,
  researchRuns,
  roles,
  users,
  workspaces,
} from "../drizzle/schema";
import { DataLayerError } from "./data-errors";
import { getDb } from "./db";
import { getTenantCaseGraph } from "./tenant-data";

describe("tenant isolation", () => {
  it("prevents Organization A from retrieving Organization B cases and all scoped children", async () => {
    const db = await getDb();
    if (!db) throw new Error("DATABASE_URL is required for tenant isolation tests");
    const suffix = Date.now().toString(36);
    let userA: number | undefined;
    let userB: number | undefined;
    let organizationA: number | undefined;
    let organizationB: number | undefined;
    let workspaceA: number | undefined;
    let workspaceB: number | undefined;
    let caseA: number | undefined;
    let caseB: number | undefined;
    let evidenceB: number | undefined;
    let researchB: number | undefined;
    let policyB: number | undefined;
    let approvalB: number | undefined;
    let actionB: number | undefined;
    let notificationB: number | undefined;

    try {
      const [ownerRole] = await db.select().from(roles).where(eq(roles.code, "OWNER")).limit(1);
      if (!ownerRole) throw new Error("OWNER role must be seeded before tenant tests");
      await db.insert(users).values([
        { openId: `tenant-a-${suffix}`, email: `tenant-a-${suffix}@invalid.test`, name: "Tenant A", status: "ACTIVE", role: "user" },
        { openId: `tenant-b-${suffix}`, email: `tenant-b-${suffix}@invalid.test`, name: "Tenant B", status: "ACTIVE", role: "user" },
      ]);
      userA = (await db.select().from(users).where(eq(users.email, `tenant-a-${suffix}@invalid.test`)).limit(1))[0]?.id;
      userB = (await db.select().from(users).where(eq(users.email, `tenant-b-${suffix}@invalid.test`)).limit(1))[0]?.id;
      if (!userA || !userB) throw new Error("Tenant test users were not created");

      await db.insert(organizations).values([
        { name: "Tenant A Organization", slug: `tenant-a-org-${suffix}`, status: "ACTIVE" },
        { name: "Tenant B Organization", slug: `tenant-b-org-${suffix}`, status: "ACTIVE" },
      ]);
      organizationA = (await db.select().from(organizations).where(eq(organizations.slug, `tenant-a-org-${suffix}`)).limit(1))[0]?.id;
      organizationB = (await db.select().from(organizations).where(eq(organizations.slug, `tenant-b-org-${suffix}`)).limit(1))[0]?.id;
      if (!organizationA || !organizationB) throw new Error("Tenant test organizations were not created");

      await db.insert(workspaces).values([
        { organizationId: organizationA, name: "Tenant A Workspace", slug: `tenant-a-workspace-${suffix}`, status: "ACTIVE" },
        { organizationId: organizationB, name: "Tenant B Workspace", slug: `tenant-b-workspace-${suffix}`, status: "ACTIVE" },
      ]);
      workspaceA = (await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organizationA), eq(workspaces.slug, `tenant-a-workspace-${suffix}`))).limit(1))[0]?.id;
      workspaceB = (await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organizationB), eq(workspaces.slug, `tenant-b-workspace-${suffix}`))).limit(1))[0]?.id;
      if (!workspaceA || !workspaceB) throw new Error("Tenant test workspaces were not created");
      await db.insert(memberships).values([
        { userId: userA, organizationId: organizationA, workspaceId: workspaceA, roleId: ownerRole.id, status: "ACTIVE" },
        { userId: userB, organizationId: organizationB, workspaceId: workspaceB, roleId: ownerRole.id, status: "ACTIVE" },
      ]);

      await db.insert(cases).values([
        { workspaceId: workspaceA, title: `Tenant A case ${suffix}`, category: "OTHER", priority: "LOW", risk: "LOW", status: "NEW", owner: userA },
        { workspaceId: workspaceB, title: `Tenant B case ${suffix}`, category: "OTHER", priority: "LOW", risk: "LOW", status: "NEW", owner: userB },
      ]);
      caseA = (await db.select().from(cases).where(and(eq(cases.workspaceId, workspaceA), eq(cases.title, `Tenant A case ${suffix}`))).limit(1))[0]?.id;
      caseB = (await db.select().from(cases).where(and(eq(cases.workspaceId, workspaceB), eq(cases.title, `Tenant B case ${suffix}`))).limit(1))[0]?.id;
      if (!caseA || !caseB) throw new Error("Tenant test cases were not created");

      evidenceB = (await db.insert(evidence).values({ caseId: caseB, type: "DOCUMENT", title: "Tenant B evidence", source: "tenant-b", uploadedBy: userB, verificationState: "VERIFIED", processingStatus: "PROCESSED" }).$returningId())[0]?.id;
      researchB = (await db.insert(researchRuns).values({ caseId: caseB, query: "Tenant B research", status: "COMPLETED", requester: userB }).$returningId())[0]?.id;
      policyB = (await db.insert(policies).values({ workspaceId: workspaceB, name: "Tenant B policy", source: "tenant-b", status: "ACTIVE" }).$returningId())[0]?.id;
      approvalB = (await db.insert(approvals).values({ caseId: caseB, requestedBy: userB, reviewer: userB, action: "SEND_EMAIL", risk: "LOW", status: "PENDING" }).$returningId())[0]?.id;
      actionB = (await db.insert(actions).values({ caseId: caseB, type: "SEND_EMAIL", status: "DRAFT", requestedBy: userB, approvalId: approvalB }).$returningId())[0]?.id;
      notificationB = (await db.insert(notifications).values({ recipient: userB, workspaceId: workspaceB, type: "SYSTEM", title: "Tenant B notification", severity: "INFO", readState: "UNREAD" }).$returningId())[0]?.id;
      await db.insert(auditLogs).values({ actor: userB, organizationId: organizationB, workspaceId: workspaceB, action: "TENANT_B_TEST", resourceType: "Case", resourceId: caseB, caseId: caseB, requestCorrelationId: `tenant-test-${suffix}` });
      if (!evidenceB || !researchB || !policyB || !approvalB || !actionB || !notificationB) throw new Error("Tenant B children were not created");

      const graphA = await getTenantCaseGraph(userA, organizationA, workspaceA);
      expect(graphA.cases.map((row) => row.id)).toEqual([caseA]);
      expect(graphA.evidence.every((row) => row.caseId === caseA)).toBe(true);
      expect(graphA.researchRuns.every((row) => row.caseId === caseA)).toBe(true);
      expect(graphA.claims.every((row) => row.caseId === caseA)).toBe(true);
      expect(graphA.approvals.every((row) => row.caseId === caseA)).toBe(true);
      expect(graphA.actions.every((row) => row.caseId === caseA)).toBe(true);
      expect(graphA.policies.every((row) => row.workspaceId === workspaceA)).toBe(true);
      expect(graphA.notifications.every((row) => row.workspaceId === workspaceA)).toBe(true);
      expect(graphA.auditLogs.every((row) => row.workspaceId === workspaceA && row.organizationId === organizationA)).toBe(true);
      expect(JSON.stringify(graphA)).not.toContain(`Tenant B`);

      await expect(getTenantCaseGraph(userA, organizationB, workspaceB)).rejects.toMatchObject<DataLayerError>({ type: "FORBIDDEN" });
    } finally {
      if (caseB) await db.delete(auditLogs).where(eq(auditLogs.caseId, caseB));
      if (notificationB) await db.delete(notifications).where(eq(notifications.id, notificationB));
      if (actionB) await db.delete(actions).where(eq(actions.id, actionB));
      if (approvalB) await db.delete(approvals).where(eq(approvals.id, approvalB));
      if (policyB) await db.delete(policies).where(eq(policies.id, policyB));
      if (researchB) await db.delete(researchRuns).where(eq(researchRuns.id, researchB));
      if (evidenceB) await db.delete(evidence).where(eq(evidence.id, evidenceB));
      if (caseA) await db.delete(cases).where(eq(cases.id, caseA));
      if (caseB) await db.delete(cases).where(eq(cases.id, caseB));
      if (workspaceA) await db.delete(memberships).where(eq(memberships.workspaceId, workspaceA));
      if (workspaceB) await db.delete(memberships).where(eq(memberships.workspaceId, workspaceB));
      if (workspaceA) await db.delete(workspaces).where(eq(workspaces.id, workspaceA));
      if (workspaceB) await db.delete(workspaces).where(eq(workspaces.id, workspaceB));
      if (organizationA) await db.delete(organizations).where(eq(organizations.id, organizationA));
      if (organizationB) await db.delete(organizations).where(eq(organizations.id, organizationB));
      if (userA) await db.delete(users).where(eq(users.id, userA));
      if (userB) await db.delete(users).where(eq(users.id, userB));
    }
  }, 30000);
});
