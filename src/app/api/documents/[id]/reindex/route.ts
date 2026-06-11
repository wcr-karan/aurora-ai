import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth } from "@/lib/api";
import { reindexDocument } from "@/lib/ai/ingest";

type Ctx = { params: Promise<{ id: string }> };

export const POST = handler(async (_req: Request, ctx: Ctx) => {
  const session = await requireAuth();
  const { id } = await ctx.params;

  const doc = await prisma.document.findFirst({
    where: { id, businessId: session.businessId },
  });
  if (!doc) return fail("Document not found", 404);

  const result = await reindexDocument(id);
  return ok(result);
});
