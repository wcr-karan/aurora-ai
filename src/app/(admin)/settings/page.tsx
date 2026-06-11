"use client";

import { Check, Copy, ExternalLink, Plus, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { PageContainer, PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Field, Input, Select, Skeleton } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/client";
import { initials } from "@/lib/utils";

interface Me {
  user: { id: string; name: string; email: string; role: string };
  business: { id: string; name: string; slug: string; publicKey: string };
  ai: { generation: string; embeddings: string; demoMode: boolean };
}
interface Agent {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const toast = useToast();
  const [me, setMe] = useState<Me | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const [invite, setInvite] = useState({ name: "", email: "", password: "", role: "AGENT" });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    api.get<Me>("/api/auth/me").then((r) => r.ok && r.data && setMe(r.data));
    api.get<Agent[]>("/api/agents").then((r) => r.ok && r.data && setAgents(r.data));
  }, []);

  if (!me) {
    return (
      <PageContainer>
        <PageHeader title="Settings" subtitle="Workspace, team, and integration." />
        <Skeleton className="h-64" />
      </PageContainer>
    );
  }

  const snippet = `<script src="${origin}/widget.js" data-key="${me.business.publicKey}" defer></script>`;
  const isOwner = me.user.role === "OWNER";

  async function addAgent(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    const r = await api.post<Agent>("/api/agents", invite);
    setInviting(false);
    if (r.ok && r.data) {
      setAgents((a) => [...a, r.data!]);
      setInvite({ name: "", email: "", password: "", role: "AGENT" });
      toast.push("Teammate added", "success");
    } else toast.push(r.error ?? "Could not add teammate", "error");
  }

  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Workspace, team, and integration." />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Workspace */}
        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold text-ink">Workspace</h2>
          <Field label="Business name">
            <Input value={me.business.name} readOnly />
          </Field>
          <Field label="Tenant slug">
            <Input value={me.business.slug} readOnly className="mono" />
          </Field>
          <Field label="Public widget key">
            <Input value={me.business.publicKey} readOnly className="mono" />
          </Field>
        </section>

        {/* AI status */}
        <section className="panel space-y-4 p-5">
          <h2 className="text-sm font-semibold text-ink">AI engine</h2>
          <div className="flex items-center gap-2">
            <Badge color={me.ai.demoMode ? "var(--color-accent)" : "var(--color-success)"}>
              {me.ai.demoMode ? "Demo mode (offline)" : "Live"}
            </Badge>
          </div>
          <Row icon={<Sparkles size={15} />} label="Generation" value={me.ai.generation} />
          <Row icon={<ShieldCheck size={15} />} label="Embeddings" value={me.ai.embeddings} />
          <p className="text-[0.78rem] text-ink-faint">
            Set <code className="mono text-accent">GROQ_API_KEY</code> to generate with Groq (free),
            or <code className="mono text-accent">ANTHROPIC_API_KEY</code> for Claude. Add{" "}
            <code className="mono text-accent">OPENAI_API_KEY</code> for semantic embeddings.
            Without keys, the platform runs fully offline.
          </p>
        </section>

        {/* Embed */}
        <section className="panel space-y-3 p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Embed your widget</h2>
            <a
              href={`/widget?key=${me.business.publicKey}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[0.82rem] text-primary hover:underline"
            >
              Preview widget <ExternalLink size={13} />
            </a>
          </div>
          <p className="text-[0.82rem] text-ink-3">Paste this before the closing &lt;/body&gt; tag on any site.</p>
          <div className="flex items-center gap-2 rounded-[0.7rem] border border-[var(--color-border-strong)] bg-[#0a0c12] p-3">
            <code className="mono flex-1 overflow-x-auto whitespace-nowrap text-[0.8rem] text-ink-2">{snippet}</code>
            <Button
              variant="subtle"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(snippet);
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              }}
            >
              {copied ? <Check size={14} className="text-[var(--color-success)]" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </section>

        {/* Team */}
        <section className="panel space-y-4 p-5 lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Team &amp; roles (RBAC)</h2>
          <div className="space-y-2">
            {agents.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-[0.7rem] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-3">
                <span className="grid size-9 place-items-center rounded-full bg-[var(--color-surface-2)] text-[0.72rem] font-bold text-ink">
                  {initials(a.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[0.88rem] font-medium text-ink">{a.name}</div>
                  <div className="text-[0.74rem] text-ink-faint mono">{a.email}</div>
                </div>
                <Badge color={a.role === "OWNER" ? "var(--color-primary)" : "var(--color-ink-3)"}>
                  {a.role === "OWNER" ? "Owner" : "Agent"}
                </Badge>
              </div>
            ))}
          </div>

          {isOwner ? (
            <form onSubmit={addAgent} className="grid gap-3 border-t border-[var(--color-border)] pt-4 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
              <Input placeholder="Name" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required />
              <Input type="password" placeholder="Temp password" value={invite.password} onChange={(e) => setInvite({ ...invite, password: e.target.value })} required minLength={8} />
              <Select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                <option value="AGENT">Agent</option>
                <option value="OWNER">Owner</option>
              </Select>
              <Button type="submit" loading={inviting}>
                <UserPlus size={15} /> Add
              </Button>
            </form>
          ) : (
            <p className="flex items-center gap-2 border-t border-[var(--color-border)] pt-4 text-[0.8rem] text-ink-faint">
              <Plus size={13} /> Only workspace owners can add teammates.
            </p>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-2.5">
      <span className="flex items-center gap-2 text-[0.82rem] text-ink-3">
        <span className="text-ink-faint">{icon}</span>
        {label}
      </span>
      <span className="text-[0.82rem] font-medium text-ink">{value}</span>
    </div>
  );
}
