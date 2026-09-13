import {
  boolean,
  foreignKey,
  bigint,
  decimal,
  index,
  json,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const userStatusValues = ["ACTIVE", "INVITED", "SUSPENDED", "DELETED"] as const;
export const organizationStatusValues = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export const workspaceStatusValues = ["ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export const membershipStatusValues = ["ACTIVE", "INVITED", "SUSPENDED", "REMOVED"] as const;
export const roleValues = ["OWNER", "ADMIN", "MANAGER", "REVIEWER", "MEMBER", "VIEWER"] as const;
export const permissionDomainValues = [
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
export const permissionActionValues = [
  "READ",
  "CREATE",
  "UPDATE",
  "DELETE",
  "APPROVE",
  "EXECUTE",
  "EXPORT",
  "MANAGE",
] as const;
export const caseStatusValues = [
  "NEW",
  "INGESTING",
  "FACTS_EXTRACTED",
  "EVIDENCE_VERIFIED",
  "RESEARCHING",
  "STRATEGY_READY",
  "DRAFT_READY",
  "AWAITING_APPROVAL",
  "SENT",
  "WAITING_RESPONSE",
  "RESPONSE_RECEIVED",
  "REANALYZING",
  "ESCALATION_READY",
  "RESOLVED",
  "CLOSED",
] as const;
export const casePriorityValues = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const caseRiskValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const caseCategoryValues = ["BILLING", "CONTRACT", "REFUND", "SERVICE", "COMPLIANCE", "OTHER"] as const;
export const evidenceTypeValues = ["EMAIL", "PDF", "DOCUMENT", "IMAGE", "SCREENSHOT", "ATTACHMENT", "FORM", "OTHER"] as const;
export const evidenceStatusValues = ["ACTIVE", "ARCHIVED", "DELETED"] as const;
export const verificationStateValues = ["UNVERIFIED", "IN_REVIEW", "VERIFIED", "REJECTED"] as const;
export const processingStatusValues = ["PENDING", "PROCESSING", "PROCESSED", "FAILED"] as const;
export const timelineEventTypeValues = ["CASE_CREATED", "STATUS_CHANGED", "EVIDENCE_CAPTURED", "EVIDENCE_VERIFIED", "FACT_RECORDED", "CLAIM_RECORDED", "NOTE", "SYSTEM"] as const;
export const factStatusValues = ["UNVERIFIED", "VERIFIED", "REJECTED"] as const;
export const claimStatusValues = ["PROPOSED", "SUPPORTED", "CONTRADICTED", "REJECTED"] as const;
export const statementClassificationValues = ["FACT", "LAW", "POLICY", "SOURCE_STATEMENT", "INFERENCE", "RECOMMENDATION", "UNKNOWN"] as const;
export const researchRunStatusValues = ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export const researchSourceTypeValues = ["OFFICIAL", "REGULATORY", "JUDICIAL", "ACADEMIC", "NEWS", "INTERNAL", "OTHER"] as const;
export const researchSourceStatusValues = ["ACTIVE", "ARCHIVED", "UNVERIFIED"] as const;
export const freshnessValues = ["FRESH", "AGING", "STALE", "UNKNOWN"] as const;
export const policyStatusValues = ["DRAFT", "ACTIVE", "RETIRED", "ARCHIVED"] as const;
export const policyVersionStatusValues = ["DRAFT", "ACTIVE", "EXPIRED", "RETIRED"] as const;
export const jurisdictionTypeValues = ["COUNTRY", "STATE_PROVINCE", "REGION", "REGULATORY_AUTHORITY", "OTHER"] as const;
export const agentRunStatusValues = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"] as const;
export const artifactTypeValues = ["ANALYSIS", "RESEARCH", "SUMMARY", "STRATEGY", "DRAFT", "RISK_ASSESSMENT", "VERIFICATION"] as const;
export const artifactStatusValues = ["DRAFT", "FINAL", "ARCHIVED", "SUPERSEDED"] as const;
export const draftStatusValues = ["DRAFT", "IN_REVIEW", "APPROVED", "REJECTED", "SENT", "ARCHIVED"] as const;
export const embeddingSourceTypeValues = ["EVIDENCE", "RESEARCH_SOURCE", "POLICY_CLAUSE", "FACT", "CLAIM", "ARTIFACT", "OTHER"] as const;
export const embeddingStatusValues = ["PENDING", "READY", "FAILED", "DELETED"] as const;
export const approvalStatusValues = ["PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED", "CANCELLED"] as const;
export const actionTypeValues = ["SEND_EMAIL", "CREATE_DRAFT", "SUBMIT_FORM", "REQUEST_INFORMATION", "ESCALATE", "SCHEDULE_FOLLOWUP"] as const;
export const actionStatusValues = ["DRAFT", "READY", "AWAITING_APPROVAL", "APPROVED", "PROCESSING", "COMPLETED", "FAILED", "CANCELLED"] as const;
export const responseStatusValues = ["PENDING", "RECEIVED", "NO_RESPONSE", "CLOSED"] as const;
export const deadlineTypeValues = ["RESPONSE", "FOLLOW_UP", "REVIEW", "SUBMISSION", "ESCALATION", "OTHER"] as const;
export const deadlineStatusValues = ["OPEN", "COMPLETED", "MISSED", "CANCELLED"] as const;
export const notificationTypeValues = ["APPROVAL", "ACTION", "RESPONSE", "DEADLINE", "SYSTEM", "SECURITY"] as const;
export const notificationSeverityValues = ["INFO", "WARNING", "ERROR", "CRITICAL"] as const;
export const notificationReadStateValues = ["UNREAD", "READ", "ARCHIVED"] as const;
export const integrationProviderValues = ["GMAIL", "OUTLOOK", "API", "WEBHOOK"] as const;
export const integrationStatusValues = ["DISCONNECTED", "PENDING", "CONNECTED", "ERROR", "REVOKED"] as const;
export const oauthTokenStatusValues = ["PENDING", "ACTIVE", "EXPIRED", "REVOKED", "ERROR"] as const;
export const deletionStatusValues = ["ACTIVE", "SCHEDULED", "LEGAL_HOLD", "DELETED"] as const;

/** Identity record backing Manus OAuth. The legacy authRole is only for framework auth compatibility. */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 320 }),
    name: varchar("name", { length: 255 }),
    avatar: varchar("avatar", { length: 1024 }),
    status: mysqlEnum("status", userStatusValues).default("ACTIVE").notNull(),
    /** Framework compatibility only; product authorization uses memberships, roles, and permissions. */
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    loginMethod: varchar("loginMethod", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
    statusIdx: index("users_status_idx").on(table.status),
    deletedAtIdx: index("users_deleted_at_idx").on(table.deletedAt),
  }),
);

