"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  CircleHelp,
  Mail,
  ShieldAlert,
  Ticket as TicketIcon,
  UserRound,
  UserRoundCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PageContainer } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge, PriorityBadge, Skeleton } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { Markdown } from "@/components/chat/markdown";
import { LinkChips, RichCards, SourceChips } from "@/components/chat/rich";
import { api } from "@/lib/client";
import type { Priority } from "@/lib/constants";
import { cn, formatDate, initials, timeAgo } from "@/lib/utils";

interface Msg {
  id: string;
  role: "USER" | "ASSISTANT" | "AGENT" | "SYSTEM";
  content: string;
  latencyMs: number;
  createdAt: string;
  meta: {
    cards?: { title: string; subtitle?: string; badge?: string; fields?: { label: string; value: string }[] }[];
    links?: { label: string; url: string }[];
    sources?: { documentName: string; score: number }[];
    escalate?: boolean;
    escalationLabel?: string;
    agentName?: string;
  };
}

interface Conv {
  id: string;
  channel: string;
  customerName?: string | null;
  customerEmail?: string | null;
  status: string;
  escalated: boolean;
  handoff: boolean;
  resolvedByAI: boolean;
  createdAt: string;
  messages: Msg[];
  events: { id: string; type: string; summary: string; createdAt: string }[];
  tickets: { id: string; subject: string; priority: Priority; status: string }[];
}

