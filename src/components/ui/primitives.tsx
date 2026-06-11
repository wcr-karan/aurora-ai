"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { PRIORITY_META, STATUS_META, type Priority, type TicketStatus } from "@/lib/constants";

const fieldBase =
  "w-full rounded-[0.7rem] bg-[var(--color-bg-2)] border border-[var(--color-border-strong)] px-3.5 py-2.5 text-sm text-ink placeholder:text-[var(--color-ink-faint)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-soft)]";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn(fieldBase, "resize-none", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(fieldBase, "appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 cursor-pointer", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237b8499' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      {label && (
        <span className="flex items-center justify-between text-[0.8rem] font-medium text-ink-2">
          {label}
          {hint && <span className="text-[0.72rem] font-normal text-ink-faint">{hint}</span>}
        </span>
      )}
      {children}
      {error && <span className="block text-[0.76rem] text-[var(--color-danger)]">{error}</span>}
    </label>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300",
        checked ? "bg-primary" : "bg-[var(--color-surface-3)]"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform duration-300 ease-[var(--ease-out-quint)]",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

export function Badge({
  children,
  color = "#7b8499",
  className,
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.72rem] font-medium",
        className
      )}
      style={{ color, background: `${color}1f` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const m = PRIORITY_META[priority];
  return <Badge color={m.color}>{m.label}</Badge>;
}

export function StatusBadge({ status }: { status: TicketStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.72rem] font-medium"
      style={{ color: m.color, borderColor: `${m.color}44`, background: `${m.color}14` }}
    >
      {m.label}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-primary)]",
        className
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg bg-[var(--color-surface)] relative overflow-hidden", className)}
    >
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.05), transparent)",
          backgroundSize: "200% 100%",
        }}
      />
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-2)]/40 px-6 py-14 text-center">
      {icon && (
        <div className="grid size-12 place-items-center rounded-2xl bg-[var(--color-surface)] text-ink-3">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm text-ink-3">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
