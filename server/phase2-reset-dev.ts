import { sql } from "drizzle-orm";
import { getDb } from "./db";

const resetAllowed = process.env.PHASE2_ALLOW_RESET === "1";
const nodeEnv = process.env.NODE_ENV ?? "development";

if (!resetAllowed) throw new Error("Refusing database reset: set PHASE2_ALLOW_RESET=1 explicitly.");
if (nodeEnv === "production") throw new Error("Refusing database reset when NODE_ENV=production.");

const tables = [
  "retentionMetadata", "oauthConnections", "notifications", "responses", "deadlines", "auditLogs", "integrations",
  "actions", "approvals", "embeddingMetadata", "draftVersions", "drafts", "artifacts", "agentRuns", "policyClauses",
  "policyVersions", "policies", "researchSources", "researchRuns", "citations", "claims", "facts", "timelineEvents",
  "storedFiles", "evidence", "cases", "rolePermissions", "permissions", "memberships", "roles", "workspaces",
  "organizations", "users", "jurisdictions", "__drizzle_migrations",
];

async function main() {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is not available");

  await db.execute(sql.raw("SET FOREIGN_KEY_CHECKS = 0"));
  for (const table of tables) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS \`${table}\``));
  }
  await db.execute(sql.raw("SET FOREIGN_KEY_CHECKS = 1"));
  console.log(JSON.stringify({ ok: true, reset: "development-only", droppedTables: tables.length, automaticDeletion: false }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
