"use client";

import { CircleHelp, FileText, Inbox, Timer, TrendingUp, Zap } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { AreaChart, Bars, Gauge, ProgressBar } from "@/components/charts";
import { EmptyState, Skeleton } from "@/components/ui/primitives";
import { useApi } from "@/lib/use-api";
import { PRIORITIES, PRIORITY_META } from "@/lib/constants";
import { pct, timeAgo } from "@/lib/utils";

interface Analytics {
  chat: { totalConversations: number; avgResponseMs: number; resolutionRate: number; escalationRate: number };
  knowledge: {
    topDocuments: { id: string; name: string; type: string; refCount: number; chunkCount: number }[];
    failedQueries: number;
    totalQueries: number;
    answerRate: number;
    unanswered: { id: string; question: string; createdAt: string; topScore: number }[];
  };
  distribution: { byChannel: Record<string, number>; byPriority: Record<string, number>; byStatus: Record<string, number> };
  series: { date: string; conversations: number; queries: number; failed: number }[];
}

function ms(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${v}ms`;
}

export default function AnalyticsPage() {
  const { data, loading } = useApi<Analytics>("/api/analytics");

  if (loading || !data) {
    return (
      <PageContainer>
        <PageHeader title="Analytics" subtitle="How your assistant and knowledge base are performing." />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </PageContainer>
    );
  }

  const maxRef = Math.max(...data.knowledge.topDocuments.map((d) => d.refCount), 1);

  return (
    <PageContainer>
      <PageHeader title="Analytics" subtitle="How your assistant and knowledge base are performing." />

      {/* Chat metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Metric icon={Inbox} color="var(--color-primary)" label="Total conversations" value={data.chat.totalConversations.toLocaleString()} />
        <Metric icon={Timer} color="var(--color-primary-2)" label="Avg response time" value={ms(data.chat.avgResponseMs)} />
        <Metric icon={Zap} color="var(--color-success)" label="Resolution rate" value={pct(data.chat.resolutionRate)} />
        <Metric icon={TrendingUp} color="var(--color-accent)" label="Escalation rate" value={pct(data.chat.escalationRate)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Volume · last 14 days</h2>
          <AreaChart data={data.series.map((s) => s.conversations)} height={180} />
          <div className="mt-4 flex items-center gap-5 text-[0.74rem] text-ink-3">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--color-primary)]" /> Conversations</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[var(--color-accent)]" /> Failed queries (below)</span>
          </div>
          <div className="mt-2">
            <AreaChart data={data.series.map((s) => s.failed)} height={70} color="var(--color-accent)" />
          </div>
        </div>

        <div className="panel flex flex-col items-center justify-center gap-3 p-5">
          <h2 className="self-start text-sm font-semibold text-ink">Knowledge answer rate</h2>
          <Gauge value={data.knowledge.answerRate} label={pct(data.knowledge.answerRate)} sublabel="queries answered" />
          <p className="text-center text-[0.78rem] text-ink-3">
            {data.knowledge.totalQueries - data.knowledge.failedQueries} of {data.knowledge.totalQueries} queries grounded in your docs.
          </p>
        </div>
      </div>

      {/* Knowledge base metrics */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Most referenced documents</h2>
          {data.knowledge.topDocuments.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-faint">No documents referenced yet.</p>
          ) : (
            <div className="space-y-3.5">
              {data.knowledge.topDocuments.map((d) => (
                <div key={d.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-[0.84rem]">
                    <span className="flex min-w-0 items-center gap-2 text-ink-2">
                      <FileText size={14} className="shrink-0 text-ink-faint" />
                      <span className="truncate">{d.name}</span>
                    </span>
                    <span className="mono shrink-0 text-ink-3">{d.refCount}×</span>
                  </div>
                  <ProgressBar value={d.refCount / maxRef} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Unanswered questions</h2>
            <span className="chip text-[0.7rem]">
              <CircleHelp size={12} /> {data.knowledge.failedQueries} gaps
            </span>
          </div>
          {data.knowledge.unanswered.length === 0 ? (
            <EmptyState title="No gaps found" description="Every question so far was answerable from your docs." />
          ) : (
            <ul className="space-y-2.5">
              {data.knowledge.unanswered.map((u) => (
                <li key={u.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] p-3">
                  <p className="text-[0.84rem] text-ink-2">{u.question}</p>
                  <p className="mt-1 text-[0.68rem] text-ink-faint">
                    {timeAgo(u.createdAt)} · best match {Math.round(u.topScore * 100)}%
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Distribution */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Tickets by priority</h2>
          <Bars
            data={PRIORITIES.map((p) => ({
              label: PRIORITY_META[p].label.slice(0, 3),
              value: data.distribution.byPriority[p] ?? 0,
              color: PRIORITY_META[p].color,
            }))}
          />
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">By channel</h2>
          <DistList dist={data.distribution.byChannel} />
        </div>
        <div className="panel p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">By status</h2>
          <DistList dist={data.distribution.byStatus} />
        </div>
      </div>
    </PageContainer>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Inbox;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="panel bezel p-4">
      <span className="grid size-8 place-items-center rounded-lg" style={{ color, background: `color-mix(in oklch, ${color} 15%, transparent)` }}>
        <Icon size={16} />
      </span>
      <div className="mt-3 font-display text-[1.7rem] font-bold leading-none text-ink mono">{value}</div>
      <div className="mt-1.5 text-[0.78rem] text-ink-3">{label}</div>
    </div>
  );
}

function DistList({ dist }: { dist: Record<string, number> }) {
  const entries = Object.entries(dist);
  const total = entries.reduce((a, [, v]) => a + v, 0) || 1;
  const COLORS = ["var(--color-primary)", "var(--color-primary-2)", "var(--color-accent)", "var(--color-success)", "var(--color-warning)"];
  if (entries.length === 0) return <p className="py-4 text-center text-sm text-ink-faint">No data</p>;
  return (
    <div className="space-y-3">
      {entries.map(([k, v], i) => (
        <div key={k}>
          <div className="mb-1 flex items-center justify-between text-[0.8rem]">
            <span className="capitalize text-ink-2">{k.toLowerCase().replace(/_/g, " ")}</span>
            <span className="mono text-ink-3">{v}</span>
          </div>
          <ProgressBar value={v / total} color={COLORS[i % COLORS.length]} />
        </div>
      ))}
    </div>
  );
}
