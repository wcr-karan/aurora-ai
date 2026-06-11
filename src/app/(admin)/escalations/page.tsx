"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge, Toggle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { PRIORITIES, PRIORITY_META, type Priority, type TicketStatus } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  query: string;
  customerName: string;
  priority: Priority;
  status: TicketStatus;
  reason?: string | null;
  conversationId?: string | null;
  createdAt: string;
}

export default function EscalationsPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyEscalated, setOnlyEscalated] = useState(true);

  async function load() {
    setLoading(true);
    const r = await api.get<{ tickets: Ticket[] }>("/api/tickets");
    if (r.ok && r.data) setTickets(r.data.tickets);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (onlyEscalated ? tickets.filter((t) => t.reason) : tickets),
    [tickets, onlyEscalated]
  );

  const lanes = useMemo(() => {
    const g: Record<Priority, Ticket[]> = { URGENT: [], HIGH: [], MEDIUM: [], LOW: [] };
    for (const t of filtered) g[t.priority]?.push(t);
    return g;
  }, [filtered]);

  async function resolve(id: string) {
    setTickets((arr) => arr.map((t) => (t.id === id ? { ...t, status: "RESOLVED" } : t)));
    const r = await api.patch(`/api/tickets/${id}`, { status: "RESOLVED" });
    if (r.ok) toast.push("Marked resolved", "success");
    else load();
  }

  return (
    <PageContainer>
      <PageHeader
        title="Escalations"
        subtitle="Flagged issues, sorted by urgency. Work the red lane first."
        actions={
          <label className="flex items-center gap-2 text-[0.8rem] text-ink-3">
            Auto-flagged only
            <Toggle checked={onlyEscalated} onChange={setOnlyEscalated} label="Only escalated" />
          </label>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PRIORITIES.map((p) => (
          <div key={p} className="panel bezel flex items-center gap-3 p-4">
            <span className="grid size-9 place-items-center rounded-xl" style={{ color: PRIORITY_META[p].color, background: PRIORITY_META[p].bg }}>
              <ShieldAlert size={17} />
            </span>
            <div>
              <div className="font-display text-xl font-bold text-ink mono">{lanes[p].length}</div>
              <div className="text-[0.74rem] text-ink-3">{PRIORITY_META[p].label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
        {PRIORITIES.map((p) => (
          <div key={p} className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-2)]/40">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3.5 py-3" style={{ borderColor: `${PRIORITY_META[p].color}33` }}>
              <span className="size-2 rounded-full" style={{ background: PRIORITY_META[p].color }} />
              <span className="text-[0.84rem] font-semibold text-ink">{PRIORITY_META[p].label}</span>
            </div>
            <div className="flex-1 space-y-2.5 p-2.5">
              {loading ? (
                <div className="h-24 animate-pulse rounded-lg bg-[var(--color-surface)]" />
              ) : lanes[p].length === 0 ? (
                <p className="py-8 text-center text-[0.76rem] text-ink-faint">Clear</p>
              ) : (
                lanes[p].map((t) => (
                  <motion.div
                    layout
                    key={t.id}
                    className="bezel rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2 text-[0.85rem] font-medium text-ink">{t.subject}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    {t.reason && (
                      <span
                        className="mt-2 inline-block rounded-md px-2 py-0.5 text-[0.68rem] font-medium"
                        style={{ color: PRIORITY_META[p].color, background: PRIORITY_META[p].bg }}
                      >
                        {t.reason.replace(/_/g, " ")}
                      </span>
                    )}
                    <div className="mt-2 flex items-center justify-between text-[0.7rem] text-ink-faint">
                      <span>{t.customerName}</span>
                      <span>{timeAgo(t.createdAt)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {t.status !== "RESOLVED" && t.status !== "CLOSED" && (
                        <Button size="sm" variant="subtle" onClick={() => resolve(t.id)}>
                          Resolve
                        </Button>
                      )}
                      {t.conversationId && (
                        <Link
                          href={`/conversations/${t.conversationId}`}
                          className="ml-auto inline-flex items-center gap-1 text-[0.76rem] text-primary hover:underline"
                        >
                          Open chat <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
