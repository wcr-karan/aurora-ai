import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth } from "@/lib/api";
import { parseJson } from "@/lib/services/chat";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId: session.businessId },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { createdAt: "asc" } },
      tickets: true,
    },
  });
  if (!conversation) return fail("Conversation not found", 404);

  return ok({
    id: conversation.id,
    sessionId: conversation.sessionId,
    channel: conversation.channel,
    customerName: conversation.customerName,
    customerEmail: conversation.customerEmail,
    status: conversation.status,
    escalated: conversation.escalated,
    handoff: conversation.handoff,
    resolvedByAI: conversation.resolvedByAI,
    createdAt: conversation.createdAt,
    messages: conversation.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      latencyMs: m.latencyMs,
      createdAt: m.createdAt,
      meta: parseJson<Record<string, unknown>>(m.meta, {}),
    })),
    events: conversation.events,
    tickets: conversation.tickets,
  });
});
