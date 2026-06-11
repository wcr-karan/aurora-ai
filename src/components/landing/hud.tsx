"use client";

import { cn } from "@/lib/utils";

/**
 * Four L-shaped corner brackets — the OPERATOR signature. Drop inside any
 * `relative` framed element to give it a targeting-reticle / HUD feel.
 */
export function Corners({
  className,
  color = "var(--color-border-strong)",
  size = 10,
  inset = -1,
}: {
  className?: string;
  color?: string;
  size?: number;
  inset?: number;
}) {
  const common = "pointer-events-none absolute";
  const len = `${size}px`;
  return (
    <span aria-hidden className={cn("absolute inset-0", className)}>
      <span className={common} style={{ top: inset, left: inset, width: len, height: len, borderTop: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
      <span className={common} style={{ top: inset, right: inset, width: len, height: len, borderTop: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
      <span className={common} style={{ bottom: inset, left: inset, width: len, height: len, borderBottom: `1.5px solid ${color}`, borderLeft: `1.5px solid ${color}` }} />
      <span className={common} style={{ bottom: inset, right: inset, width: len, height: len, borderBottom: `1.5px solid ${color}`, borderRight: `1.5px solid ${color}` }} />
    </span>
  );
}

/**
 * A monospace terminal kicker: `// LABEL` with a blinking signal block.
 */
export function Kicker({
  children,
  className,
  accent = false,
  blink = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  blink?: boolean;
}) {
  const color = accent ? "var(--color-accent)" : "var(--color-primary)";
  return (
    <span className={cn("kicker inline-flex items-center gap-2", className)}>
      <span
        className={cn("inline-block size-2", blink && "animate-blink")}
        style={{ background: color }}
      />
      {children}
    </span>
  );
}

/**
 * An auto-scrolling status ticker. Items repeat seamlessly; pauses on hover.
 */
export function Marquee({
  items,
  className,
  speed = 32,
  sep = "◆",
}: {
  items: React.ReactNode[];
  className?: string;
  speed?: number;
  sep?: string;
}) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="mono whitespace-nowrap px-5 text-[0.78rem] uppercase tracking-wider text-ink-2">
            {it}
          </span>
          <span className="text-[0.6rem] text-primary">{sep}</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={cn("group flex overflow-hidden mask-fade-x", className)}>
      <div
        className="flex animate-marquee group-hover:[animation-play-state:paused]"
        style={{ animationDuration: `${speed}s` }}
      >
        {row}
        {row}
      </div>
    </div>
  );
}

/**
 * A giant outlined "ghost" section number used as a decorative margin marker.
 */
export function GhostNumber({
  n,
  className,
}: {
  n: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none select-none font-display leading-none text-outline",
        className
      )}
    >
      {n}
    </span>
  );
}
