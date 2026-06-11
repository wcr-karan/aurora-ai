import { prisma } from "@/lib/db";
import { handler, ok, requireAuth, requireRole, parseBody } from "@/lib/api";
import { configSchema } from "@/lib/validation";
import { parseJson } from "@/lib/services/chat";

export const GET = handler(async () => {
  const session = await requireAuth();
  const config = await prisma.botConfig.findUnique({
    where: { businessId: session.businessId },
  });
  if (!config) return ok(null);

  return ok({
    botName: config.botName,
    welcomeMessage: config.welcomeMessage,
    personality: config.personality,
    accentColor: config.accentColor,
    suggestedQuestions: parseJson<string[]>(config.suggestedQuestions, []),
    escalationKeywords: parseJson<string[]>(config.escalationKeywords, []),
    autoEscalateAngry: config.autoEscalateAngry,
    autoEscalateHuman: config.autoEscalateHuman,
  });
});

export const PUT = handler(async (req: Request) => {
  // Only owners may change the assistant's configuration.
  const session = await requireRole("OWNER");
  const input = await parseBody(req, configSchema);

  const updated = await prisma.botConfig.update({
    where: { businessId: session.businessId },
    data: {
      botName: input.botName,
      welcomeMessage: input.welcomeMessage,
      personality: input.personality,
      accentColor: input.accentColor,
      suggestedQuestions: JSON.stringify(input.suggestedQuestions),
      escalationKeywords: JSON.stringify(input.escalationKeywords),
      autoEscalateAngry: input.autoEscalateAngry,
      autoEscalateHuman: input.autoEscalateHuman,
    },
  });

  return ok({ updatedAt: updated.updatedAt });
});
