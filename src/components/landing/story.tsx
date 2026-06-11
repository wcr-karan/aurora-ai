"use client";

import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Brain,
  CheckCircle2,
  GitBranch,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
} from "lucide-react";
import { Chapter } from "./chapter";
import { Corners } from "./hud";

const ease = [0.16, 1, 0.3, 1] as const;

const STAGES = [
  {
    key: "understand",
    code: "02.1",
    icon: <Search size={16} />,
    title: "Understand",
    desc: "Read for intent, embedded into the same vector space as your docs.",
  },
  {
    key: "retrieve",
    code: "02.2",
    icon: <Layers size={16} />,
    title: "Retrieve",
    desc: "Cosine search pulls the closest chunks — ranked by similarity.",
  },
  {
    key: "ground",
    code: "02.3",
    icon: <ShieldCheck size={16} />,
    title: "Ground",
    desc: "Only real retrieved sources become context. Nothing invented.",
  },
  {
    key: "generate",
    code: "02.4",
    icon: <Sparkles size={16} />,
    title: "Generate",
    desc: "Written in your bot's configured voice — calm, on-brand, cited.",
  },
  {
    key: "decide",
    code: "02.5",
    icon: <GitBranch size={16} />,
    title: "Decide",
    desc: "Resolve, follow up, or escalate to a human + open a priority ticket.",
  },
] as const;

const QUESTION = "I was charged twice. I want a refund NOW.";

/**
 * Chapter 02 — the trace. A pinned, scroll-scrubbed walk through retrieval-
 * augmented generation rendered as a terminal readout. One real (angry, double-
 * charged) question travels the whole machine as the reader scrolls: the rail
 * tracks the live stage, a lime packet rides the progress line, and the stage
 * viewport morphs to show exactly what happens — ending in escalation + ticket.
 */
