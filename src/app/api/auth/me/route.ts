import { handler, ok, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { aiStatus } from "@/lib/env";

export const GET = handler(async () => {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { business: true },
  });
  if (!user) return ok(null);

  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    business: {
      id: user.business.id,
      name: user.business.name,
      slug: user.business.slug,
      publicKey: user.business.publicKey,
    },
    ai: aiStatus(),
  });
});
