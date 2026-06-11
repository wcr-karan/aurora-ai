"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  FileStack,
  LayoutGrid,
  MessageSquareText,
  Radio,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section id="features" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-ink">
          Eight systems, one deck.
        </h2>
        <p className="mt-4 text-[1.02rem] text-ink-2">
          The work that usually sprawls across a chatbot, a help center, a
          ticketing tool, and a dashboard shares one knowledge base and one
          source of truth here.
        </p>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
        <Card icon={<FileStack size={18} />} title="Knowledge base that indexes itself" span="md:col-span-3" desc="Drop in PDF, DOCX, TXT or Markdown. Each file is parsed, chunked, embedded, and stored as searchable vectors automatically.">
          <IngestViz />
        </Card>

        <Card icon={<ShieldAlert size={18} />} title="Escalation that reads intent" span="md:col-span-3" accent desc="Refunds, payment failures, outages, legal and angry customers are flagged and routed with the right priority, before they churn.">
          <EscalationViz />
        </Card>

        <Card icon={<MessageSquareText size={18} />} title="Answers that aren't just text" span="md:col-span-2" desc="Bullet lists, comparison tables, rich product cards and links, rendered inline.">
          <RichViz />
        </Card>

        <Card icon={<LayoutGrid size={18} />} title="Tickets, the moment AI gets stuck" span="md:col-span-2" desc="Unresolved questions become tracked tickets with customer, query and priority.">
          <KanbanViz />
        </Card>

        <Card icon={<BarChart3 size={18} />} title="Analytics that show the gaps" span="md:col-span-2" desc="Resolution rate, response time, and the questions your docs can't answer yet.">
          <SparkViz />
        </Card>

        <Card icon={<Boxes size={18} />} title="Multi-tenant by design" span="md:col-span-2" desc="Every business gets isolated documents, chatbot, tickets and analytics under its own key." />
        <Card icon={<Radio size={18} />} title="Widget, WhatsApp & email" span="md:col-span-2" desc="One assistant answers across an embeddable widget, inbound WhatsApp, and support email." />
        <Card icon={<UserRoundCheck size={18} />} title="Human handoff, mid-chat" span="md:col-span-2" desc="An agent can jump into any live conversation and take over from the AI in one click." />
      </div>
    </section>
  );
}

function Card({
  icon,
  title,
  desc,
  span,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  span?: string;
  accent?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <Reveal className={span}>
      <div className="group bezel relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors duration-300 hover:border-[var(--color-border-strong)]">
        <div
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            accent ? "bg-[var(--color-accent-soft)] text-accent" : "bg-[var(--color-primary-soft)] text-primary"
          )}
        >
          {icon}
        </div>
        <h3 className="mt-4 text-[1.05rem] font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-[0.88rem] leading-relaxed text-ink-3">{desc}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </Reveal>
  );
}

// ── micro-visualisations ─────────────────────────────────────────────────────
function IngestViz() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="grid size-9 place-items-center rounded-lg bg-[var(--color-surface-2)] text-ink-2">
        <FileStack size={16} />
      </div>
      <ChevDots />
      <div className="grid grid-cols-4 gap-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.span
            key={i}
            className="size-2.5 rounded-[3px] bg-[var(--color-primary)]"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12 }}
          />
        ))}
      </div>
      <ChevDots />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-7 w-1.5 rounded-full bg-gradient-to-t from-[var(--color-primary-2)] to-[var(--color-primary)]"
            animate={{ scaleY: [0.5, 1, 0.6] }}
            style={{ transformOrigin: "bottom" }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

function ChevDots() {
  return (
    <div className="flex gap-0.5 text-ink-faint">
      {[0, 1].map((i) => (
        <span key={i} className="text-xs">›</span>
      ))}
    </div>
  );
}

function EscalationViz() {
  const lanes = [
    { label: "Urgent", color: "var(--color-danger)", w: "92%" },
    { label: "High", color: "var(--color-accent)", w: "64%" },
    { label: "Medium", color: "var(--color-warning)", w: "40%" },
    { label: "Low", color: "var(--color-success)", w: "22%" },
  ];
  return (
    <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      {lanes.map((l, i) => (
        <div key={l.label} className="flex items-center gap-2.5">
          <span className="w-12 text-[0.7rem] text-ink-3">{l.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: l.color }}
              initial={{ width: 0 }}
              whileInView={{ width: l.w }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RichViz() {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-[0.7rem]">
      <div className="overflow-hidden rounded-lg border border-[var(--color-border)]">
        <div className="grid grid-cols-2 bg-[var(--color-bg-2)] font-semibold text-ink-2">
          <span className="px-2 py-1">Plan</span>
          <span className="px-2 py-1">Price</span>
        </div>
        <div className="grid grid-cols-2 text-ink-3">
          <span className="px-2 py-1">Trail</span>
          <span className="px-2 py-1">$9/mo</span>
        </div>
        <div className="grid grid-cols-2 text-ink-3">
          <span className="px-2 py-1">Summit</span>
          <span className="px-2 py-1">$29/mo</span>
        </div>
      </div>
    </div>
  );
}

function KanbanViz() {
  const cols = [
    { t: "Open", color: "var(--color-primary)", n: 2 },
    { t: "In progress", color: "var(--color-warning)", n: 1 },
    { t: "Resolved", color: "var(--color-success)", n: 2 },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {cols.map((c) => (
        <div key={c.t} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-2">
          <div className="mb-1.5 flex items-center gap-1 text-[0.62rem] text-ink-3">
            <span className="size-1.5 rounded-full" style={{ background: c.color }} />
            {c.t}
          </div>
          <div className="space-y-1">
            {Array.from({ length: c.n }).map((_, i) => (
              <div key={i} className="h-3.5 rounded bg-[var(--color-surface-2)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SparkViz() {
  const pts = "0,28 14,24 28,26 42,16 56,20 70,10 84,13 98,5";
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <svg viewBox="0 0 98 32" className="h-12 w-full overflow-visible">
        <motion.polyline
          points={pts}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <motion.circle
          cx="98"
          cy="5"
          r="3"
          fill="var(--color-primary)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1.3 }}
        />
      </svg>
    </div>
  );
}
