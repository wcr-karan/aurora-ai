"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";

const links = [
  { href: "#features", label: "Platform" },
  { href: "#pipeline", label: "How it works" },
  { href: "#embed", label: "Embed" },
  { href: "#analytics", label: "Analytics" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
      style={{ zIndex: "var(--z-sticky)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm text-ink-2 transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonClasses("ghost", "sm"), "hidden sm:inline-flex")}>
            Sign in
          </Link>
          <Link href="/register" className={buttonClasses("primary", "sm")}>
            Start free
          </Link>
        </div>
      </div>
    </header>
  );
}
