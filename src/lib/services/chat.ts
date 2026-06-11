import { prisma } from "../db";
import type { Channel, Personality, Priority } from "../constants";
import { ragAnswer, type RagConfig } from "../ai/rag";
import type { ChatTurn, RagTurn } from "../ai/types";

export interface BusinessWithConfig {
  id: string;
  name: string;
  config: {
    botName: string;
    welcomeMessage: string;
    personality: string;
    accentColor: string;
    suggestedQuestions: string;
    escalationKeywords: string;
    autoEscalateAngry: boolean;
    autoEscalateHuman: boolean;
  } | null;
}

function toRagConfig(b: BusinessWithConfig): RagConfig {
  const c = b.config;
  return {
    botName: c?.botName ?? "Support Assistant",
    personality: (c?.personality as Personality) ?? "Friendly",
    suggestedQuestions: parseJson<string[]>(c?.suggestedQuestions, []),
    escalationKeywords: parseJson<string[]>(c?.escalationKeywords, []),
    autoEscalateAngry: c?.autoEscalateAngry ?? true,
    autoEscalateHuman: c?.autoEscalateHuman ?? true,
  };
}

export interface ChatTurnResult {
  conversationId: string;
  assistantMessageId: string;
  turn: RagTurn;
  ticketId?: string;
  /** true when escalation needs the customer's contact details to open a ticket. */
  requestContact: boolean;
}

/**
 * End-to-end handling of one inbound customer message across any channel
 * (widget, WhatsApp, email). Persists messages + events, runs RAG, and opens
 * a ticket on escalation when contact details are known. This is the single
 * source of truth for a chat turn — every channel funnels through it.
 */
export async function handleChatTurn(params: {
  business: BusinessWithConfig;
  sessionId: string;
  message: string;
  channel: Channel;
  customerName?: string;
  customerEmail?: string;
}): Promise<ChatTurnResult> {
  const { business, sessionId, message, channel } = params;
  const businessId = business.id;

  // 1. Find or create the conversation thread.
  let conversation = await prisma.conversation.findFirst({
    where: { businessId, sessionId },
  });
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        businessId,
        sessionId,
        channel,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
      },
    });
  } else if (params.customerName || params.customerEmail) {
    conversation = await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        customerName: params.customerName ?? conversation.customerName,
        customerEmail: params.customerEmail ?? conversation.customerEmail,
      },
    });
  }

  // 2. Build short history for context.
  const recent = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: 12,
  });
  const history: ChatTurn[] = recent
    .filter((m) => m.role === "USER" || m.role === "ASSISTANT")
    .map((m) => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
    }));

  // 3. Persist the user's message.
  await prisma.message.create({
    data: { businessId, conversationId: conversation.id, role: "USER", content: message },
  });

  // 4. Run the RAG turn.
  const turn = await ragAnswer({
    businessId,
    businessName: business.name,
    question: message,
    history,
    config: toRagConfig(business),
  });

  // 5. Persist the assistant's reply with rich metadata.
  const email = conversation.customerEmail ?? params.customerEmail;
  const requestContact = turn.escalate && !email;

  const assistant = await prisma.message.create({
    data: {
      businessId,
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: turn.answer,
      latencyMs: turn.latencyMs,
      meta: JSON.stringify({
        cards: turn.cards,
        links: turn.links,
        suggestions: turn.suggestions,
        sources: turn.sources,
        escalate: turn.escalate,
        escalationLabel: turn.escalationLabel,
        priority: turn.priority,
        provider: turn.provider,
        requestContact,
      }),
    },
  });

  // 6. Events + ticketing.
  let ticketId: string | undefined;
  if (turn.escalate) {
    await prisma.event.create({
      data: {
        businessId,
        conversationId: conversation.id,
        type: "ESCALATION",
        summary: turn.escalationLabel ?? "Escalation triggered",
        data: JSON.stringify({ reason: turn.escalationReason, priority: turn.priority }),
      },
    });

    if (email) {
      ticketId = await openTicket({
        businessId,
        conversationId: conversation.id,
        customerName: conversation.customerName ?? params.customerName ?? "Customer",
        customerEmail: email,
        message,
        priority: turn.priority,
        reason: turn.escalationReason,
        category: turn.escalationLabel ?? "Escalation",
        channel,
      });
    }
  }

  // 7. Update conversation rollups.
  await prisma.conversation.update({
    where: { id: conversation.id },
    data: {
      messageCount: { increment: 2 },
      lastMessageAt: new Date(),
      escalated: conversation.escalated || turn.escalate,
      resolvedByAI: turn.canAnswer && !turn.escalate ? true : conversation.resolvedByAI,
      status: turn.escalate ? "ESCALATED" : conversation.status,
    },
  });

  return {
    conversationId: conversation.id,
    assistantMessageId: assistant.id,
    turn,
    ticketId,
    requestContact,
  };
}

/** Open a support ticket and record the timeline event. Returns the ticket id. */
export async function openTicket(params: {
  businessId: string;
  conversationId?: string;
  customerName: string;
  customerEmail: string;
  message: string;
  priority: Priority;
  reason?: string;
  category: string;
  channel: Channel;
}): Promise<string> {
  const subject = deriveSubject(params.message);
  const ticket = await prisma.ticket.create({
    data: {
      businessId: params.businessId,
      conversationId: params.conversationId,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      subject,
      query: params.message,
      priority: params.priority,
      reason: params.reason,
      category: params.category,
      source: params.channel,
      status: "OPEN",
    },
  });
  await prisma.event.create({
    data: {
      businessId: params.businessId,
      conversationId: params.conversationId,
      type: "TICKET_CREATED",
      summary: `Ticket opened: ${subject}`,
      data: JSON.stringify({ ticketId: ticket.id, priority: params.priority }),
    },
  });
  return ticket.id;
}

function deriveSubject(message: string): string {
  const firstLine = message.split("\n")[0].trim();
  return firstLine.length > 80 ? firstLine.slice(0, 77) + "…" : firstLine;
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export { parseJson };
