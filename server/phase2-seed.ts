import { and, eq } from "drizzle-orm";
import { PERMISSION_ACTIONS, PERMISSION_DOMAINS, ROLE_PERMISSION_MATRIX, ACCESS_ROLES } from "../shared/access-control";
import { getDb, getWorkspaceMembership, hasWorkspacePermission } from "./db";
import { memberships, organizations, permissions, rolePermissions, roles, users, workspaces } from "../drizzle/schema";

const roleDescriptions: Record<(typeof ACCESS_ROLES)[number], string> = {
  OWNER: "Full organization and workspace control.",
  ADMIN: "Administrative control across organization workspaces.",
  MANAGER: "Manages work and approvals without platform administration.",
  REVIEWER: "Reviews evidence, research, and approval-ready work.",
  MEMBER: "Creates and updates assigned workspace work.",
  VIEWER: "Read-only access to permitted workspace records.",
};

const permissionDescription = (domain: string, action: string) => `${action} access for the ${domain.toLowerCase()} domain.`;

async function seedCatalog(db: NonNullable<Awaited<ReturnType<typeof getDb>>>) {
  for (const code of ACCESS_ROLES) {
    await db.insert(roles).values({ code, name: code[0] + code.slice(1).toLowerCase(), description: roleDescriptions[code], isSystem: true }).onDuplicateKeyUpdate({ set: { description: roleDescriptions[code], isSystem: true } });
  }

  for (const domain of PERMISSION_DOMAINS) {
    for (const action of PERMISSION_ACTIONS) {
      const permissionKey = `${domain}:${action}`;
      await db.insert(permissions).values({ domain, action, permissionKey, description: permissionDescription(domain, action) }).onDuplicateKeyUpdate({ set: { description: permissionDescription(domain, action) } });
    }
  }

  const roleRows = await db.select().from(roles);
  const permissionRows = await db.select().from(permissions);
  const roleIds = new Map(roleRows.map((row) => [row.code, row.id]));
  const permissionIds = new Map(permissionRows.map((row) => [row.permissionKey, row.id]));

  for (const code of ACCESS_ROLES) {
    const roleId = roleIds.get(code);
    if (!roleId) throw new Error(`Missing role after seed: ${code}`);
    for (const permissionKey of ROLE_PERMISSION_MATRIX[code]) {
      const permissionId = permissionIds.get(permissionKey);
      if (!permissionId) throw new Error(`Missing permission after seed: ${permissionKey}`);
      await db.insert(rolePermissions).values({ roleId, permissionId }).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
    }
  }

  return { roleIds, permissionIds };
}

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available");
  const { roleIds } = await seedCatalog(db);
  const suffix = Date.now().toString(36);
  const openId = `phase2-seed-${suffix}`;
  const organizationSlug = `phase2-org-${suffix}`;
  const workspaceSlug = `phase2-workspace-${suffix}`;
  let userId: number | undefined;
  let organizationId: number | undefined;
  let workspaceId: number | undefined;
  let membershipId: number | undefined;

  try {
    await db.insert(users).values({ openId, email: `${suffix}@seed.invalid`, name: "Phase 2 Seed User", status: "ACTIVE", role: "user" });
    const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (!user) throw new Error("Seed user was not created");
    userId = user.id;

    await db.insert(organizations).values({ name: "Phase 2 Seed Organization", slug: organizationSlug, status: "ACTIVE" });
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)).limit(1);
    if (!organization) throw new Error("Seed organization was not created");
    organizationId = organization.id;

    await db.insert(workspaces).values({ organizationId, name: "Phase 2 Seed Workspace", slug: workspaceSlug, status: "ACTIVE" });
    const [workspace] = await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organizationId), eq(workspaces.slug, workspaceSlug))).limit(1);
    if (!workspace) throw new Error("Seed workspace was not created");
    workspaceId = workspace.id;

    const ownerRoleId = roleIds.get("OWNER");
    if (!ownerRoleId) throw new Error("OWNER role was not seeded");
    await db.insert(memberships).values({ userId, organizationId, workspaceId, roleId: ownerRoleId, status: "ACTIVE" });
    const [membership] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId))).limit(1);
    if (!membership) throw new Error("Seed membership was not created");
    membershipId = membership.id;

    const resolved = await getWorkspaceMembership(userId, organizationId, workspaceId);
    if (!resolved || resolved.user.id !== userId || resolved.organization.id !== organizationId || resolved.workspace.id !== workspaceId || resolved.role.code !== "OWNER") {
      throw new Error("User → organization → workspace → membership relationship did not resolve correctly");
    }
    const canManage = await hasWorkspacePermission(userId, organizationId, workspaceId, "ADMINISTRATION:MANAGE");
    if (!canManage) throw new Error("OWNER permission resolution failed");

    console.log(JSON.stringify({ ok: true, relationship: "User -> Organization -> Workspace -> Membership", role: resolved.role.code, permission: "ADMINISTRATION:MANAGE", canManage }, null, 2));
  } finally {
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
