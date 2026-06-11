// Application-level enumerations. Modelled as const unions (not DB enums) so the
// Prisma schema stays portable across SQLite and PostgreSQL.

export const ROLES = ["OWNER", "AGENT"] as const;
export type Role = (typeof ROLES)[number];

export const PERSONALITIES = ["Professional", "Friendly", "Technical"] as const;
export type Personality = (typeof PERSONALITIES)[number];

export const DOC_TYPES = ["PDF", "DOCX", "TXT", "MD"] as const;
export type DocType = (typeof DOC_TYPES)[number];

export const DOC_STATUS = ["PROCESSING", "INDEXED", "FAILED"] as const;
export type DocStatus = (typeof DOC_STATUS)[number];

export const TICKET_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type TicketStatus = (typeof TICKET_STATUS)[number];

export const PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CHANNELS = ["WIDGET", "WHATSAPP", "EMAIL"] as const;
export type Channel = (typeof CHANNELS)[number];

export const MESSAGE_ROLES = ["USER", "ASSISTANT", "AGENT", "SYSTEM"] as const;
export type MessageRole = (typeof MESSAGE_ROLES)[number];

export const EVENT_TYPES = [
  "ESCALATION",
  "TICKET_CREATED",
  "HANDOFF",
  "RESOLVED",
  "FAILED_QUERY",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; bg: string; dot: string }
> = {
  URGENT: { label: "Urgent", color: "#f43f5e", bg: "rgba(244,63,94,.12)", dot: "#f43f5e" },
  HIGH: { label: "High", color: "#fb923c", bg: "rgba(251,146,60,.12)", dot: "#fb923c" },
  MEDIUM: { label: "Medium", color: "#facc15", bg: "rgba(250,204,21,.12)", dot: "#facc15" },
  LOW: { label: "Low", color: "#34d399", bg: "rgba(52,211,153,.12)", dot: "#34d399" },
};

export const STATUS_META: Record<
  TicketStatus,
  { label: string; color: string }
> = {
  OPEN: { label: "Open", color: "#6366f1" },
  IN_PROGRESS: { label: "In Progress", color: "#f59e0b" },
  RESOLVED: { label: "Resolved", color: "#10b981" },
  CLOSED: { label: "Closed", color: "#64748b" },
};
