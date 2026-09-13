import { relations } from "drizzle-orm";
import {
  actions,
  agentRuns,
  approvals,
  auditLogs,
  artifacts,
  cases,
  citations,
  claims,
  draftVersions,
  drafts,
  embeddingMetadata,
  deadlines,
  evidence,
  facts,
  jurisdictions,
  memberships,
  integrations,
  notifications,
  oauthConnections,
  organizations,
  permissions,
  policies,
  policyClauses,
  policyVersions,
  responses,
  retentionMetadata,
  researchRuns,
  researchSources,
  rolePermissions,
  roles,
  storedFiles,
  timelineEvents,
  users,
  workspaces,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  ownedCases: many(cases, { relationName: "caseOwner" }),
  uploadedEvidence: many(evidence, { relationName: "evidenceUploader" }),
  uploadedFiles: many(storedFiles, { relationName: "fileUploader" }),
  timelineEvents: many(timelineEvents, { relationName: "timelineActor" }),
  createdFacts: many(facts, { relationName: "factCreator" }),
  createdClaims: many(claims, { relationName: "claimCreator" }),
  requestedResearchRuns: many(researchRuns, { relationName: "researchRequester" }),
  artifactAuthors: many(artifacts, { relationName: "artifactAuthor" }),
  draftAuthors: many(drafts, { relationName: "draftAuthor" }),
  draftVersionAuthors: many(draftVersions, { relationName: "draftVersionAuthor" }),
  requestedApprovals: many(approvals, { relationName: "approvalRequester" }),
  reviewedApprovals: many(approvals, { relationName: "approvalReviewer" }),
  requestedActions: many(actions, { relationName: "actionRequester" }),
  notifications: many(notifications, { relationName: "notificationRecipient" }),
  auditLogs: many(auditLogs, { relationName: "auditActor" }),
  connectedIntegrations: many(integrations, { relationName: "integrationConnector" }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  workspaces: many(workspaces),
  memberships: many(memberships),
  auditLogs: many(auditLogs),
  retentionMetadata: many(retentionMetadata),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  organization: one(organizations, { fields: [workspaces.organizationId], references: [organizations.id] }),
  memberships: many(memberships),
  cases: many(cases),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  integrations: many(integrations),
  policies: many(policies),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
  organization: one(organizations, { fields: [memberships.organizationId], references: [organizations.id] }),
  workspace: one(workspaces, { fields: [memberships.workspaceId], references: [workspaces.id] }),
  role: one(roles, { fields: [memberships.roleId], references: [roles.id] }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({ memberships: many(memberships), permissions: many(rolePermissions) }));
export const permissionsRelations = relations(permissions, ({ many }) => ({ roles: many(rolePermissions) }));
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, { fields: [rolePermissions.roleId], references: [roles.id] }),
  permission: one(permissions, { fields: [rolePermissions.permissionId], references: [permissions.id] }),
}));

export const casesRelations = relations(cases, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [cases.workspaceId], references: [workspaces.id] }),
  owner: one(users, { fields: [cases.owner], references: [users.id], relationName: "caseOwner" }),
  evidence: many(evidence),
  timelineEvents: many(timelineEvents),
  facts: many(facts),
  claims: many(claims),
  researchRuns: many(researchRuns),
  agentRuns: many(agentRuns),
  artifacts: many(artifacts),
  drafts: many(drafts),
  approvals: many(approvals),
  actions: many(actions),
  responses: many(responses),
  deadlines: many(deadlines),
  auditLogs: many(auditLogs),
}));

export const evidenceRelations = relations(evidence, ({ one, many }) => ({
  case: one(cases, { fields: [evidence.caseId], references: [cases.id] }),
  uploader: one(users, { fields: [evidence.uploadedBy], references: [users.id], relationName: "evidenceUploader" }),
  files: many(storedFiles),
  timelineEvents: many(timelineEvents, { relationName: "evidenceTimeline" }),
  citations: many(citations),
}));

export const storedFilesRelations = relations(storedFiles, ({ one }) => ({
  evidence: one(evidence, { fields: [storedFiles.evidenceId], references: [evidence.id] }),
  uploader: one(users, { fields: [storedFiles.uploadedBy], references: [users.id], relationName: "fileUploader" }),
}));

export const timelineEventsRelations = relations(timelineEvents, ({ one }) => ({
  case: one(cases, { fields: [timelineEvents.caseId], references: [cases.id] }),
  actor: one(users, { fields: [timelineEvents.actor], references: [users.id], relationName: "timelineActor" }),
  evidence: one(evidence, { fields: [timelineEvents.relatedEvidence], references: [evidence.id], relationName: "evidenceTimeline" }),
}));

export const factsRelations = relations(facts, ({ one, many }) => ({
  case: one(cases, { fields: [facts.caseId], references: [cases.id] }),
  creator: one(users, { fields: [facts.createdBy], references: [users.id], relationName: "factCreator" }),
  citations: many(citations),
}));

export const claimsRelations = relations(claims, ({ one, many }) => ({
  case: one(cases, { fields: [claims.caseId], references: [cases.id] }),
  creator: one(users, { fields: [claims.createdBy], references: [users.id], relationName: "claimCreator" }),
  citations: many(citations),
}));

export const citationsRelations = relations(citations, ({ one }) => ({
  claim: one(claims, { fields: [citations.claimId], references: [claims.id] }),
  evidence: one(evidence, { fields: [citations.evidenceId], references: [evidence.id] }),
  fact: one(facts, { fields: [citations.factId], references: [facts.id] }),
}));

