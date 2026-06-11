import { prisma } from "../db";
import type { DocType } from "../constants";
import { chunkText, estimateTokens } from "./chunking";
import { getEmbedder } from "./embedder";
import { parseDocument } from "./parse";

const EMBED_BATCH = 64;

/**
 * Full ingestion pipeline for one document:
 *   parse -> chunk -> embed -> store vectors -> mark INDEXED.
 * Re-ingesting replaces the document's existing chunks (used by re-index).
 * Failures are recorded on the document (status = FAILED) and never throw to
 * the caller, so a bad file can't take down an upload batch.
 */
export async function ingestDocument(params: {
  businessId: string;
  documentId: string;
  buffer: Buffer;
  type: DocType;
}): Promise<{ ok: boolean; chunks: number; error?: string }> {
  const { businessId, documentId, buffer, type } = params;

  try {
    const text = await parseDocument(buffer, type);
    const clean = text.trim();
    if (!clean) throw new Error("No extractable text found in document");

    const chunks = chunkText(clean);
    if (chunks.length === 0) throw new Error("Document produced no chunks");

    const embedder = getEmbedder();
    const vectors: number[][] = [];
    for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
      const batch = chunks.slice(i, i + EMBED_BATCH);
      vectors.push(...(await embedder.embedBatch(batch)));
    }

    // Replace any prior chunks for this document (idempotent re-index).
    await prisma.chunk.deleteMany({ where: { documentId } });
    await prisma.chunk.createMany({
      data: chunks.map((content, idx) => ({
        businessId,
        documentId,
        idx,
        content,
        embedding: JSON.stringify(vectors[idx]),
        tokens: estimateTokens(content),
      })),
    });

    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "INDEXED",
        chunkCount: chunks.length,
        charCount: clean.length,
        error: null,
      },
    });

    return { ok: true, chunks: chunks.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown ingest error";
    console.error(`[ingest] document ${documentId} failed:`, message);
    await prisma.document
      .update({
        where: { id: documentId },
        data: { status: "FAILED", error: message },
      })
      .catch(() => {});
    return { ok: false, chunks: 0, error: message };
  }
}

/**
 * Re-index = recompute embeddings for a document's existing chunks (e.g. after
 * switching the embedding provider). No re-parse needed; chunk text is stored.
 */
export async function reindexDocument(
  documentId: string
): Promise<{ ok: boolean; chunks: number }> {
  const chunks = await prisma.chunk.findMany({
    where: { documentId },
    orderBy: { idx: "asc" },
  });
  if (chunks.length === 0) return { ok: true, chunks: 0 };

  const embedder = getEmbedder();
  const vectors: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH).map((c) => c.content);
    vectors.push(...(await embedder.embedBatch(batch)));
  }
  await prisma.$transaction(
    chunks.map((c, i) =>
      prisma.chunk.update({
        where: { id: c.id },
        data: { embedding: JSON.stringify(vectors[i]) },
      })
    )
  );
  await prisma.document.update({
    where: { id: documentId },
    data: { status: "INDEXED" },
  });
  return { ok: true, chunks: chunks.length };
}

/** Re-index every document in a tenant's knowledge base. */
export async function reindexBusiness(
  businessId: string
): Promise<{ documents: number; chunks: number }> {
  const docs = await prisma.document.findMany({
    where: { businessId },
    select: { id: true },
  });
  let chunks = 0;
  for (const d of docs) {
    const r = await reindexDocument(d.id);
    chunks += r.chunks;
  }
  return { documents: docs.length, chunks };
}

/** Ingest raw text directly (used by the seeder for sample KB data). */
export async function ingestText(params: {
  businessId: string;
  documentId: string;
  text: string;
}): Promise<{ ok: boolean; chunks: number }> {
  const { businessId, documentId, text } = params;
  const chunks = chunkText(text);
  const embedder = getEmbedder();
  const vectors: number[][] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    vectors.push(...(await embedder.embedBatch(chunks.slice(i, i + EMBED_BATCH))));
  }
  await prisma.chunk.deleteMany({ where: { documentId } });
  await prisma.chunk.createMany({
    data: chunks.map((content, idx) => ({
      businessId,
      documentId,
      idx,
      content,
      embedding: JSON.stringify(vectors[idx]),
      tokens: estimateTokens(content),
    })),
  });
  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: "INDEXED",
      chunkCount: chunks.length,
      charCount: text.length,
    },
  });
  return { ok: true, chunks: chunks.length };
}
