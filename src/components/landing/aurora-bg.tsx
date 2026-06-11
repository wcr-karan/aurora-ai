"use client";

import { motion } from "framer-motion";

/**
 * The deck's atmosphere: slow-drifting azure/brass light pools over a technical
 * grid. Pure transform/opacity animation; respects reduced motion via the
 * global media query (animation is disabled, the static glow remains).
 */
export function AuroraBg({ className }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}>
      <div className="absolute inset-0 deck-grid deck-grid-fade opacity-80" />

      <motion.div
        className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.9 0.205 126 / 0.16), transparent 62%)",
          filter: "blur(44px)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 -left-32 h-[30rem] w-[30rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.19 140 / 0.14), transparent 60%)",
          filter: "blur(54px)",
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-24 h-[26rem] w-[26rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.7 0.21 28 / 0.13), transparent 60%)",
          filter: "blur(54px)",
        }}
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, transparent 60%, var(--color-bg))",
        }}
      />
    </div>
  );
}