export const organizations = mysqlTable(
  "organizations",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    status: mysqlEnum("status", organizationStatusValues).default("ACTIVE").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    slugUnique: uniqueIndex("organizations_slug_unique").on(table.slug),
    statusIdx: index("organizations_status_idx").on(table.status),
    deletedAtIdx: index("organizations_deleted_at_idx").on(table.deletedAt),
  }),
);

export const workspaces = mysqlTable(
  "workspaces",
  {
    id: int("id").autoincrement().primaryKey(),
    organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    status: mysqlEnum("status", workspaceStatusValues).default("ACTIVE").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    organizationSlugUnique: uniqueIndex("workspaces_organization_slug_unique").on(table.organizationId, table.slug),
    idOrganizationUnique: uniqueIndex("workspaces_id_organization_unique").on(table.id, table.organizationId),
    organizationIdx: index("workspaces_organization_idx").on(table.organizationId),
    statusIdx: index("workspaces_status_idx").on(table.status),
    deletedAtIdx: index("workspaces_deleted_at_idx").on(table.deletedAt),
  }),
);

export const roles = mysqlTable(
  "roles",
  {
    id: int("id").autoincrement().primaryKey(),
    code: mysqlEnum("code", roleValues).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    isSystem: boolean("isSystem").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeUnique: uniqueIndex("roles_code_unique").on(table.code),
  }),
);

