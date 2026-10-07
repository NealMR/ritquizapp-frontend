"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Leaderboard from "@/components/Leaderboard";
import { ANS_BG, ANS_SHAPE, isScored } from "@/lib/questions";
import { classes, leaderboard, quizzes } from "@/lib/mock";

// Host screen meant for the classroom projector.
// Real app: drive phases over the WebSocket (/ws/quiz/{id}) and receive response counts live.
type Phase = "lobby" | "question" | "reveal" | "leaderboard" | "final";
const JOINED = ["Priya", "Atharv", "Omkar", "Tanvi", "Yash", "Sakshi", "Rohan", "Isha", "Pranav", "Gauri", "Aditya", "Neha"];

export default function HostLive() {
  const { id } = useParams<{ id: string }>();
  const quiz = quizzes.find((q) => q.id === Number(id)) ?? quizzes[0];
  const cls = classes.find((c) => c.id === quiz.class_id)!;
  const [phase, setPhase] = useState<Phase>("lobby");
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [joined, setJoined] = useState(3);
  const [paused, setPaused] = useState(false);
  const q = quiz.questions[idx];
  const total = 58;

  useEffect(() => { if (phase !== "lobby") return; const t = setInterval(() => setJoined((j) => Math.min(JOINED.length, j + 1)), 900); return () => clearInterval(t); }, [phase]);
  useEffect(() => {
    if (phase !== "question" || paused) return;
    if (left <= 0) { setPhase("reveal"); return; }
    const t = setTimeout(() => { setLeft(left - 1); setAnswered((a) => Math.min(total, a + Math.ceil(Math.random() * 6))); }, 1000);
    return () => clearTimeout(t);
  }, [phase, left, paused]);

  const start = (i: number) => { setIdx(i); setLeft(quiz.questions[i].time_limit_sec); setAnswered(0); setPaused(false); setPhase("question"); };
  const next = () => {
    if (phase === "reveal" && quiz.show_leaderboard_each_question && quiz.mode === "quiz") return setPhase("leaderboard");
    if (idx + 1 < quiz.questions.length) start(idx + 1); else setPhase("final");
  };
  const dist = q ? q.options.map((_, i) => (q.correct_options.includes(i) ? 0.5 : 0.5 / Math.max(1, q.options.length - 1)) * answered) : [];

  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3">
        <Link href={`/teacher/classes/${cls.id}`} className="text-sm text-white/70 hover:text-white">‹ Exit</Link>
        <p className="font-display font-semibold">{quiz.title}</p>
        <p className="text-sm text-white/60">{cls.name}</p>
        <p className="ml-auto text-sm text-white/70">Join code <span className="font-display text-lg font-bold tracking-widest text-white">{cls.join_code}</span></p>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-8">
        {phase === "lobby" && (
          <div className="text-center">
            <p className="text-white/70">Waiting for students</p>
            <p className="font-display text-7xl font-extrabold">{joined}</p>
            <p className="mb-8 text-white/70">joined</p>
            <div className="mx-auto mb-10 flex max-w-2xl flex-wrap justify-center gap-2">{JOINED.slice(0, joined).map((n) => <span key={n} className="rounded-full bg-white/10 px-3 py-1 text-sm">{n}</span>)}</div>
            <button onClick={() => start(0)} className="rounded-xl bg-ansD px-8 py-4 font-display text-xl font-bold">Start quiz</button>
          </div>
        )}

        {(phase === "question" || phase === "reveal") && q && (
          <div>
            <div className="mb-4 flex items-center justify-between text-sm text-white/70">
              <span>Question {idx + 1} of {quiz.questions.length}</span>
              <span>{answered} / {total} answered</span>
            </div>
            <div className="mb-6 flex items-start gap-6">
              <h1 className="flex-1 font-display text-3xl font-bold leading-tight sm:text-5xl">{q.text}</h1>
              {phase === "question" && <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-ansC font-display text-4xl font-extrabold">{left}</div>}
            </div>
            {q.options.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {q.options.map((o, i) => {
                  const right = q.correct_options.includes(i);
                  const dim = phase === "reveal" && isScored(q.type) && !right;
                  return (
                    <div key={i} className={`relative overflow-hidden rounded-xl p-5 ${ANS_BG[i]} ${dim ? "opacity-35" : ""}`}>
                      <p className="relative z-10 flex items-center gap-3 text-xl font-semibold"><span aria-hidden>{ANS_SHAPE[i]}</span>{o}{phase === "reveal" && right && <span className="ml-auto">✓</span>}</p>
                      {phase === "reveal" && <p className="relative z-10 mt-2 font-display text-3xl font-bold">{Math.round(dist[i])}</p>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-white/10 p-8 text-center text-white/80">
                {q.type === "word_cloud" && phase === "reveal" ? <p className="font-display text-4xl leading-relaxed">engaging <span className="text-6xl">clear</span> fast <span className="text-5xl text-ansC">interesting</span> tough</p>
                  : q.type === "rating" && phase === "reveal" ? <p className="font-display text-6xl font-bold">3.8 <span className="text-2xl text-white/60">/ {q.rating_max}</span></p>
                  : phase === "reveal" ? <p>{answered} responses collected. Open the report to read them all.</p>
                  : <p>Students are answering on their phones…</p>}
              </div>
            )}
            {phase === "reveal" && q.explanation && <p className="mt-5 rounded-xl bg-white/10 p-4 text-white/85">{q.explanation}</p>}
          </div>
        )}

        {phase === "leaderboard" && <div className="mx-auto w-full max-w-xl"><h1 className="mb-6 text-center font-display text-4xl font-bold">Top 5</h1><Leaderboard rows={leaderboard} dark /></div>}

        {phase === "final" && (
          <div className="mx-auto w-full max-w-xl text-center">
            <h1 className="mb-2 font-display text-5xl font-extrabold">Quiz complete</h1>
            <p className="mb-8 text-white/70">{answered || total} students took part</p>
            {quiz.mode === "quiz" && <div className="text-left"><Leaderboard rows={leaderboard} dark /></div>}
            <Link href={`/teacher/quizzes/${quiz.id}/report`} className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-ink">View full report</Link>
          </div>
        )}
      </main>

      {phase !== "lobby" && phase !== "final" && (
        <footer className="flex flex-wrap items-center gap-3 border-t border-white/10 px-5 py-3">
          {phase === "question" && <>
            <button onClick={() => setPaused(!paused)} className="rounded-lg border border-white/30 px-4 py-2 text-sm">{paused ? "Resume timer" : "Pause timer"}</button>
            <button onClick={() => setLeft((l) => l + 10)} className="rounded-lg border border-white/30 px-4 py-2 text-sm">+10 seconds</button>
            <button onClick={() => setPhase("reveal")} className="rounded-lg border border-white/30 px-4 py-2 text-sm">Close answers now</button>
          </>}
          <button onClick={() => setPhase("final")} className="rounded-lg px-4 py-2 text-sm text-white/70">End quiz</button>
          {phase !== "question" && <button onClick={next} className="ml-auto rounded-lg bg-white px-6 py-2.5 font-semibold text-ink">{idx + 1 < quiz.questions.length ? "Next question" : "Finish"}</button>}
        </footer>
      )}
    </div>
  );
}