export default function ConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const toast = useToast();
  const [conv, setConv] = useState<Conv | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await api.get<Conv>(`/api/conversations/${params.id}`);
    if (r.ok && r.data) setConv(r.data);
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages.length]);

  async function join() {
    const r = await api.post(`/api/conversations/${params.id}/handoff`);
    if (r.ok) {
      toast.push("You joined the conversation", "success");
      load();
    } else toast.push("Could not join", "error");
  }

  async function send() {
    const text = reply.trim();
    if (!text) return;
    setSending(true);
    const r = await api.post(`/api/conversations/${params.id}/message`, { content: text });
    setSending(false);
    if (r.ok) {
      setReply("");
      load();
    } else toast.push("Could not send", "error");
  }

  if (loading || !conv) {
    return (
      <PageContainer>
        <Skeleton className="mb-4 h-16" />
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <Skeleton className="h-[32rem]" />
          <Skeleton className="h-[32rem]" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Link href="/conversations" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft size={15} /> All conversations
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-[var(--color-surface-2)] text-sm font-semibold text-ink">
            {initials(conv.customerName || "Anon")}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight text-ink">
              {conv.customerName || "Anonymous visitor"}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-[0.78rem] text-ink-faint">
              {conv.customerEmail && <span className="mono">{conv.customerEmail}</span>}
              <span>· {conv.channel}</span>
              <span>· started {timeAgo(conv.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {conv.escalated && <Badge color="var(--color-accent)">Escalated</Badge>}
          {conv.resolvedByAI && <Badge color="var(--color-success)">AI resolved</Badge>}
          {!conv.handoff ? (
            <Button size="sm" variant="outline" onClick={join}>
              <UserRoundCheck size={15} /> Join conversation
            </Button>
          ) : (
            <Badge color="var(--color-primary-2)">You&rsquo;ve joined</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        {/* Transcript */}
        <div className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-2)]/40">
          <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ maxHeight: "60vh" }}>
            {conv.messages.map((m) => (
              <TranscriptMessage key={m.id} msg={m} />
            ))}
            <div ref={endRef} />
          </div>

          {conv.handoff && (
            <div className="border-t border-[var(--color-border)] p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-end gap-2 rounded-[0.9rem] border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] p-1.5 pl-3.5 focus-within:border-[var(--color-primary)]"
              >
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  placeholder="Reply as a human agent…"
                  className="max-h-24 flex-1 resize-none bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-faint"
                />
                <button
                  type="submit"
                  disabled={sending || !reply.trim()}
                  className="grid size-9 shrink-0 place-items-center rounded-[0.7rem] bg-primary text-[var(--color-primary-ink)] disabled:opacity-40"
                  aria-label="Send reply"
                >
                  <ArrowUp size={17} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Timeline + tickets */}
        <div className="space-y-4">
          {conv.tickets.length > 0 && (
            <div className="panel p-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">Tickets</h3>
              <div className="space-y-2">
                {conv.tickets.map((t) => (
                  <Link
                    key={t.id}
                    href="/tickets"
                    className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] p-2.5 text-[0.82rem] hover:border-[var(--color-border-strong)]"
                  >
                    <TicketIcon size={14} className="text-primary" />
                    <span className="line-clamp-1 flex-1 text-ink-2">{t.subject}</span>
                    <PriorityBadge priority={t.priority} />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="panel p-4">
            <h3 className="mb-3 text-sm font-semibold text-ink">Timeline</h3>
            <ol className="space-y-3">
              {conv.events.length === 0 && (
                <li className="text-[0.78rem] text-ink-faint">No events recorded.</li>
              )}
              {conv.events.map((e) => (
                <EventRow key={e.id} type={e.type} summary={e.summary} at={e.createdAt} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function TranscriptMessage({ msg }: { msg: Msg }) {
  if (msg.role === "SYSTEM") {
    return (
      <div className="flex items-center justify-center gap-2 py-1 text-[0.74rem] text-ink-faint">
        <span className="h-px w-8 bg-[var(--color-border)]" />
        {msg.content}
        <span className="h-px w-8 bg-[var(--color-border)]" />
      </div>
    );
  }

  const isUser = msg.role === "USER";
  const isAgent = msg.role === "AGENT";

  return (
    <div className={cn("flex gap-2.5", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full text-[0.66rem] font-bold",
          isUser
            ? "bg-[var(--color-surface-2)] text-ink-2"
            : isAgent
            ? "bg-[var(--color-primary-2)] text-white"
            : "bg-[var(--color-primary)] text-[var(--color-primary-ink)]"
        )}
      >
        {isUser ? <UserRound size={14} /> : isAgent ? initials(msg.meta.agentName ?? "AG") : "AI"}
      </span>
      <div className={cn("max-w-[80%] space-y-1", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5",
            isUser
              ? "rounded-tr-sm bg-[var(--color-surface-2)] text-ink"
              : isAgent
              ? "rounded-tl-sm border border-[color-mix(in_oklch,var(--color-primary-2)_40%,transparent)] bg-[color-mix(in_oklch,var(--color-primary-2)_12%,transparent)] text-ink-2"
              : "rounded-tl-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-ink-2"
          )}
        >
          {isUser ? <span className="whitespace-pre-wrap text-[0.9rem]">{msg.content}</span> : <Markdown>{msg.content}</Markdown>}

          {msg.meta.escalate && msg.meta.escalationLabel && (
            <div className="mt-2 flex items-center gap-1.5 text-[0.76rem] text-[var(--color-accent)]">
              <ShieldAlert size={13} /> {msg.meta.escalationLabel}
            </div>
          )}
          {msg.meta.cards && <RichCards cards={msg.meta.cards} />}
          {msg.meta.links && <LinkChips links={msg.meta.links} />}
          {msg.meta.sources && <SourceChips sources={msg.meta.sources} />}
        </div>
        <div className="px-1 text-[0.66rem] text-ink-faint">
          {isAgent && msg.meta.agentName ? `${msg.meta.agentName} · ` : ""}
          {formatDate(msg.createdAt)}
          {!isUser && !isAgent && msg.latencyMs > 0 ? ` · ${msg.latencyMs}ms` : ""}
        </div>
      </div>
    </div>
  );
}

const EVENT_META: Record<string, { icon: typeof ShieldAlert; color: string }> = {
  ESCALATION: { icon: ShieldAlert, color: "var(--color-accent)" },
  TICKET_CREATED: { icon: TicketIcon, color: "var(--color-primary)" },
  HANDOFF: { icon: UserRoundCheck, color: "var(--color-primary-2)" },
  RESOLVED: { icon: CheckCircle2, color: "var(--color-success)" },
  FAILED_QUERY: { icon: CircleHelp, color: "var(--color-warning)" },
};

function EventRow({ type, summary, at }: { type: string; summary: string; at: string }) {
  const meta = EVENT_META[type] ?? { icon: Mail, color: "var(--color-ink-3)" };
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md" style={{ color: meta.color, background: `color-mix(in oklch, ${meta.color} 14%, transparent)` }}>
        <Icon size={12} />
      </span>
      <div>
        <p className="text-[0.8rem] text-ink-2">{summary}</p>
        <p className="text-[0.68rem] text-ink-faint">{timeAgo(at)}</p>
      </div>
    </li>
  );
}
