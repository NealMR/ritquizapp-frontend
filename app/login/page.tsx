"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const { loginAs, googleLogin } = useAuth();
  const gbtn = useRef<HTMLDivElement>(null);
  const googleId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.toLowerCase().endsWith(COLLEGE_DOMAIN)) return setError(`Use your college email ending in ${COLLEGE_DOMAIN}.`);

    try {
      const u = await loginAs(email, password);
      router.push(homeFor(u.role));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // Google Identity Services button, only when a client ID is configured.
  useEffect(() => {
    if (!googleId) return;
    const init = () => {
      const g = (window as any).google?.accounts.id;
      if (!g || !gbtn.current) return;
      g.initialize({ client_id: googleId, callback: async (r: { credential: string }) => {
        try { const u = await googleLogin(r.credential); router.push(homeFor(u.role)); } catch (err) { setError((err as Error).message); }
      } });
      g.renderButton(gbtn.current, { theme: "outline", size: "large", width: 340, text: "signin_with" });
    };
    if ((window as any).google) return init();
    document.head.appendChild(Object.assign(document.createElement("script"), { src: "https://accounts.google.com/gsi/client", async: true, onload: init }));
  }, [googleId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthFrame title="Log in" sub="Welcome back. Use your RIT email and password.">
      {googleId && (
        <div className="mb-6">
          <div ref={gbtn} className="flex justify-center" />
          <div className="my-4 flex items-center gap-3 text-sm text-slate-400"><div className="h-px flex-1 bg-line" /> OR <div className="h-px flex-1 bg-line" /></div>
        </div>
      )}
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

      {process.env.NODE_ENV !== "production" && <div className="mt-10 rounded-xl border border-dashed border-line p-4">
        <p className="text-sm font-semibold">Test accounts</p>
        <p className="mb-3 text-xs text-slate-500">Testing only. Fills in a seeded account (password: <code>password</code>).</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {DEMO.map((d) => (
            <Button key={d.label} variant="outline" type="button" onClick={() => { setEmail(d.email); setPassword("password"); }}>{d.label}</Button>
          ))}
        </div>
      </div>}
    </AuthFrame>
  );
}
