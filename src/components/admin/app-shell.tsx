"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  Command,
  FileStack,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Menu,
  MessagesSquare,
  Settings,
  ShieldAlert,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/logo";
import { api } from "@/lib/client";
import { cn, initials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/knowledge-base", label: "Knowledge Base", icon: FileStack },
  { href: "/configuration", label: "AI Configuration", icon: Sparkles },
  { href: "/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/escalations", label: "Escalations", icon: ShieldAlert },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface ShellProps {
  user: { name: string; email: string; role: "OWNER" | "AGENT" };
  business: { name: string; publicKey: string };
  ai: { generation: string; embeddings: string; demoMode: boolean };
  children: React.ReactNode;
}

export function AppShell({ user, business, ai, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await api.post("/api/auth/logout");
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-1 p-3">
      <div className="flex items-center justify-between px-2 py-3">
        <Link href="/dashboard">
          <Logo />
        </Link>
        <button className="text-ink-3 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X size={18} />
        </button>
      </div>

      <button
        onClick={() => setPaletteOpen(true)}
        className="mx-1 mb-2 flex items-center gap-2 rounded-[0.7rem] border border-[var(--color-border)] bg-[var(--color-bg-2)] px-3 py-2 text-sm text-ink-3 transition-colors hover:border-[var(--color-border-strong)] hover:text-ink-2"
      >
        <Command size={14} />
        <span className="flex-1 text-left">Quick search</span>
        <kbd className="mono rounded bg-[var(--color-surface)] px-1.5 py-0.5 text-[0.66rem] text-ink-faint">⌘K</kbd>
      </button>

      <nav className="flex-1 space-y-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[0.7rem] px-3 py-2.5 text-sm transition-colors",
                active ? "text-ink" : "text-ink-3 hover:bg-[var(--color-surface)] hover:text-ink-2"
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 -z-10 rounded-[0.7rem] border border-[var(--color-border)] bg-[var(--color-surface)]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon size={17} className={cn(active && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
        <div className="flex items-center gap-2 px-2">
          <span
            className={cn(
              "size-1.5 rounded-full",
              ai.demoMode ? "bg-[var(--color-accent)]" : "bg-[var(--color-success)]"
            )}
          />
          <span className="text-[0.72rem] text-ink-3">
            {ai.demoMode ? "Demo AI (offline)" : "Claude connected"}
          </span>
        </div>

        <div className="flex items-center gap-2.5 rounded-[0.7rem] bg-[var(--color-bg-2)] p-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--color-primary)] text-[0.7rem] font-bold text-[var(--color-primary-ink)]">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[0.8rem] font-medium text-ink">{user.name}</div>
            <div className="truncate text-[0.7rem] text-ink-faint">{user.role === "OWNER" ? "Owner" : "Agent"} · {business.name}</div>
          </div>
          <button onClick={logout} className="text-ink-faint hover:text-[var(--color-danger)]" aria-label="Sign out" title="Sign out">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:block">
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden"
              style={{ zIndex: "var(--z-backdrop)" }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 w-72 border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:hidden"
              style={{ zIndex: "var(--z-modal)" }}
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 flex h-14 items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 px-4 backdrop-blur-xl lg:hidden" style={{ zIndex: "var(--z-sticky)" }}>
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="text-ink-2">
            <Menu size={20} />
          </button>
          <Logo />
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const items = NAV.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 grid place-items-start justify-items-center bg-black/50 p-4 pt-[12vh] backdrop-blur-sm"
          style={{ zIndex: "var(--z-modal)" }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4">
              <Command size={16} className="text-ink-faint" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Jump to…"
                className="flex-1 bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <kbd className="mono rounded bg-[var(--color-bg-2)] px-1.5 py-0.5 text-[0.66rem] text-ink-faint">esc</kbd>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {items.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-ink-faint">No matches</div>
              )}
              {items.map((i) => {
                const Icon = i.icon;
                return (
                  <button
                    key={i.href}
                    onClick={() => {
                      router.push(i.href);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-2 transition-colors hover:bg-[var(--color-bg-2)] hover:text-ink"
                  >
                    <Icon size={16} className="text-ink-faint" />
                    {i.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
