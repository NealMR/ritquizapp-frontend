"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Button, Panel } from "@/components/ui";
import { api } from "@/lib/api";
import type { Quiz, Report as ReportData } from "@/lib/types";

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const [rep, setRep] = useState<ReportData | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([api.getReport(Number(id)), api.getQuiz(Number(id))]).then(([r, q]) => { setRep(r); setQuiz(q); }).catch((e) => setErr(e.message));
  }, [id]);

  if (!rep || !quiz) return <AppShell role="teacher"><p className="text-slate-500">{err || "Loading…"}</p></AppShell>;

  const pct = (x: number | null) => (x == null ? "–" : `${Math.round(x * 100)}%`);
  const stats = [
    { n: `${rep.participants} / ${rep.class_size}`, l: "Students took part" },
    { n: rep.mode === "quiz" ? pct(rep.avg_accuracy) : "–", l: "Average accuracy" },
    { n: rep.avg_time_ms == null ? "–" : `${(rep.avg_time_ms / 1000).toFixed(1)} s`, l: "Average answer time" },
    { n: rep.hardest_question ? `Q${rep.hardest_question}` : "–", l: "Hardest question" },
  ];
  const scoredCount = rep.questions.filter((q) => q.correct_options.length).length;

  return (
    <AppShell role="teacher">
      <Link href={`/teacher/classes/${quiz.class_id}`} className="text-sm font-semibold text-brand print:hidden">‹ Back to class</Link>
      <PageTitle title={`${rep.title} report`}
        sub={rep.played_at ? `Played ${new Date(rep.played_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : "Not played yet"}
        action={<div className="flex gap-2 print:hidden">
          <Button variant="outline" onClick={() => api.exportReport(rep.quiz_id).catch((e) => setErr(e.message))}>Download CSV</Button>
          <Button variant="outline" onClick={() => window.print()}>Download PDF</Button>
        </div>} />
      {err && <p className="mb-4 text-sm text-ansA">{err}</p>}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => <div key={s.l} className="rounded-xl border border-line bg-white px-4 py-3"><p className="font-display text-3xl font-bold">{s.n}</p><p className="text-sm text-slate-600">{s.l}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="By question">
          <ol className="flex flex-col gap-6">
            {rep.questions.map((q) => {
              const labels = q.type === "rating" ? (q.distribution ?? []).map((_, i) => String(i + 1)) : q.options;
              const counts = q.distribution ?? [];
              const max = Math.max(1, ...counts);
              return (
                <li key={q.id}>
                  <p className="mb-2 font-semibold">Q{q.order}. {q.text} <span className="font-normal text-slate-500">· {q.responses} responses{q.accuracy != null && ` · ${pct(q.accuracy)} correct`}{q.rating_avg != null && ` · avg ${q.rating_avg}`}</span></p>
                  {counts.length > 0 && labels.map((o, i) => (
                    <div key={i} className="mb-1.5 flex items-center gap-3 text-sm">
                      <span className="w-40 truncate">{o}{q.correct_options.includes(i) && " ✓"}</span>
                      <span className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                        <span className={`block h-5 rounded ${q.correct_options.includes(i) ? "bg-ansD" : q.correct_options.length ? "bg-slate-300" : "bg-brand"}`} style={{ width: `${(counts[i] / max) * 100}%` }} />
                      </span>
                      <span className="w-8 text-right tabular-nums">{counts[i]}</span>
                    </div>
                  ))}
                  {q.words && <p className="flex flex-wrap gap-2 text-sm">{q.words.map(([w, n]) => <span key={w} className="rounded-full bg-brandsoft px-2.5 py-0.5">{w} <b>{n}</b></span>)}</p>}
                  {q.texts && <ul className="flex flex-col gap-1.5 text-sm">{q.texts.map((t, i) => <li key={i} className="rounded-lg bg-slate-50 px-3 py-2">{t}</li>)}</ul>}
                </li>
              );
            })}
          </ol>
        </Panel>
        <Panel title="Students">
          {rep.students.length === 0 ? <p className="text-sm text-slate-500">Nobody has played this yet.</p> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-slate-500"><tr><th className="py-2 font-semibold">#</th><th className="font-semibold">Name</th><th className="font-semibold">Correct</th><th className="text-right font-semibold">Score</th></tr></thead>
              <tbody className="divide-y divide-line">{rep.students.map((r) => <tr key={r.student_id}><td className="py-2.5">{r.rank}</td><td><p className="font-semibold">{r.full_name}</p><p className="text-xs text-slate-500">Roll {r.roll_no}</p></td><td>{r.correct}/{scoredCount}</td><td className="text-right tabular-nums">{r.score}</td></tr>)}</tbody>
            </table>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
