import { prisma } from "../db";

const DAY = 24 * 60 * 60 * 1000;

/** Five headline numbers for the admin dashboard. */
export async function getDashboard(businessId: string) {
  const [
    totalConversations,
    openTickets,
    resolvedTickets,
    escalatedConversations,
    resolvedByAI,
    documents,
    recentEvents,
    avgLatency,
  ] = await Promise.all([
    prisma.conversation.count({ where: { businessId } }),
    prisma.ticket.count({ where: { businessId, status: "OPEN" } }),
    prisma.ticket.count({ where: { businessId, status: { in: ["RESOLVED", "CLOSED"] } } }),
    prisma.conversation.count({ where: { businessId, escalated: true } }),
    prisma.conversation.count({ where: { businessId, resolvedByAI: true } }),
    prisma.document.count({ where: { businessId, status: "INDEXED" } }),
    prisma.event.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.message.aggregate({
      where: { businessId, role: "ASSISTANT", latencyMs: { gt: 0 } },
      _avg: { latencyMs: true },
    }),
  ]);

  const aiResolutionRate =
    totalConversations > 0 ? resolvedByAI / totalConversations : 0;

  const series = await dailySeries(businessId, 14);

  return {
    totalConversations,
    openTickets,
    resolvedTickets,
    escalatedConversations,
    aiResolutionRate,
    indexedDocuments: documents,
    avgResponseMs: Math.round(avgLatency._avg.latencyMs ?? 0),
    recentEvents,
    series,
  };
}

/** Full analytics payload: chat metrics + knowledge-base metrics + charts. */
export async function getAnalytics(businessId: string) {
  const [
    totalConversations,
    resolvedByAI,
    escalated,
    avgLatency,
    topDocuments,
    failedCount,
    answeredCount,
    unanswered,
    byChannel,
    byPriority,
    byStatus,
  ] = await Promise.all([
    prisma.conversation.count({ where: { businessId } }),
    prisma.conversation.count({ where: { businessId, resolvedByAI: true } }),
    prisma.conversation.count({ where: { businessId, escalated: true } }),
    prisma.message.aggregate({
      where: { businessId, role: "ASSISTANT", latencyMs: { gt: 0 } },
      _avg: { latencyMs: true },
    }),
    prisma.document.findMany({
      where: { businessId, refCount: { gt: 0 } },
      orderBy: { refCount: "desc" },
      take: 6,
      select: { id: true, name: true, type: true, refCount: true, chunkCount: true },
    }),
    prisma.queryLog.count({ where: { businessId, answered: false } }),
    prisma.queryLog.count({ where: { businessId, answered: true } }),
    prisma.queryLog.findMany({
      where: { businessId, answered: false },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: { id: true, question: true, createdAt: true, topScore: true },
    }),
    prisma.conversation.groupBy({
      by: ["channel"],
      where: { businessId },
      _count: true,
    }),
    prisma.ticket.groupBy({ by: ["priority"], where: { businessId }, _count: true }),
    prisma.ticket.groupBy({ by: ["status"], where: { businessId }, _count: true }),
  ]);

  const totalQueries = failedCount + answeredCount;

  return {
    chat: {
      totalConversations,
      avgResponseMs: Math.round(avgLatency._avg.latencyMs ?? 0),
      resolutionRate: totalConversations ? resolvedByAI / totalConversations : 0,
      escalationRate: totalConversations ? escalated / totalConversations : 0,
    },
    knowledge: {
      topDocuments,
      failedQueries: failedCount,
      totalQueries,
      answerRate: totalQueries ? answeredCount / totalQueries : 0,
      unanswered,
    },
    distribution: {
      byChannel: Object.fromEntries(byChannel.map((c) => [c.channel, c._count])),
      byPriority: Object.fromEntries(byPriority.map((p) => [p.priority, p._count])),
      byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    },
    series: await dailySeries(businessId, 14),
  };
}

/** Per-day conversation + escalation counts for the last `days` days. */
async function dailySeries(businessId: string, days: number) {
  const since = new Date(Date.now() - (days - 1) * DAY);
  since.setHours(0, 0, 0, 0);

  const [conversations, escalations, queries] = await Promise.all([
    prisma.conversation.findMany({
      where: { businessId, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.event.findMany({
      where: { businessId, type: "ESCALATION", createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.queryLog.findMany({
      where: { businessId, createdAt: { gte: since } },
      select: { createdAt: true, answered: true },
    }),
  ]);

  const buckets: {
    date: string;
    conversations: number;
    escalations: number;
    queries: number;
    failed: number;
  }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since.getTime() + i * DAY);
    buckets.push({
      date: d.toISOString().slice(0, 10),
      conversations: 0,
      escalations: 0,
      queries: 0,
      failed: 0,
    });
  }
  const indexOf = (d: Date) =>
    Math.floor((new Date(d).setHours(0, 0, 0, 0) - since.getTime()) / DAY);

  for (const c of conversations) {
    const i = indexOf(c.createdAt);
    if (buckets[i]) buckets[i].conversations++;
  }
  for (const e of escalations) {
    const i = indexOf(e.createdAt);
    if (buckets[i]) buckets[i].escalations++;
  }
  for (const q of queries) {
    const i = indexOf(q.createdAt);
    if (buckets[i]) {
      buckets[i].queries++;
      if (!q.answered) buckets[i].failed++;
    }
  }
  return buckets;
}
