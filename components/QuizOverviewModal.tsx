"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { StudentQuizOverview } from "@/lib/types";
import { Badge, Button, Modal } from "@/components/ui";

export default function QuizOverviewModal({
  quizId,
  onClose,
}: {
  quizId: number | null;
  onClose: () => void;
}) {
  const [data, setData] = useState<StudentQuizOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"questions" | "leaderboard">("questions");

  useEffect(() => {
    if (!quizId) {
      setData(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setTab("questions");
    api
      .getQuizOverview(quizId)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Failed to load quiz overview:", err);
        setError(err.message || "Failed to load test overview.");
        setLoading(false);
      });
  }, [quizId]);

  if (!quizId) return null;

  return (
    <Modal
      open={Boolean(quizId)}
      title={data ? `${data.quiz_title} — Overview` : "Test Overview"}
      onClose={onClose}
      maxWidth="max-w-3xl"
    >
      {loading ? (
        <div className="flex flex-col gap-4 py-4 animate-pulse">
          <div className="h-6 w-3/4 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100" />
            ))}
          </div>
          <div className="h-40 rounded-xl bg-slate-100 mt-2" />
        </div>
      ) : error ? (
        <div className="py-6 text-center">
          <p className="text-sm font-medium text-ansA bg-red-50 p-4 rounded-xl border border-red-200">
            {error}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              if (quizId) {
                setLoading(true);
                api.getQuizOverview(quizId).then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false));
              }
            }}
          >
            Retry
          </Button>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-6">
          {/* Subheader context */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {data.class_name} · {data.subject_code}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {data.played_at
                  ? `Completed on ${new Date(data.played_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`
                  : "Completed"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="blue">{data.mode}</Badge>
              <Badge tone={data.status === "closed" ? "slate" : "green"}>{data.status}</Badge>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-line bg-slate-50/60 p-3 text-center">
              <p className="font-display text-2xl font-black text-brand">{data.score}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Score / {data.max_score}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50/60 p-3 text-center">
              <p className="font-display text-2xl font-black text-emerald-600">
                {data.total > 0 ? `${Math.round((data.correct / data.total) * 100)}%` : "0%"}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Accuracy
              </p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50/60 p-3 text-center">
              <p className="font-display text-2xl font-black text-ink">
                {data.correct} <span className="text-sm font-normal text-slate-400">/ {data.total}</span>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Correct
              </p>
            </div>
            <div className="rounded-xl border border-line bg-slate-50/60 p-3 text-center">
              <p className="font-display text-2xl font-black text-ink">
                {data.rank ? `#${data.rank}` : "—"}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                Rank of {data.participants}
              </p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-2 border-b border-line">
            <button
              onClick={() => setTab("questions")}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${
                tab === "questions" ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Question Review ({data.questions.length})
            </button>
            <button
              onClick={() => setTab("leaderboard")}
              className={`pb-2.5 text-sm font-bold border-b-2 transition-all ${
                tab === "leaderboard" ? "border-brand text-brand" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Leaderboard ({data.leaderboard.length})
            </button>
          </div>

          {/* Question Review List */}
          {tab === "questions" && (
            <div className="flex flex-col gap-4">
              {data.questions.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No question breakdown available for this quiz.
                </p>
              ) : (
                data.questions.map((q) => {
                  const studentAns = Array.isArray(q.student_answer)
                    ? q.student_answer
                    : typeof q.student_answer === "number"
                    ? [q.student_answer]
                    : [];

                  return (
                    <div
                      key={q.id}
                      className="rounded-xl border border-line bg-white p-4 shadow-sm transition-all hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {q.order}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {q.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {q.is_correct ? (
                            <Badge tone="green">✓ Correct (+{q.points_awarded || q.points} pts)</Badge>
                          ) : (
                            <Badge tone="red">✗ Incorrect (0 pts)</Badge>
                          )}
                        </div>
                      </div>

                      <p className="mt-2.5 font-display text-base font-bold text-ink">
                        {q.text}
                      </p>

                      {/* Options breakdown */}
                      {q.options && q.options.length > 0 && (
                        <div className="mt-3 grid gap-2">
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
                                className={`flex items-center justify-between rounded-xl border p-3 text-sm transition-all ${borderCls}`}
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

                      {/* Explanation if present */}
                      {q.explanation && (
                        <div className="mt-3 rounded-lg bg-brandsoft/40 p-3 text-xs text-slate-700 border border-brand/10">
                          <span className="font-bold text-brand">Explanation: </span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Leaderboard Table */}
          {tab === "leaderboard" && (
            <div className="overflow-hidden rounded-xl border border-line bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Rank</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-400">
                        No leaderboard data recorded.
                      </td>
                    </tr>
                  ) : (
                    data.leaderboard.map((item) => (
                      <tr
                        key={item.student_id}
                        className={`hover:bg-slate-50/60 ${item.rank === data.rank ? "bg-brandsoft/30 font-semibold" : ""}`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-brand">
                          #{item.rank}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-medium text-ink">{item.full_name}</p>
                          {item.roll_no && (
                            <p className="text-xs text-slate-400">Roll {item.roll_no}</p>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-display font-bold tabular-nums text-slate-800">
                          {item.score} pts
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Close action */}
          <div className="mt-2 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
