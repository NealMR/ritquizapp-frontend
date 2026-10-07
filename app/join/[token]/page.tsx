"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/ui";
import { classes, yearLabel } from "@/lib/mock";

export default function JoinClass() {
  const { token } = useParams<{ token: string }>();
  const c = classes.find((x) => x.join_token === token);
  const [joined, setJoined] = useState(false);

  return (
    <AppShell role="student">
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-6 text-center">
        {!c ? (
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
            <Button className="w-full py-3" onClick={() => setJoined(true)}>Join class</Button>
          </>
        )}
      </div>
    </AppShell>
  );
}
