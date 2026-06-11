"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { AuroraBg } from "@/components/landing/aurora-bg";

const points = [
  "Upload PDF, DOCX, TXT & Markdown — indexed automatically",
  "Grounded answers with cards, tables, and links",
  "Auto-escalation, tickets, and human handoff",
  "Live analytics across every conversation",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--color-border)] p-12 lg:flex">
        <AuroraBg />
        <Link href="/">
          <Logo />
        </Link>

        <div className="max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[2.6rem] font-bold leading-tight tracking-tight text-ink"
          >
            Your support team&rsquo;s
            <br />
            <span className="text-primary">command deck.</span>
          </motion.h2>
          <ul className="mt-8 space-y-3">
            {points.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                className="flex items-center gap-3 text-[0.95rem] text-ink-2"
              >
                <CheckCircle2 size={18} className="shrink-0 text-primary" />
                {p}
              </motion.li>
            ))}
          </ul>
        </div>

        <p className="text-[0.8rem] text-ink-faint">
          Multi-tenant · RBAC · retrieval-augmented · built for Magentic AI.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
          <p className="mt-1.5 text-sm text-ink-3">{subtitle}</p>
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-ink-3">{footer}</div>}
        </motion.div>
      </div>
    </div>
  );
}
