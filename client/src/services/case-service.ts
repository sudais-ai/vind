import { databaseCaseService } from "@/services/database-case-service";

export const CASE_CREATED_EVENT = "vindicai:case-created";

/** Compatibility name retained so existing pages do not need to be rewritten. */
export const caseService = databaseCaseService;
export const mockCaseService = databaseCaseService;
