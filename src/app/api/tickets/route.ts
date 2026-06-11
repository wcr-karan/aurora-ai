import { prisma } from "@/lib/db";
import { handler, ok, requireAuth, parseBody } from "@/lib/api";
import { createTicketSchema } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

export const GET = handler(async (req: Request) => {
  const session = await requireAuth();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const q = url.searchParams.get("q")?.trim();

  const where: Prisma.TicketWhereInput = { businessId: session.businessId };
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (q) {
    where.OR = [
      { subject: { contains: q } },
      { customerName: { contains: q } },
      { customerEmail: { contains: q } },
      { query: { contains: q } },
    ];
  }

  const [tickets, byStatus, byPriority] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.ticket.groupBy({
      by: ["status"],
      where: { businessId: session.businessId },
      _count: true,
    }),
    prisma.ticket.groupBy({
      by: ["priority"],
      where: { businessId: session.businessId },
      _count: true,
    }),
  ]);

  return ok({
    tickets,
    counts: {
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
      byPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p._count])),
    },
  });
});

export const POST = handler(async (req: Request) => {
  const session = await requireAuth();
  const input = await parseBody(req, createTicketSchema);

  const ticket = await prisma.ticket.create({
    data: {
      businessId: session.businessId,
      conversationId: input.conversationId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      subject: input.subject,
      query: input.query,
      priority: input.priority,
      category: input.category ?? "General",
      source: "WIDGET",
      status: "OPEN",
    },
  });

  await prisma.event.create({
    data: {
      businessId: session.businessId,
      conversationId: input.conversationId,
      type: "TICKET_CREATED",
      summary: `Ticket created manually: ${input.subject}`,
      data: JSON.stringify({ ticketId: ticket.id }),
    },
  });

  return ok(ticket);
});
