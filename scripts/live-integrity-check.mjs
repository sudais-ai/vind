import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const result = { invalidEnumRejected: false, orphanEvidenceRejected: false, duplicateSlugRejected: false, caseDeleteBehavior: "unknown", vectorFoundation: false };

async function expectRejected(label, sql, values = []) {
  try {
    await connection.execute(sql, values);
    console.log(`[integrity] FAIL ${label}: invalid write was accepted`);
  } catch (error) {
    result[label] = true;
    console.log(`[integrity] PASS ${label}: ${error.code ?? error.message}`);
  }
}

try {
  const [cases] = await connection.query("SELECT id, workspaceId FROM cases ORDER BY id LIMIT 1");
  const [organizations] = await connection.query("SELECT slug FROM organizations ORDER BY id LIMIT 1");
  const caseRow = cases[0];
  const organization = organizations[0];
  if (!caseRow || !organization) throw new Error("Expected coherent seed rows are missing");

  await expectRejected("invalidEnumRejected", "INSERT INTO cases (workspaceId, title, category, priority, risk, status) VALUES (?, 'invalid-status-probe', 'OTHER', 'LOW', 'LOW', 'NOT_A_STATUS')", [caseRow.workspaceId]);
  await expectRejected("orphanEvidenceRejected", "INSERT INTO evidence (caseId, type, title, source, verificationState, processingStatus) VALUES (999999999, 'DOCUMENT', 'orphan-probe', 'probe', 'UNVERIFIED', 'PENDING')");
  await expectRejected("duplicateSlugRejected", "INSERT INTO organizations (name, slug, status) VALUES ('duplicate-probe', ?, 'ACTIVE')", [organization.slug]);

  await connection.beginTransaction();
  try {
    await connection.query("DELETE FROM cases WHERE id = ?", [caseRow.id]);
    const [remainingEvidence] = await connection.query("SELECT COUNT(*) AS count FROM evidence WHERE caseId = ?", [caseRow.id]);
    result.caseDeleteBehavior = Number(remainingEvidence[0].count) === 0 ? "cascade" : "partial";
  } catch (error) {
    result.caseDeleteBehavior = `restrict-or-error:${error.code ?? "unknown"}`;
  } finally {
    await connection.rollback();
  }

  const [embeddingTables] = await connection.query("SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'embeddingMetadata'");
  const [embeddingColumns] = await connection.query("SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'embeddingMetadata' AND column_name IN ('sourceType','sourceId','provider','model','dimensions','status')");
  result.vectorFoundation = Number(embeddingTables[0].count) === 1 && Number(embeddingColumns[0].count) === 6;
  console.log(JSON.stringify(result, null, 2));
} finally {
  await connection.end();
}
