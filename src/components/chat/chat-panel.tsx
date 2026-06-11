"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, LifeBuoy, ShieldAlert, Sparkles, User } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { RichCard, RichLink } from "@/lib/ai/types";
import type { Priority } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/ui/logo";
import { Markdown } from "./markdown";
import { LinkChips, RichCards, SourceChips, SuggestionChips } from "./rich";

export interface ChatConfig {
  botName: string;
  welcomeMessage: string;
  accentColor: string;
  suggestedQuestions: string[];
}

export interface ChatResponse {
  answer: string;
  cards?: RichCard[];
  links?: RichLink[];
  suggestions?: string[];
  escalate?: boolean;
  escalationLabel?: string;
  requestContact?: boolean;
  ticketId?: string;
  canAnswer?: boolean;
  sources?: { documentName: string; score: number }[];
  latencyMs?: number;
}

export interface ChatMsg {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  cards?: RichCard[];
  links?: RichLink[];
  suggestions?: string[];
  sources?: { documentName: string; score: number }[];
  escalate?: boolean;
  escalationLabel?: string;
  requestContact?: boolean;
  ticketId?: string;
  latencyMs?: number;
  typing?: boolean;
}

interface ChatPanelProps {
  config: ChatConfig;
  send: (message: string) => Promise<ChatResponse>;
  onContact?: (info: {
    name: string;
    email: string;
    query: string;
    priority: Priority;
  }) => Promise<{ ticketId?: string }>;
  showSources?: boolean;
  className?: string;
  bodyClassName?: string;
  seed?: ChatMsg[];
}

let counter = 0;
const uid = () => `m${++counter}_${Math.floor(performance.now())}`;

export function ChatPanel({
  config,
  send,
  onContact,
  showSources,
  className,
  bodyClassName,
  seed,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMsg[]>(
    seed ?? [{ id: "welcome", role: "assistant", text: config.welcomeMessage }]
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingContact, setPendingContact] = useState<{ query: string; priority: Priority } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const accent = config.accentColor || "var(--color-primary)";

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const showSuggestions =
    messages.filter((m) => m.role === "user").length === 0 &&
    config.suggestedQuestions.length > 0;

  async function submit(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);

    setMessages((m) => [
      ...m,
      { id: uid(), role: "user", text: q },
      { id: uid(), role: "assistant", text: "", typing: true },
    ]);

    try {
      const res = await send(q);
      setMessages((m) => {
        const copy = [...m];
        const idx = copy.findIndex((x) => x.typing);
        if (idx !== -1) {
          copy[idx] = {
            id: copy[idx].id,
            role: "assistant",
            text: res.answer,
            cards: res.cards,
            links: res.links,
            suggestions: res.suggestions,
            sources: showSources ? res.sources : undefined,
            escalate: res.escalate,
            escalationLabel: res.escalationLabel,
            requestContact: res.requestContact,
            ticketId: res.ticketId,
            latencyMs: res.latencyMs,
          };
        }
        return copy;
      });
      if (res.requestContact && onContact) {
        setPendingContact({
          query: q,
          priority: (res as { priority?: Priority }).priority ?? "MEDIUM",
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        const idx = copy.findIndex((x) => x.typing);
        if (idx !== -1)
          copy[idx] = {
            id: copy[idx].id,
            role: "assistant",
            text: "Sorry, something went wrong reaching the assistant. Please try again.",
          };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("flex flex-col", className)}>
      <div
        ref={scrollRef}
        className={cn("flex-1 space-y-4 overflow-y-auto px-4 py-5", bodyClassName)}
      >
        {messages.map((m) =>
          m.role === "system" ? (
            <SystemLine key={m.id} text={m.text} />
          ) : (
            <Bubble
              key={m.id}
              msg={m}
              accent={accent}
              botName={config.botName}
              showSources={showSources}
              onPick={(q) => submit(q)}
            />
          )
        )}

        {showSuggestions && (
          <SuggestionChips suggestions={config.suggestedQuestions} onPick={(q) => submit(q)} />
        )}

        {pendingContact && onContact && (
          <ContactForm
            accent={accent}
            onSubmit={async (info) => {
              const r = await onContact({ ...info, query: pendingContact.query, priority: pendingContact.priority });
              setPendingContact(null);
              setMessages((m) => [
                ...m,
                {
                  id: uid(),
                  role: "assistant",
                  text: `Thanks ${info.name.split(" ")[0]} — I've opened ticket **#${(r.ticketId ?? "").slice(-6).toUpperCase()}** and our team will email you at ${info.email} shortly.`,
                },
              ]);
            }}
          />
        )}
      </div>

      <Composer
        value={input}
        setValue={setInput}
        onSend={() => submit(input)}
        busy={busy}
        accent={accent}
        botName={config.botName}
      />
    </div>
  );
}

function Bubble({
  msg,
  accent,
  botName,
  showSources,
  onPick,
}: {
  msg: ChatMsg;
  accent: string;
  botName: string;
  showSources?: boolean;
  onPick: (q: string) => void;
}) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex gap-2.5", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full",
          isUser ? "bg-[var(--color-surface-2)] text-ink-2" : "text-[var(--color-primary-ink)]"
        )}
        style={!isUser ? { background: accent } : undefined}
      >
        {isUser ? <User size={14} /> : <LogoMark size={16} />}
      </div>

      <div className={cn("max-w-[82%] space-y-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[0.9rem] leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-[var(--color-surface-2)] text-ink"
              : "rounded-tl-sm bg-[var(--color-surface)] text-ink-2 border border-[var(--color-border)]"
          )}
        >
          {msg.typing ? (
            <TypingDots />
          ) : isUser ? (
            <span className="whitespace-pre-wrap">{msg.text}</span>
          ) : (
            <Markdown>{msg.text}</Markdown>
          )}

          {!isUser && msg.escalate && msg.escalationLabel && (
            <div
              className="mt-2.5 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[0.8rem]"
              style={{
                borderColor: "color-mix(in oklch, var(--color-accent) 35%, transparent)",
                background: "var(--color-accent-soft)",
                color: "var(--color-accent)",
              }}
            >
              <ShieldAlert size={14} />
              <span>Escalated to a human · {msg.escalationLabel}</span>
            </div>
          )}

          {!isUser && msg.cards && <RichCards cards={msg.cards} accent={accent} />}
          {!isUser && msg.links && <LinkChips links={msg.links} />}
          {!isUser && showSources && msg.sources && <SourceChips sources={msg.sources} />}
        </div>

        {!isUser && msg.latencyMs != null && msg.latencyMs > 0 && (
          <div className="px-1 text-[0.66rem] text-ink-faint mono">
            {botName} · {msg.latencyMs}ms
          </div>
        )}

        {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
          <SuggestionChips suggestions={msg.suggestions} onPick={onPick} />
        )}
      </div>
    </motion.div>
  );
}

