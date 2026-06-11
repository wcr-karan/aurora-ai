"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { ChatPanel, type ChatConfig, type ChatResponse } from "@/components/chat/chat-panel";

const FALLBACK: ChatConfig = {
  botName: "Support Assistant",
  welcomeMessage: "Hi! 👋 How can I help you today?",
  accentColor: "#5b8cff",
  suggestedQuestions: [],
};

function persistentSession(publicKey: string): string {
  if (typeof window === "undefined") return "sess_server";
  const k = `helpdesk_session_${publicKey}`;
  let v = window.localStorage.getItem(k);
  if (!v) {
    v = `sess_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    window.localStorage.setItem(k, v);
  }
  return v;
}

/**
 * The customer chat widget: a floating launcher + slide-up panel. Used by the
 * full-page `/widget` route (the iframe target of widget.js) and showcased
 * live on the marketing site.
 */
export function ChatWidget({
  publicKey,
  embedded = false,
  defaultOpen = false,
}: {
  publicKey: string;
  /** true when rendered inside the widget.js iframe (panel fills the frame). */
  embedded?: boolean;
  defaultOpen?: boolean;
}) {
  const [config, setConfig] = useState<ChatConfig>(FALLBACK);
  const [open, setOpen] = useState(defaultOpen || embedded);
  const sessionId = useMemo(() => persistentSession(publicKey), [publicKey]);
  const accent = config.accentColor || "#5b8cff";

  useEffect(() => {
    api
      .get<ChatConfig>(`/api/widget/config?key=${publicKey}`)
      .then((r) => r.ok && r.data && setConfig(r.data))
      .catch(() => {});
  }, [publicKey]);

  // When embedded, tell the parent page to resize the iframe on open/close.
  useEffect(() => {
    if (!embedded || typeof window === "undefined") return;
    window.parent?.postMessage({ type: "helpdesk:widget", open }, "*");
  }, [open, embedded]);

  async function send(message: string): Promise<ChatResponse> {
    const r = await api.post<ChatResponse>("/api/widget/chat", {
      publicKey,
      sessionId,
      message,
    });
    if (!r.ok || !r.data) throw new Error(r.error ?? "failed");
    return r.data;
  }

  async function onContact(info: { name: string; email: string; query: string; priority: string }) {
    const r = await api.post<{ ticketId: string }>("/api/widget/ticket", {
      publicKey,
      sessionId,
      customerName: info.name,
      customerEmail: info.email,
      query: info.query,
      priority: info.priority,
    });
    return { ticketId: r.data?.ticketId };
  }

  const panel = (
    <div
      className={cn(
        "flex flex-col overflow-hidden bg-[var(--color-bg-2)]",
        embedded
          ? "h-full w-full"
          : "h-[min(34rem,72vh)] w-[min(24rem,calc(100vw-2.5rem))] rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] shadow-2xl"
      )}
    >
      <Header config={config} accent={accent} onClose={() => setOpen(false)} closable={!embedded} />
      <ChatPanel
        config={config}
        send={send}
        onContact={onContact}
        className="min-h-0 flex-1"
        bodyClassName="bg-[var(--color-bg)]"
      />
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-2)] py-1.5 text-center text-[0.66rem] text-ink-faint">
        Powered by <span className="font-medium text-ink-3">Helpdesk AI</span>
      </div>
    </div>
  );

  if (embedded) return panel;

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3" style={{ zIndex: "var(--z-modal)" }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "bottom right" }}
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="grid size-14 place-items-center rounded-full text-[var(--color-primary-ink)] shadow-2xl"
        style={{ background: accent }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <X size={24} /> : <MessageCircle size={24} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function Header({
  config,
  accent,
  onClose,
  closable,
}: {
  config: ChatConfig;
  accent: string;
  onClose: () => void;
  closable: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5"
      style={{ background: `linear-gradient(135deg, ${accent}, color-mix(in oklch, ${accent} 60%, #000))` }}
    >
      <span className="grid size-9 place-items-center rounded-full bg-white/20 font-display text-sm font-bold text-white backdrop-blur">
        {config.botName.slice(0, 1)}
      </span>
      <div className="flex-1">
        <div className="text-sm font-semibold text-white">{config.botName}</div>
        <div className="flex items-center gap-1.5 text-[0.72rem] text-white/80">
          <span className="size-1.5 rounded-full bg-[var(--color-success)]" />
          Online
        </div>
      </div>
      {closable && (
        <button onClick={onClose} aria-label="Minimize" className="text-white/80 hover:text-white">
          <X size={18} />
        </button>
      )}
    </div>
  );
}
