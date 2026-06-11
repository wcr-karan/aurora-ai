import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import {
  verifyPassword,
  signSession,
  setSessionCookie,
  type Role,
} from "@/lib/auth";

export const POST = handler(async (req: Request) => {
  const input = await parseBody(req, loginSchema);

  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    include: { business: true },
  });
  if (!user) return fail("Invalid email or password", 401);

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) return fail("Invalid email or password", 401);

  const token = await signSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    businessId: user.businessId,
  });
  await setSessionCookie(token);

  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    business: {
      id: user.business.id,
      name: user.business.name,
      publicKey: user.business.publicKey,
    },
  });
});
