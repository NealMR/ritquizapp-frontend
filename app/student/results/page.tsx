"use client";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Panel } from "@/components/ui";
import { myResults } from "@/lib/mock";

export default function Results() {
  return (
    <AppShell role="student">
      <PageTitle title="My results" sub="Every quiz you've played." />
      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-line text-slate-500"><tr><th className="py-2 font-semibold">Quiz</th><th className="font-semibold">Date</th><th className="font-semibold">Correct</th><th className="font-semibold">Score</th><th className="font-semibold">Rank</th></tr></thead>
            <tbody className="divide-y divide-line">
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
