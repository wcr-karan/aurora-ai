"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, FileText, Sparkles } from "lucide-react";
import type { RichCard, RichLink } from "@/lib/ai/types";

export function RichCards({ cards, accent }: { cards: RichCard[]; accent?: string }) {
  if (!cards?.length) return null;
  return (
    <div className="mt-2.5 grid gap-2">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-[0.8rem] border border-[var(--color-border-strong)] bg-[var(--color-bg-2)]"
        >
          <div
            className="h-1 w-full"
            style={{ background: accent ?? "var(--color-primary)" }}
          />
          <div className="p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-[0.98rem] font-semibold text-ink">{card.title}</div>
                {card.subtitle && (
                  <div className="text-[0.78rem] text-ink-3">{card.subtitle}</div>
                )}
              </div>
              {card.badge && (
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[0.78rem] font-semibold"
                  style={{
                    color: accent ?? "var(--color-primary)",
                    background: `color-mix(in oklch, ${accent ?? "var(--color-primary)"} 16%, transparent)`,
                  }}
                >
                  {card.badge}
                </span>
              )}
            </div>
            {card.description && (
              <p className="mt-1.5 text-[0.83rem] text-ink-2">{card.description}</p>
            )}
            {card.fields && card.fields.length > 0 && (
              <dl className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
                {card.fields.map((f, j) => (
                  <div key={j} className="flex flex-col">
                    <dt className="text-[0.68rem] uppercase tracking-wide text-ink-faint">{f.label}</dt>
                    <dd className="text-[0.85rem] font-medium text-ink">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {card.link && (
              <a
                href={card.link.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[0.82rem] font-medium text-primary hover:underline"
              >
                {card.link.label}
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function LinkChips({ links }: { links: RichLink[] }) {
  if (!links?.length) return null;
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {links.map((l, i) => (
        <a
          key={i}
          href={l.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] px-3 py-1.5 text-[0.8rem] font-medium text-ink-2 transition-colors hover:border-[var(--color-primary)] hover:text-primary"
        >
          <ArrowUpRight size={13} />
          {l.label}
        </a>
      ))}
    </div>
  );
}

export function SuggestionChips({
  suggestions,
  onPick,
}: {
  suggestions: string[];
  onPick: (q: string) => void;
}) {
  if (!suggestions?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {suggestions.map((q, i) => (
        <button
          key={i}
          onClick={() => onPick(q)}
          className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] px-3 py-1.5 text-[0.8rem] text-ink-2 transition-all hover:border-[var(--color-primary)] hover:text-ink"
        >
          <Sparkles size={12} className="text-primary opacity-70 group-hover:opacity-100" />
          {q}
        </button>
      ))}
    </div>
  );
}

export function SourceChips({
  sources,
}: {
  sources: { documentName: string; score: number }[];
}) {
  if (!sources?.length) return null;
  const unique = Array.from(new Map(sources.map((s) => [s.documentName, s])).values());
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-[0.7rem] text-ink-faint">Sources</span>
      {unique.map((s, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-bg)] px-2 py-0.5 text-[0.7rem] text-ink-3"
          title={`relevance ${(s.score * 100).toFixed(0)}%`}
        >
          <FileText size={11} />
          {s.documentName}
        </span>
      ))}
    </div>
  );
}
