import { prisma } from "../db";
import type { RetrievedChunk } from "./types";

/**
 * Application-layer vector store. Retrieval is computed with cosine similarity
 * over a tenant's chunk embeddings. This keeps the platform DB-agnostic and
 * dependency-free for the assessment's data volume.
 *
 * Production scaling path (documented in README): swap this module for a
 * pgvector / Qdrant adapter implementing the same `search()` signature — the
 * RAG orchestrator depends only on this interface.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function search(
  businessId: string,
  queryEmbedding: number[],
  topK = 5
): Promise<RetrievedChunk[]> {
  const chunks = await prisma.chunk.findMany({
    where: { businessId },
    select: {
      id: true,
      documentId: true,
      content: true,
      embedding: true,
      document: { select: { name: true } },
    },
  });

  const scored: RetrievedChunk[] = [];
  for (const c of chunks) {
    let vec: number[];
    try {
      vec = JSON.parse(c.embedding) as number[];
    } catch {
      continue;
    }
    scored.push({
      chunkId: c.id,
      documentId: c.documentId,
      documentName: c.document.name,
      content: c.content,
      score: cosineSimilarity(queryEmbedding, vec),
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}
