import { cn } from "@/lib/utils";

/**
 * Brand mark: a stylised "signal" — a chat node emitting a resolved pulse.
 * Cool azure core (AI) with a single warm node (escalation) baked into identity.
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="lg-core" x1="4" y1="4" x2="28" y2="28">
          <stop stopColor="oklch(0.78 0.15 232)" />
          <stop offset="1" stopColor="oklch(0.6 0.17 255)" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.5c-6.9 0-12.5 4.9-12.5 11 0 3.5 1.9 6.6 4.9 8.6L7.6 28l5.2-2.7c1 .2 2.1.3 3.2.3 6.9 0 12.5-4.9 12.5-11s-5.6-11-12.5-11Z"
        fill="url(#lg-core)"
      />
      <circle cx="11" cy="14.5" r="1.7" fill="oklch(0.18 0.03 248)" />
      <circle cx="16" cy="14.5" r="1.7" fill="oklch(0.18 0.03 248)" />
      <circle cx="23" cy="9" r="3" fill="oklch(0.84 0.13 78)" stroke="oklch(0.166 0.014 248)" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={28} />
      {withWord && (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight text-ink">
          Helpdesk<span className="text-primary">AI</span>
        </span>
      )}
    </span>
  );
}
