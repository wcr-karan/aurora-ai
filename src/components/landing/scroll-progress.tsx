"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const CHAPTERS = [
  { id: "top", index: "00", label: "Intro" },
  { id: "problem", index: "01", label: "The problem" },
  { id: "story", index: "02", label: "The trace" },
  { id: "features", index: "03", label: "Systems" },
  { id: "analytics", index: "04", label: "Telemetry" },
  { id: "embed", index: "05", label: "Deploy" },
  { id: "start", index: "06", label: "Begin" },
];

/**
 * The console's "live" spine: an acid-lime scroll meter pinned to the top and a
 * right-hand chapter rail of hard ticks that lights up the section you're
 * reading. The whole page advertises its own length and position.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const [active, setActive] = useState("top");

  useEffect(() => {
    const ids = CHAPTERS.map((c) => c.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* Top progress meter */}
      <motion.div
        aria-hidden
        className="fixed inset-x-0 top-0 h-[3px] origin-left"
        style={{
          scaleX,
          zIndex: "var(--z-tooltip)",
          background:
            "linear-gradient(90deg, var(--color-primary), var(--color-primary-2) 60%, var(--color-accent))",
          boxShadow: "0 0 14px -1px var(--color-primary)",
        }}
      />

      {/* Right chapter rail (desktop) */}
      <nav
        aria-label="Chapters"
        className="fixed right-5 top-1/2 z-[var(--z-sticky)] hidden -translate-y-1/2 flex-col items-end gap-2.5 xl:flex"
      >
        {CHAPTERS.map((c) => {
          const on = active === c.id;
          return (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="group flex items-center gap-2.5"
              aria-current={on ? "true" : undefined}
            >
              <span
                className={cn(
                  "mono whitespace-nowrap text-[0.66rem] uppercase tracking-[0.12em] transition-all duration-300",
                  on
                    ? "text-ink opacity-100"
                    : "translate-x-1 text-ink-faint opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                )}
              >
                <span className="mr-1.5 text-primary">{c.index}</span>
                {c.label}
              </span>
              <span
                className={cn("block transition-all duration-300", on ? "h-3 w-3" : "h-2 w-2 group-hover:bg-ink-3")}
                style={{
                  background: on ? "var(--color-primary)" : "var(--color-border-strong)",
                  boxShadow: on ? "0 0 0 3px var(--color-primary-soft)" : undefined,
                }}
              />
            </a>
          );
        })}
      </nav>
    </>
  );
}