export const memberships = mysqlTable(
  "memberships",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
    roleId: int("roleId").notNull().references(() => roles.id, { onDelete: "restrict", onUpdate: "cascade" }),
    status: mysqlEnum("status", membershipStatusValues).default("INVITED").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    removedAt: timestamp("removedAt"),
  },
  (table) => ({
    userWorkspaceUnique: uniqueIndex("memberships_user_organization_workspace_unique").on(table.userId, table.organizationId, table.workspaceId),
    userIdx: index("memberships_user_idx").on(table.userId),
    organizationIdx: index("memberships_organization_idx").on(table.organizationId),
    workspaceIdx: index("memberships_workspace_idx").on(table.workspaceId),
    roleIdx: index("memberships_role_idx").on(table.roleId),
    statusIdx: index("memberships_status_idx").on(table.status),
    tenantWorkspaceFk: foreignKey({
      columns: [table.workspaceId, table.organizationId],
      foreignColumns: [workspaces.id, workspaces.organizationId],
      name: "memberships_workspace_tenant_fk",
    }),
  }),
);

export const permissions = mysqlTable(
  "permissions",
  {
    id: int("id").autoincrement().primaryKey(),
    domain: mysqlEnum("domain", permissionDomainValues).notNull(),
    action: mysqlEnum("action", permissionActionValues).notNull(),
    permissionKey: varchar("permissionKey", { length: 80 }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    keyUnique: uniqueIndex("permissions_key_unique").on(table.permissionKey),
    domainActionUnique: uniqueIndex("permissions_domain_action_unique").on(table.domain, table.action),
    domainIdx: index("permissions_domain_idx").on(table.domain),
  }),
);

export const rolePermissions = mysqlTable(
  "rolePermissions",
  {
    roleId: int("roleId").notNull().references(() => roles.id, { onDelete: "cascade", onUpdate: "cascade" }),
    permissionId: int("permissionId").notNull().references(() => permissions.id, { onDelete: "cascade", onUpdate: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
    permissionIdx: index("role_permissions_permission_idx").on(table.permissionId),
  }),
);

export const cases = mysqlTable(
  "cases",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "restrict", onUpdate: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    company: varchar("company", { length: 255 }),
    category: mysqlEnum("category", caseCategoryValues).default("OTHER").notNull(),
    priority: mysqlEnum("priority", casePriorityValues).default("MEDIUM").notNull(),
    risk: mysqlEnum("risk", caseRiskValues).default("MEDIUM").notNull(),
    status: mysqlEnum("status", caseStatusValues).default("NEW").notNull(),
    desiredOutcome: text("desiredOutcome"),
    owner: int("owner").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    closedAt: timestamp("closedAt"),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    workspaceStatusIdx: index("cases_workspace_status_idx").on(table.workspaceId, table.status),
    workspaceUpdatedIdx: index("cases_workspace_updated_idx").on(table.workspaceId, table.updatedAt),
    ownerIdx: index("cases_owner_idx").on(table.owner),
    deletedAtIdx: index("cases_deleted_at_idx").on(table.deletedAt),
  }),
);

export const evidence = mysqlTable(
  "evidence",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: mysqlEnum("type", evidenceTypeValues).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    source: varchar("source", { length: 255 }),
    sourceIdentifier: varchar("sourceIdentifier", { length: 512 }),
    status: mysqlEnum("status", evidenceStatusValues).default("ACTIVE").notNull(),
    verificationState: mysqlEnum("verificationState", verificationStateValues).default("UNVERIFIED").notNull(),
    captureTime: timestamp("captureTime"),
    uploadedBy: int("uploadedBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    originalFilename: varchar("originalFilename", { length: 512 }),
    checksum: varchar("checksum", { length: 128 }),
    processingStatus: mysqlEnum("processingStatus", processingStatusValues).default("PENDING").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    deletedAt: timestamp("deletedAt"),
  },
  (table) => ({
    caseStatusIdx: index("evidence_case_status_idx").on(table.caseId, table.status),
    caseVerificationIdx: index("evidence_case_verification_idx").on(table.caseId, table.verificationState),
    sourceIdx: index("evidence_source_idx").on(table.source, table.sourceIdentifier),
    checksumIdx: index("evidence_checksum_idx").on(table.checksum),
    deletedAtIdx: index("evidence_deleted_at_idx").on(table.deletedAt),
  }),
);

