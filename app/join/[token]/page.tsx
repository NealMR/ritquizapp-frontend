"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui";
import { yearLabel } from "@/lib/mock";
import { useData } from "@/lib/data";
import type { ClassRoom } from "@/lib/types";
import { api } from "@/lib/api";

export default function JoinClass() {
  const { token } = useParams<{ token: string }>();
  const [c, setC] = useState<ClassRoom | null>(null);
  const { classes, refresh } = useData();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  const rawToken = typeof token === "string" ? token : Array.isArray(token) ? token[0] : "";
  const cleanToken = rawToken ? rawToken.trim() : "";

  useEffect(() => {
    if (cleanToken) {
      setFetching(true);
      api.getClassByToken(cleanToken)
        .then(setC)
        .catch(() => setC(null))
        .finally(() => setFetching(false));
    } else {
      setFetching(false);
    }
  }, [cleanToken]);

  const isAlreadyMember = Boolean(c && classes.some((item) => item.id === c.id));
  const isEnrolled = joined || isAlreadyMember;

  const handleJoin = async () => {
    if (!cleanToken) return;
    setLoading(true);
    setError(null);
    try {
      await api.joinClass(cleanToken);
      setJoined(true);
      await refresh();
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("already")) {
        setJoined(true);
        await refresh();
      } else {
        setError(err.message || "Failed to join class");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell role="student">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-6 text-center">
        {fetching ? (
          <p className="text-slate-500 py-6">Loading class details...</p>
        ) : !c ? (
          <>
            <h1 className="font-display text-2xl font-bold">Invalid or expired class code</h1>
            <p className="mt-2 text-slate-600">This class code or link is invalid or has expired. Ask your teacher for the current join code.</p>
            <Link href="/student"><Button className="mt-6 w-full">Back to dashboard</Button></Link>
          </>
        ) : !c.allow_join ? (
          <>
            <h1 className="font-display text-2xl font-bold">{c.name}</h1>
            <p className="mt-2 text-slate-600">Joining is closed for this class. Ask {c.teacher_name} to open it.</p>
            <Link href="/student"><Button className="mt-6 w-full">Back to dashboard</Button></Link>
          </>
        ) : isEnrolled ? (
          <>
            <p className="text-5xl">✓</p>
            <h1 className="mt-2 font-display text-2xl font-bold">You&apos;re in {c.name}</h1>
            <p className="mt-2 text-slate-600">Quizzes for this class will appear on your home screen.</p>
            <Link href="/student"><Button className="mt-6 w-full">Go to dashboard</Button></Link>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-brand">{c.subject_code}</p>
            <h1 className="font-display text-3xl font-bold">{c.name}</h1>
            <dl className="my-6 grid grid-cols-2 gap-3 text-left text-sm">
              <div><dt className="text-slate-500">Teacher</dt><dd className="font-semibold">{c.teacher_name}</dd></div>
              <div><dt className="text-slate-500">Class</dt><dd className="font-semibold">{yearLabel(c.year)}, Div {c.division}</dd></div>
              <div><dt className="text-slate-500">Semester</dt><dd className="font-semibold">{c.semester}</dd></div>
              <div><dt className="text-slate-500">Students</dt><dd className="font-semibold">{c.student_count}</dd></div>
            </dl>
            {error && <p className="mb-4 text-sm font-medium text-ansA bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
            <Button className="w-full py-3" onClick={handleJoin} disabled={loading}>{loading ? "Joining..." : "Enroll in this class"}</Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
