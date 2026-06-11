import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import { publicKey, slugify } from "@/lib/ids";

const DEFAULT_SUGGESTED = [
  "How do I track my order?",
  "What are your pricing plans?",
  "What's your refund policy?",
  "How do I contact support?",
];
const DEFAULT_ESCALATION = ["refund", "lawsuit", "cancel my account", "data breach"];

export const POST = handler(async (req: Request) => {
  const input = await parseBody(req, registerSchema);

  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) return fail("An account with this email already exists", 409);

  const business = await prisma.business.create({
    data: {
      name: input.businessName,
      slug: slugify(input.businessName),
      publicKey: publicKey(),
      config: {
        create: {
          botName: `${input.businessName} Assistant`,
          suggestedQuestions: JSON.stringify(DEFAULT_SUGGESTED),
          escalationKeywords: JSON.stringify(DEFAULT_ESCALATION),
        },
      },
      users: {
        create: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash: await hashPassword(input.password),
          role: "OWNER",
        },
      },
    },
    include: { users: true },
  });

  const user = business.users[0];
  const token = await signSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: "OWNER",
    businessId: business.id,
  });
  await setSessionCookie(token);

  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    business: { id: business.id, name: business.name, publicKey: business.publicKey },
  });
});
