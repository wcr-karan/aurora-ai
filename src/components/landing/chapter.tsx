"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/lib/use-scroll";
import { cn } from "@/lib/utils";

/**
 * Chapter marker — the storytelling spine in OPERATOR form: a bracketed
 * monospace index `[ 02 ]`, a signal-colored hairline that draws itself, and
 * the chapter title tracked out in uppercase mono.
 */
export function Chapter({
  index,
  title,
  accent = false,
  align = "center",
  className,
}: {
  index: string;
  title: string;
  accent?: boolean;
  align?: "center" | "start";
  className?: string;
}) {
  const color = accent ? "var(--color-accent)" : "var(--color-primary)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "flex items-center gap-3",
        align === "center" ? "justify-center" : "justify-start",
        className
      )}
    >
      <span
        className="mono text-[0.78rem] font-bold tracking-[0.12em]"
        style={{ color }}
      >
        [ {index} ]
      </span>
      <motion.span
        className="block h-px origin-left"
        style={{ width: 48, background: color, boxShadow: `0 0 8px ${color}` }}
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="kicker">{title}</span>
    </motion.div>
  );
}

/**
 * A number that counts up the first time it scrolls into view.
 */
export function CountUp({
  to,
  decimals = 0,
  prefix,
  suffix,
  duration,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const { ref, display } = useCountUp(to, { decimals, prefix, suffix, duration });
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
