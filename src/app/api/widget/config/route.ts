import { prisma } from "@/lib/db";
import { handler, ok, fail } from "@/lib/api";
import { parseJson } from "@/lib/services/chat";

// Public endpoint: the embeddable widget fetches its tenant's branding/config
// using the non-secret publicKey. CORS is opened for this path in next.config.
export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (!key) return fail("Missing key", 400);

  const business = await prisma.business.findUnique({
    where: { publicKey: key },
    include: { config: true },
  });
  if (!business || !business.config) return fail("Unknown widget key", 404);

  const c = business.config;
  return ok({
    businessName: business.name,
    botName: c.botName,
    welcomeMessage: c.welcomeMessage,
    personality: c.personality,
    accentColor: c.accentColor,
    suggestedQuestions: parseJson<string[]>(c.suggestedQuestions, []),
  });
});

export const OPTIONS = handler(async () => ok({}));
