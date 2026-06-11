import type { DocType } from "../constants";

/**
 * Extracts plain text from an uploaded document buffer.
 *  - PDF  -> unpdf (serverless-friendly, no native deps)
 *  - DOCX -> mammoth (raw text extraction)
 *  - TXT  -> utf-8 decode
 *  - MD   -> utf-8 decode (markdown structure is preserved; it aids chunking)
 */
export async function parseDocument(
  buffer: Buffer,
  type: DocType
): Promise<string> {
  switch (type) {
    case "PDF":
      return parsePdf(buffer);
    case "DOCX":
      return parseDocx(buffer);
    case "TXT":
    case "MD":
      return buffer.toString("utf-8");
    default:
      return buffer.toString("utf-8");
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const uint8 = new Uint8Array(buffer);
  const pdf = await getDocumentProxy(uint8);
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n\n") : text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

/** Map a filename / mime type to our supported DocType (or null if unsupported). */
export function detectDocType(
  filename: string,
  mime?: string
): DocType | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || mime === "application/pdf") return "PDF";
  if (
    ext === "docx" ||
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  )
    return "DOCX";
  if (ext === "md" || ext === "markdown" || mime === "text/markdown") return "MD";
  if (ext === "txt" || mime === "text/plain") return "TXT";
  return null;
}
