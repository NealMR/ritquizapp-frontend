"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Button, Panel } from "@/components/ui";
import { ANS_BG } from "@/lib/questions";
import { classes, leaderboard, quizzes } from "@/lib/mock";

export default function Report() {
  const { id } = useParams<{ id: string }>();
  const quiz = quizzes.find((q) => q.id === Number(id)) ?? quizzes[0];
  const qs = quiz.questions.length ? quiz.questions : quizzes[0].questions;
  const cls = classes.find((c) => c.id === quiz.class_id)!;
  const stats = [{ n: "58 / 64", l: "Students took part" }, { n: "71%", l: "Average accuracy" }, { n: "8.4 s", l: "Average answer time" }, { n: "Q2", l: "Hardest question" }];

  return (
    <AppShell role="teacher">
      <Link href={`/teacher/classes/${cls.id}`} className="text-sm font-semibold text-brand">‹ {cls.name}</Link>
      <PageTitle title={`${quiz.title} report`} sub="Played 22 Sep 2026, 10:20" action={<div className="flex gap-2"><Button variant="outline">Download CSV</Button><Button variant="outline">Download PDF</Button></div>} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => <div key={s.l} className="rounded-xl border border-line bg-white px-4 py-3"><p className="font-display text-3xl font-bold">{s.n}</p><p className="text-sm text-slate-600">{s.l}</p></div>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="By question">
          <ol className="flex flex-col gap-6">
            {qs.filter((q) => q.options.length).map((q, qi) => {
              const counts = q.options.map((_, i) => (q.correct_options.includes(i) ? 38 - qi * 6 : 6 + i));
              const max = Math.max(...counts);
              return (
                <li key={q.id}>
                  <p className="mb-2 font-semibold">Q{q.order}. {q.text}</p>
                  {q.options.map((o, i) => (
                    <div key={i} className="mb-1.5 flex items-center gap-3 text-sm">
                      <span className="w-40 truncate">{o}{q.correct_options.includes(i) && " ✓"}</span>
                      <span className="h-5 flex-1 rounded bg-paper"><span className={`block h-5 rounded ${ANS_BG[i]}`} style={{ width: `${(counts[i] / max) * 100}%` }} /></span>
                      <span className="w-8 text-right tabular-nums">{counts[i]}</span>
                    </div>
                  ))}
                </li>
              );
            })}
          </ol>
        </Panel>
        <Panel title="Students">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-slate-500"><tr><th className="py-2 font-semibold">#</th><th className="font-semibold">Name</th><th className="font-semibold">Correct</th><th className="text-right font-semibold">Score</th></tr></thead>
            <tbody className="divide-y divide-line">{leaderboard.map((r) => <tr key={r.student_id}><td className="py-2.5">{r.rank}</td><td><p className="font-semibold">{r.full_name}</p><p className="text-xs text-slate-500">Roll {r.roll_no}</p></td><td>{r.correct}/{qs.filter((q) => q.correct_options.length).length}</td><td className="text-right tabular-nums">{r.score}</td></tr>)}</tbody>
          </table>
        </Panel>
      </div>
    </AppShell>
  );
}
