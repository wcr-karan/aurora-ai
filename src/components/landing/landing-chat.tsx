"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client";
import { DEMO } from "@/lib/demo";
import { ChatPanel, type ChatConfig, type ChatResponse } from "@/components/chat/chat-panel";
import { cn } from "@/lib/utils";

const FALLBACK: ChatConfig = {
  botName: "Aurora Assistant",
  welcomeMessage:
    "Hi! 👋 I'm Aurora Outdoors' AI assistant. Ask me about orders, returns, gear, or warranties — I'm trained on our help center.",
  accentColor: "#5b8cff",
  suggestedQuestions: [
    "How do I track my order?",
    "What's your return policy?",
    "Compare your tent models",
    "I want a refund — I'm furious",
  ],
};

export function LandingChat({ className }: { className?: string }) {
  const [config, setConfig] = useState<ChatConfig>(FALLBACK);
  const sessionId = useMemo(
    () => `sess_demo_${Math.floor(performance.now())}_${Math.floor(performance.now() % 9973)}`,
    []
  );

  useEffect(() => {
    api
      .get<ChatConfig>(`/api/widget/config?key=${DEMO.publicKey}`)
      .then((r) => r.ok && r.data && setConfig(r.data))
      .catch(() => {});
  }, []);

  async function send(message: string): Promise<ChatResponse> {
    const r = await api.post<ChatResponse>("/api/widget/chat", {
      publicKey: DEMO.publicKey,
      sessionId,
      message,
    });
    if (!r.ok || !r.data) throw new Error(r.error ?? "failed");
    return r.data;
  }

  async function onContact(info: { name: string; email: string; query: string; priority: string }) {
    const r = await api.post<{ ticketId: string }>("/api/widget/ticket", {
      publicKey: DEMO.publicKey,
      sessionId,
      customerName: info.name,
      customerEmail: info.email,
      query: info.query,
      priority: info.priority,
    });
    return { ticketId: r.data?.ticketId };
  }

  return (
    <div
      className={cn(
        "bezel flex h-[33rem] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] shadow-2xl",
        className
      )}
    >
      <div
        className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3"
        style={{ background: "color-mix(in oklch, var(--color-bg-2) 70%, var(--color-surface))" }}
      >
        <span className="relative grid size-9 place-items-center rounded-full" style={{ background: config.accentColor }}>
          <span className="font-display text-sm font-bold text-[var(--color-primary-ink)]">
            {config.botName.slice(0, 1)}
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[var(--color-bg-2)] bg-[var(--color-success)]" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-ink">{config.botName}</div>
          <div className="mono flex items-center gap-1.5 text-[0.68rem] uppercase tracking-wider text-ink-3">
            <span className="size-1.5 rounded-full bg-[var(--color-success)]" />
            online · replies instantly
          </div>
        </div>
        <span className="chip">[ live_demo ]</span>
      </div>

      <ChatPanel
        config={config}
        send={send}
        onContact={onContact}
        className="min-h-0 flex-1"
        bodyClassName="bg-[var(--color-bg)]"
      />
    </div>
  );
}
