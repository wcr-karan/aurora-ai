import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = handler(async (_req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;

  const doc = await prisma.document.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!doc) return fail("Document not found", 404);

  // Cascades to chunks via the schema relation.
  await prisma.document.delete({ where: { id } });
  return ok({ deleted: true });
});