/** Provider-agnostic object metadata; file bytes remain in S3-compatible storage, never in SQL. */
export const storedFiles = mysqlTable(
  "storedFiles",
  {
    id: int("id").autoincrement().primaryKey(),
    evidenceId: int("evidenceId").notNull().references(() => evidence.id, { onDelete: "cascade", onUpdate: "cascade" }),
    storageProvider: varchar("storageProvider", { length: 80 }).notNull(),
    storageKey: varchar("storageKey", { length: 1024 }).notNull(),
    mimeType: varchar("mimeType", { length: 255 }).notNull(),
    sizeBytes: bigint("sizeBytes", { mode: "number" }).notNull(),
    checksum: varchar("checksum", { length: 128 }).notNull(),
    filename: varchar("filename", { length: 512 }).notNull(),
    uploadedBy: int("uploadedBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    evidenceIdx: index("stored_files_evidence_idx").on(table.evidenceId),
    providerKeyUnique: uniqueIndex("stored_files_provider_key_unique").on(table.storageProvider, table.storageKey),
    checksumIdx: index("stored_files_checksum_idx").on(table.checksum),
  }),
);

export const timelineEvents = mysqlTable(
  "timelineEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    eventType: mysqlEnum("eventType", timelineEventTypeValues).notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    actor: int("actor").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    source: varchar("source", { length: 255 }),
    relatedEvidence: int("relatedEvidence").references(() => evidence.id, { onDelete: "set null", onUpdate: "cascade" }),
    metadata: json("metadata"),
  },
  (table) => ({
    caseTimeIdx: index("timeline_events_case_time_idx").on(table.caseId, table.timestamp),
    eventTypeIdx: index("timeline_events_type_idx").on(table.eventType),
  }),
);

export const facts = mysqlTable(
  "facts",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    statement: text("statement").notNull(),
    status: mysqlEnum("status", factStatusValues).default("UNVERIFIED").notNull(),
    createdBy: int("createdBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("facts_case_status_idx").on(table.caseId, table.status),
  }),
);

export const claims = mysqlTable(
  "claims",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    statement: text("statement").notNull(),
    statementType: mysqlEnum("statementType", statementClassificationValues).default("UNKNOWN").notNull(),
    status: mysqlEnum("status", claimStatusValues).default("PROPOSED").notNull(),
    confidence: int("confidence"),
    createdBy: int("createdBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("claims_case_status_idx").on(table.caseId, table.status),
  }),
);

export const citations = mysqlTable(
  "citations",
  {
    id: int("id").autoincrement().primaryKey(),
    claimId: int("claimId").notNull().references(() => claims.id, { onDelete: "cascade" }),
    evidenceId: int("evidenceId").notNull().references(() => evidence.id, { onDelete: "cascade" }),
    // Source link is resolved by the citation service; researchSources is declared later in this module.
    researchSourceId: int("researchSourceId"),
    factId: int("factId").references(() => facts.id, { onDelete: "set null", onUpdate: "cascade" }),
    excerpt: text("excerpt"),
    locator: varchar("locator", { length: 512 }),
    sourceRetrievedAt: timestamp("sourceRetrievedAt"),
    authoritySnapshot: varchar("authoritySnapshot", { length: 255 }),
    confidence: int("confidence"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    claimIdx: index("citations_claim_idx").on(table.claimId),
    evidenceIdx: index("citations_evidence_idx").on(table.evidenceId),
    researchSourceIdx: index("citations_research_source_idx").on(table.researchSourceId),
    factIdx: index("citations_fact_idx").on(table.factId),
  }),
);

export const researchRuns = mysqlTable(
  "researchRuns",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    query: text("query").notNull(),
    status: mysqlEnum("status", researchRunStatusValues).default("PENDING").notNull(),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    requester: int("requester").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("research_runs_case_status_idx").on(table.caseId, table.status),
    requesterIdx: index("research_runs_requester_idx").on(table.requester),
  }),
);

export const jurisdictions = mysqlTable(
  "jurisdictions",
  {
    id: int("id").autoincrement().primaryKey(),
    country: varchar("country", { length: 120 }),
    stateProvince: varchar("stateProvince", { length: 120 }),
    region: varchar("region", { length: 120 }),
    regulatoryAuthority: varchar("regulatoryAuthority", { length: 255 }),
    type: mysqlEnum("type", jurisdictionTypeValues).notNull(),
    code: varchar("code", { length: 80 }),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeTypeUnique: uniqueIndex("jurisdictions_code_type_unique").on(table.code, table.type),
    countryRegionIdx: index("jurisdictions_country_region_idx").on(table.country, table.region),
  }),
);

