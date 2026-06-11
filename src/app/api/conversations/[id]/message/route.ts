import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth, parseBody } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({ content: z.string().min(1).max(2000) });

// Agent reply during a human-handoff session.
export const POST = handler(async (req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;
  const { content } = await parseBody(req, schema);

  const conversation = await prisma.conversation.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!conversation) return fail("Conversation not found", 404);

  const message = await prisma.message.create({
    data: {
      businessId: session.businessId,
      conversationId: id,
      role: "AGENT",
      content,
      meta: JSON.stringify({ agentName: session.name }),
    },
  });
  await prisma.conversation.update({
    where: { id },
    data: { lastMessageAt: new Date(), messageCount: { increment: 1 } },
  });

  return ok(message);
});
