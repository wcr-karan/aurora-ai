import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth, requireRole, parseBody } from "@/lib/api";
import { inviteAgentSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

// List teammates (used for ticket assignment + handoff).
export const GET = handler(async () => {
  const session = await requireAuth();
  const users = await prisma.user.findMany({
    where: { businessId: session.businessId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return ok(users);
});

// Owners can add agents (RBAC).
export const POST = handler(async (req: Request) => {
  const session = await requireRole("OWNER");
  const input = await parseBody(req, inviteAgentSchema);

  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) return fail("A user with this email already exists", 409);

  const user = await prisma.user.create({
    data: {
      businessId: session.businessId,
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
    },
    select: { id: true, name: true, email: true, role: true },
  });
  return ok(user);
});
