import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth, parseBody } from "@/lib/api";
import { updateTicketSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;
  const ticket = await prisma.ticket.findFirst({
    where: { id, businessId: session.businessId },
    include: {
      assignedTo: { select: { id: true, name: true } },
      conversation: { select: { id: true, sessionId: true, channel: true } },
    },
  });
  if (!ticket) return fail("Ticket not found", 404);
  return ok(ticket);
});

export const PATCH = handler(async (req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;
  const input = await parseBody(req, updateTicketSchema);

  const existing = await prisma.ticket.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!existing) return fail("Ticket not found", 404);

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      status: input.status ?? existing.status,
      priority: input.priority ?? existing.priority,
      assignedToId:
        input.assignedToId === undefined ? existing.assignedToId : input.assignedToId,
    },
  });

  if (input.status && input.status !== existing.status) {
    await prisma.event.create({
      data: {
        businessId: session.businessId,
        conversationId: existing.conversationId,
        type: input.status === "RESOLVED" ? "RESOLVED" : "TICKET_CREATED",
        summary: `Ticket ${existing.subject} → ${input.status}`,
        data: JSON.stringify({ ticketId: id, status: input.status }),
      },
    });
  }

  return ok(ticket);
});
