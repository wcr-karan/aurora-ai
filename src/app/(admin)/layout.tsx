import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { aiStatus } from "@/lib/env";
import { ToastProvider } from "@/components/ui/toast";
import { AppShell } from "@/components/admin/app-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <ToastProvider>
      <AppShell
        user={{
          name: user.name,
          email: user.email,
          role: user.role as "OWNER" | "AGENT",
        }}
        business={{ name: user.business.name, publicKey: user.business.publicKey }}
        ai={aiStatus()}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
