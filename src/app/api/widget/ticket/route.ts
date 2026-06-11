import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { openTicket } from "@/lib/services/chat";
import type { Priority } from "@/lib/constants";

const schema = z.object({
  publicKey: z.string().min(6),
  conversationId: z.string().optional(),
  customerName: z.string().min(1).max(80),
  customerEmail: z.string().email(),
  query: z.string().min(1).max(2000),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  reason: z.string().max(60).optional(),
});

// Public endpoint: the widget submits the customer's contact details to open a
// ticket after an escalation that lacked an email.
export const POST = handler(async (req: Request) => {
  const input = await parseBody(req, schema);

  const business = await prisma.business.findUnique({
    where: { publicKey: input.publicKey },
  });
  if (!business) return fail("Unknown widget key", 404);

  // Attach the customer details to the conversation if we have one.
  if (input.conversationId) {
    await prisma.conversation.updateMany({
      where: { id: input.conversationId, businessId: business.id },
      data: { customerName: input.customerName, customerEmail: input.customerEmail },
    });
  }

  const ticketId = await openTicket({
    businessId: business.id,
    conversationId: input.conversationId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    message: input.query,
    priority: input.priority as Priority,
    reason: input.reason,
    category: "Customer request",
    channel: "WIDGET",
  });

  return ok({ ticketId });
});

export const OPTIONS = handler(async () => ok({}));
