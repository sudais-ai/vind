import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import mysql from "mysql2/promise";

const migration = "0009_greedy_silver_samurai.sql";
const source = await readFile(
  new URL(`../drizzle/${migration}`, import.meta.url),
  "utf8"
);
const hash = createHash("sha256").update(source).digest("hex");
const connection = await mysql.createConnection(process.env.DATABASE_URL);
try {
  await connection.query(
    "INSERT INTO `__drizzle_migrations` (`hash`, `created_at`) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM `__drizzle_migrations` WHERE `hash` = ?)",
    [hash, Date.now(), hash]
  );
  console.log(`[migration] recorded ${migration}`);
} finally {
  await connection.end();
}
