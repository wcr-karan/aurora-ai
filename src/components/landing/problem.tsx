"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MoonStar } from "lucide-react";
import { Chapter, CountUp } from "./chapter";
import { Corners, GhostNumber } from "./hud";

const ease = [0.16, 1, 0.3, 1] as const;

const waiting = [
  { name: "Marcus T.", text: "My order still hasn't shipped and I leave Friday…", ago: "06:11:42", hot: false },
  { name: "Priya N.", text: "Does the Summit tent actually fit 4 people?", ago: "04:03:18", hot: false },
  { name: "Dana R.", text: "I was charged twice. I want a refund NOW.", ago: "02:47:09", hot: true },
  { name: "Lee K.", text: "What's your return window for unused gear?", ago: "00:44:55", hot: false },
];

/**
 * Chapter 01 — the stakes. A cold, after-hours queue where customer questions
 * pile up unanswered. Hard cells settle in and the unanswered counter ticks as
 * the reader scrolls in; the copy then pivots toward the machine.
 */
export function Problem() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const ghostY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section
      id="problem"
      ref={ref}
      className="relative overflow-hidden border-b border-[var(--color-border-strong)] bg-[var(--color-bg-2)]/30"
    >
      <motion.div
        aria-hidden
        style={{ y: ghostY }}
        className="pointer-events-none absolute -right-6 top-10 -z-10 hidden lg:block"
      >
        <GhostNumber n="01" className="text-[20rem]" />
      </motion.div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:py-32">
        {/* Narrative side */}
        <div>
          <Chapter index="01" title="The problem" accent align="start" />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease }}
            className="mono mt-6 inline-flex items-center gap-2 border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-1.5 text-[0.82rem] text-ink-2"
          >
            <MoonStar size={14} className="text-[var(--color-accent)]" />
            02:47:00 · LOCAL · AFTER HOURS
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease }}
            className="mt-6 text-[clamp(2.2rem,5vw,3.8rem)] uppercase text-ink"
          >
            Customers don&rsquo;t keep
            <br />
            <span className="text-outline">business hours.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="mt-6 max-w-lg text-[1.02rem] leading-relaxed text-ink-2"
          >
            Questions land at midnight, on weekends, mid-holiday. They sit in a
            queue going cold while the answer was in your help center the whole
            time. Every hour of silence is a refund that hardens into a
            chargeback — and a customer who quietly leaves.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-7 max-w-lg border-l-2 border-[var(--color-primary)] pl-4 text-[1.1rem] font-semibold leading-relaxed text-ink"
          >
            What if every one of these got a real, grounded answer the second it
            arrived?
          </motion.p>
        </div>

        {/* Cold queue */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="bezel panel scanlines relative p-4 sm:p-5"
        >
          <Corners color="var(--color-accent)" size={12} inset={-5} />
          <div className="flex items-center justify-between border-b border-[var(--color-border-strong)] pb-3">
            <span className="mono text-[0.72rem] uppercase tracking-[0.14em] text-ink-2">
              // overnight_queue
            </span>
            <span className="mono inline-flex items-center gap-1.5 border border-[var(--color-danger)] px-2.5 py-1 text-[0.72rem] font-bold uppercase tracking-wide text-[var(--color-danger)]">
              <span className="size-1.5 animate-pulse bg-[var(--color-danger)]" />
              <CountUp to={4} duration={1.2} /> unanswered
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {waiting.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease }}
                className="flex items-start gap-3 border border-[var(--color-border)] bg-[var(--color-bg)] p-3"
                style={
                  m.hot
                    ? { borderColor: "var(--color-danger)", background: "var(--color-danger-soft)" }
                    : undefined
                }
              >
                <span
                  className="mono mt-0.5 grid size-8 shrink-0 place-items-center text-[0.72rem] font-bold"
                  style={{
                    background: m.hot ? "var(--color-danger)" : "var(--color-surface-2)",
                    color: m.hot ? "var(--color-primary-ink)" : "var(--color-ink-2)",
                  }}
                >
                  {m.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.84rem] font-semibold text-ink">{m.name}</span>
                    <span className="mono shrink-0 text-[0.68rem] text-ink-faint">+{m.ago}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[0.84rem] text-ink-3">{m.text}</p>
                </div>
                {m.hot && (
                  <span className="mono mt-0.5 shrink-0 bg-[var(--color-danger)] px-1.5 py-0.5 text-[0.62rem] font-bold uppercase tracking-wide text-[var(--color-primary-ink)]">
                    angry
                  </span>
                )}
              </motion.div>
            ))}
          </div>

          <div className="mono mt-3 flex items-center gap-2 text-[0.7rem] uppercase tracking-wider text-ink-faint">
            <span className="block h-px flex-1 bg-[var(--color-border)]" />
            replies typed in the morning
            <span className="block h-px flex-1 bg-[var(--color-border)]" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
