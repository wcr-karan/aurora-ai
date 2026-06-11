import { env, hasRealEmbeddings } from "../env";
import type { Embedder } from "./types";

// ── Local, deterministic embedder (no network) ───────────────────────────────
// Uses feature hashing over unigrams + bigrams with signed buckets and
// sublinear term-frequency weighting, then L2-normalises. Cosine similarity
// between these vectors approximates lexical/semantic overlap well enough to
// demonstrate real retrieval entirely offline. Same algorithm for queries and
// documents => consistent vector space.
class LocalEmbedder implements Embedder {
  readonly id = "local-hash-v1";
  readonly dimensions = 384;

  async embed(text: string): Promise<number[]> {
    return this.vectorize(text);
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.vectorize(t));
  }

  private vectorize(text: string): number[] {
    const vec = new Float64Array(this.dimensions);
    const tokens = tokenize(text);
    const grams: string[] = [...tokens];
    for (let i = 0; i < tokens.length - 1; i++) {
      grams.push(`${tokens[i]}_${tokens[i + 1]}`);
    }

    const counts = new Map<string, number>();
    for (const g of grams) counts.set(g, (counts.get(g) ?? 0) + 1);

    for (const [gram, count] of counts) {
      const h = fnv1a(gram);
      const bucket = h % this.dimensions;
      const sign = ((h >>> 31) & 1) === 0 ? 1 : -1;
      // sublinear tf to dampen frequent terms
      vec[bucket] += sign * (1 + Math.log(count));
    }

    // L2 normalise
    let norm = 0;
    for (let i = 0; i < vec.length; i++) norm += vec[i] * vec[i];
    norm = Math.sqrt(norm) || 1;
    const out = new Array(this.dimensions);
    for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
    return out;
  }
}

// ── OpenAI embedder (real semantic embeddings when a key is present) ──────────
class OpenAIEmbedder implements Embedder {
  readonly id = `openai-${env.embeddingModel}`;
  readonly dimensions = 1536;

  async embed(text: string): Promise<number[]> {
    const [v] = await this.embedBatch([text]);
    return v;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openaiKey}`,
      },
      body: JSON.stringify({
        model: env.embeddingModel,
        input: texts.map((t) => t.slice(0, 8000)),
      }),
    });
    if (!res.ok) {
      throw new Error(`OpenAI embeddings failed: ${res.status} ${await res.text()}`);
    }
    const json = (await res.json()) as {
      data: { embedding: number[]; index: number }[];
    };
    return json.data
      .sort((a, b) => a.index - b.index)
      .map((d) => d.embedding);
  }
}

let cached: Embedder | null = null;

/** Returns the active embedder, upgrading to OpenAI automatically when keyed. */
export function getEmbedder(): Embedder {
  if (cached) return cached;
  cached = hasRealEmbeddings() ? new OpenAIEmbedder() : new LocalEmbedder();
  return cached;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// 32-bit FNV-1a hash
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be",
  "been", "to", "of", "in", "on", "at", "for", "with", "as", "by", "it",
  "this", "that", "these", "those", "i", "you", "we", "they", "he", "she",
  "do", "does", "did", "can", "could", "would", "should", "will", "my",
  "your", "our", "their", "from", "so", "if", "then", "than", "how", "what",
  "when", "which", "who", "me", "us", "am",
]);
