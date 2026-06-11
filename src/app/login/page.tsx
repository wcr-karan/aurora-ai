"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/primitives";
import { api } from "@/lib/client";
import { DEMO } from "@/lib/demo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const r = await api.post("/api/auth/login", { email, password });
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Could not sign in");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your support command deck."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create a workspace
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Work email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required autoComplete="email" />
        </Field>
        <Field
          label="Password"
          hint={undefined}
        >
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
        </Field>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-[0.8rem] text-ink-3 hover:text-ink">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-[color-mix(in_oklch,var(--color-danger)_40%,transparent)] bg-[var(--color-danger-soft)] px-3 py-2 text-[0.82rem] text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Sign in
        </Button>
      </form>

      <button
        onClick={() => {
          setEmail(DEMO.adminEmail);
          setPassword(DEMO.adminPassword);
        }}
        className="mt-4 w-full rounded-lg border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-2)] px-3 py-2.5 text-left text-[0.8rem] text-ink-3 transition-colors hover:border-[var(--color-primary)] hover:text-ink-2"
      >
        <span className="font-medium text-ink-2">Use demo admin →</span>{" "}
        <span className="mono">{DEMO.adminEmail}</span> / <span className="mono">{DEMO.adminPassword}</span>
      </button>
    </AuthShell>
  );
}
