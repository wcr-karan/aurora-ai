"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "outline" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold uppercase tracking-[0.04em] select-none whitespace-nowrap rounded-[var(--radius)] transition-[transform,background,box-shadow,color,border-color] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-[var(--color-primary-ink)] font-semibold hover:brightness-110 shadow-[0_8px_30px_-10px_var(--color-primary)] hover:shadow-[0_10px_40px_-8px_var(--color-primary)]",
  accent:
    "bg-accent text-[#231a07] font-semibold hover:brightness-110 shadow-[0_8px_30px_-12px_var(--color-accent)]",
  outline:
    "border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] text-ink hover:bg-[var(--color-surface)] hover:border-[var(--color-border-strong)]",
  ghost: "text-ink-2 hover:text-ink hover:bg-[var(--color-surface)]",
  subtle: "bg-[var(--color-surface)] text-ink hover:bg-[var(--color-surface-2)]",
  danger:
    "bg-[var(--color-danger)] text-white font-semibold hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[0.82rem]",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
  icon: "h-9 w-9",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 grid place-items-center">
            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent opacity-80" />
          </span>
        )}
        <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export function buttonClasses(variant: Variant = "primary", size: Size = "md") {
  return cn(base, variants[variant], sizes[size]);
}
