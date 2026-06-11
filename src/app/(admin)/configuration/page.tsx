"use client";

import { Plus, Save, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Field, Input, Skeleton, Textarea, Toggle } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { ChatPanel, type ChatResponse } from "@/components/chat/chat-panel";
import { PERSONALITIES, type Personality } from "@/lib/constants";
import { api } from "@/lib/client";
import { cn } from "@/lib/utils";

interface Config {
  botName: string;
  welcomeMessage: string;
  personality: Personality;
  accentColor: string;
  suggestedQuestions: string[];
  escalationKeywords: string[];
  autoEscalateAngry: boolean;
  autoEscalateHuman: boolean;
}

const SWATCHES = ["#5b8cff", "#6366f1", "#8b5cf6", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#ec4899"];

export default function ConfigurationPage() {
  const toast = useToast();
  const [config, setConfig] = useState<Config | null>(null);
  const [saving, setSaving] = useState(false);
  const sessionId = useMemo(() => `sess_preview_${Math.floor(performance.now())}`, []);

  useEffect(() => {
    api.get<Config>("/api/config").then((r) => r.ok && r.data && setConfig(r.data));
  }, []);

  function patch<K extends keyof Config>(key: K, value: Config[K]) {
    setConfig((c) => (c ? { ...c, [key]: value } : c));
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    const r = await api.put("/api/config", config);
    setSaving(false);
    if (r.ok) toast.push("Configuration saved", "success");
    else toast.push(r.error ?? "Could not save", "error");
  }

  async function send(message: string): Promise<ChatResponse> {
    const r = await api.post<{ turn: ChatResponse; requestContact?: boolean; ticketId?: string }>(
      "/api/chat",
      { sessionId, message }
    );
    if (!r.ok || !r.data) throw new Error(r.error ?? "failed");
    // /api/chat returns the full handler result; flatten the turn for the panel.
    return { ...r.data.turn, requestContact: r.data.requestContact, ticketId: r.data.ticketId };
  }

  if (!config) {
    return (
      <PageContainer>
        <PageHeader title="AI Configuration" subtitle="Shape your assistant's identity and rules." />
        <div className="grid gap-6 lg:grid-cols-[1fr_26rem]">
          <Skeleton className="h-[36rem]" />
          <Skeleton className="h-[36rem]" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="AI Configuration"
        subtitle="Shape your assistant's identity, voice, and escalation rules."
        actions={
          <Button onClick={save} loading={saving} size="sm">
            <Save size={15} /> Save changes
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_26rem]">
        {/* Form */}
        <div className="space-y-6">
          <section className="panel space-y-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Identity</h2>
            <Field label="Bot name">
              <Input value={config.botName} onChange={(e) => patch("botName", e.target.value)} placeholder="Aurora Assistant" />
            </Field>
            <Field label="Welcome message">
              <Textarea rows={2} value={config.welcomeMessage} onChange={(e) => patch("welcomeMessage", e.target.value)} />
            </Field>
            <Field label="Accent color">
              <div className="flex items-center gap-2">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    onClick={() => patch("accentColor", c)}
                    className={cn(
                      "size-7 rounded-full ring-2 ring-offset-2 ring-offset-[var(--color-surface)] transition-all",
                      config.accentColor.toLowerCase() === c ? "ring-[var(--color-ink)]" : "ring-transparent"
                    )}
                    style={{ background: c }}
                    aria-label={c}
                  />
                ))}
                <label className="relative ml-1 size-7 cursor-pointer overflow-hidden rounded-full border border-[var(--color-border-strong)]">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => patch("accentColor", e.target.value)}
                    className="absolute inset-[-25%] size-[150%] cursor-pointer"
                  />
                </label>
              </div>
            </Field>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Personality</h2>
            <div className="grid grid-cols-3 gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => patch("personality", p)}
                  className={cn(
                    "rounded-[0.7rem] border px-3 py-3 text-sm font-medium transition-colors",
                    config.personality === p
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-ink"
                      : "border-[var(--color-border)] bg-[var(--color-bg-2)] text-ink-3 hover:text-ink-2"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[0.78rem] text-ink-faint">
              {config.personality === "Professional" && "Polished, courteous, and concise corporate tone."}
              {config.personality === "Friendly" && "Warm, approachable, conversational — a tasteful emoji welcome."}
              {config.personality === "Technical" && "Precise and detail-oriented, with structured steps and tables."}
            </p>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Suggested questions</h2>
            <p className="-mt-2 text-[0.78rem] text-ink-faint">Shown as starter chips in an empty chat.</p>
            <TagInput
              values={config.suggestedQuestions}
              onChange={(v) => patch("suggestedQuestions", v)}
              placeholder="e.g. How do I track my order?"
              max={8}
            />
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="text-sm font-semibold text-ink">Escalation rules</h2>
            <p className="-mt-2 text-[0.78rem] text-ink-faint">
              Built-in detection already covers refunds, payments, outages and legal. Add your own trigger phrases:
            </p>
            <TagInput
              values={config.escalationKeywords}
              onChange={(v) => patch("escalationKeywords", v)}
              placeholder="e.g. cancel my account"
              max={30}
            />
            <div className="space-y-3 border-t border-[var(--color-border)] pt-4">
              <ToggleRow
                label="Escalate angry customers"
                desc="Detect frustration and route to a human at high priority."
                checked={config.autoEscalateAngry}
                onChange={(v) => patch("autoEscalateAngry", v)}
              />
              <ToggleRow
                label="Escalate on human request"
                desc='Hand off when a customer asks to "talk to a person".'
                checked={config.autoEscalateHuman}
                onChange={(v) => patch("autoEscalateHuman", v)}
              />
            </div>
          </section>
        </div>

        {/* Live preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-2 flex items-center gap-2 text-[0.8rem] text-ink-3">
            <Sparkles size={14} className="text-primary" />
            Live preview · talks to your real knowledge base
          </div>
          <div
            className="bezel flex h-[34rem] flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] shadow-2xl"
            key={config.personality}
          >
            <div
              className="flex items-center gap-3 px-4 py-3.5"
              style={{ background: `linear-gradient(135deg, ${config.accentColor}, color-mix(in oklch, ${config.accentColor} 55%, #000))` }}
            >
              <span className="grid size-9 place-items-center rounded-full bg-white/20 font-display text-sm font-bold text-white backdrop-blur">
                {config.botName.slice(0, 1) || "A"}
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{config.botName || "Assistant"}</div>
                <div className="flex items-center gap-1.5 text-[0.72rem] text-white/80">
                  <span className="size-1.5 rounded-full bg-[var(--color-success)]" /> Online
                </div>
              </div>
            </div>
            <ChatPanel
              key={`${config.botName}-${config.welcomeMessage}-${config.accentColor}-${config.suggestedQuestions.join(",")}`}
              config={{
                botName: config.botName,
                welcomeMessage: config.welcomeMessage,
                accentColor: config.accentColor,
                suggestedQuestions: config.suggestedQuestions,
              }}
              send={send}
              showSources
              className="min-h-0 flex-1"
              bodyClassName="bg-[var(--color-bg)]"
            />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-[0.76rem] text-ink-faint">{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

function TagInput({
  values,
  onChange,
  placeholder,
  max = 20,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (v && !values.includes(v) && values.length < max) {
      onChange([...values, v]);
      setDraft("");
    }
  }
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-bg-2)] py-1 pl-3 pr-1.5 text-[0.8rem] text-ink-2"
          >
            {v}
            <button
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="grid size-4 place-items-center rounded-full text-ink-faint hover:bg-[var(--color-surface-2)] hover:text-ink"
              aria-label={`Remove ${v}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      {values.length < max && (
        <div className="mt-2 flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={placeholder}
          />
          <Button variant="subtle" size="md" onClick={add} type="button">
            <Plus size={15} />
          </Button>
        </div>
      )}
    </div>
  );
}
