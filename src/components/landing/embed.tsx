"use client";

import { motion } from "framer-motion";
import { Check, Copy, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DEMO } from "@/lib/demo";
import { Reveal } from "./reveal";
import { Chapter } from "./chapter";
import { Corners } from "./hud";

export function Embed() {
  const [origin, setOrigin] = useState("https://your-app.com");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const snippet = `<script
  src="${origin}/widget.js"
  data-key="${DEMO.publicKey}"
  defer
></script>`;

  return (
    <section id="embed" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <Chapter index="05" title="Deploy" className="mb-12" />
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.6vw,3.4rem)] uppercase text-ink">
            One line. <span className="text-signal">Whole install.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[1.02rem] text-ink-2">
            Paste the snippet before{" "}
            <code className="mono text-accent">&lt;/body&gt;</code>. The widget
            loads its own branding, suggested questions and personality from your
            tenant key, fully isolated from every other business.
          </p>

          <div className="relative mt-7 border border-[var(--color-border-strong)] bg-[#070809]">
            <Corners color="var(--color-primary)" size={11} inset={-5} />
            <div className="flex items-center justify-between border-b border-[var(--color-border-strong)] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 bg-[var(--color-danger)]" />
                <span className="size-2.5 bg-[var(--color-warning)]" />
                <span className="size-2.5 bg-[var(--color-success)]" />
                <span className="mono ml-2 text-[0.7rem] uppercase tracking-wide text-ink-faint">index.html</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(snippet);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="mono inline-flex items-center gap-1.5 px-2 py-1 text-[0.72rem] uppercase tracking-wide text-ink-2 transition-colors hover:text-primary"
              >
                {copied ? <Check size={13} className="text-[var(--color-success)]" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto p-4 text-[0.82rem] leading-relaxed">
              <code className="mono text-ink-2">
                <span className="text-ink-faint">&lt;</span>
                <span className="text-primary">script</span>
                {"\n  "}
                <span className="text-accent">src</span>=
                <span className="text-[var(--color-success)]">&quot;{origin}/widget.js&quot;</span>
                {"\n  "}
                <span className="text-accent">data-key</span>=
                <span className="text-[var(--color-success)]">&quot;{DEMO.publicKey}&quot;</span>
                {"\n  "}
                <span className="text-accent">defer</span>
                {"\n"}
                <span className="text-ink-faint">&gt;&lt;/</span>
                <span className="text-primary">script</span>
                <span className="text-ink-faint">&gt;</span>
              </code>
            </pre>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="bezel scanlines relative aspect-[4/3] overflow-hidden border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] ring-grid">
            <Corners color="var(--color-primary)" size={13} inset={-6} />
            <div className="absolute inset-x-6 top-6 space-y-2">
              <div className="h-6 w-1/3 bg-[var(--color-surface-2)]" />
              <div className="h-24 bg-[var(--color-surface)]/70" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-16 bg-[var(--color-surface)]/50" />
                <div className="h-16 bg-[var(--color-surface)]/50" />
                <div className="h-16 bg-[var(--color-surface)]/50" />
              </div>
            </div>

            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 16 }}
              className="absolute bottom-5 right-5 grid size-14 place-items-center text-[var(--color-primary-ink)] animate-[pulseRing_2s_ease-out_infinite]"
              style={{ background: "var(--color-primary)" }}
              aria-hidden
            >
              <MessageCircle size={24} />
            </motion.button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
