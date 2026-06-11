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
      <div className="absolute inset-0 deck-grid opacity-70" />

      <motion.div
        className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.15 234 / 0.28), transparent 62%)",
          filter: "blur(40px)",
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-20 -left-32 h-[30rem] w-[30rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.66 0.16 250 / 0.2), transparent 60%)",
          filter: "blur(50px)",
        }}
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -right-24 h-[26rem] w-[26rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.83 0.13 78 / 0.14), transparent 60%)",
          filter: "blur(50px)",
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
