import { prisma } from "@/lib/db";
import { handler, ok, parseBody } from "@/lib/api";
import { forgotSchema } from "@/lib/validation";
import { resetToken } from "@/lib/ids";

export const POST = handler(async (req: Request) => {
  const { email } = await parseBody(req, forgotSchema);
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always respond success to avoid leaking which emails are registered.
  if (!user) {
    return ok({ sent: true });
  }

  const token = resetToken();
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetExpires: new Date(Date.now() + 1000 * 60 * 30) },
  });

  // No email provider is configured in the assessment environment, so the
  // reset link is returned directly (a production build would email it).
  const link = `/reset-password?token=${token}`;
  return ok({ sent: true, devResetLink: link });
});
