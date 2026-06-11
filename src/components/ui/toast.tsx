"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, AlertTriangle, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useId, useState } from "react";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: string;
  kind: ToastKind;
  message: string;
}

const ToastCtx = createContext<{
  push: (message: string, kind?: ToastKind) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const ICONS: Record<ToastKind, React.ReactNode> = {
  success: <Check size={16} />,
  error: <AlertTriangle size={16} />,
  info: <Info size={16} />,
};
const COLORS: Record<ToastKind, string> = {
  success: "var(--color-success)",
  error: "var(--color-danger)",
  info: "var(--color-primary)",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const base = useId();

  const push = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = `${base}-${Math.round(performance.now())}-${Math.floor(performance.now() % 1000)}`;
      setToasts((t) => [...t, { id, kind, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
    },
    [base]
  );

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div
        className="pointer-events-none fixed bottom-5 left-1/2 flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2"
        style={{ zIndex: "var(--z-toast)" }}
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto flex items-center gap-3 rounded-[0.8rem] border border-[var(--color-border-strong)] bg-[var(--color-surface)]/95 px-3.5 py-3 shadow-2xl backdrop-blur"
            >
              <span
                className="grid size-6 shrink-0 place-items-center rounded-full"
                style={{ color: COLORS[t.kind], background: `${COLORS[t.kind]}22` }}
              >
                {ICONS[t.kind]}
              </span>
              <span className="flex-1 text-sm text-ink">{t.message}</span>
              <button
                onClick={() => setToasts((arr) => arr.filter((x) => x.id !== t.id))}
                className="text-ink-faint hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={15} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
