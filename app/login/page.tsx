"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthFrame from "@/components/AuthFrame";
import { Button, Input } from "@/components/ui";
import { homeFor, useAuth } from "@/lib/auth";
import { COLLEGE_DOMAIN } from "@/lib/mock";

const DEMO = [
  { label: "Admin", email: "admin@ritindia.edu" },
  { label: "Teacher", email: "sneha.patil@ritindia.edu" },
  { label: "Student", email: "2303026@ritindia.edu" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const { loginAs } = useAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.toLowerCase().endsWith(COLLEGE_DOMAIN)) return setError(`Use your college email ending in ${COLLEGE_DOMAIN}.`);
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    const u = await loginAs(email, password);
    if (!u) return setError("Invalid email or password.");
    if (u.role === "teacher" && !u.is_approved) return setError("Your teacher account is waiting for admin approval.");
    router.push(homeFor(u.role));
  };

  const handleGoogleLogin = async () => {
    // In a real app, this triggers OAuth popup and logs in
    setError("");
    // We simulate by picking a mock user based on nothing, just taking a known student
    const u = await loginAs("2303026@ritindia.edu", "test1234");
    if (u) router.push(homeFor(u.role));
  };

  return (
    <AuthFrame title="Log in" sub="Welcome back. Use your RIT email and password.">
      <div className="mb-6">
        <Button variant="outline" type="button" className="flex w-full items-center justify-center gap-2 py-3" onClick={handleGoogleLogin}>
          <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
          Log in with Google
        </Button>
        <div className="my-4 flex items-center gap-3 text-sm text-slate-400">
          <div className="h-px flex-1 bg-line" /> OR <div className="h-px flex-1 bg-line" />
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="College email" type="email" placeholder={`2303026${COLLEGE_DOMAIN} or sneha.patil${COLLEGE_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <div className="flex flex-col items-start justify-between gap-3 text-sm sm:flex-row sm:items-center sm:gap-0">
          <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me logged in</label>
          <Link href="/forgot-password" className="font-semibold text-brand">Forgot password?</Link>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" className="mt-1 w-full py-3">Log in</Button>
      </form>
      <p className="mt-6 text-sm text-slate-600">New here? <Link href="/signup" className="font-semibold text-brand">Create an account</Link></p>

      <div className="mt-10 rounded-xl border border-dashed border-line p-4">
        <p className="text-sm font-semibold">Test accounts</p>
        <p className="mb-3 text-xs text-slate-500">Testing only. Fills in a seeded account (password: <code>password</code>).</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {DEMO.map((d) => (
            <Button key={d.label} variant="outline" type="button" onClick={() => { setEmail(d.email); setPassword("password"); }}>{d.label}</Button>
          ))}
        </div>
      </div>
    </AuthFrame>
  );
}
