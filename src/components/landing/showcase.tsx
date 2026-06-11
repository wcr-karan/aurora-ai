"use client";

import { ArrowDownRight, ArrowUpRight, Inbox, Timer, TrendingUp, Zap } from "lucide-react";
import { AreaChart, Gauge } from "@/components/charts";
import { Reveal } from "./reveal";
import { Chapter, CountUp } from "./chapter";
import { Corners } from "./hud";
import { cn } from "@/lib/utils";

const series = [12, 18, 15, 24, 30, 27, 38, 41, 36, 48, 52, 61, 58, 72];

export function Showcase() {
  return (
    <section id="analytics" className="relative border-y border-[var(--color-border-strong)] bg-[var(--color-bg-2)]/30">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Chapter index="04" title="Telemetry" />
        <Reveal className="mx-auto mt-5 max-w-2xl text-center">
          <h2 className="text-[clamp(2.1rem,5vw,3.6rem)] uppercase text-ink">
            The whole operation, <span className="text-signal">one screen.</span>
          </h2>
          <p className="mt-4 text-[1.02rem] text-ink-2">
            Resolution rate, response time, escalations, and the questions your
            documents can&rsquo;t answer yet. Every number is live.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="bezel panel scanlines relative p-5 sm:p-7">
            <Corners color="var(--color-primary)" size={14} inset={-6} />
            <div className="mono mb-5 flex items-center justify-between border-b border-[var(--color-border-strong)] pb-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink-faint">
              <span>// support_telemetry · realtime</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--color-success)]">
                <span className="size-1.5 animate-pulse bg-[var(--color-success)]" /> live
              </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
              <Tile icon={<Inbox size={15} />} label="conversations" value={<CountUp to={1284} />} delta="+18%" up />
              <Tile icon={<Zap size={15} />} label="ai resolution" value={<CountUp to={87} suffix="%" />} delta="+6%" up accent="var(--color-success)" />
              <Tile icon={<Timer size={15} />} label="avg response" value={<CountUp to={0.42} decimals={2} suffix="s" />} delta="-0.1s" up accent="var(--color-primary)" />
              <Tile icon={<TrendingUp size={15} />} label="escalations" value={<CountUp to={9} suffix="%" />} delta="-3%" up={false} accent="var(--color-accent)" />
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.7fr_1fr]">
              <div className="panel-2 relative p-5">
                <Corners color="var(--color-border-strong)" size={8} />
                <div className="mono mb-4 flex items-center justify-between text-[0.72rem] uppercase tracking-wide">
                  <span className="text-ink-2">conversations · 14d</span>
                  <span className="inline-flex items-center gap-1.5 text-primary">
                    <span className="size-1.5 animate-pulse bg-[var(--color-primary)]" /> +72 today
                  </span>
                </div>
                <AreaChart data={series} height={170} />
              </div>

              <div className="panel-2 relative flex flex-col items-center justify-center gap-3 p-5">
                <Corners color="var(--color-border-strong)" size={8} />
                <h3 className="mono self-start text-[0.72rem] uppercase tracking-wide text-ink-2">ai_resolution_rate</h3>
                <Gauge value={0.87} label="87%" sublabel="resolved by AI" color="var(--color-success)" />
                <p className="mono text-center text-[0.72rem] uppercase tracking-wide text-ink-faint">
                  1,117 / 1,284 closed without a human
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
  value: React.ReactNode;
  delta: string;
  up: boolean;
  accent?: string;
}) {
  return (
    <div className="panel-2 lift relative p-4">
      <Corners color="var(--color-border-strong)" size={7} />
      <div className="flex items-center justify-between">
        <span className="grid size-7 place-items-center" style={{ color: accent, background: `color-mix(in oklch, ${accent} 16%, transparent)` }}>
          {icon}
        </span>
        <span
          className="mono inline-flex items-center gap-0.5 text-[0.72rem] font-bold"
          style={{ color: up ? "var(--color-success)" : "var(--color-accent)" }}
        >
          {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {delta}
        </span>
      </div>
      <div className={cn("mono mt-3 text-2xl font-bold text-ink")}>{value}</div>
      <div className="mono text-[0.7rem] uppercase tracking-wide text-ink-3">{label}</div>
    </div>
  );
}
