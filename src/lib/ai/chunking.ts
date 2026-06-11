/**
 * Splits raw document text into overlapping, semantically-coherent chunks.
 *
 * Strategy: paragraph-aware packing. Paragraphs are accumulated until a target
 * character budget is reached, then emitted with a sliding overlap so context
 * isn't lost across boundaries. Very long paragraphs are hard-split on sentence
 * boundaries. This keeps related sentences together — better retrieval than a
 * naive fixed-window split.
 */

export interface ChunkOptions {
  targetChars?: number;
  overlapChars?: number;
  maxChars?: number;
}

const DEFAULTS: Required<ChunkOptions> = {
  targetChars: 900,
  overlapChars: 150,
  maxChars: 1400,
};

export function chunkText(input: string, opts: ChunkOptions = {}): string[] {
  const { targetChars, overlapChars, maxChars } = { ...DEFAULTS, ...opts };
  const text = normalize(input);
  if (!text) return [];

  // Split into paragraphs on blank lines; keep markdown headings attached
  // to the following block so a heading provides context for its section.
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    const trimmed = current.trim();
    if (trimmed) chunks.push(trimmed);
    current = "";
  };

  for (const para of paragraphs) {
    // Oversized paragraph: split on sentences.
    if (para.length > maxChars) {
      flush();
      for (const piece of splitLong(para, targetChars)) chunks.push(piece);
      continue;
    }

    if (current.length + para.length + 2 > targetChars && current.length > 0) {
      flush();
      // carry an overlap tail for continuity
      const tail = chunks[chunks.length - 1]?.slice(-overlapChars) ?? "";
      current = tail ? `${tail}\n\n${para}` : para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  flush();

  return chunks.filter((c) => c.replace(/\s/g, "").length > 1);
}

function splitLong(para: string, target: number): string[] {
  const sentences = para.match(/[^.!?\n]+[.!?]?/g) ?? [para];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    if (buf.length + s.length > target && buf) {
      out.push(buf.trim());
      buf = s;
    } else {
      buf += s;
    }
  }
  if (buf.trim()) out.push(buf.trim());
  return out;
}

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Rough token estimate (~4 chars/token) for analytics + budgeting. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
