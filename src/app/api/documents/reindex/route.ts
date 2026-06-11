import { handler, ok, requireRole } from "@/lib/api";
import { reindexBusiness } from "@/lib/ai/ingest";

export const POST = handler(async () => {
  const session = await requireRole("OWNER");
  const result = await reindexBusiness(session.businessId);
  return ok(result);
});
