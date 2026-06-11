import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth, parseBody } from "@/lib/api";
import { chatSchema } from "@/lib/validation";
import { handleChatTurn } from "@/lib/services/chat";

// Authenticated "test your assistant" endpoint used by the admin preview.
export const POST = handler(async (req: Request) => {
  const session = await requireAuth();
  const input = await parseBody(req, chatSchema);

  const business = await prisma.business.findUnique({
    where: { id: session.businessId },
    include: { config: true },
  });
  if (!business) return fail("Business not found", 404);

  const result = await handleChatTurn({
    business,
    sessionId: input.sessionId,
    message: input.message,
    channel: "WIDGET",
    customerName: input.customerName,
    customerEmail: input.customerEmail || undefined,
  });

  return ok(result);
});
