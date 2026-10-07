"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Leaderboard from "@/components/Leaderboard";
import { ANS_BG, ANS_SHAPE, isScored } from "@/lib/questions";
import { leaderboard, quizzes } from "@/lib/mock";
import type { Question } from "@/lib/types";

// Student phone screen. Real app: listen on the WebSocket for
// question_start / question_end / leaderboard / quiz_end and POST answers.
type Phase = "lobby" | "question" | "submitted" | "result" | "leaderboard" | "final";
const ME = 4;

export default function Play() {
  const { id } = useParams<{ id: string }>();
  const quiz = quizzes.find((q) => q.id === Number(id)) ?? quizzes[0];
  const [phase, setPhase] = useState<Phase>("lobby");
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [score, setScore] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const q = quiz.questions[idx];

  useEffect(() => { if (phase === "lobby") { const t = setTimeout(() => start(0), 3000); return () => clearTimeout(t); } }, [phase]); // eslint-disable-line
  useEffect(() => {
    if (phase !== "question" && phase !== "submitted") return;
    if (left <= 0) { reveal(); return; }
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]); // eslint-disable-line

  function start(i: number) { setIdx(i); setPicked([]); setText(""); setLeft(quiz.questions[i].time_limit_sec); setPhase("question"); }
  function submit(ans: number[] = picked) {
    setPicked(ans);
    const ok = isScored(q.type) && ans.length === q.correct_options.length && ans.every((a) => q.correct_options.includes(a));
    const gain = ok ? Math.round(q.points * (quiz.speed_bonus ? 0.5 + 0.5 * (left / q.time_limit_sec) : 1)) : 0;
    setLastGain(gain); setScore((s) => s + gain); setPhase("submitted");
  }
  function reveal() { if (phase === "question") setLastGain(0); setPhase("result"); }
  function next() {
    if (phase === "result" && quiz.show_leaderboard_each_question && quiz.mode === "quiz") return setPhase("leaderboard");
    if (idx + 1 < quiz.questions.length) start(idx + 1); else setPhase("final");
  }

  const correct = q && q.correct_options.length > 0 && picked.length === q.correct_options.length && picked.every((a) => q.correct_options.includes(a));

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between bg-ink px-4 py-3 text-white">
        <Link href="/student" className="text-sm text-white/70">‹ Leave</Link>
        <p className="truncate px-3 text-sm font-semibold">{quiz.title}</p>
        <p className="font-display font-bold tabular-nums">{score.toLocaleString("en-IN")}</p>
      </header>

      {(phase === "question" || phase === "submitted") && q && (
        <div className="h-2 bg-line"><div className="h-2 bg-ansC transition-all duration-1000 ease-linear" style={{ width: `${(left / q.time_limit_sec) * 100}%` }} /></div>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col p-4">
        {phase === "lobby" && (
          <div className="m-auto text-center">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="mx-auto mb-6 grid w-28 grid-cols-2 gap-2" aria-hidden>
              <div className="h-12 rounded-lg bg-ansA" /><div className="h-12 rounded-lg bg-ansB" /><div className="h-12 rounded-lg bg-ansC" /><div className="h-12 rounded-lg bg-ansD" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold">You&apos;re in!</h1>
            <p className="mt-2 text-slate-600">Atharv Thorat · Roll 42</p>
            <p className="mt-6 text-slate-500">Waiting for your teacher to start…</p>
            {quiz.description && <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">{quiz.description}</p>}
          </div>
        )}

        {phase === "question" && q && <AnswerUI q={q} idx={idx} total={quiz.questions.length} left={left} picked={picked} setPicked={setPicked} text={text} setText={setText} submit={submit} />}

        {phase === "submitted" && (
          <div className="m-auto text-center">
            <p className="font-display text-3xl font-bold">Answer locked in</p>
            <p className="mt-2 text-slate-600">Results in {left} seconds</p>
          </div>
        )}

        {phase === "result" && q && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`m-auto w-full rounded-2xl p-8 text-center text-white ${!isScored(q.type) || quiz.mode === "poll" ? "bg-brand" : correct ? "bg-ansD" : "bg-ansA"}`}>
            {!isScored(q.type) || quiz.mode === "poll" ? <p className="font-display text-3xl font-bold">Thanks, response recorded</p> : (
              <>
                <p className="font-display text-4xl font-extrabold">{correct ? "Correct!" : picked.length ? "Not quite" : "Time's up"}</p>
                <p className="mt-2 text-xl">+{lastGain.toLocaleString("en-IN")} points</p>
                {!correct && <p className="mt-4 text-white/90">Answer: {q.correct_options.map((i) => q.options[i]).join(", ")}</p>}
                {q.explanation && <p className="mt-4 rounded-xl bg-white/15 p-3 text-sm">{q.explanation}</p>}
                <p className="mt-6 text-white/80">You&apos;re 2nd so far</p>
              </>
            )}
          </motion.div>
        )}

        {phase === "leaderboard" && <div><h1 className="mb-4 text-center font-display text-3xl font-bold">Leaderboard</h1><Leaderboard rows={leaderboard} highlight={ME} /></div>}

        {phase === "final" && (
          <div className="m-auto w-full text-center">
            <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring" }} className="font-display text-8xl font-extrabold text-brand">#2</motion.p>
            <p className="font-display text-2xl font-bold">of 58 students</p>
            <p className="mt-2 text-slate-600">{score.toLocaleString("en-IN")} points</p>
            <div className="mt-8 text-left"><Leaderboard rows={leaderboard.slice(0, 3)} highlight={ME} /></div>
            <Link href="/student/results" className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 font-semibold text-white">See my results</Link>
          </div>
        )}
      </main>

      {(phase === "result" || phase === "leaderboard") && (
        <footer className="border-t border-line bg-white p-3 text-center">
          <button onClick={next} className="text-sm font-semibold text-brand">Demo only: simulate teacher pressing “Next”</button>
        </footer>
      )}
    </div>
  );
}

