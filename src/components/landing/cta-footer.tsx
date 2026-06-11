"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { DEMO } from "@/lib/demo";
import { Reveal } from "./reveal";
import { cn } from "@/lib/utils";

export function CtaFooter() {
  return (
    <>
      <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal>
          <div className="bezel relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 py-16 text-center sm:px-12">
            <div
              className="absolute inset-0 -z-10 opacity-80"
              style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%, oklch(0.72 0.15 234 / 0.18), transparent 70%)" }}
            />
            <h2 className="mx-auto max-w-2xl text-[clamp(2rem,4.5vw,3.4rem)] font-bold tracking-tight text-ink">
              Give your docs a voice today.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[1.05rem] text-ink-2">
              Spin up a tenant, upload a few files, and watch your assistant
              answer real questions in minutes. No credit card.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className={cn(buttonClasses("primary", "lg"), "group")}>
                Create your workspace
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className={buttonClasses("outline", "lg")}>
                Sign in to the demo
              </Link>
            </div>
            <p className="mt-5 text-[0.78rem] text-ink-faint">
              Demo workspace · <span className="mono text-ink-3">{DEMO.adminEmail}</span> ·{" "}
              <span className="mono text-ink-3">{DEMO.adminPassword}</span>
            </p>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row sm:px-8">
          <Logo />
          <p className="text-[0.8rem] text-ink-faint">
            Built for the Magentic AI assessment · Retrieval-augmented support, end to end.
          </p>
          <div className="flex items-center gap-4 text-[0.8rem] text-ink-3">
            <a href="#features" className="hover:text-ink">Platform</a>
            <Link href="/login" className="hover:text-ink">Sign in</Link>
            <Link href="/register" className="hover:text-ink">Start free</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