export const researchSources = mysqlTable(
  "researchSources",
  {
    id: int("id").autoincrement().primaryKey(),
    researchRunId: int("researchRunId").notNull().references(() => researchRuns.id, { onDelete: "cascade", onUpdate: "cascade" }),
    url: varchar("url", { length: 2048 }),
    reference: varchar("reference", { length: 1024 }),
    title: varchar("title", { length: 512 }).notNull(),
    authority: varchar("authority", { length: 255 }),
    publicationDate: timestamp("publicationDate"),
    effectiveDate: timestamp("effectiveDate"),
    freshness: mysqlEnum("freshness", freshnessValues).default("UNKNOWN").notNull(),
    sourceType: mysqlEnum("sourceType", researchSourceTypeValues).notNull(),
    status: mysqlEnum("status", researchSourceStatusValues).default("UNVERIFIED").notNull(),
    jurisdictionId: int("jurisdictionId").references(() => jurisdictions.id, { onDelete: "set null", onUpdate: "cascade" }),
    checksum: varchar("checksum", { length: 128 }),
    retrievedAt: timestamp("retrievedAt").defaultNow().notNull(),
    expirationDate: timestamp("expirationDate"),
    supersededBy: int("supersededBy"),
    version: int("version").default(1).notNull(),
    confidence: int("confidence"),
    verificationStatus: mysqlEnum("verificationStatus", verificationStateValues).default("UNVERIFIED").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    researchRunIdx: index("research_sources_run_idx").on(table.researchRunId),
    jurisdictionIdx: index("research_sources_jurisdiction_idx").on(table.jurisdictionId),
    freshnessIdx: index("research_sources_freshness_idx").on(table.freshness),
    supersededByIdx: index("research_sources_superseded_by_idx").on(table.supersededBy),
  }),
);

export const sourceSnapshots = mysqlTable(
  "sourceSnapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    researchSourceId: int("researchSourceId").notNull().references(() => researchSources.id, { onDelete: "cascade", onUpdate: "cascade" }),
    sourceHash: varchar("sourceHash", { length: 128 }).notNull(),
    retrievedAt: timestamp("retrievedAt").defaultNow().notNull(),
    normalizedContentRef: varchar("normalizedContentRef", { length: 1024 }),
    versionMetadata: json("versionMetadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("source_snapshots_source_idx").on(table.researchSourceId),
    hashIdx: index("source_snapshots_hash_idx").on(table.sourceHash),
  }),
);

export const policies = mysqlTable(
  "policies",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    source: varchar("source", { length: 1024 }),
    workspaceId: int("workspaceId").references(() => workspaces.id, { onDelete: "set null", onUpdate: "cascade" }),
    jurisdictionId: int("jurisdictionId").references(() => jurisdictions.id, { onDelete: "set null", onUpdate: "cascade" }),
    status: mysqlEnum("status", policyStatusValues).default("DRAFT").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    jurisdictionIdx: index("policies_jurisdiction_idx").on(table.jurisdictionId),
    workspaceIdx: index("policies_workspace_idx").on(table.workspaceId),
    statusIdx: index("policies_status_idx").on(table.status),
  }),
);

