import { eq } from "drizzle-orm";
import { sourceSnapshots } from "../../drizzle/schema";
import { getDb } from "../db";

export type SourceSnapshotInput = {
  researchSourceId: number;
  sourceHash: string;
  retrievedAt: Date;
  normalizedContentRef?: string | null;
  versionMetadata?: Record<string, unknown> | null;
};

export async function recordSourceSnapshot(
  input: SourceSnapshotInput
): Promise<{ snapshotId: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  const inserted = await db
    .insert(sourceSnapshots)
    .values({
      ...input,
      normalizedContentRef: input.normalizedContentRef ?? null,
      versionMetadata: input.versionMetadata ?? null,
    })
    .$returningId();
  const snapshotId = inserted[0]?.id;
  if (!snapshotId) throw new Error("Source snapshot was not created");
  return { snapshotId };
}

export async function getSourceSnapshots(researchSourceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is unavailable");
  return db
    .select()
    .from(sourceSnapshots)
    .where(eq(sourceSnapshots.researchSourceId, researchSourceId));
}
