import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { handleChatTurn, openTicket } from "@/lib/services/chat";

const schema = z.object({
  publicKey: z.string().min(6),
  from: z.string().email(),
  fromName: z.string().max(80).optional(),
  subject: z.string().max(160).optional(),
  text: z.string().min(1).max(4000),
});

/**
 * Inbound support email -> the AI drafts a reply AND a ticket is always opened
 * (every email becomes a tracked ticket). Email carries the customer's address,
 * so escalation ticketing happens automatically; we guarantee at least one
 * ticket per email even when the AI fully answers.
 */
export const POST = handler(async (req: Request) => {
  const input = await parseBody(req, schema);

  const business = await prisma.business.findUnique({
    where: { publicKey: input.publicKey },
    include: { config: true },
  });
  if (!business) return fail("Unknown widget key", 404);

  const composed = input.subject
    ? `${input.subject}\n\n${input.text}`
    : input.text;

  const result = await handleChatTurn({
    business,
    sessionId: `email_${input.from}`,
    message: composed,
    channel: "EMAIL",
    customerName: input.fromName ?? input.from.split("@")[0],
    customerEmail: input.from,
  });

  // Ensure every email yields a ticket, even if the AI resolved it.
  let ticketId = result.ticketId;
  if (!ticketId) {
    ticketId = await openTicket({
      businessId: business.id,
      conversationId: result.conversationId,
      customerName: input.fromName ?? input.from.split("@")[0],
      customerEmail: input.from,
      message: composed,
      priority: "LOW",
      reason: "email_intake",
      category: "Email",
      channel: "EMAIL",
    });
  }

  return ok({ draftReply: result.turn.answer, ticketId });
});
