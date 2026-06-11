import type { Priority } from "../constants";
import type { EscalationDecision } from "./types";

interface Rule {
  reason: string;
  label: string;
  priority: Priority;
  patterns: RegExp[];
}

// Built-in intelligent escalation rules. Tenants extend these with their own
// keywords (config.escalationKeywords), and angry / human-handoff detection is
// toggleable per tenant.
const RULES: Rule[] = [
  {
    reason: "service_outage",
    label: "Service outage",
    priority: "URGENT",
    patterns: [/\boutage\b/i, /\bdown\b/i, /\bnot working\b/i, /\bcan'?t (log|sign) in\b/i, /\bsystem('?s)? down\b/i],
  },
  {
    reason: "legal_concern",
    label: "Legal concern",
    priority: "URGENT",
    patterns: [/\blegal\b/i, /\blawsuit\b/i, /\bsue\b/i, /\bgdpr\b/i, /\bcompliance\b/i, /\bdata breach\b/i, /\bprivacy violation\b/i],
  },
  {
    reason: "payment_failure",
    label: "Payment failure",
    priority: "HIGH",
    patterns: [/\bpayment (failed|failure|declined|issue)\b/i, /\bcharged (twice|double)\b/i, /\bbilling (error|issue|problem)\b/i, /\bcard declined\b/i, /\bdouble charged\b/i],
  },
  {
    reason: "refund_requested",
    label: "Refund requested",
    priority: "HIGH",
    patterns: [/\brefund\b/i, /\bmoney back\b/i, /\bchargeback\b/i, /\bcancel.* (subscription|plan|order).* refund\b/i],
  },
  {
    reason: "human_requested",
    label: "Human agent requested",
    priority: "MEDIUM",
    patterns: [/\b(speak|talk|connect|chat) (to|with) (a )?(human|person|agent|representative|someone|rep)\b/i, /\bhuman (agent|support|please)\b/i, /\breal person\b/i, /\blive agent\b/i],
  },
];

const ANGRY_PATTERNS: RegExp[] = [
  /\b(angry|furious|frustrated|fed up|ridiculous|unacceptable|worst|terrible|awful|horrible|disgusting|useless)\b/i,
  /\b(hate|disappointed|outrageous|scam|fraud)\b/i,
  /!{2,}/,
  /\b[A-Z]{4,}\b.*\b[A-Z]{4,}\b/, // shouting (multiple all-caps words)
];

export interface EscalationConfig {
  keywords: string[];
  autoEscalateAngry: boolean;
  autoEscalateHuman: boolean;
}

const PRIORITY_RANK: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Decide whether a message should escalate, why, and at what priority.
 * Combines built-in rules, tenant keywords, and sentiment/human-handoff toggles.
 * The highest-priority matching reason wins.
 */
export function classifyEscalation(
  message: string,
  config: EscalationConfig
): EscalationDecision {
  const matches: EscalationDecision[] = [];

  for (const rule of RULES) {
    if (rule.reason === "human_requested" && !config.autoEscalateHuman) continue;
    if (rule.patterns.some((p) => p.test(message))) {
      matches.push({
        escalate: true,
        reason: rule.reason,
        label: rule.label,
        priority: rule.priority,
      });
    }
  }

  // Tenant-defined keywords -> HIGH priority.
  for (const kw of config.keywords) {
    const k = kw.trim();
    if (k && new RegExp(`\\b${escapeRegExp(k)}\\b`, "i").test(message)) {
      matches.push({
        escalate: true,
        reason: "custom_keyword",
        label: `Matched rule: "${k}"`,
        priority: "HIGH",
      });
    }
  }

  if (config.autoEscalateAngry && ANGRY_PATTERNS.some((p) => p.test(message))) {
    matches.push({
      escalate: true,
      reason: "customer_angry",
      label: "Customer appears upset",
      priority: "HIGH",
    });
  }

  if (matches.length === 0) {
    return { escalate: false, priority: "LOW" };
  }

  matches.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]);
  return matches[0];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
