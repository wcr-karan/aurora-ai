import { cn } from "@/lib/utils";

/**
 * Brand mark: a stylised "signal" — a chat node emitting a resolved pulse.
 * Acid-lime core (AI / live) with a single hot-coral node (escalation) baked
 * into the identity.
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
          <stop stopColor="oklch(0.9 0.205 126)" />
          <stop offset="1" stopColor="oklch(0.78 0.19 142)" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.5c-6.9 0-12.5 4.9-12.5 11 0 3.5 1.9 6.6 4.9 8.6L7.6 28l5.2-2.7c1 .2 2.1.3 3.2.3 6.9 0 12.5-4.9 12.5-11s-5.6-11-12.5-11Z"
        fill="url(#lg-core)"
      />
      <circle cx="11" cy="14.5" r="1.7" fill="oklch(0.2 0.04 130)" />
      <circle cx="16" cy="14.5" r="1.7" fill="oklch(0.2 0.04 130)" />
      <circle cx="23" cy="9" r="3" fill="oklch(0.7 0.21 28)" stroke="oklch(0.155 0.008 252)" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ className, withWord = true }: { className?: string; withWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={26} />
      {withWord && (
        <span className="mono text-[0.92rem] font-bold uppercase tracking-[0.06em] text-ink">
          Helpdesk<span className="text-primary">//AI</span>
        </span>
      )}
    </span>
  );
}
