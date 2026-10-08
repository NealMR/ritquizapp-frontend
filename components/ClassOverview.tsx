"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge, Button, Panel } from "@/components/ui";
import { api } from "@/lib/api";
import type { ClassOverview as Data } from "@/lib/types";

const when = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
const day = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—");
const pct = (n: number | null) => (n === null ? "—" : `${n}%`);

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-ink">{value}</p>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="py-4 text-sm text-slate-500">{children}</p>;

/** Class landing tab: what happened, who is doing well, who is missing. */
export default function ClassOverview({ classId, onExport }: { classId: number; onExport: () => void }) {
  const [d, setD] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.getClassOverview(classId).then(setD).catch((e) => setErr(e.message)); }, [classId]);

  if (err) return <p className="text-sm text-red-700">{err}</p>;
  if (!d) return <p className="text-slate-500">Loading…</p>;

  const daysLeft = d.deletes_on ? Math.ceil((new Date(d.deletes_on).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="flex flex-col gap-6">
      {d.live_quiz && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-900">
          <p className="font-semibold">Live now: {d.live_quiz.title}</p>
          <Link href={`/teacher/quizzes/${d.live_quiz.id}/live`}><Button>Open host screen</Button></Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Students" value={d.students} hint={d.recent_joins[0] ? `Last joined ${day(d.recent_joins[0].at)}` : "Share the QR to add students"} />
        <Stat label="Quizzes run" value={d.quizzes.closed} hint={`${d.quizzes.draft + d.quizzes.scheduled} not run yet`} />
        <Stat label="Avg. accuracy" value={pct(d.avg_accuracy)} hint="Across all quizzes" />
        <Stat label="Participation" value={pct(d.avg_participation)} hint="Students per quiz" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Recent quizzes">
          {d.recent_quizzes.length === 0 ? <Empty>No finished quizzes yet. Launch one from the Quizzes tab.</Empty> : (
            <ul className="divide-y divide-line">
              {d.recent_quizzes.map((q) => (
                <li key={q.quiz_id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{q.title}</p>
                    <p className="text-xs text-slate-500">{when(q.played_at)} · {q.participants} of {d.students} played</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {q.accuracy !== null && <Badge tone={q.accuracy >= 60 ? "green" : q.accuracy >= 40 ? "amber" : "red"}>{q.accuracy}%</Badge>}
                    <Link href={`/teacher/quizzes/${q.quiz_id}/report`} className="text-sm font-semibold text-brand">Report</Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Top students">
          {d.top_students.length === 0 ? <Empty>Rankings appear after the first quiz.</Empty> : (
            <ol className="divide-y divide-line">
              {d.top_students.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brandsoft text-sm font-bold text-brand">{i + 1}</span>
                  <p className="min-w-0 flex-1 truncate font-semibold">{s.full_name} <span className="font-normal text-slate-500">· Roll {s.roll_no}</span></p>
                  <p className="shrink-0 text-sm text-slate-600">{s.score} pts</p>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <Panel title="Needs attention">
          {d.struggling.length === 0 && d.not_participated.length === 0 ? <Empty>Nobody stands out yet.</Empty> : (
            <div className="flex flex-col gap-4 text-sm">
              {d.struggling.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold text-slate-700">Scoring under 40%</p>
                  <ul className="divide-y divide-line">{d.struggling.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3 py-2"><span className="truncate">{s.full_name} · Roll {s.roll_no}</span><Badge tone="red">{s.accuracy}%</Badge></li>
                  ))}</ul>
                </div>
              )}
              {d.not_participated.length > 0 && (
                <div>
                  <p className="mb-1 font-semibold text-slate-700">Have not played any quiz</p>
                  <p className="text-slate-600">{d.not_participated.map((s) => `${s.full_name} (${s.roll_no})`).join(", ")}</p>
                </div>
              )}
            </div>
          )}
        </Panel>

        <Panel title="Recently joined">
          {d.recent_joins.length === 0 ? <Empty>No students yet.</Empty> : (
            <ul className="divide-y divide-line">
              {d.recent_joins.map((s) => (
                <li key={s.id} className="flex justify-between gap-3 py-3 text-sm"><span className="truncate font-semibold">{s.full_name}</span><span className="shrink-0 text-slate-500">{day(s.at)}</span></li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm ${daysLeft !== null && daysLeft <= 30 ? "border-amber-300 bg-amber-50 text-amber-900" : "border-line bg-white text-slate-600"}`}>
        <p>
          Last activity: <b>{when(d.last_activity)}</b>.
          {d.deletes_on && <> This class is deleted on <b>{day(d.deletes_on)}</b> ({daysLeft} days). Export results before then.</>}
        </p>
        <Button variant="outline" onClick={onExport}>Export all results (CSV)</Button>
      </div>
    </div>
  );
}
