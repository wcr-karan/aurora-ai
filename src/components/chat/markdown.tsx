"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Markdown renderer tuned for the dark chat surface. Supports GFM tables,
 *  bullet lists, links, code and emphasis — the assistant's rich text formats. */
export const Markdown = memo(function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-chat text-[0.9rem] leading-relaxed text-ink-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="my-1.5 first:mt-0 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="my-2 ml-1 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="my-2 ml-4 list-decimal space-y-1.5 marker:text-ink-faint">{children}</ol>,
          li: ({ children }) => (
            <li className="relative pl-5 [ol_&]:pl-1">
              <span className="absolute left-0 top-[0.55em] size-1.5 rounded-full bg-[var(--color-primary)] [ol_&]:hidden" />
              {children}
            </li>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline decoration-[var(--color-primary)]/40 underline-offset-2 hover:decoration-[var(--color-primary)]"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="mono rounded-md bg-[var(--color-bg)] px-1.5 py-0.5 text-[0.82em] text-accent">
              {children}
            </code>
          ),
          h1: ({ children }) => <h3 className="mb-1.5 mt-3 text-base font-semibold text-ink">{children}</h3>,
          h2: ({ children }) => <h4 className="mb-1.5 mt-3 text-[0.95rem] font-semibold text-ink">{children}</h4>,
          h3: ({ children }) => <h4 className="mb-1 mt-2.5 text-sm font-semibold text-ink">{children}</h4>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 rounded-r-md bg-[var(--color-bg-2)] px-3 py-1.5 text-ink-3">{children}</blockquote>
          ),
          table: ({ children }) => (
            <div className="my-2.5 overflow-x-auto rounded-[0.7rem] border border-[var(--color-border)]">
              <table className="w-full border-collapse text-[0.82rem]">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-[var(--color-bg-2)]">{children}</thead>,
          th: ({ children }) => (
            <th className="border-b border-[var(--color-border)] px-3 py-2 text-left font-semibold text-ink">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[var(--color-border)]/60 px-3 py-2 text-ink-2">{children}</td>
          ),
          hr: () => <hr className="my-3 border-[var(--color-border)]" />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
});
