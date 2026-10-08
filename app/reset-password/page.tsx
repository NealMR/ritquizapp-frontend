"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthFrame from "@/components/AuthFrame";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";

function Form() {
  const token = useSearchParams().get("token") ?? "";
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (pw !== confirm) return setError("Passwords don't match.");
    try { await api.resetPassword(token, pw); setDone(true); } catch (err) { setError((err as Error).message); }
  };

  return (
    <AuthFrame title="Set a new password" sub="Choose a password you haven't used before.">
      {done ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">Password updated. <Link href="/login" className="font-semibold text-brand">Log in</Link></div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input label="New password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required minLength={8} hint="At least 8 characters." autoComplete="new-password" />
          <Input label="Confirm new password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={!token}>Update password</Button>
          {!token && <p className="text-sm text-red-700">This link is missing its token. Request a new one.</p>}
        </form>
      )}
    </AuthFrame>
  );
}

export default function ResetPassword() {
  return <Suspense><Form /></Suspense>;
}
