import { describe, expect, it } from "vitest";
import {
  ACCESS_ROLES,
  PERMISSION_ACTIONS,
  PERMISSION_DOMAINS,
  ROLE_PERMISSION_MATRIX,
} from "../shared/access-control";

describe("Phase 2 access-control catalog", () => {
  it("defines every required role exactly once", () => {
    expect(ACCESS_ROLES).toEqual(["OWNER", "ADMIN", "MANAGER", "REVIEWER", "MEMBER", "VIEWER"]);
    expect(new Set(ACCESS_ROLES).size).toBe(ACCESS_ROLES.length);
    expect(Object.keys(ROLE_PERMISSION_MATRIX).sort()).toEqual([...ACCESS_ROLES].sort());
  });

  it("covers every permission domain and action in the owner role", () => {
    const expected = PERMISSION_DOMAINS.flatMap((domain) => PERMISSION_ACTIONS.map((action) => `${domain}:${action}`)).sort();
    expect([...ROLE_PERMISSION_MATRIX.OWNER].sort()).toEqual(expected);
    expect(new Set(ROLE_PERMISSION_MATRIX.OWNER).size).toBe(expected.length);
  });

  it("keeps viewer access read-only", () => {
    expect(ROLE_PERMISSION_MATRIX.VIEWER.every((key) => key.endsWith(":READ"))).toBe(true);
    expect(ROLE_PERMISSION_MATRIX.VIEWER).toContain("CASES:READ");
    expect(ROLE_PERMISSION_MATRIX.VIEWER).not.toContain("CASES:UPDATE");
    expect(ROLE_PERMISSION_MATRIX.VIEWER).not.toContain("ACTIONS:EXECUTE");
  });
});