export function Story() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const [stage, setStage] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const s = Math.min(STAGES.length - 1, Math.max(0, Math.floor(v * STAGES.length)));
    setStage(s);
  });

  const fillHeight = useTransform(scrollYProgress, [0.02, 0.98], ["0%", "100%"]);

  return (
    <section id="story" ref={ref} className="relative" style={{ height: "440vh" }}>
      <div className="sticky top-0 flex min-h-screen flex-col justify-center overflow-hidden py-14">
        <div className="absolute inset-0 -z-10 deck-grid opacity-50" />

        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
          <Chapter index="02" title="The trace" />
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
            className="mx-auto mt-4 max-w-3xl text-center text-[clamp(1.9rem,5vw,3.4rem)] uppercase text-ink"
          >
            Watch one question <span className="text-signal">trace the machine.</span>
          </motion.h2>
          <p className="mono mx-auto mt-3 max-w-xl text-center text-[0.8rem] uppercase tracking-wider text-ink-faint">
            grounded strictly in your documents · scroll to follow it through
          </p>

          <div className="mt-9 grid items-start gap-8 lg:mt-11 lg:grid-cols-[minmax(0,20rem)_1fr]">
            {/* Stepper rail */}
            <div className="relative">
              <div className="absolute left-[1.2rem] top-3 bottom-3 w-px bg-[var(--color-border-strong)]" />
              <motion.div
                className="absolute left-[1.2rem] top-3 w-px origin-top"
                style={{
                  height: fillHeight,
                  background: "linear-gradient(to bottom, var(--color-primary), var(--color-primary-2))",
                  boxShadow: "0 0 10px 0 var(--color-primary)",
                }}
              />
              <ol className="space-y-1">
                {STAGES.map((s, i) => {
                  const on = i === stage;
                  const done = i < stage;
                  return (
                    <li key={s.key}>
                      <div
                        className="flex w-full items-start gap-3 p-2.5 transition-colors duration-300"
                        style={on ? { background: "var(--color-surface)" } : undefined}
                        aria-current={on ? "step" : undefined}
                      >
                        <span
                          className="relative z-10 grid size-[2.4rem] shrink-0 place-items-center border transition-all duration-300"
                          style={{
                            background: on || done ? "var(--color-primary)" : "var(--color-bg)",
                            borderColor: on || done ? "var(--color-primary)" : "var(--color-border-strong)",
                            color: on || done ? "var(--color-primary-ink)" : "var(--color-ink-3)",
                            boxShadow: on ? "0 0 0 3px var(--color-primary-soft)" : undefined,
                          }}
                        >
                          {done ? <CheckCircle2 size={17} /> : s.icon}
                        </span>
                        <span className="pt-0.5">
                          <span
                            className="flex items-center gap-2 text-[0.95rem] font-bold uppercase tracking-wide transition-colors duration-300"
                            style={{ color: on ? "var(--color-ink)" : done ? "var(--color-ink-2)" : "var(--color-ink-3)" }}
                          >
                            <span className="mono text-[0.66rem] text-ink-faint">{s.code}</span>
                            {s.title}
                          </span>
                          <AnimatePresence initial={false}>
                            {on && (
                              <motion.span
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="block overflow-hidden text-[0.82rem] leading-relaxed text-ink-3"
                              >
                                <span className="block pt-1">{s.desc}</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Stage viewport */}
            <div className="bezel panel scanlines relative min-h-[22rem] p-5 sm:min-h-[24rem] sm:p-7">
              <Corners color="var(--color-primary)" size={13} inset={-6} />
              {/* persistent customer message — terminal input line */}
              <div className="flex items-start gap-3 border-b border-[var(--color-border-strong)] pb-4">
                <span className="mono grid size-9 shrink-0 place-items-center bg-[var(--color-danger)] text-[0.8rem] font-bold text-[var(--color-primary-ink)]">
                  D
                </span>
                <div>
                  <div className="mono flex items-center gap-2 text-[0.72rem] uppercase tracking-wide">
                    <span className="text-ink-2">dana_r</span>
                    <span className="bg-[var(--color-danger)] px-1.5 py-0.5 text-[0.6rem] font-bold text-[var(--color-primary-ink)]">
                      angry · billing
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.95rem] text-ink">
                    <span className="mono text-primary">&gt; </span>&ldquo;{QUESTION}&rdquo;
                  </p>
                </div>
              </div>

              <div className="relative mt-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={STAGES[stage].key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.4, ease }}
                  >
                    <StageVisual stage={stage} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StageVisual({ stage }: { stage: number }) {
  switch (stage) {
    case 0:
      return <Understand />;
    case 1:
      return <Retrieve />;
    case 2:
      return <Ground />;
    case 3:
      return <Generate />;
    default:
      return <Decide />;
  }
}

// ── Stage 0 ───────────────────────────────────────────────────────────────────
function Understand() {
  const intents = ["refund", "billing", "duplicate charge", "high urgency", "negative sentiment"];
  return (
    <div>
      <Caption>detected_intent</Caption>
      <div className="mt-3 flex flex-wrap gap-2">
        {intents.map((t, i) => (
          <motion.span
            key={t}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.09, duration: 0.35, ease }}
            className="mono border px-3 py-1 text-[0.78rem]"
            style={{
              borderColor: "var(--color-primary)",
              background: "var(--color-primary-soft)",
              color: "var(--color-primary)",
            }}
          >
            {t}
          </motion.span>
        ))}
      </div>

      <Caption className="mt-6">
        <Brain size={12} className="mr-1 inline" /> embedded_to_vector_space
      </Caption>
      <div className="mt-3 flex items-end gap-1">
        {Array.from({ length: 44 }).map((_, i) => (
          <motion.span
            key={i}
            className="w-full"
            style={{ maxWidth: 7, background: "linear-gradient(to top, var(--color-primary-2), var(--color-primary))" }}
            initial={{ height: 4, opacity: 0.3 }}
            animate={{ height: 6 + ((i * 37) % 30), opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.011, duration: 0.4, ease }}
          />
        ))}
      </div>
      <p className="mono mt-2 text-[0.72rem] text-ink-faint">vector[1536] · cosine-ready</p>
    </div>
  );
}

// ── Stage 1 ───────────────────────────────────────────────────────────────────
function Retrieve() {
  const chunks = [
    { doc: "billing-policy.pdf", text: "Duplicate charges are auto-refunded within 5–7 business days…", score: 0.94, hit: true },
    { doc: "refunds.md", text: "Unused gear may be returned within 30 days for a full refund…", score: 0.88, hit: true },
    { doc: "payments-faq.docx", text: "We process payments through Stripe; failed captures may retry…", score: 0.71, hit: true },
    { doc: "shipping.md", text: "Orders ship within 2 business days from our Denver warehouse…", score: 0.21, hit: false },
    { doc: "warranty.pdf", text: "Tents carry a limited lifetime warranty against defects…", score: 0.12, hit: false },
  ];
  return (
    <div>
      <Caption>top_matches · knowledge_base</Caption>
      <div className="mt-3 space-y-2">
        {chunks.map((c, i) => (
          <motion.div
            key={c.doc}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: c.hit ? 1 : 0.4, x: 0 }}
            transition={{ delay: 0.08 + i * 0.08, duration: 0.35, ease }}
            className="flex items-center gap-3 border p-2.5"
            style={{
              borderColor: c.hit ? "var(--color-primary)" : "var(--color-border)",
              background: c.hit ? "var(--color-primary-soft)" : "var(--color-bg)",
            }}
          >
            <div className="min-w-0 flex-1">
              <div className="mono text-[0.72rem] text-ink-2">{c.doc}</div>
              <div className="mt-0.5 truncate text-[0.8rem] text-ink-3">{c.text}</div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span
                className="mono text-[0.74rem] font-bold"
                style={{ color: c.hit ? "var(--color-primary)" : "var(--color-ink-faint)" }}
              >
                {c.score.toFixed(2)}
              </span>
              <div className="h-1.5 w-16 overflow-hidden bg-[var(--color-surface-2)]">
                <motion.div
                  className="h-full"
                  style={{ background: c.hit ? "var(--color-primary)" : "var(--color-ink-faint)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${c.score * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Stage 2 ───────────────────────────────────────────────────────────────────
function Ground() {
  const sources = ["billing-policy.pdf", "refunds.md", "payments-faq.docx"];
  return (
    <div>
      <Caption>context_assembled · sources_only</Caption>
      <div className="relative mt-3">
        {sources.map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.4, ease }}
            className="mb-2 flex items-center gap-2.5 border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
          >
            <CheckCircle2 size={16} className="shrink-0 text-[var(--color-success)]" />
            <span className="mono text-[0.78rem] text-ink-2">{s}</span>
            <span className="mono ml-auto text-[0.68rem] uppercase tracking-wide text-ink-faint">verified</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4, ease }}
        className="mono mt-3 inline-flex items-center gap-2 border px-3 py-1.5 text-[0.8rem] font-bold uppercase tracking-wide"
        style={{ borderColor: "var(--color-success)", color: "var(--color-success)" }}
      >
        <ShieldCheck size={14} />
        grounded · 0 facts invented
      </motion.div>
    </div>
  );
}

// ── Stage 3 ───────────────────────────────────────────────────────────────────
function Generate() {
  const lines = [
    "I'm sorry about the double charge, Dana — that shouldn't happen.",
    "I can see two captures on the same order. Per our billing policy, duplicate charges are automatically refunded within 5–7 business days.",
    "I've flagged this for our team so a human can confirm the reversal today.",
  ];
  return (
    <div>
      <Caption>generated · voice=&ldquo;friendly&rdquo;</Caption>
      <div className="mt-3 flex items-start gap-3">
        <span className="mono grid size-9 shrink-0 place-items-center bg-[var(--color-primary)] text-[0.8rem] font-bold text-[var(--color-primary-ink)]">
          A
        </span>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.35, duration: 0.4, ease }}
              className="max-w-md border border-[var(--color-border)] bg-[var(--color-bg)] px-3.5 py-2.5 text-[0.88rem] leading-relaxed text-ink-2"
            >
              {l}
            </motion.p>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mono flex items-center gap-1.5 pl-1 text-[0.7rem] uppercase tracking-wide text-ink-faint"
          >
            <Sparkles size={12} className="text-primary" /> cites: billing-policy.pdf · refunds.md
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Stage 4 ───────────────────────────────────────────────────────────────────
function Decide() {
  const branches = [
    { label: "Resolve", on: false },
    { label: "Follow-up", on: false },
    { label: "Escalate", on: true },
  ];
  return (
    <div>
      <Caption>decision</Caption>
      <div className="mt-3 flex flex-wrap gap-2">
        {branches.map((b, i) => (
          <motion.span
            key={b.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: b.on ? 1 : 0.4, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.35, ease }}
            className="mono border px-3 py-1.5 text-[0.8rem] font-bold uppercase tracking-wide"
            style={{
              borderColor: b.on ? "var(--color-accent)" : "var(--color-border)",
              background: b.on ? "var(--color-accent-soft)" : "var(--color-bg)",
              color: b.on ? "var(--color-accent)" : "var(--color-ink-3)",
            }}
          >
            {b.label}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.45, duration: 0.45, ease }}
        className="relative mt-4 border bg-[var(--color-bg)]"
        style={{ borderColor: "var(--color-accent)" }}
      >
        <Corners color="var(--color-accent)" size={9} />
        <div className="flex items-center justify-between border-b border-[var(--color-border-strong)] bg-[var(--color-accent-soft)] px-4 py-2.5">
          <span className="mono flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-wide text-accent">
            <Ticket size={15} /> ticket_opened · routed_to_human
          </span>
          <span className="mono bg-[var(--color-accent)] px-2 py-0.5 text-[0.66rem] font-bold uppercase tracking-wide text-[var(--color-accent-ink)]">
            High
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3 text-[0.8rem]">
          <Field k="Customer" v="Dana R." />
          <Field k="Category" v="Billing · refund" />
          <Field k="Reason" v="Duplicate charge" />
          <Field k="SLA" v="Respond < 1h" />
        </div>
      </motion.div>
      <p className="mono mt-3 flex items-center gap-1.5 text-[0.76rem] uppercase tracking-wide text-[var(--color-success)]">
        <CheckCircle2 size={13} /> answered · logged · escalated — in 0.42s
      </p>
    </div>
  );
}

// ── shared ────────────────────────────────────────────────────────────────────
function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mono flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-faint ${className ?? ""}`}>
      <span className="text-primary">&gt;//</span>
      {children}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mono text-[0.66rem] uppercase tracking-wide text-ink-faint">{k}</div>
      <div className="text-ink-2">{v}</div>
    </div>
  );
}
