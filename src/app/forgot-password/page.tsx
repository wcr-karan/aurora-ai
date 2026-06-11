"use client";

import Link from "next/link";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/primitives";
import { api } from "@/lib/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await api.post<{ sent: boolean; devResetLink?: string }>("/api/auth/forgot", { email });
    setLoading(false);
    setSent(true);
    setDevLink(r.data?.devResetLink ?? null);
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send a secure link to your email."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-2)] p-5 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--color-primary-soft)] text-primary">
            <MailCheck size={22} />
          </div>
          <p className="text-sm text-ink-2">
            If an account exists for <span className="font-medium text-ink">{email}</span>, a reset
            link is on its way.
          </p>
          {devLink && (
            <div className="rounded-lg border border-dashed border-[var(--color-border-strong)] p-3 text-left">
              <p className="mb-1 text-[0.72rem] text-ink-faint">
                Email isn&rsquo;t configured in this demo, so here&rsquo;s your link:
              </p>
              <Link href={devLink} className="mono break-all text-[0.78rem] text-primary hover:underline">
                {devLink}
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Field label="Work email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </Field>
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
