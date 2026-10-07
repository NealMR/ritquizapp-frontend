"use client";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Panel } from "@/components/ui";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { QuizResult } from "@/lib/types";

export default function Results() {
  const [myResults, setMyResults] = useState<QuizResult[]>([]);
  useEffect(() => {
    api.getMyResults().then(setMyResults).catch(console.error);
  }, []);

  return (
    <AppShell role="student">
      <PageTitle title="My results" sub="Every quiz you've played." />
      <Panel>
        <ul className="flex flex-col divide-y divide-line sm:hidden">
          {myResults.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No results yet. Join a live quiz to see your scores here.</li>}
          {myResults.map((r) => (
            <li key={r.quiz_id} className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.quiz_title}</p>
                <p className="text-sm text-slate-500">{r.class_name} · {new Date(r.played_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p>
                <p className="mt-1 text-sm text-slate-600">{r.correct}/{r.total} correct · {r.score.toLocaleString("en-IN")} pts</p>
              </div>
              <p className="shrink-0 text-right font-display text-2xl font-extrabold text-brand">#{r.rank}<span className="block text-xs font-medium text-slate-500">of {r.participants}</span></p>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-line text-slate-500"><tr><th className="py-2 font-semibold">Quiz</th><th className="font-semibold">Date</th><th className="font-semibold">Correct</th><th className="font-semibold">Score</th><th className="font-semibold">Rank</th></tr></thead>
            <tbody className="divide-y divide-line">
              {myResults.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No results yet. Join a live quiz to see your scores here.</td></tr>}
              {myResults.map((r) => (
                <tr key={r.quiz_id}>
                  <td className="py-3"><p className="font-semibold">{r.quiz_title}</p><p className="text-slate-500">{r.class_name}</p></td>
                  <td>{new Date(r.played_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                  <td>{r.correct}/{r.total}</td>
                  <td className="tabular-nums">{r.score.toLocaleString("en-IN")} <span className="text-slate-500">/ {r.max_score.toLocaleString("en-IN")}</span></td>
                  <td>#{r.rank} of {r.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}
