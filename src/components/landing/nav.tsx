"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { useScrolledPast } from "@/lib/use-scroll";
import { cn } from "@/lib/utils";

const links = [
  { href: "#story", label: "TRACE" },
  { href: "#features", label: "SYSTEMS" },
  { href: "#analytics", label: "TELEMETRY" },
  { href: "#embed", label: "DEPLOY" },
];

export function Nav() {
  const scrolled = useScrolledPast(16);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--color-border-strong)] bg-[var(--color-bg)]/90 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
      style={{ zIndex: "var(--z-sticky)" }}
    >
      {/* signal hairline */}
      <div
        className={cn("h-px w-full transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")}
        style={{ background: "linear-gradient(90deg, transparent, var(--color-primary) 50%, transparent)" }}
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>
          <span className="hidden items-center gap-1.5 border-l border-[var(--color-border)] pl-4 lg:inline-flex">
            <span className="size-1.5 animate-pulse rounded-full bg-[var(--color-success)]" />
            <span className="mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-faint">
              sys · online
            </span>
          </span>
        </div>

        <nav className="hidden items-center md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="mono group relative px-3.5 py-2 text-[0.74rem] uppercase tracking-[0.12em] text-ink-3 transition-colors hover:text-primary"
            >
              <span className="text-ink-faint group-hover:text-primary">/ </span>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="mono hidden text-[0.74rem] uppercase tracking-[0.12em] text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          >
            Sign&nbsp;in
          </Link>
          <Link href="/register" className={cn(buttonClasses("primary", "sm"), "group")}>
            Start
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
