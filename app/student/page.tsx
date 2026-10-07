"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Panel, Badge, Button, Modal, statusTone } from "@/components/ui";
import { useData } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { QuizResult } from "@/lib/types";

import { motion } from "framer-motion";

export default function StudentHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { classes, quizzes, refresh } = useData();
  useEffect(() => { const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [refresh]); // spot quizzes going live
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [scanning, setScanning] = useState(false);
  const [myResults, setMyResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    api.getMyResults().then(setMyResults).catch(console.error);
  }, []);

  const mine = classes;
  const upcoming = quizzes.filter((q) => q.status !== "closed" && mine.some((c) => c.id === q.class_id));
  const live = quizzes.find((q) => q.status === "live");
  const liveClass = classes.find((c) => c.id === live?.class_id);

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6) return setErr("Code must be 6 characters.");
    router.push(`/join/${code.trim().toUpperCase()}`);
  };

  return (
    <AppShell role="student">
      <PageTitle title={`Hi, ${user?.full_name?.split(' ')[0] || "Student"}!`} sub="Join a class or jump into a live quiz." />

      {live && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-ansD to-emerald-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Live now in {liveClass?.name}</p>
            <p className="mt-1 font-display text-2xl font-bold">{live.title}</p>
          </div>
          <Link href={`/play/${live.id}`}><button className="w-full rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 shadow-soft hover:shadow-float active:scale-[0.98] transition-all sm:w-auto">Join quiz</button></Link>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Join a class" delay={0.1}>
          <form onSubmit={join} className="flex flex-col gap-4">
            <label htmlFor="code" className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Class code</label>
            <input id="code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} maxLength={6} placeholder="DL7K2Q"
              className="rounded-xl border border-line px-4 py-3 text-center font-display text-xl font-bold tracking-widest uppercase focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-slate-50" />
            {err && <p className="text-sm font-medium text-ansA bg-red-50 p-3 rounded-lg border border-red-100">{err}</p>}
            <Button type="submit" disabled={code.length !== 6}>Join class</Button>
            <Button type="button" variant="outline" onClick={() => setScanning(true)}>Scan QR code</Button>
          </form>
        </Panel>

        <Panel title="My classes" delay={0.2}>
          <ul className="divide-y divide-line/60">
            {mine.map((c) => (
              <li key={c.id} className="py-4 hover:bg-slate-50 transition-colors -mx-6 px-6">
                <p className="font-display font-bold text-lg">{c.name}</p>
                <p className="text-sm font-medium text-slate-500 mt-1">{c.subject_code} · {c.teacher_name}</p>
                <ul className="mt-3 flex flex-col gap-2 empty:hidden">
                  {upcoming.filter((q) => q.class_id === c.id).map((q) => (
                    <li key={q.id} className="flex items-center gap-2 text-sm font-medium"><Badge tone={statusTone(q.status)}>{q.status}</Badge>{q.status === "live" ? <Link href={`/play/${q.id}`} className="font-semibold text-brand">{q.title} →</Link> : q.title}{q.scheduled_at && <span className="text-slate-500">· {new Date(q.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>}</li>
                  ))}
                </ul>
              </li>
            ))}
            {mine.length === 0 && <li className="py-4 text-sm text-slate-500">You haven&apos;t joined any classes yet. Enter the code your teacher shows.</li>}
          </ul>
        </Panel>
      </div>

      <Panel title="Recent results" className="mt-8" delay={0.3} action={<Link href="/student/results" className="text-sm font-bold text-brand hover:text-brand/80 transition-colors">See all →</Link>}>
        <ul className="divide-y divide-line/60">
          {myResults.length === 0 && <li className="py-4 text-sm text-slate-500">Your quiz results will show up here.</li>}
          {myResults.slice(0, 5).map((r) => (
            <li key={r.quiz_id} className="flex items-center justify-between py-4 hover:bg-slate-50 transition-colors -mx-6 px-6">
              <div><p className="font-display font-bold text-lg">{r.quiz_title}</p><p className="text-sm font-medium text-slate-500 mt-1">{r.class_name}</p></div>
              <div className="text-right"><p className="font-display text-2xl font-extrabold text-brand">#{r.rank}<span className="text-sm font-medium text-slate-500 ml-1">of {r.participants}</span></p><p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-1">{r.correct}/{r.total} correct</p></div>
            </li>
          ))}
        </ul>
      </Panel>

      <Modal open={scanning} title="Scan class QR" onClose={() => setScanning(false)}>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-slate-700">
          <li>Open your phone&apos;s <b>camera app</b> (or Google Lens).</li>
          <li>Point it at the QR code on the classroom screen.</li>
          <li>Tap the link that pops up. It opens this app and adds you to the class.</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">Can&apos;t scan? Type the 6-character code shown under the QR instead.</p>
        <Button className="mt-4 w-full" variant="outline" onClick={() => setScanning(false)}>Got it</Button>
      </Modal>
    </AppShell>
  );
}
