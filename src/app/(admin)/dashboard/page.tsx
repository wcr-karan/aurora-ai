"use client";

import Link from "next/link";
import {
  CheckCircle2,
  CircleHelp,
  Inbox,
  type LucideIcon,
  MessagesSquare,
  ShieldAlert,
  Ticket,
  Timer,
  UserRoundCheck,
  Zap,
} from "lucide-react";
import { AreaChart, Gauge } from "@/components/charts";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Skeleton } from "@/components/ui/primitives";
import { useApi } from "@/lib/use-api";
import { timeAgo, pct, cn } from "@/lib/utils";

interface DashboardData {
  totalConversations: number;
  openTickets: number;
  resolvedTickets: number;
  escalatedConversations: number;
  aiResolutionRate: number;
  indexedDocuments: number;
  avgResponseMs: number;
  recentEvents: { id: string; type: string; summary: string; createdAt: string }[];
  series: { date: string; conversations: number; escalations: number }[];
}

export default function DashboardPage() {
  const { data, loading } = useApi<DashboardData>("/api/dashboard");

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        subtitle="Your support operation at a glance."
      />

      {loading || !data ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Stat icon={MessagesSquare} label="Conversations" value={data.totalConversations.toLocaleString()} tone="primary" />
            <Stat icon={Inbox} label="Open tickets" value={data.openTickets.toLocaleString()} tone="warning" />
            <Stat icon={CheckCircle2} label="Resolved tickets" value={data.resolvedTickets.toLocaleString()} tone="success" />
            <Stat icon={ShieldAlert} label="Escalated" value={data.escalatedConversations.toLocaleString()} tone="accent" />
            <Stat icon={Zap} label="AI resolution" value={pct(data.aiResolutionRate)} tone="success" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <div className="panel p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-ink">Conversations</h2>
                  <p className="text-[0.78rem] text-ink-faint">Last 14 days</p>
                </div>
                <span className="chip mono text-[0.66rem]">
                  <Timer size={11} /> avg {data.avgResponseMs}ms
                </span>
              </div>
              <AreaChart data={data.series.map((s) => s.conversations)} height={190} />
            </div>

            <div className="panel flex flex-col items-center justify-center gap-3 p-5">
              <h2 className="self-start text-sm font-semibold text-ink">AI resolution rate</h2>
              <Gauge value={data.aiResolutionRate} label={pct(data.aiResolutionRate)} sublabel="resolved by AI" color="var(--color-success)" />
              <p className="text-center text-[0.78rem] text-ink-3">
                {data.indexedDocuments} document{data.indexedDocuments === 1 ? "" : "s"} indexed in your knowledge base.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="panel p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Jump back in</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <QuickLink href="/knowledge-base" icon={MessagesSquare} label="Upload docs" />
                <QuickLink href="/configuration" icon={Zap} label="Tune the bot" />
                <QuickLink href="/tickets" icon={Ticket} label="Work tickets" />
                <QuickLink href="/analytics" icon={CheckCircle2} label="See analytics" />
              </div>
            </div>

            <div className="panel p-5">
              <h2 className="mb-4 text-sm font-semibold text-ink">Recent activity</h2>
              {data.recentEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-faint">
                  No activity yet. Try the assistant from the live widget.
                </p>
              ) : (
                <ul className="space-y-3">
                  {data.recentEvents.map((e) => (
                    <ActivityRow key={e.id} type={e.type} summary={e.summary} at={e.createdAt} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

const TONES: Record<string, { color: string }> = {
  primary: { color: "var(--color-primary)" },
  success: { color: "var(--color-success)" },
  warning: { color: "var(--color-warning)" },
  accent: { color: "var(--color-accent)" },
};

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: keyof typeof TONES;
}) {
  const { color } = TONES[tone];
  return (
    <div className="panel bezel lift p-4">
      <span
        className="grid size-8 place-items-center rounded-lg"
        style={{ color, background: `color-mix(in oklch, ${color} 15%, transparent)` }}
      >
        <Icon size={16} />
      </span>
      <div className="mt-3 font-display text-[1.7rem] font-bold leading-none text-ink mono">{value}</div>
      <div className="mt-1.5 text-[0.78rem] text-ink-3">{label}</div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2.5 rounded-[0.7rem] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-3 text-sm text-ink-2 transition-colors hover:border-[var(--color-primary)] hover:text-ink"
    >
      <Icon size={16} className="text-ink-faint transition-colors group-hover:text-primary" />
      {label}
    </Link>
  );
}

const EVENT_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  ESCALATION: { icon: ShieldAlert, color: "var(--color-accent)" },
  TICKET_CREATED: { icon: Ticket, color: "var(--color-primary)" },
  HANDOFF: { icon: UserRoundCheck, color: "var(--color-primary-2)" },
  RESOLVED: { icon: CheckCircle2, color: "var(--color-success)" },
  FAILED_QUERY: { icon: CircleHelp, color: "var(--color-warning)" },
};

function ActivityRow({ type, summary, at }: { type: string; summary: string; at: string }) {
  const meta = EVENT_ICON[type] ?? EVENT_ICON.TICKET_CREATED;
  const Icon = meta.icon;
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg"
        style={{ color: meta.color, background: `color-mix(in oklch, ${meta.color} 14%, transparent)` }}
      >
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.85rem] text-ink-2">{summary}</p>
        <p className="text-[0.7rem] text-ink-faint">{timeAgo(at)}</p>
      </div>
    </li>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-28")} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