export const policyVersions = mysqlTable(
  "policyVersions",
  {
    id: int("id").autoincrement().primaryKey(),
    policyId: int("policyId").notNull().references(() => policies.id, { onDelete: "cascade", onUpdate: "cascade" }),
    versionNumber: int("versionNumber").notNull(),
    effectiveDate: timestamp("effectiveDate"),
    expirationDate: timestamp("expirationDate"),
    source: varchar("source", { length: 1024 }),
    status: mysqlEnum("status", policyVersionStatusValues).default("DRAFT").notNull(),
    checksum: varchar("checksum", { length: 128 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    policyVersionUnique: uniqueIndex("policy_versions_policy_version_unique").on(table.policyId, table.versionNumber),
    effectiveDateIdx: index("policy_versions_effective_date_idx").on(table.effectiveDate),
  }),
);

export const policyClauses = mysqlTable(
  "policyClauses",
  {
    id: int("id").autoincrement().primaryKey(),
    policyVersionId: int("policyVersionId").notNull().references(() => policyVersions.id, { onDelete: "cascade", onUpdate: "cascade" }),
    clauseNumber: varchar("clauseNumber", { length: 80 }).notNull(),
    title: varchar("title", { length: 255 }),
    text: text("text").notNull(),
    checksum: varchar("checksum", { length: 128 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    versionClauseUnique: uniqueIndex("policy_clauses_version_number_unique").on(table.policyVersionId, table.clauseNumber),
  }),
);

export const agentRuns = mysqlTable(
  "agentRuns",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    agentType: varchar("agentType", { length: 120 }).notNull(),
    status: mysqlEnum("status", agentRunStatusValues).default("QUEUED").notNull(),
    provider: varchar("provider", { length: 120 }),
    model: varchar("model", { length: 255 }),
    modelVersion: varchar("modelVersion", { length: 120 }),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    inputTokens: int("inputTokens"),
    outputTokens: int("outputTokens"),
    estimatedCost: decimal("estimatedCost", { precision: 18, scale: 8 }),
    errorState: text("errorState"),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("agent_runs_case_status_idx").on(table.caseId, table.status),
    agentTypeIdx: index("agent_runs_agent_type_idx").on(table.agentType),
  }),
);

export const artifacts = mysqlTable(
  "artifacts",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    agentRunId: int("agentRunId").references(() => agentRuns.id, { onDelete: "set null", onUpdate: "cascade" }),
    researchSourceId: int("researchSourceId").references(() => researchSources.id, { onDelete: "set null", onUpdate: "cascade" }),
    type: mysqlEnum("type", artifactTypeValues).notNull(),
    status: mysqlEnum("status", artifactStatusValues).default("DRAFT").notNull(),
    version: int("version").default(1).notNull(),
    content: text("content").notNull(),
    author: int("author").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    source: varchar("source", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseTypeVersionUnique: uniqueIndex("artifacts_case_type_version_unique").on(table.caseId, table.type, table.version),
    caseStatusIdx: index("artifacts_case_status_idx").on(table.caseId, table.status),
    agentRunIdx: index("artifacts_agent_run_idx").on(table.agentRunId),
    researchSourceIdx: index("artifacts_research_source_idx").on(table.researchSourceId),
  }),
);

export const drafts = mysqlTable(
  "drafts",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    author: int("author").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    status: mysqlEnum("status", draftStatusValues).default("DRAFT").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    currentVersion: int("currentVersion").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("drafts_case_status_idx").on(table.caseId, table.status),
  }),
);

export const draftVersions = mysqlTable(
  "draftVersions",
  {
    id: int("id").autoincrement().primaryKey(),
    draftId: int("draftId").notNull().references(() => drafts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    version: int("version").notNull(),
    author: int("author").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    status: mysqlEnum("status", draftStatusValues).default("DRAFT").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    draftVersionUnique: uniqueIndex("draft_versions_draft_version_unique").on(table.draftId, table.version),
    draftCreatedIdx: index("draft_versions_draft_created_idx").on(table.draftId, table.createdAt),
  }),
);

/** Provider-neutral vector groundwork; no vector engine or RAG pipeline is executed in Phase 2. */
export const embeddingMetadata = mysqlTable(
  "embeddingMetadata",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceType: mysqlEnum("sourceType", embeddingSourceTypeValues).notNull(),
    sourceId: int("sourceId").notNull(),
    provider: varchar("provider", { length: 120 }).notNull(),
    model: varchar("model", { length: 255 }).notNull(),
    modelVersion: varchar("modelVersion", { length: 120 }),
    dimensions: int("dimensions"),
    status: mysqlEnum("status", embeddingStatusValues).default("PENDING").notNull(),
    checksum: varchar("checksum", { length: 128 }),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sourceIdx: index("embedding_metadata_source_idx").on(table.sourceType, table.sourceId),
    modelIdx: index("embedding_metadata_model_idx").on(table.provider, table.model),
    checksumIdx: index("embedding_metadata_checksum_idx").on(table.checksum),
  }),
);

