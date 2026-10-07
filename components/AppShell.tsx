"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { homeFor, useAuth } from "@/lib/auth";
import type { Role } from "@/lib/types";

const NAV: Record<Role, { href: string; label: string }[]> = {
  admin: [{ href: "/admin", label: "Users" }, { href: "/admin/settings", label: "Settings" }],
  teacher: [{ href: "/teacher", label: "My classes" }, { href: "/profile", label: "Profile" }],
  student: [{ href: "/student", label: "Home" }, { href: "/student/results", label: "My results" }, { href: "/profile", label: "Profile" }],
};

export default function AppShell({ role, children }: { role?: Role; children: React.ReactNode }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (role && user.role !== role) router.replace(homeFor(user.role));
  }, [ready, user, role, router]);

  if (!ready || !user) return <div className="p-10 text-center text-slate-500">Loading…</div>;

  return (
    <div className="min-h-screen pb-12">
      <header className="sticky top-0 z-40 print:hidden bg-gradient-brand text-white shadow-md border-b border-white/10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-6 md:px-8">
          <Link href={homeFor(user.role)} className="font-display text-2xl font-extrabold tracking-tight hover:opacity-90 transition-opacity">RIT Quiz</Link>
          <nav className="hidden gap-2 sm:flex">
            {NAV[user.role].map((n) => (
              <Link key={n.href} href={n.href}
                className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${path === n.href ? "bg-white/20 text-white shadow-inner" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-right text-sm leading-tight md:block font-medium">
              {user.full_name}<br /><span className="text-[11px] font-bold uppercase tracking-wider text-white/70">{user.role}</span>
            </span>
            <button onClick={() => { logout(); router.push("/login"); }} className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-sm font-semibold hover:bg-white/15 transition-all">Log out</button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3 sm:hidden no-scrollbar">
          {NAV[user.role].map((n) => (
            <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all ${path === n.href ? "bg-white/20 text-white shadow-inner" : "text-white/80"}`}>{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10 animate-fade-in">{children}</main>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end animate-slide-up">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {sub && <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
