"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { DEMO } from "@/lib/demo";
import { Reveal } from "./reveal";
import { Chapter } from "./chapter";
import { Corners, Marquee } from "./hud";
import { cn } from "@/lib/utils";

const TICKER = [
  "DEPLOY IN MINUTES",
  "NO CREDIT CARD",
  "GROUNDED ANSWERS",
  "AUTO-ESCALATION",
  "MULTI-CHANNEL",
  "LIVE ANALYTICS",
  "ONE-LINE EMBED",
];

export function CtaFooter() {
  return (
    <>
      <section id="start" className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <Chapter index="06" title="Begin" />
          <div className="bezel scanlines relative mt-8 overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center sm:px-12 sm:py-20">
            <Corners color="var(--color-primary)" size={18} inset={-7} />
            <div
              className="absolute inset-0 -z-10 opacity-90"
              style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, oklch(0.9 0.205 126 / 0.12), transparent 70%)" }}
            />
            <h2 className="mx-auto max-w-3xl text-[clamp(2.4rem,6vw,4.6rem)] uppercase text-ink">
              Give your docs <span className="text-signal">a voice.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[1.05rem] text-ink-2">
              Spin up a tenant, upload a few files, and watch your assistant
              answer real questions in minutes. No credit card.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className={cn(buttonClasses("primary", "lg"), "group")}>
                Create your workspace
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className={buttonClasses("outline", "lg")}>
                Sign in to the demo
              </Link>
            </div>
            <p className="mono mt-6 text-[0.72rem] uppercase tracking-wide text-ink-faint">
              demo · <span className="text-ink-3">{DEMO.adminEmail}</span> ·{" "}
              <span className="text-ink-3">{DEMO.adminPassword}</span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* closing marquee */}
      <div className="border-y border-[var(--color-border-strong)] bg-[var(--color-bg)] py-3">
        <Marquee items={TICKER} speed={28} />
      </div>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
          <Logo />
          <p className="mono text-[0.72rem] uppercase tracking-wide text-ink-faint">
            built for the Magentic AI assessment · RAG support, end to end
          </p>
          <div className="mono flex items-center gap-4 text-[0.72rem] uppercase tracking-wide text-ink-3">
            <a href="#features" className="hover:text-primary">Systems</a>
            <Link href="/login" className="hover:text-primary">Sign in</Link>
            <Link href="/register" className="hover:text-primary">Start</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
