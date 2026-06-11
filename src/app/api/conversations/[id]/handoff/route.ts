import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

// Human handoff: a support agent joins the live conversation.
export const POST = handler(async (_req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!conversation) return fail("Conversation not found", 404);

  await prisma.conversation.update({
    where: { id },
    data: { handoff: true, status: "ESCALATED" },
  });
  await prisma.message.create({
    data: {
      businessId: session.businessId,
      conversationId: id,
      role: "SYSTEM",
      content: `${session.name} joined the conversation.`,
    },
  });
  await prisma.event.create({
    data: {
      businessId: session.businessId,
      conversationId: id,
      type: "HANDOFF",
      summary: `${session.name} took over the conversation`,
      data: JSON.stringify({ agentId: session.id }),
    },
  });

  return ok({ handoff: true });
});
