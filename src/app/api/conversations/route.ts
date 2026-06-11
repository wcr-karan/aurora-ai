import { prisma } from "@/lib/db";
import { handler, ok, requireAuth } from "@/lib/api";
import type { Prisma } from "@prisma/client";

export const GET = handler(async (req: Request) => {
  const session = await requireAuth();
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const channel = url.searchParams.get("channel");
  const filter = url.searchParams.get("filter"); // escalated | resolved | all

  const where: Prisma.ConversationWhereInput = { businessId: session.businessId };
  if (channel) where.channel = channel;
  if (filter === "escalated") where.escalated = true;
  if (filter === "resolved") where.resolvedByAI = true;
  if (q) {
    where.OR = [
      { customerName: { contains: q } },
      { customerEmail: { contains: q } },
      { messages: { some: { content: { contains: q } } } },
    ];
  }

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { lastMessageAt: "desc" },
    take: 100,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, role: true, createdAt: true },
      },
      _count: { select: { messages: true, tickets: true } },
    },
  });

  return ok(
    conversations.map((c) => ({
      id: c.id,
      sessionId: c.sessionId,
      channel: c.channel,
      customerName: c.customerName,
      customerEmail: c.customerEmail,
      status: c.status,
      escalated: c.escalated,
      handoff: c.handoff,
      resolvedByAI: c.resolvedByAI,
      messageCount: c._count.messages,
      ticketCount: c._count.tickets,
      lastMessage: c.messages[0]?.content ?? "",
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
    }))
  );
});
