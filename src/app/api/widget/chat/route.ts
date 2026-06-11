import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { widgetChatSchema } from "@/lib/validation";
import { handleChatTurn } from "@/lib/services/chat";

// Public endpoint powering the embeddable customer chat widget.
export const POST = handler(async (req: Request) => {
  const input = await parseBody(req, widgetChatSchema);

  const business = await prisma.business.findUnique({
    where: { publicKey: input.publicKey },
    include: { config: true },
  });
  if (!business) return fail("Unknown widget key", 404);

  const result = await handleChatTurn({
    business,
    sessionId: input.sessionId,
    message: input.message,
    channel: "WIDGET",
    customerName: input.customerName,
    customerEmail: input.customerEmail || undefined,
  });

  // Only expose what the client needs (no internal ids beyond conversation).
  return ok({
    conversationId: result.conversationId,
    answer: result.turn.answer,
    cards: result.turn.cards,
    links: result.turn.links,
    suggestions: result.turn.suggestions,
    escalate: result.turn.escalate,
    escalationLabel: result.turn.escalationLabel,
    requestContact: result.requestContact,
    ticketId: result.ticketId,
    canAnswer: result.turn.canAnswer,
    latencyMs: result.turn.latencyMs,
  });
});

export const OPTIONS = handler(async () => ok({}));