export const approvals = mysqlTable(
  "approvals",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    requestedBy: int("requestedBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    reviewer: int("reviewer").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    draftId: int("draftId").references(() => drafts.id, { onDelete: "set null", onUpdate: "cascade" }),
    action: mysqlEnum("action", actionTypeValues).notNull(),
    risk: mysqlEnum("risk", caseRiskValues).default("MEDIUM").notNull(),
    status: mysqlEnum("status", approvalStatusValues).default("PENDING").notNull(),
    reason: text("reason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("approvals_case_status_idx").on(table.caseId, table.status),
    reviewerIdx: index("approvals_reviewer_idx").on(table.reviewer, table.status),
    draftIdx: index("approvals_draft_idx").on(table.draftId),
  }),
);

export const actions = mysqlTable(
  "actions",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: mysqlEnum("type", actionTypeValues).notNull(),
    status: mysqlEnum("status", actionStatusValues).default("DRAFT").notNull(),
    requestedBy: int("requestedBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    approvalId: int("approvalId").references(() => approvals.id, { onDelete: "set null", onUpdate: "cascade" }),
    payloadMetadata: json("payloadMetadata"),
    scheduledAt: timestamp("scheduledAt"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    errorState: text("errorState"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("actions_case_status_idx").on(table.caseId, table.status),
    approvalIdx: index("actions_approval_idx").on(table.approvalId),
  }),
);

export const responses = mysqlTable(
  "responses",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    actionId: int("actionId").references(() => actions.id, { onDelete: "set null", onUpdate: "cascade" }),
    externalReference: varchar("externalReference", { length: 512 }),
    status: mysqlEnum("status", responseStatusValues).default("PENDING").notNull(),
    receivedAt: timestamp("receivedAt"),
    contentMetadata: json("contentMetadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseStatusIdx: index("responses_case_status_idx").on(table.caseId, table.status),
    externalReferenceIdx: index("responses_external_reference_idx").on(table.externalReference),
  }),
);

export const deadlines = mysqlTable(
  "deadlines",
  {
    id: int("id").autoincrement().primaryKey(),
    caseId: int("caseId").notNull().references(() => cases.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: mysqlEnum("type", deadlineTypeValues).notNull(),
    dueAt: timestamp("dueAt").notNull(),
    source: varchar("source", { length: 255 }),
    status: mysqlEnum("status", deadlineStatusValues).default("OPEN").notNull(),
    priority: mysqlEnum("priority", casePriorityValues).default("MEDIUM").notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    caseDueIdx: index("deadlines_case_due_idx").on(table.caseId, table.dueAt),
    statusDueIdx: index("deadlines_status_due_idx").on(table.status, table.dueAt),
  }),
);

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    recipient: int("recipient").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
    workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: mysqlEnum("type", notificationTypeValues).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    severity: mysqlEnum("severity", notificationSeverityValues).default("INFO").notNull(),
    readState: mysqlEnum("readState", notificationReadStateValues).default("UNREAD").notNull(),
    relatedResourceType: varchar("relatedResourceType", { length: 120 }),
    relatedResourceId: int("relatedResourceId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    readAt: timestamp("readAt"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    recipientStateIdx: index("notifications_recipient_state_idx").on(table.recipient, table.readState),
    workspaceCreatedIdx: index("notifications_workspace_created_idx").on(table.workspaceId, table.createdAt),
  }),
);

