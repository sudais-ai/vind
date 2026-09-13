import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const migrationFiles = [
  "0002_old_sebastian_shaw.sql",
  "0003_romantic_kitty_pryde.sql",
  "0004_complex_gabe_jones.sql",
  "0005_brainy_gamora.sql",
  "0006_gray_mimic.sql",
  "0007_complete_warstar.sql",
  "0008_fine_ares.sql",
];

try {
  await connection.query("SET FOREIGN_KEY_CHECKS=0");
  for (const file of migrationFiles) {
    const source = await readFile(new URL(`../drizzle/${file}`, import.meta.url), "utf8");
    const hash = createHash("sha256").update(source).digest("hex");
    const statements = source
      .split(/--> statement-breakpoint/)
      .map((statement) => statement.trim())
      .filter(Boolean)
      .filter((statement) => !/^CREATE TABLE `users`/i.test(statement));

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (error) {
        const message = String(error?.message ?? error);
        if (/already exists|duplicate key name|duplicate foreign key constraint|duplicate column name/i.test(message)) {
          console.log(`[repair] tolerated existing object in ${file}: ${message}`);
          continue;
        }
        throw new Error(`[repair] ${file} failed: ${message}`);
      }
    }
    await connection.query("INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM `__drizzle_migrations` WHERE `hash` = ?)", [hash, Date.now(), hash]);
    console.log(`[repair] applied ${file}`);
  }
} finally {
  await connection.query("SET FOREIGN_KEY_CHECKS=1");
  await connection.end();
}

console.log("[repair] completed without dropping existing tables");
