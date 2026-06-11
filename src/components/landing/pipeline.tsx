"use client";

import { motion } from "framer-motion";
import { Brain, GitBranch, Layers, Search, Sparkles } from "lucide-react";
import { Reveal } from "./reveal";

const steps = [
  { icon: <Search size={18} />, title: "Understand", desc: "The question is embedded into the same vector space as your docs." },
  { icon: <Layers size={18} />, title: "Retrieve", desc: "Cosine search pulls the most relevant chunks from your knowledge base." },
  { icon: <Brain size={18} />, title: "Ground", desc: "Only real, retrieved sources are assembled into context. Nothing invented." },
  { icon: <Sparkles size={18} />, title: "Generate", desc: "The answer is written in your bot's configured voice and personality." },
  { icon: <GitBranch size={18} />, title: "Decide", desc: "Resolve, suggest follow-ups, escalate, or open a ticket automatically." },
];

export function Pipeline() {
  return (
    <section id="pipeline" className="relative border-y border-[var(--color-border)] bg-[var(--color-bg-2)]/40">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-bold tracking-tight text-ink">
            How a question becomes an answer.
          </h2>
          <p className="mt-4 text-[1.02rem] text-ink-2">
            Retrieval-augmented generation, grounded strictly in your documents.
            No hallucinated policies. No made-up prices.
          </p>
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-[1.65rem] hidden h-px bg-gradient-to-r from-transparent via-[var(--color-border-strong)] to-transparent lg:block" />
          <motion.div
            className="absolute left-0 top-[1.65rem] hidden h-px bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-2)] lg:block"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.08}>
                <div className="flex flex-col items-center text-center lg:items-center">
                  <div className="relative z-10 grid size-[3.3rem] place-items-center rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] text-primary shadow-lg">
                    {s.icon}
                    <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--color-primary)] text-[0.62rem] font-bold text-[var(--color-primary-ink)] mono">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[1.02rem] font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1.5 max-w-[15rem] text-[0.85rem] leading-relaxed text-ink-3">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
