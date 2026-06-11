"use client";

import { ArrowDownRight, ArrowUpRight, Inbox, Timer, TrendingUp, Zap } from "lucide-react";
import { AreaChart, Gauge } from "@/components/charts";
import { Reveal } from "./reveal";

const series = [12, 18, 15, 24, 30, 27, 38, 41, 36, 48, 52, 61, 58, 72];

export function Showcase() {
  return (
    <section id="analytics" className="relative border-y border-[var(--color-border)] bg-[var(--color-bg-2)]/40">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-ink">
            Watch the whole operation from one screen.
          </h2>
          <p className="mt-4 text-[1.02rem] text-ink-2">
            Resolution rate, response time, escalations, and the questions your
            documents can&rsquo;t answer yet. Every number is live.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="bezel overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-5 shadow-2xl sm:p-7">
            <div className="grid gap-4 lg:grid-cols-4">
              <Tile icon={<Inbox size={15} />} label="Conversations" value="1,284" delta="+18%" up />
              <Tile icon={<Zap size={15} />} label="AI resolution" value="87%" delta="+6%" up accent="var(--color-success)" />
              <Tile icon={<Timer size={15} />} label="Avg response" value="0.42s" delta="-0.1s" up accent="var(--color-primary)" />
              <Tile icon={<TrendingUp size={15} />} label="Escalations" value="9%" delta="-3%" up={false} accent="var(--color-accent)" />
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
              <div className="panel-2 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Conversations · last 14 days</h3>
                  <span className="chip mono text-[0.66rem]">+72 today</span>
                </div>
                <AreaChart data={series} height={170} />
              </div>

              <div className="panel-2 flex flex-col items-center justify-center gap-3 p-5">
                <h3 className="self-start text-sm font-semibold text-ink">AI resolution rate</h3>
                <Gauge value={0.87} label="87%" sublabel="resolved by AI" color="var(--color-success)" />
                <p className="text-center text-[0.78rem] text-ink-3">
                  1,117 of 1,284 conversations closed without a human.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Tile({
  icon,
  label,
  value,
  delta,
  up,
  accent = "var(--color-primary)",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  up: boolean;
  accent?: string;
}) {
  return (
    <div className="panel-2 p-4">
      <div className="flex items-center justify-between">
        <span className="grid size-7 place-items-center rounded-lg" style={{ color: accent, background: `color-mix(in oklch, ${accent} 16%, transparent)` }}>
          {icon}
        </span>
        <span
          className="inline-flex items-center gap-0.5 text-[0.72rem] font-medium"
          style={{ color: up ? "var(--color-success)" : "var(--color-accent)" }}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta}
        </span>
      </div>
      <div className="mt-3 font-display text-2xl font-bold text-ink mono">{value}</div>
      <div className="text-[0.78rem] text-ink-3">{label}</div>
    </div>
  );
}
