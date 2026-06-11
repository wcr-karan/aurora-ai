import { handler, ok } from "@/lib/api";
import { aiStatus } from "@/lib/env";
import { prisma } from "@/lib/db";

export const GET = handler(async () => {
  let db = "ok";
  let businesses = 0;
  try {
    businesses = await prisma.business.count();
  } catch {
    db = "error";
  }
  return ok({
    status: "ok",
    db,
    businesses,
    ai: aiStatus(),
    time: new Date().toISOString(),
  });
});
