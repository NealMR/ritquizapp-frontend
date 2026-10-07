"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Leaderboard from "@/components/Leaderboard";
import { isScored, LETTERS, OPTION_BG } from "@/lib/questions";
import { useAuth } from "@/lib/auth";
import { useQuizSocket } from "@/lib/live";
import type { LiveState } from "@/lib/types";

// Student phone screen. Everything (timer, scoring, rank) comes from the server over the WebSocket.
type LiveQuestion = NonNullable<LiveState["question"]>;
type Answer = number[] | string;

export default function Play() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { state: s, error, connected, send, secondsLeft } = useQuizSocket(Number(id));

  if (!s) {
    return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper p-6 text-center text-slate-600">
      <p>{error || "Connecting…"}</p>
      {error && <Link href="/student" className="font-semibold text-brand">Back to home</Link>}
    </div>;
  }

  const q = s.question;
  const me = s.me;
  const scoredQ = !!q && isScored(q.type) && s.mode === "quiz";
  const res = me?.result;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between bg-ink px-4 py-3 text-white">
        <Link href="/student" className="text-sm text-white/70">‹ Leave</Link>
        <p className="truncate px-3 text-sm font-semibold">{s.title}</p>
        <p className="font-display font-bold tabular-nums">{(me?.score ?? 0).toLocaleString("en-IN")}</p>
      </header>
      {!connected && <p className="bg-ansA px-4 py-1 text-center text-xs font-bold text-white">Reconnecting…</p>}
      {error && <p className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">{error}</p>}

      {s.phase === "question" && q && (
        <div className="h-2 bg-line"><div className="h-2 bg-ansC transition-all duration-300 ease-linear" style={{ width: `${Math.min(100, (secondsLeft / q.time_limit_sec) * 100)}%` }} /></div>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col p-4">
        {s.phase === "lobby" && (
          <div className="m-auto text-center">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="mx-auto mb-6 grid w-28 grid-cols-2 gap-2" aria-hidden>
              <div className="h-12 rounded-lg bg-ansA" /><div className="h-12 rounded-lg bg-ansB" /><div className="h-12 rounded-lg bg-ansC" /><div className="h-12 rounded-lg bg-ansD" />
            </motion.div>
            <h1 className="font-display text-3xl font-bold">You&apos;re in!</h1>
            <p className="mt-2 text-slate-600">{user?.full_name}{user?.roll_no && ` · Roll ${user.roll_no}`}</p>
            <p className="mt-6 text-slate-500">Waiting for your teacher to start… ({s.joined.length} joined)</p>
            {s.description && <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">{s.description}</p>}
          </div>
        )}

        {s.phase === "question" && q && (me?.answered ? (
          <div className="m-auto text-center">
            <p className="font-display text-3xl font-bold">Answer locked in</p>
            <p className="mt-2 text-slate-600">{s.paused ? "Timer paused" : `Results in ${secondsLeft} seconds`}</p>
          </div>
        ) : (
          <AnswerUI key={s.index} q={q} idx={s.index} total={s.total} left={secondsLeft} error={error} submit={(a) => send("answer", { answer: a })} />
        ))}

        {s.phase === "reveal" && q && (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`m-auto w-full rounded-2xl p-8 text-center text-white ${!scoredQ ? "bg-brand" : res?.is_correct ? "bg-ansD" : "bg-ansA"}`}>
            {!scoredQ ? <p className="font-display text-3xl font-bold">{res ? "Thanks, response recorded" : "This question is closed"}</p> : (
              <>
                <p className="font-display text-4xl font-extrabold">{res?.is_correct ? "Correct!" : res ? "Not quite" : "Time's up"}</p>
                <p className="mt-2 text-xl">+{(res?.points ?? 0).toLocaleString("en-IN")} points</p>
                {!res?.is_correct && <p className="mt-4 text-white/90">Answer: {(s.reveal?.correct_options ?? []).map((i) => q.options[i]).join(", ")}</p>}
                {s.reveal?.explanation && <p className="mt-4 rounded-xl bg-white/15 p-3 text-sm">{s.reveal.explanation}</p>}
                {me?.rank && <p className="mt-6 text-white/80">You&apos;re #{me.rank} of {s.participants} so far</p>}
              </>
            )}
            <p className="mt-6 text-sm text-white/70">Waiting for your teacher…</p>
          </motion.div>
        )}

        {s.phase === "leaderboard" && <div><h1 className="mb-4 text-center font-display text-3xl font-bold">Leaderboard</h1><Leaderboard rows={(s.leaderboard ?? []).slice(0, 5)} highlight={user?.id} />
          {me?.rank && me.rank > 5 && <p className="mt-4 text-center text-slate-600">You&apos;re #{me.rank}</p>}</div>}

        {s.phase === "final" && (
          <div className="m-auto w-full text-center">
            {s.mode === "quiz" && me?.rank ? <>
              <motion.p initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring" }} className="font-display text-8xl font-extrabold text-brand">#{me.rank}</motion.p>
              <p className="font-display text-2xl font-bold">of {s.participants} students</p>
              <p className="mt-2 text-slate-600">{(me.score ?? 0).toLocaleString("en-IN")} points</p>
              <div className="mt-8 text-left"><Leaderboard rows={(s.leaderboard ?? []).slice(0, 3)} highlight={user?.id} /></div>
            </> : <p className="font-display text-3xl font-bold">Thanks for taking part!</p>}
            <Link href="/student/results" className="mt-8 inline-block rounded-xl bg-ink px-6 py-3 font-semibold text-white">See my results</Link>
          </div>
        )}
      </main>
    </div>
  );
}

function AnswerUI({ q, idx, total, left, error, submit }: { q: LiveQuestion; idx: number; total: number; left: number; error: string; submit: (a: Answer) => void }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  useEffect(() => { setSent(false); }, [error]); // server rejected it: let them retry
  const go = (a: Answer) => { if (sent) return; setSent(true); submit(a); };

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-4 flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <span>Question {idx + 1} of {total}</span>
        <span className="rounded-full bg-brand/10 px-3 py-1 text-brand font-extrabold shadow-sm">{left}s left</span>
      </div>
      <h1 className="mb-6 font-display text-2xl font-extrabold leading-snug text-ink">{q.text}</h1>
      {q.image_url && <img src={q.image_url} alt="" className="mb-6 max-h-56 w-full rounded-2xl object-cover shadow-soft" />}

      {(q.type === "mcq" || q.type === "true_false") && (
        <div className="flex flex-1 flex-col gap-3">
          {q.options.map((o, i) => (
            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={i} onClick={() => go([i])} disabled={sent}
              className="group relative flex w-full items-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:border-brand hover:shadow-md active:scale-[0.98]"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white shadow-sm ${OPTION_BG[i]}`}>{LETTERS[i]}</div>
              <span className="text-lg font-semibold text-slate-700 group-hover:text-ink">{o}</span>
            </motion.button>
          ))}
        </div>
      )}

      {q.type === "multi_select" && (
        <>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">Select all that apply</p>
          <div className="flex flex-col gap-3">
            {q.options.map((o, i) => {
              const on = picked.includes(i);
              return (
                <motion.button
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  key={i} aria-pressed={on} onClick={() => setPicked(on ? picked.filter((x) => x !== i) : [...picked, i])}
                  className={`group relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left shadow-sm transition-all active:scale-[0.98] ${on ? "border-brand bg-brand/5 shadow-md" : "border-slate-200 bg-white hover:border-brand/40"}`}
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-display text-lg font-bold text-white shadow-sm ${OPTION_BG[i]}`}>{on ? "✓" : LETTERS[i]}</div>
                  <span className={`text-lg font-semibold ${on ? "text-brand" : "text-slate-700"}`}>{o}</span>
                </motion.button>
              );
            })}
          </div>
          <button disabled={!picked.length || sent} onClick={() => go(picked)} className="mt-6 rounded-2xl bg-ink py-4 font-bold text-white shadow-soft transition-all hover:shadow-md disabled:opacity-40">Submit answer</button>
        </>
      )}

      {q.type === "rating" && (
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-3">
            {Array.from({ length: q.rating_max ?? 5 }, (_, i) => i + 1).map((n, i) => (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                key={n} onClick={() => go([n])} disabled={sent}
                className="h-16 w-16 rounded-2xl border-2 border-slate-200 bg-white font-display text-2xl font-extrabold text-slate-600 shadow-sm transition-all hover:border-brand hover:text-brand hover:shadow-md active:scale-95"
              >
                {n}
              </motion.button>
            ))}
          </div>
          <div className="mt-4 flex justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-slate-500"><span>Not at all</span><span>Very much</span></div>
        </div>
      )}

      {(q.type === "open_text" || q.type === "word_cloud") && (
        <div className="flex flex-col gap-4 mt-2">
          {q.type === "open_text" ? (
            <textarea value={text} maxLength={q.max_chars} onChange={(e) => setText(e.target.value)} aria-label="Your answer" placeholder="Type your answer here..." className="min-h-40 rounded-2xl border-2 border-slate-200 bg-white p-4 font-medium text-ink shadow-sm transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10" />
          ) : (
            <input value={text} onChange={(e) => setText(e.target.value.split(/\s+/).slice(0, q.max_words ?? 1).join(" "))} aria-label="Your word" placeholder={`Type up to ${q.max_words ?? 1} word(s)`} className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-center font-display text-2xl font-bold text-ink shadow-sm transition-all focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/10" />
          )}
          {q.type === "open_text" && <p className="text-right text-xs font-bold text-slate-400">{text.length}/{q.max_chars}</p>}
          <button disabled={!text.trim() || sent} onClick={() => go(text)} className="mt-2 rounded-2xl bg-ink py-4 font-bold text-white shadow-soft transition-all hover:shadow-md disabled:opacity-40">Submit response</button>
        </div>
      )}
    </div>
  );
}