export const researchRunsRelations = relations(researchRuns, ({ one, many }) => ({
  case: one(cases, { fields: [researchRuns.caseId], references: [cases.id] }),
  requester: one(users, { fields: [researchRuns.requester], references: [users.id], relationName: "researchRequester" }),
  sources: many(researchSources),
}));

export const researchSourcesRelations = relations(researchSources, ({ one, many }) => ({
  researchRun: one(researchRuns, { fields: [researchSources.researchRunId], references: [researchRuns.id] }),
  jurisdiction: one(jurisdictions, { fields: [researchSources.jurisdictionId], references: [jurisdictions.id] }),
  artifacts: many(artifacts, { relationName: "researchArtifact" }),
}));

export const jurisdictionsRelations = relations(jurisdictions, ({ many }) => ({
  researchSources: many(researchSources),
  policies: many(policies),
}));

export const policiesRelations = relations(policies, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [policies.workspaceId], references: [workspaces.id] }),
  jurisdiction: one(jurisdictions, { fields: [policies.jurisdictionId], references: [jurisdictions.id] }),
  versions: many(policyVersions),
}));

export const policyVersionsRelations = relations(policyVersions, ({ one, many }) => ({
  policy: one(policies, { fields: [policyVersions.policyId], references: [policies.id] }),
  clauses: many(policyClauses),
}));

export const policyClausesRelations = relations(policyClauses, ({ one }) => ({
  policyVersion: one(policyVersions, { fields: [policyClauses.policyVersionId], references: [policyVersions.id] }),
}));

export const agentRunsRelations = relations(agentRuns, ({ one, many }) => ({
  case: one(cases, { fields: [agentRuns.caseId], references: [cases.id] }),
  artifacts: many(artifacts),
}));

export const artifactsRelations = relations(artifacts, ({ one }) => ({
  case: one(cases, { fields: [artifacts.caseId], references: [cases.id] }),
  agentRun: one(agentRuns, { fields: [artifacts.agentRunId], references: [agentRuns.id] }),
  researchSource: one(researchSources, { fields: [artifacts.researchSourceId], references: [researchSources.id], relationName: "researchArtifact" }),
  author: one(users, { fields: [artifacts.author], references: [users.id], relationName: "artifactAuthor" }),
}));

export const draftsRelations = relations(drafts, ({ one, many }) => ({
  case: one(cases, { fields: [drafts.caseId], references: [cases.id] }),
  author: one(users, { fields: [drafts.author], references: [users.id], relationName: "draftAuthor" }),
  versions: many(draftVersions),
  approvals: many(approvals),
}));

export const draftVersionsRelations = relations(draftVersions, ({ one }) => ({
  draft: one(drafts, { fields: [draftVersions.draftId], references: [drafts.id] }),
  author: one(users, { fields: [draftVersions.author], references: [users.id], relationName: "draftVersionAuthor" }),
}));

// embeddingMetadata intentionally has polymorphic sourceId metadata rather than unsafe cross-table foreign keys.
export const embeddingMetadataRelations = relations(embeddingMetadata, () => ({}));

export const approvalsRelations = relations(approvals, ({ one, many }) => ({
  case: one(cases, { fields: [approvals.caseId], references: [cases.id] }),
  requester: one(users, { fields: [approvals.requestedBy], references: [users.id], relationName: "approvalRequester" }),
  reviewer: one(users, { fields: [approvals.reviewer], references: [users.id], relationName: "approvalReviewer" }),
  draft: one(drafts, { fields: [approvals.draftId], references: [drafts.id] }),
  actions: many(actions),
}));

export const actionsRelations = relations(actions, ({ one, many }) => ({
  case: one(cases, { fields: [actions.caseId], references: [cases.id] }),
  requester: one(users, { fields: [actions.requestedBy], references: [users.id], relationName: "actionRequester" }),
  approval: one(approvals, { fields: [actions.approvalId], references: [approvals.id] }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  case: one(cases, { fields: [responses.caseId], references: [cases.id] }),
  action: one(actions, { fields: [responses.actionId], references: [actions.id] }),
}));

export const deadlinesRelations = relations(deadlines, ({ one }) => ({
  case: one(cases, { fields: [deadlines.caseId], references: [cases.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, { fields: [notifications.recipient], references: [users.id], relationName: "notificationRecipient" }),
  workspace: one(workspaces, { fields: [notifications.workspaceId], references: [workspaces.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actor], references: [users.id], relationName: "auditActor" }),
  organization: one(organizations, { fields: [auditLogs.organizationId], references: [organizations.id] }),
  workspace: one(workspaces, { fields: [auditLogs.workspaceId], references: [workspaces.id] }),
  case: one(cases, { fields: [auditLogs.caseId], references: [cases.id] }),
}));

export const integrationsRelations = relations(integrations, ({ one }) => ({
  workspace: one(workspaces, { fields: [integrations.workspaceId], references: [workspaces.id] }),
  connectedBy: one(users, { fields: [integrations.connectedBy], references: [users.id], relationName: "integrationConnector" }),
  oauthConnection: one(oauthConnections),
}));

export const oauthConnectionsRelations = relations(oauthConnections, ({ one }) => ({
  integration: one(integrations, { fields: [oauthConnections.integrationId], references: [integrations.id] }),
}));

export const retentionMetadataRelations = relations(retentionMetadata, ({ one }) => ({
  organization: one(organizations, { fields: [retentionMetadata.organizationId], references: [organizations.id] }),
}));
