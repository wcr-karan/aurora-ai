"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, Plus, Search, Ticket as TicketIcon, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, PriorityBadge, Select, StatusBadge, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import {
  PRIORITIES,
  PRIORITY_META,
  STATUS_META,
  TICKET_STATUS,
  type Priority,
  type TicketStatus,
} from "@/lib/constants";
import { cn, formatDate, timeAgo } from "@/lib/utils";

interface Ticket {
  id: string;
  subject: string;
  query: string;
  customerName: string;
  customerEmail: string;
  priority: Priority;
  status: TicketStatus;
  category: string;
  source: string;
  reason?: string | null;
  conversationId?: string | null;
  createdAt: string;
  assignedTo?: { id: string; name: string } | null;
}

export default function TicketsPage() {
  const toast = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("");
  const [active, setActive] = useState<Ticket | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (priority) params.set("priority", priority);
    const r = await api.get<{ tickets: Ticket[] }>(`/api/tickets?${params}`);
    if (r.ok && r.data) setTickets(r.data.tickets);
    setLoading(false);
  }, [q, priority]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  async function move(id: string, status: TicketStatus) {
    setTickets((arr) => arr.map((t) => (t.id === id ? { ...t, status } : t)));
    const r = await api.patch(`/api/tickets/${id}`, { status });
    if (!r.ok) {
      toast.push("Could not update ticket", "error");
      load();
    }
  }

  const grouped = useMemo(() => {
    const g: Record<TicketStatus, Ticket[]> = { OPEN: [], IN_PROGRESS: [], RESOLVED: [], CLOSED: [] };
    for (const t of tickets) g[t.status]?.push(t);
    return g;
  }, [tickets]);

  return (
    <PageContainer>
      <PageHeader
        title="Tickets"
        subtitle="Everything the AI couldn't close, tracked to resolution."
        actions={
          <Button size="sm" onClick={() => setShowNew(true)}>
            <Plus size={15} /> New ticket
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets…" className="pl-9" />
        </div>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-auto">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_META[p].label}</option>
          ))}
        </Select>
        <span className="ml-auto text-[0.8rem] text-ink-faint">{tickets.length} tickets</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {TICKET_STATUS.map((status) => (
          <div
            key={status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragId) move(dragId, status);
              setDragId(null);
            }}
            className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-2)]/40"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-3.5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: STATUS_META[status].color }} />
                <span className="text-[0.84rem] font-semibold text-ink">{STATUS_META[status].label}</span>
              </div>
              <span className="mono text-[0.72rem] text-ink-faint">{grouped[status].length}</span>
            </div>
            <div className="flex-1 space-y-2.5 p-2.5">
              {loading ? (
                <div className="h-20 animate-pulse rounded-lg bg-[var(--color-surface)]" />
              ) : grouped[status].length === 0 ? (
                <div className="grid place-items-center py-8 text-center text-[0.76rem] text-ink-faint">
                  Drop tickets here
                </div>
              ) : (
                grouped[status].map((t) => (
                  <TicketCard
                    key={t.id}
                    ticket={t}
                    onClick={() => setActive(t)}
                    onDragStart={() => setDragId(t.id)}
                    onDragEnd={() => setDragId(null)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <TicketDrawer
            ticket={active}
            onClose={() => setActive(null)}
            onChange={(updated) => {
              setTickets((arr) => arr.map((t) => (t.id === updated.id ? updated : t)));
              setActive(updated);
            }}
          />
        )}
        {showNew && (
          <NewTicketModal
            onClose={() => setShowNew(false)}
            onCreated={() => {
              setShowNew(false);
              load();
              toast.push("Ticket created", "success");
            }}
          />
        )}
      </AnimatePresence>
    </PageContainer>
  );
}

function TicketCard({
  ticket,
  onClick,
  onDragStart,
  onDragEnd,
}: {
  ticket: Ticket;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <motion.button
      layout
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="bezel block w-full cursor-grab rounded-[0.8rem] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-left transition-colors hover:border-[var(--color-border-strong)] active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="line-clamp-2 text-[0.86rem] font-medium leading-snug text-ink">{ticket.subject}</span>
        <PriorityBadge priority={ticket.priority} />
      </div>
      <p className="mt-1.5 line-clamp-2 text-[0.78rem] text-ink-3">{ticket.query}</p>
      <div className="mt-3 flex items-center justify-between text-[0.7rem] text-ink-faint">
        <span className="truncate">{ticket.customerName}</span>
        <span>{timeAgo(ticket.createdAt)}</span>
      </div>
    </motion.button>
  );
}

function TicketDrawer({
  ticket,
  onClose,
  onChange,
}: {
  ticket: Ticket;
  onClose: () => void;
  onChange: (t: Ticket) => void;
}) {
  const toast = useToast();
  async function update(patch: Partial<Pick<Ticket, "status" | "priority">>) {
    const r = await api.patch<Ticket>(`/api/tickets/${ticket.id}`, patch);
    if (r.ok) {
      onChange({ ...ticket, ...patch });
      toast.push("Ticket updated", "success");
    } else toast.push("Update failed", "error");
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: "var(--z-backdrop)" }}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 340, damping: 36 }}
        className="fixed inset-y-0 right-0 w-full max-w-md overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)] p-6"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <h2 className="font-display text-xl font-bold tracking-tight text-ink">{ticket.subject}</h2>
        <p className="mt-1 text-[0.78rem] text-ink-faint mono">#{ticket.id.slice(-8).toUpperCase()} · {ticket.source}</p>

        <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-4">
          <p className="text-[0.74rem] uppercase tracking-wide text-ink-faint">Customer message</p>
          <p className="mt-2 whitespace-pre-wrap text-[0.9rem] text-ink-2">{ticket.query}</p>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4">
          <Detail label="Customer" value={ticket.customerName} />
          <Detail label="Email" value={ticket.customerEmail} mono />
          <Detail label="Category" value={ticket.category} />
          <Detail label="Created" value={formatDate(ticket.createdAt)} />
          {ticket.reason && <Detail label="Escalation reason" value={ticket.reason.replace(/_/g, " ")} />}
        </dl>

        <div className="mt-6 space-y-4 border-t border-[var(--color-border)] pt-5">
          <Field label="Status">
            <Select value={ticket.status} onChange={(e) => update({ status: e.target.value as TicketStatus })}>
              {TICKET_STATUS.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Priority">
            <Select value={ticket.priority} onChange={(e) => update({ priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_META[p].label}</option>
              ))}
            </Select>
          </Field>

          {ticket.conversationId && (
            <a
              href={`/conversations/${ticket.conversationId}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Mail size={15} /> View originating conversation
            </a>
          )}
        </div>
      </motion.aside>
    </>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-wide text-ink-faint">{label}</dt>
      <dd className={cn("mt-0.5 text-[0.86rem] text-ink", mono && "mono break-all")}>{value}</dd>
    </div>
  );
}

function NewTicketModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    subject: "",
    query: "",
    priority: "MEDIUM" as Priority,
  });
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const r = await api.post("/api/tickets", form);
    setSaving(false);
    if (r.ok) onCreated();
    else toast.push(r.error ?? "Could not create ticket", "error");
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ zIndex: "var(--z-backdrop)" }}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed left-1/2 top-1/2 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-6 shadow-2xl"
        style={{ zIndex: "var(--z-modal)" }}
      >
        <div className="mb-4 flex items-center gap-2">
          <TicketIcon size={18} className="text-primary" />
          <h2 className="text-lg font-semibold text-ink">New ticket</h2>
        </div>
        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Customer name">
              <Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
            </Field>
            <Field label="Email">
              <Input type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} required />
            </Field>
          </div>
          <Field label="Subject">
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
          </Field>
          <Field label="Query">
            <Textarea rows={3} value={form.query} onChange={(e) => setForm({ ...form, query: e.target.value })} required />
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{PRIORITY_META[p].label}</option>
              ))}
            </Select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>Create ticket</Button>
          </div>
        </form>
      </motion.div>
    </>
  );
}
