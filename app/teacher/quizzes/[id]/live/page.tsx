"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import { isScored, LETTERS, OPTION_BG } from "@/lib/questions";
import { api } from "@/lib/api";
import { useQuizSocket } from "@/lib/live";
import type { ClassRoom } from "@/lib/types";

// Host screen for the classroom projector. The server runs the timer and scoring; this page only renders its state.

export default function HostLive() {
  const { id } = useParams<{ id: string }>();
  const { state: s, error, connected, send, secondsLeft } = useQuizSocket(Number(id));
  const [cls, setCls] = useState<ClassRoom | null>(null);

  useEffect(() => {
    api.getQuiz(Number(id)).then((q) => api.getClass(q.class_id)).then(setCls).catch(() => {});
  }, [id]);

  if (!s) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink text-white">
      <p>{error || "Connecting…"}</p>
      {error && <Link href="/teacher" className="text-sm underline">Back to my classes</Link>}
    </div>;
  }

  const q = s.question;
  const rev = s.reveal;
  const last = s.index + 1 >= s.total;
  const maxCount = Math.max(1, ...(rev?.distribution ?? [0]));

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3">
        <Link href={cls ? `/teacher/classes/${cls.id}` : "/teacher"} className="text-sm text-white/70 hover:text-white">‹ Exit</Link>
        <p className="font-display font-semibold">{s.title}</p>
        {cls && <p className="text-sm text-white/60">{cls.name}</p>}
        {!connected && <p className="rounded bg-ansA px-2 py-0.5 text-xs font-bold">Reconnecting…</p>}
        {cls && <p className="ml-auto text-sm text-white/70">Class code <span className="font-display text-lg font-bold tracking-widest text-white">{cls.join_code}</span></p>}
      </header>

      {error && <p className="bg-ansA/90 px-5 py-2 text-sm">{error}</p>}

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-8">
        {s.phase === "lobby" && (
          <div className="text-center">
            <p className="text-white/70">Waiting for students. Ask them to open RIT Quiz and tap <b>Join quiz</b>.</p>
            <p className="font-display text-7xl font-extrabold">{s.joined.length}</p>
            <p className="mb-8 text-white/70">joined</p>
            <div className="mx-auto mb-10 flex max-w-2xl flex-wrap justify-center gap-2">{s.joined.map((p) => <span key={p.id} className="rounded-full bg-white/10 px-3 py-1 text-sm">{p.name}</span>)}</div>
            <button onClick={() => send("start")} disabled={!s.total} className="rounded-xl bg-ansD px-8 py-4 font-display text-xl font-bold disabled:opacity-40">
              {s.total ? "Start quiz" : "Add questions first"}
            </button>
          </div>
        )}

        {(s.phase === "question" || s.phase === "reveal") && q && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-white/70">
              <span>Question {s.index + 1} of {s.total}</span>
              <span>{s.answered} / {s.joined.length} answered</span>
            </div>
            <div className="mb-6 flex items-start gap-6">
              <h1 className="flex-1 font-display text-3xl font-bold leading-tight sm:text-5xl">{q.text}</h1>
              {s.phase === "question" && <div className={`grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 font-display text-4xl font-extrabold ${s.paused ? "border-white/30 text-white/50" : "border-ansC"}`}>{secondsLeft}</div>}
            </div>
            {q.image_url && <img src={q.image_url} alt="" className="mb-6 max-h-64 rounded-2xl object-contain" />}
            {q.options.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {q.options.map((o, i) => {
                  const right = !!rev?.correct_options.includes(i);
                  const dim = s.phase === "reveal" && s.mode === "quiz" && isScored(q.type) && !right;
                  const n = rev?.distribution?.[i] ?? 0;
                  return (
                    <div key={i} className={`relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-500 ${dim ? "border-white/5 bg-white/5 opacity-40" : right && s.phase === "reveal" ? "border-ansD bg-white/10 ring-4 ring-ansD/30" : "border-white/10 bg-white/10"}`}>
                      {s.phase === "reveal" && <span className="absolute inset-y-0 left-0 bg-white/10 transition-all duration-700" style={{ width: `${(n / maxCount) * 100}%` }} />}
                      <p className="relative z-10 flex items-center gap-4 text-2xl font-semibold text-white">
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display font-bold text-white ${OPTION_BG[i]}`}>{LETTERS[i]}</span>
                        <span className="flex-1">{o}</span>
                        {s.phase === "reveal" && <span className="font-display text-3xl font-extrabold tabular-nums">{n}{right && <span className="ml-3 text-ansD">✓</span>}</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-white/10 p-8 text-center text-white/80">
                {s.phase === "question" ? <p>Students are answering on their phones…</p>
                  : q.type === "rating" ? (
                    <div>
                      <p className="font-display text-6xl font-bold">{rev?.rating_avg ?? "–"} <span className="text-2xl text-white/60">/ {q.rating_max}</span></p>
                      <div className="mx-auto mt-6 flex max-w-md items-end justify-center gap-2">
                        {(rev?.distribution ?? []).map((n, i) => (
                          <div key={i} className="flex flex-1 flex-col items-center gap-1 text-sm">
                            <span>{n}</span><span className="w-full rounded-t bg-ansC" style={{ height: `${(n / maxCount) * 120 + 4}px` }} /><span className="text-white/60">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : q.type === "word_cloud" ? (
                    <p className="flex flex-wrap items-baseline justify-center gap-x-5 gap-y-2 font-display leading-tight">
                      {(rev?.words ?? []).map(([w, n], i) => <span key={w} className={i % 3 === 0 ? "text-ansC" : ""} style={{ fontSize: `${Math.min(4.5, 1.2 + n * 0.6)}rem` }}>{w}</span>)}
                      {!rev?.words?.length && <span>No words yet.</span>}
                    </p>
                  ) : (
                    <ul className="grid max-h-80 gap-2 overflow-y-auto text-left sm:grid-cols-2">
                      {(rev?.texts ?? []).map((t, i) => <li key={i} className="rounded-lg bg-white/10 p-3">{t}</li>)}
                      {!rev?.texts?.length && <li>No responses.</li>}
                    </ul>
                  )}
              </div>
            )}
            {s.phase === "reveal" && rev?.explanation && <p className="mt-5 rounded-xl bg-white/10 p-4 text-white/85">{rev.explanation}</p>}
          </div>
        )}

        {s.phase === "leaderboard" && <div className="mx-auto w-full max-w-xl"><h1 className="mb-6 text-center font-display text-4xl font-bold">Top 5</h1><Leaderboard rows={(s.leaderboard ?? []).slice(0, 5)} dark /></div>}

        {s.phase === "final" && (
          <div className="mx-auto w-full max-w-xl text-center">
            <h1 className="mb-2 font-display text-5xl font-extrabold">Quiz complete</h1>
            <p className="mb-8 text-white/70">{s.participants} students took part</p>
            {s.mode === "quiz" && <div className="text-left"><Leaderboard rows={s.leaderboard ?? []} dark /></div>}
            <Link href={`/teacher/quizzes/${s.quiz_id}/report`} className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-ink">View full report</Link>
          </div>
        )}
      </main>

      {s.phase !== "lobby" && s.phase !== "final" && (
        <footer className="flex flex-wrap items-center gap-3 border-t border-white/10 px-5 py-3">
          {s.phase === "question" && <>
            <button onClick={() => send(s.paused ? "resume" : "pause")} className="rounded-lg border border-white/30 px-4 py-2 text-sm">{s.paused ? "Resume timer" : "Pause timer"}</button>
            <button onClick={() => send("add_time", { seconds: 10 })} className="rounded-lg border border-white/30 px-4 py-2 text-sm">+10 seconds</button>
            <button onClick={() => send("close_answers")} className="rounded-lg border border-white/30 px-4 py-2 text-sm">Close answers now</button>
          </>}
          <button onClick={() => confirm("End the quiz now? Scores so far are saved.") && send("end")} className="rounded-lg px-4 py-2 text-sm text-white/70">End quiz</button>
          {s.phase === "reveal" && s.mode === "quiz" && q && isScored(q.type) && <button onClick={() => send("show_leaderboard")} className="ml-auto rounded-lg border border-white/30 px-4 py-2 text-sm">Show leaderboard</button>}
          {s.phase !== "question" && <button onClick={() => send("next")} className={`${s.phase === "reveal" && s.mode === "quiz" && q && isScored(q.type) ? "" : "ml-auto "}rounded-lg bg-white px-6 py-2.5 font-semibold text-ink`}>{last ? "Finish" : "Next question"}</button>}
        </footer>
      )}
    </div>
  );
}
