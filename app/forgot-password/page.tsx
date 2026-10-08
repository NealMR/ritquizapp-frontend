"use client";
import Link from "next/link";
import { useState } from "react";
import AuthFrame from "@/components/AuthFrame";
import { Button, Input } from "@/components/ui";
import { api } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthFrame title="Reset password" sub="We'll email you a link to set a new password.">
      {sent ? (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          If an account exists for <b>{email}</b>, a reset link is on its way. It expires in 30 minutes.
        </div>
      ) : (
        <form onSubmit={async (e) => { e.preventDefault(); setError(""); try { await api.forgotPassword(email); setSent(true); } catch (err) { setError((err as Error).message); } }} className="flex flex-col gap-4">
          <Input label="College email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit">Send reset link</Button>
        </form>
      )}
      <p className="mt-6 text-sm"><Link href="/login" className="font-semibold text-brand">Back to log in</Link></p>
    </AuthFrame>
  );
}
