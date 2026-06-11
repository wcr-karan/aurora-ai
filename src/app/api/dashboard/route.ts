import { handler, ok, requireAuth } from "@/lib/api";
import { getDashboard } from "@/lib/services/metrics";

export const GET = handler(async () => {
  const session = await requireAuth();
  return ok(await getDashboard(session.businessId));
});
