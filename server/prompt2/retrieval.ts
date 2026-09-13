import { and, eq, like, desc } from "drizzle-orm";
import { getDb } from "../db";
import { researchRuns, researchSources } from "../../drizzle/schema";
import type {
  KnowledgeRetriever,
  KnowledgeSource,
  RetrievalRequest,
} from "./types";

const MAX_LIMIT = 20;

export class DrizzleKnowledgeRetriever implements KnowledgeRetriever {
  async retrieve(request: RetrievalRequest): Promise<KnowledgeSource[]> {
    const db = await getDb();
    if (!db) throw new Error("Database is unavailable");
    const limit = Math.min(Math.max(request.limit ?? 8, 1), MAX_LIMIT);
    const rows = await db
      .select({ source: researchSources, run: researchRuns })
      .from(researchSources)
      .innerJoin(
        researchRuns,
        eq(researchSources.researchRunId, researchRuns.id)
      )
      .where(
        and(
          eq(researchRuns.caseId, request.caseId),
          eq(researchSources.status, "ACTIVE")
        )
      )
      .orderBy(desc(researchSources.createdAt))
      .limit(limit * 4);
    const query = request.query.trim().toLowerCase();
    return rows
      .map(({ source }) => ({
        id: source.id,
        title: source.title,
        authority: source.authority,
        reference: source.reference,
        url: source.url,
        sourceType: source.sourceType,
        freshness: source.freshness,
        excerpt: [source.title, source.authority, source.reference]
          .filter(Boolean)
          .join(" — "),
        provenance: { table: "researchSources" as const, recordId: source.id },
      }))
      .filter(
        source =>
          !query ||
          `${source.title} ${source.authority ?? ""} ${source.reference ?? ""}`
            .toLowerCase()
            .includes(query)
      )
      .slice(0, limit);
  }
}

export class InMemoryKnowledgeRetriever implements KnowledgeRetriever {
  constructor(private readonly sources: KnowledgeSource[]) {}
  async retrieve(request: RetrievalRequest): Promise<KnowledgeSource[]> {
    const limit = Math.min(Math.max(request.limit ?? 8, 1), MAX_LIMIT);
    const query = request.query.trim().toLowerCase();
    return this.sources
      .filter(
        source =>
          source.provenance.recordId > 0 &&
          (!query ||
            `${source.title} ${source.excerpt}`.toLowerCase().includes(query))
      )
      .slice(0, limit);
  }
}
