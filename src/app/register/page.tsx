"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/primitives";
import { api } from "@/lib/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ businessName: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const r = await api.post("/api/auth/register", form);
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Could not create your workspace");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your workspace"
      subtitle="One tenant, isolated docs, your own AI assistant."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Business name">
          <Input value={form.businessName} onChange={set("businessName")} placeholder="Aurora Outdoors" required />
        </Field>
        <Field label="Your name">
          <Input value={form.name} onChange={set("name")} placeholder="Maya Chen" required />
        </Field>
        <Field label="Work email">
          <Input type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" required autoComplete="email" />
        </Field>
        <Field label="Password" hint="8+ characters">
          <Input type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={8} autoComplete="new-password" />
        </Field>

        {error && (
          <p className="rounded-lg border border-[color-mix(in_oklch,var(--color-danger)_40%,transparent)] bg-[var(--color-danger-soft)] px-3 py-2 text-[0.82rem] text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create workspace
        </Button>
        <p className="text-center text-[0.74rem] text-ink-faint">
          You become the workspace owner. Add agents later from Settings.
        </p>
      </form>
    </AuthShell>
  );
}
