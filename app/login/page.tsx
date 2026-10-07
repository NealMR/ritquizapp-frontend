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
  { label: "Student", email: "atharv.thorat@ritindia.edu" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const { loginAs } = useAuth();
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.toLowerCase().endsWith(COLLEGE_DOMAIN)) return setError(`Use your college email ending in ${COLLEGE_DOMAIN}.`);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    // Real app: POST /auth/login { email, password } → { access_token, user }
    const u = loginAs(email);
    if (!u) return setError("No account found for this email. Sign up first.");
    if (u.role === "teacher" && !u.is_approved) return setError("Your teacher account is waiting for admin approval.");
    router.push(homeFor(u.role));
  };

  return (
    <AuthFrame title="Log in" sub="Welcome back. Use your RIT email and password.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Input label="College email" type="email" placeholder={`firstname.lastname${COLLEGE_DOMAIN}`} value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me logged in</label>
          <Link href="/forgot-password" className="font-semibold text-brand">Forgot password?</Link>
        </div>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" className="mt-1 py-3">Log in</Button>
      </form>
      <p className="mt-6 text-sm text-slate-600">New here? <Link href="/signup" className="font-semibold text-brand">Create an account</Link></p>

      <div className="mt-10 rounded-xl border border-dashed border-line p-4">
        <p className="text-sm font-semibold">Demo accounts (prototype only)</p>
        <p className="mb-3 text-xs text-slate-500">Fills the form with a mock user. Any 6+ character password works.</p>
        <div className="flex flex-wrap gap-2">
          {DEMO.map((d) => (
            <Button key={d.label} variant="outline" type="button" onClick={() => { setEmail(d.email); setPassword("test1234"); }}>{d.label}</Button>
          ))}
        </div>
      </div>
    </AuthFrame>
  );
}
