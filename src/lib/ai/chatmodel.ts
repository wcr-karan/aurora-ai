import { env, llmProvider } from "../env";
import type { Personality } from "../constants";
import {
  PERSONA_FALLBACK,
  PERSONA_LEAD,
  PERSONA_PROMPT,
} from "./personality";
import type {
  ChatModel,
  ChatModelResult,
  GenerateParams,
  RetrievedChunk,
  RichCard,
  RichLink,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Offline grounded mock model. Produces answers strictly from retrieved context
// so the platform demonstrates a real RAG loop with no external dependency.
// ─────────────────────────────────────────────────────────────────────────────
class MockChatModel implements ChatModel {
  readonly id = "demo-grounded-v1";

  async generate(params: GenerateParams): Promise<ChatModelResult> {
    const { question, context, personality } = params;

    if (context.length === 0) {
      return {
        answer: PERSONA_FALLBACK[personality],
        canAnswer: false,
        provider: this.id,
      };
    }

    const links = extractLinks(context);
    const lead = pickDeterministic(PERSONA_LEAD[personality], question);
    const body = composeBody(question, context);

    // If the user is asking about pricing/plans and the knowledge base holds a
    // table, surface it as rich plan cards (and strip raw tables from the text
    // to avoid showing the same data twice).
    let cards: RichCard[] = [];
    let text = body;
    if (isPricingIntent(question)) {
      const joined = context.map((c) => c.content).join("\n\n");
      const table = findTable(joined);
      if (table) {
        const built = tableToCards(table);
        if (built.length) {
          cards = built;
          text = removeTables(body).trim();
        }
      }
    }

    const answer = text ? `${lead}\n\n${text}` : lead;
    return {
      answer,
      cards: cards.length ? cards : undefined,
      links: links.length ? links : undefined,
      canAnswer: true,
      provider: this.id,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Claude model. Used automatically when ANTHROPIC_API_KEY is set. Answers are
// grounded in retrieved context; the model may return rich cards/links as JSON.
// ─────────────────────────────────────────────────────────────────────────────
class ClaudeChatModel implements ChatModel {
  readonly id = `claude-${env.anthropicModel}`;

  async generate(params: GenerateParams): Promise<ChatModelResult> {
    const { question, history, context, botName, personality, businessName } =
      params;

    const system = buildSystemPrompt(
      botName,
      businessName,
      personality,
      context
    );

    const messages = [
      ...history.slice(-8).map((h) => ({
        role: h.role,
        content: h.content,
      })),
      { role: "user" as const, content: question },
    ];

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.anthropicKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: env.anthropicModel,
          max_tokens: 1024,
          system,
          messages,
        }),
      });

      if (!res.ok) {
        throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
      }

      const json = (await res.json()) as {
        content: { type: string; text?: string }[];
      };
      const raw =
        json.content
          ?.filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("") ?? "";

      return parseModelJson(raw, this.id, context.length > 0);
    } catch (err) {
      console.error("[claude] generation failed, using grounded fallback:", err);
      // Never hard-fail a customer turn — fall back to the offline model.
      return new MockChatModel().generate(params);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Groq model. Used automatically when GROQ_API_KEY is set. Free, fast, and
// OpenAI-compatible (Llama / Gemma / GPT-OSS). Answers are grounded in retrieved
// context; the model returns the same rich-card/link JSON shape as Claude.
// ─────────────────────────────────────────────────────────────────────────────
class GroqChatModel implements ChatModel {
  readonly id = `groq-${env.groqModel}`;

  async generate(params: GenerateParams): Promise<ChatModelResult> {
    const { question, history, context, botName, personality, businessName } =
      params;

    const system = buildSystemPrompt(botName, businessName, personality, context);

    const messages = [
      { role: "system" as const, content: system },
      ...history.slice(-8).map((h) => ({ role: h.role, content: h.content })),
      { role: "user" as const, content: question },
    ];

    try {
      const raw = await this.call(messages, true);
      return parseModelJson(raw, this.id, context.length > 0);
    } catch (err) {
      console.error("[groq] generation failed, using grounded fallback:", err);
      // Never hard-fail a customer turn — fall back to the offline model.
      return new MockChatModel().generate(params);
    }
  }

  /** POST to Groq's OpenAI-compatible endpoint. Retries once without JSON mode
   *  if the chosen model rejects response_format, before bubbling the error. */
  private async call(
    messages: { role: string; content: string }[],
    json: boolean
  ): Promise<string> {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.groqKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        max_tokens: 1024,
        temperature: 0.3,
        ...(json ? { response_format: { type: "json_object" } } : {}),
        messages,
      }),
    });

    if (!res.ok) {
      if (json) return this.call(messages, false); // model may not support JSON mode
      throw new Error(`Groq API ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

function buildSystemPrompt(
  botName: string,
  businessName: string,
  personality: Personality,
  context: RetrievedChunk[]
): string {
  const ctx = context.length
    ? context
        .map(
          (c, i) =>
            `[Source ${i + 1} — ${c.documentName}]\n${c.content}`
        )
        .join("\n\n---\n\n")
    : "(No relevant knowledge-base context was retrieved.)";

  return `You are ${botName}, the AI customer-support assistant for ${businessName}.
${PERSONA_PROMPT[personality]}

RULES:
- Answer ONLY using the knowledge-base context below. Do not invent facts, prices, policies, or URLs.
- If the context does not contain the answer, set "canAnswer" to false and say you'll connect them with a human — do NOT guess.
- Keep answers focused and well-formatted. Use markdown: bullet lists for steps, tables for structured comparisons.
- You may include up to 3 rich cards for structured items (e.g. pricing plans) and links found in the context.

KNOWLEDGE BASE CONTEXT:
${ctx}

RESPOND WITH ONLY a JSON object (no markdown fence) of this exact shape:
{
  "answer": "<markdown string>",
  "canAnswer": <boolean>,
  "cards": [{ "title": "", "subtitle": "", "badge": "", "description": "", "fields": [{ "label": "", "value": "" }] }],
  "links": [{ "label": "", "url": "" }]
}
"cards" and "links" are optional — omit or use [] when not relevant.`;
}

function parseModelJson(
  raw: string,
  provider: string,
  hadContext: boolean
): ChatModelResult {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const slice = start >= 0 ? cleaned.slice(start, end + 1) : cleaned;
    const obj = JSON.parse(slice) as {
      answer?: string;
      canAnswer?: boolean;
      cards?: RichCard[];
      links?: RichLink[];
    };
    return {
      answer: obj.answer?.trim() || raw,
      canAnswer: obj.canAnswer ?? hadContext,
      cards: obj.cards?.length ? obj.cards.slice(0, 3) : undefined,
      links: obj.links?.length ? obj.links.slice(0, 5) : undefined,
      provider,
    };
  } catch {
    // Model returned prose, not JSON — still usable.
    return { answer: raw.trim(), canAnswer: hadContext, provider };
  }
}

// ── grounded composition helpers (mock) ──────────────────────────────────────
function composeBody(question: string, context: RetrievedChunk[]): string {
  const qTokens = tokenSet(question);
  const blocks: { text: string; score: number }[] = [];

  for (const chunk of context.slice(0, 3)) {
    const paras = chunk.content.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    for (const para of paras) {
      // Skip dangling heading-only blocks (e.g. "## How to track your order").
      if (/^#{1,6}\s+\S/.test(para) && !para.includes("\n")) continue;
      const overlap = overlapScore(qTokens, para);
      blocks.push({ text: para, score: overlap + chunk.score * 0.4 });
    }
  }

  blocks.sort((a, b) => b.score - a.score);

  const picked: string[] = [];
  let budget = 850;
  for (const b of blocks) {
    if (picked.includes(b.text)) continue;
    if (budget - b.text.length < 0 && picked.length > 0) break;
    picked.push(b.text);
    budget -= b.text.length;
    if (budget <= 0) break;
  }
  return picked.join("\n\n");
}

function overlapScore(qTokens: Set<string>, text: string): number {
  const t = tokenSet(text);
  let shared = 0;
  for (const tok of qTokens) if (t.has(tok)) shared++;
  return qTokens.size ? shared / qTokens.size : 0;
}

function tokenSet(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

function isPricingIntent(question: string): boolean {
  return /\b(pric|cost|plan|subscri|tier|how much|fee|billing)/i.test(question);
}

function findTable(text: string): string | null {
  const lines = text.split("\n");
  const start = lines.findIndex((l) => /\|.*\|/.test(l) && lines[lines.indexOf(l) + 1]?.includes("--"));
  if (start === -1) {
    // simpler detection: a block of consecutive lines containing pipes
    const idx = lines.findIndex((l) => (l.match(/\|/g)?.length ?? 0) >= 2);
    if (idx === -1) return null;
    const block: string[] = [];
    for (let i = idx; i < lines.length; i++) {
      if ((lines[i].match(/\|/g)?.length ?? 0) >= 2) block.push(lines[i]);
      else if (block.length) break;
    }
    return block.length >= 2 ? block.join("\n") : null;
  }
  const block: string[] = [];
  for (let i = start; i < lines.length; i++) {
    if ((lines[i].match(/\|/g)?.length ?? 0) >= 2) block.push(lines[i]);
    else break;
  }
  return block.join("\n");
}

function removeTables(text: string): string {
  return text
    .split("\n")
    .filter((l) => (l.match(/\|/g)?.length ?? 0) < 2)
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
}

function tableToCards(table: string): RichCard[] {
  const cells = (r: string) =>
    r.split("|").map((c) => c.trim()).filter((c, i, arr) => !(c === "" && (i === 0 || i === arr.length - 1)));

  // A separator row's cells are all dashes/colons (e.g. "---", ":--:").
  const isSeparator = (r: string) => {
    const cs = cells(r);
    return cs.length > 0 && cs.every((c) => /^:?-{2,}:?$/.test(c));
  };

  const rows = table
    .split("\n")
    .map((r) => r.trim())
    .filter((r) => r.includes("|") && !isSeparator(r));

  if (rows.length < 2) return [];

  const header = cells(rows[0]).map((h) => h.replace(/\*\*/g, ""));
  const cards: RichCard[] = [];

  for (const row of rows.slice(1)) {
    const c = cells(row).map((v) => v.replace(/\*\*/g, ""));
    if (!c.length) continue;
    const priceIdx = c.findIndex((v) => /[$€£]|\/mo|month|free/i.test(v));
    const fields = header
      .map((label, i) => ({ label, value: c[i] ?? "" }))
      .filter((_, i) => i !== 0 && i !== priceIdx && c[i]);
    cards.push({
      title: c[0],
      badge: priceIdx > 0 ? c[priceIdx] : undefined,
      fields: fields.length ? fields : undefined,
    });
    if (cards.length >= 3) break;
  }
  return cards;
}

function extractLinks(context: RetrievedChunk[]): RichLink[] {
  const found = new Map<string, string>();
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  for (const c of context) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(c.content)) !== null) {
      if (!found.has(m[2])) found.set(m[2], m[1]);
      if (found.size >= 4) break;
    }
  }
  return [...found.entries()].map(([url, label]) => ({ label, url }));
}

function pickDeterministic(arr: string[], seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

let cached: ChatModel | null = null;

/** Returns the active chat model: Groq or Claude when keyed, else the mock. */
export function getChatModel(): ChatModel {
  if (cached) return cached;
  const provider = llmProvider();
  cached =
    provider === "groq"
      ? new GroqChatModel()
      : provider === "anthropic"
        ? new ClaudeChatModel()
        : new MockChatModel();
  return cached;
}
