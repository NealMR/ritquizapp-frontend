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
  const { refresh } = useData();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (token) {
      api.getClassByToken(token as string)
        .then(setC)
        .catch(() => setC(null))
        .finally(() => setFetching(false));
    }
  }, [token]);

  const handleJoin = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      await api.joinClass(token as string);
      setJoined(true);
      refresh();
    } catch (err: any) {
      setError(err.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell role="student">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-6 text-center">
        {fetching ? (
          <p>Loading class details...</p>
        ) : !c ? (
          <><h1 className="font-display text-2xl font-bold">This QR code has expired</h1><p className="mt-2 text-slate-600">Ask your teacher to show the current code.</p><Link href="/student"><Button className="mt-6 w-full">Back to home</Button></Link></>
        ) : !c.allow_join ? (
          <><h1 className="font-display text-2xl font-bold">{c.name}</h1><p className="mt-2 text-slate-600">Joining is closed for this class. Ask {c.teacher_name} to open it.</p><Link href="/student"><Button className="mt-6 w-full">Back to home</Button></Link></>
        ) : joined ? (
          <><p className="text-5xl">✓</p><h1 className="mt-2 font-display text-2xl font-bold">You&apos;re in {c.name}</h1><p className="mt-2 text-slate-600">Quizzes for this class will appear on your home screen.</p><Link href="/student"><Button className="mt-6 w-full">Go to home</Button></Link></>
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
            {error && <p className="mb-4 text-sm text-ansA">{error}</p>}
            <Button className="w-full py-3" onClick={handleJoin} disabled={loading}>{loading ? "Joining..." : "Join class"}</Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