function AnswerUI({ q, idx, total, left, picked, setPicked, text, setText, submit }: {
  q: Question; idx: number; total: number; left: number; picked: number[]; setPicked: (v: number[]) => void; text: string; setText: (v: string) => void; submit: (a?: number[]) => void;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-2 flex justify-between text-sm text-slate-500"><span>Question {idx + 1} of {total}</span><span className="font-semibold text-ink">{left}s</span></div>
      <h1 className="mb-5 font-display text-2xl font-bold leading-snug">{q.text}</h1>
      {q.image_url && <img src={q.image_url} alt="" className="mb-4 max-h-48 rounded-xl object-contain" />}

      {(q.type === "mcq" || q.type === "true_false") && (
        <div className="grid flex-1 grid-cols-2 gap-3">
          {q.options.map((o, i) => (
            <button key={i} onClick={() => submit([i])} className={`flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl p-3 text-lg font-semibold text-white active:scale-95 ${ANS_BG[i]}`}>
              <span className="text-2xl" aria-hidden>{ANS_SHAPE[i]}</span>{o}
            </button>
          ))}
        </div>
      )}

      {q.type === "multi_select" && (
        <>
          <p className="mb-2 text-sm text-slate-600">Select all that apply</p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((o, i) => {
              const on = picked.includes(i);
              return (
                <button key={i} aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== i) : [...picked, i])}
                  className={`flex min-h-24 items-center justify-center gap-2 rounded-2xl p-3 text-lg font-semibold text-white ${ANS_BG[i]} ${on ? "ring-4 ring-ink ring-offset-2" : "opacity-80"}`}>
                  {on && "✓"} {o}
                </button>
              );
            })}
          </div>
          <button disabled={!picked.length} onClick={() => submit()} className="mt-4 rounded-xl bg-ink py-4 font-semibold text-white disabled:opacity-40">Submit answer</button>
        </>
      )}

      {q.type === "rating" && (
        <div className="mt-4">
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: q.rating_max ?? 5 }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => submit([n])} className="h-14 w-14 rounded-xl border-2 border-line bg-white font-display text-xl font-bold hover:border-brand">{n}</button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-500"><span>Not at all</span><span>Very</span></div>
        </div>
      )}

      {(q.type === "open_text" || q.type === "word_cloud") && (
        <div className="flex flex-col gap-3">
          {q.type === "open_text" ? (
            <textarea value={text} maxLength={q.max_chars} onChange={(e) => setText(e.target.value)} aria-label="Your answer" placeholder="Type your answer" className="min-h-32 rounded-xl border-2 border-line p-3" />
          ) : (
            <input value={text} onChange={(e) => setText(e.target.value.split(/\s+/).slice(0, q.max_words ?? 1).join(" "))} aria-label="Your word" placeholder={`Up to ${q.max_words ?? 1} word`} className="rounded-xl border-2 border-line p-4 text-center text-2xl" />
          )}
          {q.type === "open_text" && <p className="text-right text-xs text-slate-500">{text.length}/{q.max_chars}</p>}
          <button disabled={!text.trim()} onClick={() => submit([])} className="rounded-xl bg-ink py-4 font-semibold text-white disabled:opacity-40">Send</button>
        </div>
      )}
    </div>
  );
}
