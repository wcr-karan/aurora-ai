import { prisma } from "@/lib/db";
import { handler, ok, fail, parseBody } from "@/lib/api";
import { resetSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/auth";

export const POST = handler(async (req: Request) => {
  const { token, password } = await parseBody(req, resetSchema);

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetExpires: { gt: new Date() } },
  });
  if (!user) return fail("This reset link is invalid or has expired", 400);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      resetToken: null,
      resetExpires: null,
    },
  });
  return ok({ reset: true });
});
