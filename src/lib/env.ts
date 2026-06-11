/**
 * Centralised feature detection. The platform degrades gracefully: with no keys
 * it runs in fully-offline DEMO mode; with keys present it upgrades to real
 * Claude generation and real embeddings — no code changes required.
 */

export const env = {
  authSecret:
    process.env.AUTH_SECRET ?? "insecure-dev-secret-do-not-use-in-production",
  anthropicKey: process.env.ANTHROPIC_API_KEY?.trim() || "",
  anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-8",
  openaiKey: process.env.OPENAI_API_KEY?.trim() || "",
  embeddingModel:
    process.env.EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
} as const;

/** True when Claude should generate answers (otherwise the grounded mock model). */
export const hasLLM = () => env.anthropicKey.length > 0;

/** True when real embeddings are available (otherwise the deterministic local one). */
export const hasRealEmbeddings = () => env.openaiKey.length > 0;

/** Human-readable provider labels surfaced in the admin UI / health endpoint. */
export function aiStatus() {
  return {
    generation: hasLLM() ? `Claude (${env.anthropicModel})` : "Demo model (offline)",
    embeddings: hasRealEmbeddings()
      ? `OpenAI (${env.embeddingModel})`
      : "Local embedder (offline)",
    demoMode: !hasLLM() && !hasRealEmbeddings(),
  };
}
