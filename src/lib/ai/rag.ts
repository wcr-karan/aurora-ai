import { prisma } from "../db";
import type { Personality, Priority } from "../constants";
import { getEmbedder } from "./embedder";
import { getChatModel } from "./chatmodel";
import { search } from "./vectorstore";
import { classifyEscalation } from "./escalation";
import type { ChatTurn, RagTurn, RetrievedChunk } from "./types";

export interface RagConfig {
  botName: string;
  personality: Personality;
  suggestedQuestions: string[];
  escalationKeywords: string[];
  autoEscalateAngry: boolean;
  autoEscalateHuman: boolean;
}

export interface RagInput {
  businessId: string;
  businessName: string;
  question: string;
  history: ChatTurn[];
  config: RagConfig;
}

const TOP_K = 6;

// Minimum cosine similarity to treat a chunk as relevant. The local hashed
// embedder and OpenAI live on different scales, so thresholds are per-provider.
function minScoreFor(embedderId: string): number {
  if (embedderId.startsWith("openai")) return 0.22;
  return 0.05; // local-hash
}

/**
 * The core Retrieval-Augmented-Generation turn:
 *   embed -> retrieve -> (escalation classify) -> generate -> log.
 * Returns everything the chat surface needs: answer, rich payloads, sources,
 * escalation decision, follow-up suggestions and latency.
 */
export async function ragAnswer(input: RagInput): Promise<RagTurn> {
  const started = Date.now();
  const { businessId, businessName, question, history, config } = input;

  const embedder = getEmbedder();
  const model = getChatModel();

  // 1. Retrieve
  let retrieved: RetrievedChunk[] = [];
  try {
    const qVec = await embedder.embed(question);
    const all = await search(businessId, qVec, TOP_K);
    const min = minScoreFor(embedder.id);
    retrieved = all.filter((c) => c.score >= min);
  } catch (err) {
    console.error("[rag] retrieval failed:", err);
  }

  // 2. Generate (grounded in retrieved context)
  const result = await model.generate({
    question,
    history,
    context: retrieved,
    botName: config.botName,
    personality: config.personality,
    businessName,
  });

  // 3. Escalation decision
  const decision = classifyEscalation(question, {
    keywords: config.escalationKeywords,
    autoEscalateAngry: config.autoEscalateAngry,
    autoEscalateHuman: config.autoEscalateHuman,
  });

  let escalate = decision.escalate;
  let escalationReason = decision.reason;
  let escalationLabel = decision.label;
  let priority: Priority = decision.priority;

  // The AI couldn't resolve it -> route to a human / ticket.
  if (!result.canAnswer && !escalate) {
    escalate = true;
    escalationReason = "no_answer";
    escalationLabel = "AI could not resolve the query";
    priority = "MEDIUM";
  }

  // 4. Sources + suggestions
  const sources = retrieved.slice(0, 4).map((c) => ({
    documentId: c.documentId,
    documentName: c.documentName,
    chunkId: c.chunkId,
    score: Number(c.score.toFixed(4)),
    snippet: c.content.replace(/\s+/g, " ").slice(0, 160).trim() + "…",
  }));

  const suggestions = config.suggestedQuestions
    .filter((q) => q.toLowerCase().trim() !== question.toLowerCase().trim())
    .slice(0, 3);

  // 5. Persist analytics (best-effort)
  void logTurn(businessId, question, result.canAnswer, retrieved);

  return {
    answer: result.answer,
    cards: result.cards ?? [],
    links: result.links ?? [],
    suggestions,
    canAnswer: result.canAnswer,
    escalate,
    escalationReason,
    escalationLabel,
    priority,
    sources,
    latencyMs: Date.now() - started,
    provider: result.provider,
  };
}

async function logTurn(
  businessId: string,
  question: string,
  answered: boolean,
  retrieved: RetrievedChunk[]
) {
  try {
    const docIds = [...new Set(retrieved.map((r) => r.documentId))];
    await prisma.queryLog.create({
      data: {
        businessId,
        question: question.slice(0, 500),
        answered,
        topScore: retrieved[0]?.score ?? 0,
        sourceIds: JSON.stringify(docIds),
      },
    });
    if (answered && docIds.length) {
      await prisma.document.updateMany({
        where: { id: { in: docIds } },
        data: { refCount: { increment: 1 } },
      });
    }
  } catch (err) {
    console.error("[rag] logTurn failed:", err);
  }
}
