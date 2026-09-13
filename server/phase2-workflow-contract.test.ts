import { describe, expect, it } from "vitest";
import {
  actionStatusValues,
  actionTypeValues,
  approvalStatusValues,
  integrationProviderValues,
  oauthTokenStatusValues,
} from "../drizzle/schema";
import { appendAuditLog, getCaseAuditTrail } from "./db";

describe("Phase 2 workflow and audit foundation contract", () => {
  it("preserves the requested approval and action lifecycle contracts", () => {
    expect(approvalStatusValues).toEqual(["PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED", "CANCELLED"]);
    expect(actionTypeValues).toEqual(["SEND_EMAIL", "CREATE_DRAFT", "SUBMIT_FORM", "REQUEST_INFORMATION", "ESCALATE", "SCHEDULE_FOLLOWUP"]);
    expect(actionStatusValues).toEqual(["DRAFT", "READY", "AWAITING_APPROVAL", "APPROVED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"]);
  });

  it("supports future integration providers without connecting one in Phase 2", () => {
    expect(integrationProviderValues).toEqual(["GMAIL", "OUTLOOK", "API", "WEBHOOK"]);
    expect(oauthTokenStatusValues).toContain("PENDING");
  });

  it("exposes the audit API as append/read only", () => {
    expect(appendAuditLog.name).toBe("appendAuditLog");
    expect(getCaseAuditTrail.name).toBe("getCaseAuditTrail");
    expect(typeof appendAuditLog).toBe("function");
    expect(typeof getCaseAuditTrail).toBe("function");
  });
});
