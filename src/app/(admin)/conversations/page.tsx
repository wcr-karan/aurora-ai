"use client";

import Link from "next/link";
import {
  ChevronRight,
  Mail,
  MessageCircle,
  type LucideIcon,
  Phone,
  Search,
  ShieldAlert,
  UserRoundCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Input, Select, EmptyState, Skeleton } from "@/components/ui/primitives";
import { api } from "@/lib/client";
import { cn, timeAgo } from "@/lib/utils";

interface ConvRow {
  id: string;
  channel: string;
  customerName?: string | null;
  customerEmail?: string | null;
  status: string;
  escalated: boolean;
  handoff: boolean;
  resolvedByAI: boolean;
  messageCount: number;
  ticketCount: number;
  lastMessage: string;
  lastMessageAt: string;
}

const CHANNEL_ICON: Record<string, LucideIcon> = {
  WIDGET: MessageCircle,
  WHATSAPP: Phone,
  EMAIL: Mail,
};

export default function ConversationsPage() {
  const [rows, setRows] = useState<ConvRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (filter) params.set("filter", filter);
    const r = await api.get<ConvRow[]>(`/api/conversations?${params}`);
    if (r.ok && r.data) setRows(r.data);
    setLoading(false);
  }, [q, filter]);

  useEffect(() => {
    const t = setTimeout(load, 220);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <PageContainer>
      <PageHeader title="Conversations" subtitle="Every customer thread, searchable down to the message." />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search messages, names, emails…" className="pl-9" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} className="w-auto">
          <option value="">All conversations</option>
          <option value="escalated">Escalated</option>
          <option value="resolved">AI resolved</option>
        </Select>
        <span className="ml-auto text-[0.8rem] text-ink-faint">{rows.length} threads</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[4.5rem]" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={22} />}
          title="No conversations yet"
          description="When customers chat with your assistant, their threads appear here."
        />
      ) : (
        <div className="space-y-2">
          {rows.map((c) => {
            const Icon = CHANNEL_ICON[c.channel] ?? MessageCircle;
            return (
              <Link
                key={c.id}
                href={`/conversations/${c.id}`}
                className="group flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--color-bg-2)] text-ink-2">
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[0.9rem] font-medium text-ink">
                      {c.customerName || "Anonymous visitor"}
                    </span>
                    {c.escalated && (
                      <ShieldAlert size={13} className="shrink-0 text-[var(--color-accent)]" />
                    )}
                    {c.handoff && (
                      <UserRoundCheck size={13} className="shrink-0 text-[var(--color-primary-2)]" />
                    )}
                  </div>
                  <p className="truncate text-[0.8rem] text-ink-3">{c.lastMessage}</p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-1 text-[0.72rem] text-ink-faint sm:flex">
                  <span>{timeAgo(c.lastMessageAt)}</span>
                  <span className="flex items-center gap-2">
                    <span className="mono">{c.messageCount} msgs</span>
                    {c.resolvedByAI && !c.escalated && (
                      <span className="rounded bg-[color-mix(in_oklch,var(--color-success)_16%,transparent)] px-1.5 py-0.5 text-[var(--color-success)]">
                        AI resolved
                      </span>
                    )}
                  </span>
                </div>
                <ChevronRight size={16} className={cn("shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5")} />
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
