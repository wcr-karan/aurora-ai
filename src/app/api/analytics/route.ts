import { handler, ok, requireAuth } from "@/lib/api";
import { getAnalytics } from "@/lib/services/metrics";

export const GET = handler(async () => {
  const session = await requireAuth();
  return ok(await getAnalytics(session.businessId));
});
