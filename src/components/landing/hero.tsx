"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AuroraBg } from "./aurora-bg";
import { LandingChat } from "./landing-chat";
import { CountUp } from "./chapter";
import { Corners, Kicker, Marquee } from "./hud";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

const TICKER = [
  "● LIVE",
  "1,284 CONVERSATIONS",
  "87% AI-RESOLVED",
  "0.42S AVG RESPONSE",
  "9% ESCALATED",
  "PDF · DOCX · TXT · MD",
  "CLAUDE-READY RAG",
  "ONE-LINE EMBED",
  "MULTI-TENANT",
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const copyY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const panelY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const panelRotate = useTransform(scrollYProgress, [0, 1], [0, -1.5]);
  const auroraY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.18], [1, 0]);

  return (
    <section id="top" ref={ref} className="relative overflow-hidden pt-28 pb-0 sm:pt-32">
      <motion.div style={{ y: auroraY }} className="absolute inset-0 -z-10">
        <AuroraBg />
      </motion.div>
      {/* a single scan beam sweeping the hero */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="animate-scan absolute inset-x-0 top-0 h-24 opacity-30"
          style={{ background: "linear-gradient(to bottom, transparent, oklch(0.9 0.205 126 / 0.25), transparent)" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 pb-16 sm:px-8 lg:grid-cols-[1.04fr_1fr]">
        <motion.div style={{ y: copyY, opacity: copyOpacity }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Kicker blink>AI SUPPORT CONSOLE — GROUNDED RAG</Kicker>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mt-5 text-[clamp(3rem,8.5vw,6.4rem)] uppercase text-ink"
          >
            <span className="block">Docs that</span>
            <span className="block text-signal">answer back.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-ink-2"
          >
            Upload your knowledge base. The assistant learns it, replies in your
            brand voice with cards, tables and links, opens a ticket when it&rsquo;s
            stuck, and escalates refunds and outages to a human —{" "}
            <span className="text-ink">while your team sleeps.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/register" className={cn(buttonClasses("primary", "lg"), "group")}>
              Build your agent
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#story" className={buttonClasses("outline", "lg")}>
              Run the trace
            </a>
          </motion.div>

          {/* Live readout cluster */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-10 grid max-w-xl grid-cols-3 gap-2.5"
          >
            <Readout value={<CountUp to={1284} />} label="handled" tone="ink" />
            <Readout value={<CountUp to={87} suffix="%" />} label="ai-resolved" tone="primary" />
            <Readout value={<CountUp to={0.42} decimals={2} suffix="s" />} label="avg reply" tone="accent" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ y: panelY, rotate: panelRotate }}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease }}
          className="relative"
        >
          <div
            className="absolute -inset-5 -z-10 opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.9 0.205 126 / 0.2), transparent 70%)" }}
          />
          <div className="relative">
            <LandingChat />
            <Corners color="var(--color-primary)" size={14} inset={-6} />
          </div>
          <p className="mono mt-4 text-center text-[0.7rem] uppercase tracking-[0.14em] text-ink-faint">
            // real assistant · trained on Aurora Outdoors&rsquo; sample docs · try it
          </p>
        </motion.div>
      </div>

      {/* full-bleed status marquee — the console feels staffed */}
      <div className="relative border-y border-[var(--color-border-strong)] bg-[var(--color-bg)]/60 py-3 backdrop-blur-sm">
        <Marquee
          items={TICKER.map((t, i) =>
            i === 0 ? (
              <span key={t} className="text-primary">{t}</span>
            ) : (
              t
            )
          )}
        />
      </div>

      <motion.a
        href="#problem"
        aria-label="Scroll to begin"
        style={{ opacity: hintOpacity }}
        className="absolute inset-x-0 bottom-[5.5rem] mx-auto hidden w-fit flex-col items-center gap-1.5 text-ink-faint sm:flex"
      >
        <span className="mono text-[0.62rem] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </motion.a>
    </section>
  );
}

function Readout({
  value,
  label,
  tone,
}: {
  value: React.ReactNode;
  label: string;
  tone: "ink" | "primary" | "accent";
}) {
  const color =
    tone === "primary" ? "text-primary" : tone === "accent" ? "text-accent" : "text-ink";
  return (
    <div className="relative border border-[var(--color-border-strong)] bg-[var(--color-bg)]/70 p-3">
      <Corners color="var(--color-border-strong)" size={7} />
      <div className={cn("mono text-[1.6rem] font-bold leading-none", color)}>{value}</div>
      <div className="mono mt-1.5 text-[0.62rem] uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </div>
    </div>
  );
}
