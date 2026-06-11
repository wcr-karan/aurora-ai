import type { Personality, Priority } from "../constants";

/** A single retrievable chunk with its vector. */
export interface EmbeddedChunk {
  id: string;
  documentId: string;
  documentName: string;
  content: string;
  embedding: number[];
}

/** Result of a vector similarity search. */
export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  content: string;
  score: number; // cosine similarity in [-1, 1]
}

/** Pluggable embedding provider. Implementations: Local (offline) / OpenAI. */
export interface Embedder {
  readonly id: string;
  readonly dimensions: number;
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

/** Structured rich payloads the assistant can attach to a text answer. */
export interface RichCard {
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  fields?: { label: string; value: string }[];
  link?: { label: string; url: string };
}

export interface RichLink {
  label: string;
  url: string;
}

/** What the chat model returns for a single turn. */
export interface ChatModelResult {
  answer: string; // markdown
  cards?: RichCard[];
  links?: RichLink[];
  /** false when the model had no grounded information to answer with. */
  canAnswer: boolean;
  provider: string;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateParams {
  question: string;
  history: ChatTurn[];
  context: RetrievedChunk[];
  botName: string;
  personality: Personality;
  businessName: string;
}

/** Pluggable generation provider. Implementations: Mock (offline) / Claude. */
export interface ChatModel {
  readonly id: string;
  generate(params: GenerateParams): Promise<ChatModelResult>;
}

export interface EscalationDecision {
  escalate: boolean;
  reason?: string; // machine code, e.g. "refund_requested"
  label?: string; // human label, e.g. "Refund requested"
  priority: Priority;
}

/** Full RAG turn result returned to the API / widget. */
export interface RagTurn {
  answer: string;
  cards: RichCard[];
  links: RichLink[];
  suggestions: string[];
  canAnswer: boolean;
  escalate: boolean;
  escalationReason?: string;
  escalationLabel?: string;
  priority: Priority;
  sources: {
    documentId: string;
    documentName: string;
    chunkId: string;
    score: number;
    snippet: string;
  }[];
  latencyMs: number;
  provider: string;
}
