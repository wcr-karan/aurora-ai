/**
 * Centralised feature detection. The platform degrades gracefully: with no keys
 * it runs in fully-offline DEMO mode; with a key present it upgrades to real
 * generation (Groq or Claude) and, optionally, real embeddings — no code
 * changes required.
 */

export const env = {
  authSecret:
    process.env.AUTH_SECRET ?? "insecure-dev-secret-do-not-use-in-production",
  // Generation — Groq (free, OpenAI-compatible) takes precedence when set,
  // then Anthropic; otherwise the grounded offline mock.
  groqKey: process.env.GROQ_API_KEY?.trim() || "",
  groqModel: process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile",
  anthropicKey: process.env.ANTHROPIC_API_KEY?.trim() || "",
  anthropicModel: process.env.ANTHROPIC_MODEL?.trim() || "claude-opus-4-8",
  // Embeddings — OpenAI when keyed, otherwise the deterministic local embedder.
  // (Groq does not expose an embeddings endpoint, so retrieval stays local.)
  openaiKey: process.env.OPENAI_API_KEY?.trim() || "",
  embeddingModel:
    process.env.EMBEDDING_MODEL?.trim() || "text-embedding-3-small",
  appUrl:
    process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000",
} as const;

/** Which generation provider is active. */
export function llmProvider(): "groq" | "anthropic" | "none" {
  if (env.groqKey.length > 0) return "groq";
  if (env.anthropicKey.length > 0) return "anthropic";
  return "none";
}

/** True when a real LLM should generate answers (otherwise the grounded mock). */
export const hasLLM = () => llmProvider() !== "none";

/** True when real embeddings are available (otherwise the deterministic local one). */
export const hasRealEmbeddings = () => env.openaiKey.length > 0;

/** Human-readable provider labels surfaced in the admin UI / health endpoint. */
export function aiStatus() {
  const provider = llmProvider();
  const generation =
    provider === "groq"
      ? `Groq (${env.groqModel})`
      : provider === "anthropic"
        ? `Claude (${env.anthropicModel})`
        : "Demo model (offline)";
  return {
    generation,
    embeddings: hasRealEmbeddings()
      ? `OpenAI (${env.embeddingModel})`
      : "Local embedder (offline)",
    demoMode: !hasLLM() && !hasRealEmbeddings(),
  };
}
