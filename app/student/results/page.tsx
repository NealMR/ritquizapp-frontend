"use client";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Panel, Button } from "@/components/ui";
import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import type { QuizResult } from "@/lib/types";
import QuizOverviewModal from "@/components/QuizOverviewModal";

export default function Results() {
  const [myResults, setMyResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchResults = useCallback(() => {
    setLoading(true);
    setError(null);
    api.getMyResults()
      .then((data) => {
        setMyResults(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setError(err?.message || "Failed to load quiz results.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Compute 4-card overview metrics
  const totalQuizzes = myResults.length;
  const totalCorrect = myResults.reduce((sum, r) => sum + (r.correct || 0), 0);
  const totalQuestions = myResults.reduce((sum, r) => sum + (r.total || 0), 0);
  const avgAccuracy = totalQuestions > 0 ? `${Math.round((totalCorrect / totalQuestions) * 100)}%` : "—";
  const totalPoints = myResults.reduce((sum, r) => sum + (r.score || 0), 0).toLocaleString("en-IN");
  const ranked = myResults.filter((r) => typeof r.rank === "number" && r.rank !== null && r.rank > 0);
  const bestRank = ranked.length > 0 ? `#${Math.min(...ranked.map((r) => r.rank!))}` : "—";

  // Filter results by search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return myResults;
    const q = searchQuery.toLowerCase().trim();
    return myResults.filter(
      (r) =>
        r.quiz_title.toLowerCase().includes(q) ||
        r.class_name.toLowerCase().includes(q)
    );
  }, [myResults, searchQuery]);

  return (
    <AppShell role="student">
      <PageTitle title="My results" sub="Every quiz you've played. Click any test to see its full overview." />

      {/* Error state banner with Retry button */}
      {error && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-ansA">
          <p className="font-medium">{error}</p>
          <Button variant="outline" className="px-4 py-2 text-xs" onClick={fetchResults}>
            Retry
          </Button>
        </div>
      )}

      {/* 4-card Overview KPI Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
              <div className="mb-2 h-8 w-16 rounded bg-slate-200" />
              <div className="h-4 w-28 rounded bg-slate-100" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
              <p className="font-display text-3xl font-bold text-ink">{totalQuizzes}</p>
              <p className="text-sm font-medium text-slate-600">Quizzes Completed</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
              <p className="font-display text-3xl font-bold text-brand">{avgAccuracy}</p>
              <p className="text-sm font-medium text-slate-600">Average Accuracy</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
              <p className="font-display text-3xl font-bold text-emerald-600">{totalPoints}</p>
              <p className="text-sm font-medium text-slate-600">Total Points</p>
            </div>
            <div className="rounded-xl border border-line bg-white px-4 py-3 shadow-soft">
              <p className="font-display text-3xl font-bold text-ink">{bestRank}</p>
              <p className="text-sm font-medium text-slate-600">Best Rank</p>
            </div>
          </>
        )}
      </div>

      <Panel
        title="All quiz results"
        action={
          <div className="flex items-center gap-3">
            <div className="relative w-56 sm:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quiz or class..."
                className="w-full rounded-xl border border-line bg-slate-50/80 px-3.5 py-1.5 pl-9 text-xs text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="animate-pulse space-y-4 py-6">
            <div className="h-5 w-48 rounded bg-slate-200" />
            <div className="h-12 w-full rounded bg-slate-100" />
            <div className="h-12 w-full rounded bg-slate-100" />
            <div className="h-12 w-full rounded bg-slate-100" />
          </div>
        ) : (
          <>
            {searchQuery && (
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                <p>
                  Found <span className="font-bold text-ink">{filteredResults.length}</span> of {myResults.length} results matching &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="font-semibold text-brand hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Mobile list view */}
            <ul className="flex flex-col divide-y divide-line sm:hidden">
              {filteredResults.length === 0 && (
                <li className="py-8 text-center text-sm text-slate-500">
                  {searchQuery ? (
                    <div>
                      <p>No results match &ldquo;{searchQuery}&rdquo;</p>
                      <Button variant="outline" className="mt-3 text-xs" onClick={() => setSearchQuery("")}>
                        Clear search filter
                      </Button>
                    </div>
                  ) : (
                    "No results yet. Join a live quiz to see your scores here."
                  )}
                </li>
              )}
              {filteredResults.map((r, idx) => (
                <li
                  key={`${r.quiz_id}-${r.played_at}-${r.id || idx}`}
                  onClick={() => setSelectedQuizId(r.quiz_id)}
                  className="flex items-center justify-between gap-3 py-4 cursor-pointer hover:bg-slate-50 transition-colors -mx-6 px-6"
                  role="button"
                  tabIndex={0}
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink hover:text-brand transition-colors">
                      {r.quiz_title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {r.class_name} · {new Date(r.played_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {r.correct}/{r.total} correct · {r.score.toLocaleString("en-IN")} pts
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl font-extrabold text-brand">
                      {r.rank ? `#${r.rank}` : "Unranked"}
                      {r.rank ? <span className="block text-xs font-medium text-slate-500">of {r.participants}</span> : null}
                    </p>
                    <span className="text-xs font-semibold text-brand mt-1 block">View overview →</span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Desktop table view */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-line text-slate-500">
                  <tr>
                    <th className="py-2.5 font-semibold">Quiz</th>
                    <th className="font-semibold">Date</th>
                    <th className="font-semibold">Correct</th>
                    <th className="font-semibold">Score</th>
                    <th className="font-semibold">Rank</th>
                    <th className="font-semibold text-right">Overview</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filteredResults.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500">
                        {searchQuery ? (
                          <div>
                            <p className="font-medium text-slate-700">No results match &ldquo;{searchQuery}&rdquo;</p>
                            <p className="text-xs text-slate-400 mt-1">Try searching by another title or class name.</p>
                            <Button variant="outline" className="mt-3 text-xs" onClick={() => setSearchQuery("")}>
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          "No results yet. Join a live quiz to see your scores here."
                        )}
                      </td>
                    </tr>
                  )}
                  {filteredResults.map((r, idx) => (
                    <tr
                      key={`${r.quiz_id}-${r.played_at}-${r.id || idx}`}
                      onClick={() => setSelectedQuizId(r.quiz_id)}
                      className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                      title="Click to view test overview"
                    >
                      <td className="py-3.5">
                        <p className="font-semibold text-ink group-hover:text-brand transition-colors">
                          {r.quiz_title}
                        </p>
                        <p className="text-xs text-slate-500">{r.class_name}</p>
                      </td>
                      <td className="text-slate-600">
                        {new Date(r.played_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      </td>
                      <td>{r.correct}/{r.total}</td>
                      <td className="tabular-nums font-medium text-slate-800">
                        {r.score.toLocaleString("en-IN")}{" "}
                        <span className="text-slate-400 font-normal">/ {r.max_score.toLocaleString("en-IN")}</span>
                      </td>
                      <td>
                        {r.rank ? (
                          <span className="font-bold text-brand">#{r.rank} <span className="text-slate-400 font-normal text-xs">of {r.participants}</span></span>
                        ) : (
                          <span className="text-slate-400">Unranked</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedQuizId(r.quiz_id);
                          }}
                          className="rounded-lg bg-brandsoft/50 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition-all shadow-2xs"
                        >
                          View overview →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Panel>

      {/* Test Overview Modal */}
      <QuizOverviewModal
        quizId={selectedQuizId}
        onClose={() => setSelectedQuizId(null)}
      />
    </AppShell>
  );
}
