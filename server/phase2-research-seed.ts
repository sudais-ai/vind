import { and, eq, asc } from "drizzle-orm";
import {
  agentRuns,
  artifacts,
  cases,
  draftVersions,
  drafts,
  embeddingMetadata,
  jurisdictions,
  memberships,
  organizations,
  policies,
  policyClauses,
  policyVersions,
  researchRuns,
  researchSources,
  roles,
  users,
  workspaces,
} from "../drizzle/schema";
import { ACCESS_ROLES } from "../shared/access-control";
import { getDb } from "./db";

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available");

  const suffix = Date.now().toString(36);
  const openId = `phase2-research-seed-${suffix}`;
  const organizationSlug = `phase2-research-org-${suffix}`;
  const workspaceSlug = `phase2-research-workspace-${suffix}`;
  let userId: number | undefined;
  let organizationId: number | undefined;
  let workspaceId: number | undefined;
  let membershipId: number | undefined;
  let caseId: number | undefined;
  let jurisdictionId: number | undefined;
  let policyId: number | undefined;
  let draftId: number | undefined;
  let embeddingId: number | undefined;

  try {
    await db.insert(users).values({ openId, email: `${suffix}@research-seed.invalid`, name: "Phase 2 Research Seed User", status: "ACTIVE", role: "user" });
    const [user] = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    if (!user) throw new Error("Seed user was not created");
    userId = user.id;

    await db.insert(organizations).values({ name: "Phase 2 Research Seed Organization", slug: organizationSlug, status: "ACTIVE" });
    const [organization] = await db.select().from(organizations).where(eq(organizations.slug, organizationSlug)).limit(1);
    if (!organization) throw new Error("Seed organization was not created");
    organizationId = organization.id;

    await db.insert(workspaces).values({ organizationId, name: "Phase 2 Research Seed Workspace", slug: workspaceSlug, status: "ACTIVE" });
    const [workspace] = await db.select().from(workspaces).where(and(eq(workspaces.organizationId, organizationId), eq(workspaces.slug, workspaceSlug))).limit(1);
    if (!workspace) throw new Error("Seed workspace was not created");
    workspaceId = workspace.id;

    const [ownerRole] = await db.select().from(roles).where(eq(roles.code, ACCESS_ROLES[0])).limit(1);
    if (!ownerRole) throw new Error("OWNER role is not seeded");
    await db.insert(memberships).values({ userId, organizationId, workspaceId, roleId: ownerRole.id, status: "ACTIVE" });
    const [membership] = await db.select().from(memberships).where(and(eq(memberships.userId, userId), eq(memberships.workspaceId, workspaceId))).limit(1);
    if (!membership) throw new Error("Seed membership was not created");
    membershipId = membership.id;

    await db.insert(cases).values({ workspaceId, title: "Research-to-draft verification case", description: "Temporary verification case for Phase 2 foundation relationships.", company: "Northwind", category: "COMPLIANCE", priority: "MEDIUM", risk: "MEDIUM", status: "RESEARCHING", desiredOutcome: "Confirm the policy-backed response path.", owner: userId });
    const [caseRow] = await db.select().from(cases).where(and(eq(cases.workspaceId, workspaceId), eq(cases.title, "Research-to-draft verification case"))).limit(1);
    if (!caseRow) throw new Error("Seed case was not created");
    caseId = caseRow.id;

    await db.insert(jurisdictions).values({ country: "United States", stateProvince: "California", region: "West", regulatoryAuthority: "Example Consumer Authority", type: "STATE_PROVINCE", code: `US-CA-${suffix}`, name: "California" });
    const [jurisdiction] = await db.select().from(jurisdictions).where(eq(jurisdictions.code, `US-CA-${suffix}`)).limit(1);
    if (!jurisdiction) throw new Error("Seed jurisdiction was not created");
    jurisdictionId = jurisdiction.id;

    await db.insert(researchRuns).values({ caseId, query: "Applicable billing dispute requirements", status: "COMPLETED", startedAt: new Date(), completedAt: new Date(), requester: userId, metadata: { phase: 2, executed: false } });
    const [researchRun] = await db.select().from(researchRuns).where(eq(researchRuns.caseId, caseId)).limit(1);
    if (!researchRun) throw new Error("Seed research run was not created");
    await db.insert(researchSources).values({ researchRunId: researchRun.id, url: "https://example.invalid/regulatory/billing", reference: "REG-2026-09", title: "Example billing requirements", authority: "Example Consumer Authority", publicationDate: new Date(), effectiveDate: new Date(), freshness: "FRESH", sourceType: "REGULATORY", status: "ACTIVE", jurisdictionId, checksum: "sha256:research-source" });
    const [researchSource] = await db.select().from(researchSources).where(eq(researchSources.researchRunId, researchRun.id)).limit(1);
    if (!researchSource) throw new Error("Seed research source was not created");

    await db.insert(policies).values({ name: "Billing Resolution Policy", description: "Versioned review policy for billing disputes.", source: "Internal policy registry", jurisdictionId, status: "ACTIVE" });
    const [policy] = await db.select().from(policies).where(and(eq(policies.name, "Billing Resolution Policy"), eq(policies.jurisdictionId, jurisdictionId))).limit(1);
    if (!policy) throw new Error("Seed policy was not created");
    policyId = policy.id;
    await db.insert(policyVersions).values({ policyId, versionNumber: 1, effectiveDate: new Date(), source: "Internal policy registry", status: "ACTIVE", checksum: "sha256:policy-v1" });
    const [policyVersion] = await db.select().from(policyVersions).where(and(eq(policyVersions.policyId, policyId), eq(policyVersions.versionNumber, 1))).limit(1);
    if (!policyVersion) throw new Error("Seed policy version was not created");
    await db.insert(policyClauses).values({ policyVersionId: policyVersion.id, clauseNumber: "4.2", title: "Evidence before response", text: "Verify source records before issuing a consequential response.", checksum: "sha256:policy-clause-4-2" });
    const [policyClause] = await db.select().from(policyClauses).where(eq(policyClauses.policyVersionId, policyVersion.id)).limit(1);
    if (!policyClause) throw new Error("Seed policy clause was not created");

    await db.insert(agentRuns).values({ caseId, agentType: "research-review", status: "SUCCEEDED", provider: "not-executed", model: "foundation-placeholder", modelVersion: "phase-2", startedAt: new Date(), completedAt: new Date(), inputTokens: 0, outputTokens: 0, estimatedCost: "0", metadata: { execution: "deferred-to-phase-3" } });
    const [agentRun] = await db.select().from(agentRuns).where(eq(agentRuns.caseId, caseId)).limit(1);
    if (!agentRun) throw new Error("Seed AgentRun was not created");
    await db.insert(artifacts).values({ caseId, agentRunId: agentRun.id, researchSourceId: researchSource.id, type: "RESEARCH", status: "FINAL", version: 1, content: "Research artifact placeholder linked to the source and policy foundation.", author: userId, source: `research-source:${researchSource.id}` });
    const [artifact] = await db.select().from(artifacts).where(eq(artifacts.agentRunId, agentRun.id)).limit(1);
    if (!artifact) throw new Error("Seed artifact was not created");

    await db.insert(drafts).values({ caseId, author: userId, status: "IN_REVIEW", title: "Policy-backed response draft", currentVersion: 1 });
    const [draft] = await db.select().from(drafts).where(and(eq(drafts.caseId, caseId), eq(drafts.title, "Policy-backed response draft"))).limit(1);
    if (!draft) throw new Error("Seed draft was not created");
    draftId = draft.id;
    await db.insert(draftVersions).values({ draftId, version: 1, author: userId, status: "DRAFT", content: "Version 1: initial policy-backed response." });
    await db.insert(draftVersions).values({ draftId, version: 2, author: userId, status: "IN_REVIEW", content: "Version 2: refined response with evidence and policy citation." });
    await db.update(drafts).set({ currentVersion: 2, updatedAt: new Date() }).where(eq(drafts.id, draftId));

    await db.insert(embeddingMetadata).values({ sourceType: "POLICY_CLAUSE", sourceId: policyClause.id, provider: "provider-neutral", model: "embedding-placeholder", modelVersion: "phase-2", dimensions: 0, status: "PENDING", checksum: "sha256:policy-clause-4-2" });
    const [embedding] = await db.select().from(embeddingMetadata).where(and(eq(embeddingMetadata.sourceType, "POLICY_CLAUSE"), eq(embeddingMetadata.sourceId, policyClause.id))).limit(1);
    if (!embedding) throw new Error("Embedding metadata was not created");
    embeddingId = embedding.id;

    const [draftHead] = await db.select().from(drafts).where(eq(drafts.id, draftId)).limit(1);
    const versions = await db.select().from(draftVersions).where(eq(draftVersions.draftId, draftId)).orderBy(asc(draftVersions.version));
    const [resolvedSource] = await db.select().from(researchSources).where(eq(researchSources.id, researchSource.id)).limit(1);
    const [resolvedPolicy] = await db.select().from(policyVersions).where(eq(policyVersions.id, policyVersion.id)).limit(1);
    const [resolvedAgent] = await db.select().from(agentRuns).where(eq(agentRuns.id, agentRun.id)).limit(1);
    const [resolvedArtifact] = await db.select().from(artifacts).where(eq(artifacts.id, artifact.id)).limit(1);
    if (!draftHead || draftHead.currentVersion !== 2 || versions.length !== 2 || versions[0]?.version !== 1 || !versions[0].content.includes("Version 1") || versions[1]?.version !== 2 || resolvedSource?.researchRunId !== researchRun.id || resolvedPolicy?.policyId !== policyId || resolvedAgent?.caseId !== caseId || resolvedArtifact?.agentRunId !== agentRun.id || resolvedArtifact?.researchSourceId !== researchSource.id) {
      throw new Error("Research -> Policy -> AgentRun -> Artifact -> Draft relationship or version history failed");
    }

    console.log(JSON.stringify({ ok: true, chain: "ResearchRun -> ResearchSource -> PolicyVersion -> AgentRun -> Artifact -> Draft", draftVersionsPreserved: versions.map((version) => version.version), currentVersion: draftHead.currentVersion, agentExecution: "not executed; foundation record only", embedding: "provider-neutral metadata only" }, null, 2));
  } finally {
    if (embeddingId) await db.delete(embeddingMetadata).where(eq(embeddingMetadata.id, embeddingId));
    if (policyId) await db.delete(policies).where(eq(policies.id, policyId));
    if (jurisdictionId) await db.delete(jurisdictions).where(eq(jurisdictions.id, jurisdictionId));
    if (caseId) await db.delete(cases).where(eq(cases.id, caseId));
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
