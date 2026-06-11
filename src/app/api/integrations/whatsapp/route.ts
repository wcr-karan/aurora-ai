import { z } from "zod";
import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { handleChatTurn } from "@/lib/services/chat";

// Webhook verification handshake (Meta-style): echo the challenge.
export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const challenge = url.searchParams.get("hub.challenge");
  return new Response(challenge ?? "ok", { status: 200 });
});

const schema = z.object({
  publicKey: z.string().min(6),
  from: z.string().min(3), // phone number
  text: z.string().min(1).max(2000),
  name: z.string().max(80).optional(),
});

/**
 * Inbound WhatsApp message handled by the AI. The phone number is the stable
 * session id, so a customer keeps one continuous conversation. In production a
 * provider (Twilio / WhatsApp Cloud API) calls this webhook; the reply below
 * would be sent back via that provider's send API.
 */
export const POST = handler(async (req: Request) => {
  const input = await parseBody(req, schema);

  const business = await prisma.business.findUnique({
    where: { publicKey: input.publicKey },
    include: { config: true },
  });
  if (!business) return fail("Unknown widget key", 404);

  const result = await handleChatTurn({
    business,
    sessionId: `wa_${input.from}`,
    message: input.text,
    channel: "WHATSAPP",
    customerName: input.name ?? `WhatsApp ${input.from.slice(-4)}`,
  });

  return ok({
    reply: result.turn.answer,
    escalated: result.turn.escalate,
    ticketId: result.ticketId,
  });
});
