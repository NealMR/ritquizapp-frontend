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
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
          <Link href={homeFor(user.role)} className="font-display text-xl font-bold tracking-tight">RIT Quiz</Link>
          <nav className="hidden gap-1 sm:flex">
            {NAV[user.role].map((n) => (
              <Link key={n.href} href={n.href}
                className={`rounded-md px-3 py-1.5 text-sm ${path === n.href ? "bg-white/15 font-semibold" : "text-white/75 hover:text-white"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right text-sm leading-tight md:block">
              {user.full_name}<br /><span className="text-xs capitalize text-white/60">{user.role}</span>
            </span>
            <button onClick={() => { logout(); router.push("/login"); }} className="rounded-md border border-white/25 px-3 py-1.5 text-sm hover:bg-white/10">Log out</button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-4 pb-2 sm:hidden">
          {NAV[user.role].map((n) => (
            <Link key={n.href} href={n.href} className={`whitespace-nowrap rounded-md px-3 py-1 text-sm ${path === n.href ? "bg-white/15 font-semibold" : "text-white/75"}`}>{n.label}</Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {sub && <p className="mt-1 text-slate-600">{sub}</p>}
      </div>
      {action}
    </div>
  );
}
