"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/primitives";
import { api } from "@/lib/client";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const r = await api.post("/api/auth/reset", { token, password });
    setLoading(false);
    if (!r.ok) {
      setError(r.error ?? "Could not reset your password");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1400);
  }

  if (!token) {
    return (
      <p className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-2)] p-4 text-sm text-ink-3">
        This reset link is missing its token. Request a new one from the{" "}
        <Link href="/forgot-password" className="text-primary hover:underline">
          forgot password
        </Link>{" "}
        page.
      </p>
    );
  }

  if (done) {
    return (
      <p className="rounded-lg border border-[color-mix(in_oklch,var(--color-success)_40%,transparent)] bg-[color-mix(in_oklch,var(--color-success)_12%,transparent)] p-4 text-sm text-[var(--color-success)]">
        Password updated. Redirecting you to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="New password" hint="8+ characters">
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={8} autoComplete="new-password" />
      </Field>
      {error && (
        <p className="rounded-lg border border-[color-mix(in_oklch,var(--color-danger)_40%,transparent)] bg-[var(--color-danger-soft)] px-3 py-2 text-[0.82rem] text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        Set new password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something strong and memorable."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <Suspense fallback={<div className="h-32" />}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
