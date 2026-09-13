export const ACCESS_ROLES = ["OWNER", "ADMIN", "MANAGER", "REVIEWER", "MEMBER", "VIEWER"] as const;
export type AccessRole = (typeof ACCESS_ROLES)[number];

export const PERMISSION_DOMAINS = [
  "CASES",
  "EVIDENCE",
  "RESEARCH",
  "POLICIES",
  "APPROVALS",
  "ACTIONS",
  "INTEGRATIONS",
  "AUDIT",
  "ADMINISTRATION",
] as const;
export type PermissionDomain = (typeof PERMISSION_DOMAINS)[number];

export const PERMISSION_ACTIONS = [
  "READ",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "EXECUTE",
  "EXPORT",
  "MANAGE",
] as const;
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export type PermissionKey = `${PermissionDomain}:${PermissionAction}`;

const permissionKeys = (...keys: PermissionKey[]) => keys;
const allPermissionKeys = PERMISSION_DOMAINS.flatMap((domain) =>
  PERMISSION_ACTIONS.map((action) => `${domain}:${action}` as PermissionKey),
);

export const ROLE_PERMISSION_MATRIX: Record<AccessRole, readonly PermissionKey[]> = {
  OWNER: allPermissionKeys,
  ADMIN: allPermissionKeys,
  MANAGER: permissionKeys(
    "CASES:READ", "CASES:CREATE", "CASES:UPDATE", "CASES:EXPORT",
    "EVIDENCE:READ", "EVIDENCE:CREATE", "EVIDENCE:UPDATE", "EVIDENCE:EXPORT",
    "RESEARCH:READ", "RESEARCH:CREATE", "RESEARCH:UPDATE", "RESEARCH:EXPORT",
    "POLICIES:READ", "POLICIES:CREATE", "POLICIES:UPDATE", "POLICIES:EXPORT",
    "APPROVALS:READ", "APPROVALS:CREATE", "APPROVALS:UPDATE", "APPROVALS:APPROVE",
    "ACTIONS:READ", "ACTIONS:CREATE", "ACTIONS:UPDATE",
    "AUDIT:READ", "AUDIT:EXPORT",
  ),
  REVIEWER: permissionKeys(
    "CASES:READ", "EVIDENCE:READ", "EVIDENCE:CREATE", "EVIDENCE:UPDATE",
    "RESEARCH:READ", "RESEARCH:CREATE", "RESEARCH:UPDATE", "RESEARCH:EXPORT",
    "POLICIES:READ", "APPROVALS:READ", "APPROVALS:APPROVE",
    "ACTIONS:READ", "AUDIT:READ",
  ),
  MEMBER: permissionKeys(
    "CASES:READ", "CASES:CREATE", "CASES:UPDATE",
    "EVIDENCE:READ", "EVIDENCE:CREATE", "EVIDENCE:UPDATE",
    "RESEARCH:READ", "RESEARCH:CREATE", "POLICIES:READ",
    "APPROVALS:READ", "ACTIONS:READ", "AUDIT:READ",
  ),
  VIEWER: permissionKeys(
    "CASES:READ", "EVIDENCE:READ", "RESEARCH:READ", "POLICIES:READ",
    "APPROVALS:READ", "ACTIONS:READ", "AUDIT:READ",
  ),
};

export const permissionKey = (domain: PermissionDomain, action: PermissionAction): PermissionKey => `${domain}:${action}`;
