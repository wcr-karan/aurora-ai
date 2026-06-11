"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Plug, Sparkles } from "lucide-react";
import { AuroraBg } from "./aurora-bg";
import { LandingChat } from "./landing-chat";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-36">
      <AuroraBg />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chip"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            Trained on your knowledge base · grounded answers only
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-[clamp(2.5rem,6vw,4.4rem)] font-bold leading-[0.98] tracking-tight text-ink"
          >
            Your help docs,
            <br />
            answering customers
            <br />
            <span className="text-primary">while you sleep.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ink-2"
          >
            Upload your knowledge base. The assistant learns it, replies in your
            brand voice with cards, tables and links, opens a ticket when it's
            stuck, and escalates refunds and outages to a human.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link href="/register" className={cn(buttonClasses("primary", "lg"), "group")}>
              Build your assistant
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#features" className={buttonClasses("outline", "lg")}>
              Explore the platform
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-ink-3"
          >
            <span className="inline-flex items-center gap-1.5">
              <FileText size={14} className="text-ink-faint" /> PDF · DOCX · TXT · Markdown
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-ink-faint" /> Claude-ready RAG
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Plug size={14} className="text-ink-faint" /> One-line embed
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div
            className="absolute -inset-6 -z-10 rounded-full opacity-60 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.72 0.15 234 / 0.25), transparent 70%)" }}
          />
          <LandingChat />
          <p className="mt-3 text-center text-[0.76rem] text-ink-faint">
            This is the real assistant, trained on Aurora Outdoors&rsquo; sample docs. Try it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
