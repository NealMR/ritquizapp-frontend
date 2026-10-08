"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Badge, Button, Panel } from "@/components/ui";
import { api } from "@/lib/api";
import type { StudentQuizOverview } from "@/lib/types";

export default function StudentQuizResultDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<StudentQuizOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"questions" | "leaderboard">("questions");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getQuizOverview(Number(id))
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load test overview.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <AppShell role="student">
        <div className="py-12 animate-pulse space-y-6 max-w-4xl mx-auto">
          <div className="h-6 w-32 bg-slate-200 rounded" />
          <div className="h-10 w-96 bg-slate-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-slate-100 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell role="student">
        <div className="max-w-2xl mx-auto py-12 text-center">
          <p className="text-sm font-medium text-ansA bg-red-50 p-4 rounded-xl border border-red-200">
            {error || "Quiz not found"}
          </p>
          <Link href="/student/results">
            <Button variant="outline" className="mt-4">
              ‹ Back to results
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell role="student">
      <Link
        href="/student/results"
        className="text-sm font-semibold text-brand hover:underline inline-flex items-center gap-1 mb-2"
      >
        ‹ Back to all results
      </Link>
      <PageTitle
        title={`${data.quiz_title} — Overview`}
        sub={`${data.class_name} · ${data.subject_code} · ${
          data.played_at
            ? new Date(data.played_at).toLocaleDateString("en-IN", { dateStyle: "medium" })
            : "Completed"
        }`}
        action={
          <div className="flex gap-2">
            <Badge tone="blue">{data.mode}</Badge>
            <Badge tone={data.status === "closed" ? "slate" : "green"}>{data.status}</Badge>
          </div>
        }
      />

      {/* 4 Metric Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
          <p className="font-display text-3xl font-extrabold text-brand">{data.score}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
            Score / {data.max_score} pts
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
          <p className="font-display text-3xl font-extrabold text-emerald-600">
            {data.total > 0 ? `${Math.round((data.correct / data.total) * 100)}%` : "0%"}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
            Accuracy
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
          <p className="font-display text-3xl font-extrabold text-ink">
            {data.correct} <span className="text-lg font-normal text-slate-400">/ {data.total}</span>
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
            Questions Correct
          </p>
        </div>
        <div className="rounded-xl border border-line bg-white p-4 shadow-soft">
          <p className="font-display text-3xl font-extrabold text-ink">
            {data.rank ? `#${data.rank}` : "—"}
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-1">
            Rank of {data.participants}
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b border-line">
        <button
          onClick={() => setTab("questions")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            tab === "questions"
              ? "border-brand text-brand"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Question Review ({data.questions.length})
        </button>
        <button
          onClick={() => setTab("leaderboard")}
          className={`pb-3 text-sm font-bold border-b-2 transition-all ${
            tab === "leaderboard"
              ? "border-brand text-brand"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Class Leaderboard ({data.leaderboard.length})
        </button>
      </div>

      {tab === "questions" && (
        <div className="flex flex-col gap-4">
          {data.questions.map((q) => {
            const studentAns = Array.isArray(q.student_answer)
              ? q.student_answer
              : typeof q.student_answer === "number"
              ? [q.student_answer]
              : [];

            return (
              <Panel key={q.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                      {q.order}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {q.type}
                    </span>
                  </div>
                  <div>
                    {q.is_correct ? (
                      <Badge tone="green">✓ Correct (+{q.points_awarded || q.points} pts)</Badge>
                    ) : (
                      <Badge tone="red">✗ Incorrect (0 pts)</Badge>
                    )}
                  </div>
                </div>

                <p className="mt-3 font-display text-lg font-bold text-ink">{q.text}</p>

                {q.options && q.options.length > 0 && (
                  <div className="mt-4 grid gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isCorrectOpt = q.correct_options?.includes(optIdx);
                      const isStudentPick = studentAns.includes(optIdx);

                      let borderCls = "border-line bg-slate-50/50 text-slate-700";
                      if (isCorrectOpt) {
                        borderCls = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500/30";
                      } else if (isStudentPick && !isCorrectOpt) {
                        borderCls = "border-red-400 bg-red-50 text-red-900 font-medium";
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`flex items-center justify-between rounded-xl border p-3.5 text-sm transition-all ${borderCls}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs text-slate-400">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span>{opt}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            {isStudentPick && (
                              <span className="rounded-md bg-white/90 px-2 py-0.5 font-bold shadow-2xs border border-slate-200 text-slate-800">
                                Your answer
                              </span>
                            )}
                            {isCorrectOpt && (
                              <span className="rounded-md bg-emerald-600 px-2 py-0.5 font-bold text-white shadow-2xs">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {q.explanation && (
                  <div className="mt-4 rounded-lg bg-brandsoft/40 p-3.5 text-xs text-slate-700 border border-brand/10">
                    <span className="font-bold text-brand">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      {tab === "leaderboard" && (
        <Panel title="Class Standings">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-4">Rank</th>
                  <th className="py-2.5 px-4">Student</th>
                  <th className="py-2.5 px-4 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.leaderboard.map((item) => (
                  <tr
                    key={item.student_id}
                    className={`hover:bg-slate-50/60 ${
                      item.rank === data.rank ? "bg-brandsoft/30 font-semibold" : ""
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-brand">#{item.rank}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-ink">{item.full_name}</p>
                      {item.roll_no && <p className="text-xs text-slate-400">Roll {item.roll_no}</p>}
                    </td>
                    <td className="py-3 px-4 text-right font-display font-bold tabular-nums text-slate-800">
                      {item.score} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </AppShell>
  );
}