function SystemLine({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-1 text-[0.74rem] text-ink-faint">
      <span className="h-px w-8 bg-[var(--color-border)]" />
      <LifeBuoy size={12} />
      {text}
      <span className="h-px w-8 bg-[var(--color-border)]" />
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-ink-3"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function Composer({
  value,
  setValue,
  onSend,
  busy,
  accent,
  botName,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  busy: boolean;
  accent: string;
  botName: string;
}) {
  return (
    <div className="border-t border-[var(--color-border)] p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-end gap-2 rounded-[0.9rem] border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] p-1.5 pl-3.5 transition-colors focus-within:border-[var(--color-primary)]"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          rows={1}
          placeholder={`Message ${botName}…`}
          className="max-h-28 flex-1 resize-none bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <button
          type="submit"
          disabled={busy || !value.trim()}
          aria-label="Send message"
          className="grid size-9 shrink-0 place-items-center rounded-[0.7rem] text-[var(--color-primary-ink)] transition-all disabled:opacity-40 active:scale-95"
          style={{ background: accent }}
        >
          {busy ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <ArrowUp size={17} />
          )}
        </button>
      </form>
    </div>
  );
}

function ContactForm({
  accent,
  onSubmit,
}: {
  accent: string;
  onSubmit: (info: { name: string; email: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const formId = useId();

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        setSubmitting(true);
        await onSubmit({ name, email });
        setSubmitting(false);
      }}
      className="ml-9 space-y-2 rounded-[0.9rem] border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] p-3.5"
    >
      <p className="text-[0.82rem] font-medium text-ink">
        Leave your details and our team will follow up:
      </p>
      <input
        id={`${formId}-name`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-ink outline-none focus:border-[var(--color-primary)]"
      />
      <input
        id={`${formId}-email`}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="w-full rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg)] px-3 py-2 text-sm text-ink outline-none focus:border-[var(--color-primary)]"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-[var(--color-primary-ink)] disabled:opacity-60"
        style={{ background: accent }}
      >
        {submitting ? "Opening ticket…" : "Create support ticket"}
        <Sparkles size={14} />
      </button>
    </motion.form>
  );
}
