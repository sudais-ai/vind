import { TRPCError } from "@trpc/server";
import { hasWorkspacePermission, getWorkspaceMembership } from "./db";
import type { PermissionKey } from "../shared/access-control";
import { DataLayerError } from "./data-errors";

export type TenantScope = {
  organizationId: number;
  workspaceId: number;
};

export async function requireTenantMembership(userId: number, scope: TenantScope) {
  const membership = await getWorkspaceMembership(userId, scope.organizationId, scope.workspaceId);
  if (!membership) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this workspace." });
  }
  return membership;
}

export async function requireWorkspacePermission(userId: number, scope: TenantScope, permission: PermissionKey) {
  await requireTenantMembership(userId, scope);
  const allowed = await hasWorkspacePermission(userId, scope.organizationId, scope.workspaceId, permission);
  if (!allowed) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have permission for this workspace resource." });
  }
  return true as const;
}

export function publicDataError(error: unknown, fallback = "The requested data could not be loaded."): TRPCError {
  if (error instanceof TRPCError) return error;
  if (error instanceof DataLayerError) {
    const code = error.type === "NOT_FOUND" ? "NOT_FOUND" : error.type === "FORBIDDEN" ? "FORBIDDEN" : error.type === "UNAUTHORIZED" ? "UNAUTHORIZED" : error.type === "CONFLICT" ? "CONFLICT" : error.type === "VALIDATION_ERROR" ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR";
    return new TRPCError({ code, message: error.message });
  }
  return new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: fallback });
}
