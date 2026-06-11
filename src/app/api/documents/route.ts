import { prisma } from "@/lib/db";
import { handler, ok, fail, requireAuth } from "@/lib/api";
import { detectDocType } from "@/lib/ai/parse";
import { ingestDocument } from "@/lib/ai/ingest";

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB / file

export const GET = handler(async () => {
  const session = await requireAuth();
  const docs = await prisma.document.findMany({
    where: { businessId: session.businessId },
    orderBy: { createdAt: "desc" },
  });
  return ok(docs);
});

export const POST = handler(async (req: Request) => {
  const session = await requireAuth();
  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) return fail("No files provided", 400);

  const results = [];
  for (const file of files) {
    const type = detectDocType(file.name, file.type);
    if (!type) {
      results.push({ name: file.name, ok: false, error: "Unsupported file type" });
      continue;
    }
    if (file.size > MAX_BYTES) {
      results.push({ name: file.name, ok: false, error: "File exceeds 15 MB limit" });
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const doc = await prisma.document.create({
      data: {
        businessId: session.businessId,
        name: file.name,
        type,
        sizeBytes: file.size,
        status: "PROCESSING",
      },
    });

    const result = await ingestDocument({
      businessId: session.businessId,
      documentId: doc.id,
      buffer,
      type,
    });

    results.push({
      id: doc.id,
      name: file.name,
      ok: result.ok,
      chunks: result.chunks,
      error: result.error,
    });
  }

  return ok({ uploaded: results });
});