/** Append-only audit record. There is intentionally no updatedAt/deletedAt field or edit helper. */
export const auditLogs = mysqlTable(
  "auditLogs",
  {
    id: int("id").autoincrement().primaryKey(),
    actor: int("actor").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    organizationId: int("organizationId").references(() => organizations.id, { onDelete: "set null", onUpdate: "cascade" }),
    workspaceId: int("workspaceId").references(() => workspaces.id, { onDelete: "set null", onUpdate: "cascade" }),
    action: varchar("action", { length: 120 }).notNull(),
    resourceType: varchar("resourceType", { length: 120 }).notNull(),
    resourceId: int("resourceId"),
    caseId: int("caseId").references(() => cases.id, { onDelete: "set null", onUpdate: "cascade" }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    metadata: json("metadata"),
    requestCorrelationId: varchar("requestCorrelationId", { length: 120 }),
  },
  (table) => ({
    resourceIdx: index("audit_logs_resource_idx").on(table.resourceType, table.resourceId),
    tenantTimeIdx: index("audit_logs_tenant_time_idx").on(table.organizationId, table.workspaceId, table.timestamp),
    caseTimeIdx: index("audit_logs_case_time_idx").on(table.caseId, table.timestamp),
    correlationIdx: index("audit_logs_correlation_idx").on(table.requestCorrelationId),
  }),
);

export const integrations = mysqlTable(
  "integrations",
  {
    id: int("id").autoincrement().primaryKey(),
    workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" }),
    provider: mysqlEnum("provider", integrationProviderValues).notNull(),
    status: mysqlEnum("status", integrationStatusValues).default("DISCONNECTED").notNull(),
    connectedBy: int("connectedBy").references(() => users.id, { onDelete: "set null", onUpdate: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceProviderUnique: uniqueIndex("integrations_workspace_provider_unique").on(table.workspaceId, table.provider),
    workspaceStatusIdx: index("integrations_workspace_status_idx").on(table.workspaceId, table.status),
  }),
);

/** Server-only OAuth metadata; encryptedSecretRef points to secure storage and is never a raw token. */
export const oauthConnections = mysqlTable(
  "oauthConnections",
  {
    id: int("id").autoincrement().primaryKey(),
    integrationId: int("integrationId").notNull().references(() => integrations.id, { onDelete: "cascade", onUpdate: "cascade" }),
    provider: mysqlEnum("provider", integrationProviderValues).notNull(),
    accountReference: varchar("accountReference", { length: 512 }).notNull(),
    scopes: json("scopes"),
    tokenStatus: mysqlEnum("tokenStatus", oauthTokenStatusValues).default("PENDING").notNull(),
    tokenExpiresAt: timestamp("tokenExpiresAt"),
    tokenMetadata: json("tokenMetadata"),
    encryptedSecretRef: varchar("encryptedSecretRef", { length: 1024 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    integrationUnique: uniqueIndex("oauth_connections_integration_unique").on(table.integrationId),
    providerAccountIdx: index("oauth_connections_provider_account_idx").on(table.provider, table.accountReference),
    tokenStatusIdx: index("oauth_connections_token_status_idx").on(table.tokenStatus),
  }),
);

/** Retention metadata only. Phase 2 never runs automatic deletion. */
export const retentionMetadata = mysqlTable(
  "retentionMetadata",
  {
    id: int("id").autoincrement().primaryKey(),
    organizationId: int("organizationId").references(() => organizations.id, { onDelete: "set null", onUpdate: "cascade" }),
    resourceType: varchar("resourceType", { length: 120 }).notNull(),
    resourceId: int("resourceId"),
    retentionDuration: int("retentionDuration").notNull(),
    organizationPolicy: varchar("organizationPolicy", { length: 255 }).notNull(),
    legalHold: boolean("legalHold").default(false).notNull(),
    deletionStatus: mysqlEnum("deletionStatus", deletionStatusValues).default("ACTIVE").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    resourceIdx: index("retention_metadata_resource_idx").on(table.resourceType, table.resourceId),
    organizationStatusIdx: index("retention_metadata_org_status_idx").on(table.organizationId, table.deletionStatus),
    legalHoldIdx: index("retention_metadata_legal_hold_idx").on(table.legalHold),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Organization = typeof organizations.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;
export type Case = typeof cases.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type StoredFile = typeof storedFiles.$inferSelect;
export type TimelineEvent = typeof timelineEvents.$inferSelect;
export type Fact = typeof facts.$inferSelect;
export type Claim = typeof claims.$inferSelect;
export type Citation = typeof citations.$inferSelect;
export type ResearchRun = typeof researchRuns.$inferSelect;
export type ResearchSource = typeof researchSources.$inferSelect;
export type Jurisdiction = typeof jurisdictions.$inferSelect;
export type Policy = typeof policies.$inferSelect;
export type PolicyVersion = typeof policyVersions.$inferSelect;
export type PolicyClause = typeof policyClauses.$inferSelect;
export type AgentRun = typeof agentRuns.$inferSelect;
export type Artifact = typeof artifacts.$inferSelect;
export type Draft = typeof drafts.$inferSelect;
export type DraftVersion = typeof draftVersions.$inferSelect;
export type EmbeddingMetadata = typeof embeddingMetadata.$inferSelect;
export type Approval = typeof approvals.$inferSelect;
export type Action = typeof actions.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type Deadline = typeof deadlines.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type OAuthConnection = typeof oauthConnections.$inferSelect;
export type RetentionMetadata = typeof retentionMetadata.$inferSelect;
