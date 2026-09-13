import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  auditLogs,
  cases,
  citations,
  claims,
  evidence,
  facts,
  memberships,
  organizations,
  permissions,
  rolePermissions,
  roles,
  users,
  workspaces,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "avatar", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (user.status !== undefined) {
    values.status = user.status;
    updateSet.status = user.status;
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/** Tenant-scoped membership lookup. Callers must supply the workspace boundary. */
export async function getWorkspaceMembership(userId: number, organizationId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select({ membership: memberships, user: users, organization: organizations, workspace: workspaces, role: roles })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .innerJoin(workspaces, eq(memberships.workspaceId, workspaces.id))
    .innerJoin(roles, eq(memberships.roleId, roles.id))
    .where(and(
      eq(memberships.userId, userId),
      eq(memberships.organizationId, organizationId),
      eq(memberships.workspaceId, workspaceId),
      eq(workspaces.organizationId, memberships.organizationId),
      eq(memberships.status, "ACTIVE"),
      eq(users.status, "ACTIVE"),
      eq(organizations.status, "ACTIVE"),
      eq(workspaces.status, "ACTIVE"),
    ))
    .limit(1);
  return result[0];
}

export async function hasWorkspacePermission(
  userId: number,
  organizationId: number,
  workspaceId: number,
  permissionKey: string,
) {
  const membership = await getWorkspaceMembership(userId, organizationId, workspaceId);
  if (!membership) return false;
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select({ id: permissions.id })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
    .where(and(eq(rolePermissions.roleId, membership.role.id), eq(permissions.permissionKey, permissionKey)))
    .limit(1);
  return result.length > 0;
}

/** Queryable traceability path: Claim -> Fact -> Evidence -> Case. */
export async function getCaseTraceability(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({ case: cases, evidence, fact: facts, claim: claims, citation: citations })
    .from(citations)
    .innerJoin(claims, eq(citations.claimId, claims.id))
    .innerJoin(facts, eq(citations.factId, facts.id))
    .innerJoin(evidence, eq(citations.evidenceId, evidence.id))
    .innerJoin(cases, eq(claims.caseId, cases.id))
    .where(and(eq(claims.caseId, caseId), eq(evidence.caseId, caseId), eq(facts.caseId, caseId)))
    .orderBy(citations.createdAt);
}

/** Append-only audit API. Deliberately exposes insert and read only, never update/delete. */
export async function appendAuditLog(entry: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const [created] = await db.insert(auditLogs).values(entry).$returningId();
  return created;
}

export async function getCaseAuditTrail(caseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLogs).where(eq(auditLogs.caseId, caseId)).orderBy(auditLogs.timestamp);
}
