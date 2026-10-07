"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { Badge, Button, Input, Panel, Select, Textarea, Toggle } from "@/components/ui";
import { blankQuestion, isScored, LETTERS, OPTION_BG, QTYPES, typeLabel } from "@/lib/questions";
import { api } from "@/lib/api";
import type { Question, QuestionType, Quiz, Settings } from "@/lib/types";

export default function QuizBuilder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [sel, setSel] = useState(0);
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);
  const [defaults, setDefaults] = useState<Settings | null>(null);

  useEffect(() => {
    api.getQuiz(Number(id)).then((q) => setQuiz({ ...q, questions: q.questions ?? [] })).catch((e) => setSaved(e.message));
    api.getSettings().then(setDefaults).catch(() => {});
  }, [id]);

  if (!quiz) return <AppShell role="teacher"><p>{saved || "Loading..."}</p></AppShell>;
  const locked = quiz.status === "live" || quiz.status === "closed";

  const q = quiz.questions[sel];

  const setQ = (p: Partial<Question>) => setQuiz({ ...quiz, questions: quiz.questions.map((x, i) => (i === sel ? { ...x, ...p } : x)) });
  const add = () => { setQuiz({ ...quiz, questions: [...quiz.questions, blankQuestion(quiz.questions.length + 1, "mcq", defaults)] }); setSel(quiz.questions.length); };
  const remove = (i: number) => { const qs = quiz.questions.filter((_, j) => j !== i).map((x, j) => ({ ...x, order: j + 1 })); setQuiz({ ...quiz, questions: qs }); setSel(Math.max(0, Math.min(sel, qs.length - 1))); };
  const move = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= quiz.questions.length) return; const qs = [...quiz.questions]; [qs[i], qs[j]] = [qs[j], qs[i]]; setQuiz({ ...quiz, questions: qs.map((x, k) => ({ ...x, order: k + 1 })) }); setSel(j); };
  const duplicate = (i: number) => { const qs = [...quiz.questions]; qs.splice(i + 1, 0, { ...structuredClone(qs[i]), id: Date.now() }); setQuiz({ ...quiz, questions: qs.map((x, k) => ({ ...x, order: k + 1 })) }); setSel(i + 1); };
  const changeType = (t: QuestionType) => { const b = blankQuestion(q.order, t, defaults); setQ({ ...b, id: q.id, text: q.text, time_limit_sec: q.time_limit_sec, image_url: q.image_url }); };

  const problems = quiz.questions.map((x) => {
    if (!x.text.trim()) return "Question text is empty";
    if (["mcq", "multi_select"].includes(x.type) && x.options.filter((o) => o.trim()).length < 2) return "Add at least 2 options";
    if (quiz.mode === "quiz" && isScored(x.type) && x.correct_options.length === 0) return "Mark the correct answer";
    return "";
  });

  const save = async () => {
    try {
      setSaving(true);
      setSaved("Saving...");

      const isReady = !problems.some(Boolean);

      // Update quiz details
      await api.updateQuiz(quiz.id, {
        class_id: quiz.class_id,
        title: quiz.title,
        description: quiz.description,
        mode: quiz.mode,
        status: isReady ? "scheduled" : "draft",
        scheduled_at: quiz.scheduled_at,
        shuffle_questions: quiz.shuffle_questions,
        shuffle_options: quiz.shuffle_options,
        speed_bonus: quiz.speed_bonus,
        show_leaderboard_each_question: quiz.show_leaderboard_each_question,
        allow_late_join: quiz.allow_late_join
      });

      // Update all questions
      await api.updateQuestions(quiz.id, quiz.questions);

      setSaved(isReady ? "All changes saved to server." : "Saved as draft. Fix the flagged questions before launching.");
    } catch (err: any) {
      setSaved(`Not saved: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  return (
    <AppShell role="teacher">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link href={`/teacher/classes/${quiz.class_id}`} className="text-sm font-semibold text-brand">‹ Back to class</Link>
        <div className="ml-auto flex items-center gap-2">
          {saved && <span className="text-sm text-slate-600">{saved}</span>}
          <Button variant="outline" onClick={save} disabled={saving || locked}>{locked ? "Already run" : "Save"}</Button>
          <Button disabled={saving || locked || problems.some(Boolean) || quiz.questions.length === 0} onClick={async () => { await save(); router.push(`/teacher/quizzes/${quiz.id}/live`); }}>Save and launch live</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Question list */}
        <aside className="flex flex-col gap-3">
          <Panel title="Quiz details">
            <div className="flex flex-col gap-3">
              <Input label="Title" value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
              <Textarea label="Description" value={quiz.description ?? ""} onChange={(e) => setQuiz({ ...quiz, description: e.target.value })} />
              <Select label="Type" value={quiz.mode} onChange={(e) => setQuiz({ ...quiz, mode: e.target.value as Quiz["mode"] })} options={[{ value: "quiz", label: "Quiz (scored)" }, { value: "poll", label: "Poll (no scoring)" }]} />
            </div>
          </Panel>
          <ol className="flex flex-col gap-2">
            {quiz.questions.map((x, i) => (
              <li key={x.id}>
                <button onClick={() => setSel(i)} className={`w-full rounded-lg border p-3 text-left ${i === sel ? "border-brand bg-brandsoft" : "border-line bg-white"}`}>
                  <span className="text-xs font-semibold text-slate-500">Q{i + 1} · {typeLabel(x.type)}</span>
                  <span className="mt-0.5 line-clamp-2 block text-sm font-medium">{x.text || "Untitled question"}</span>
                  {problems[i] && <span className="mt-1 block text-xs text-ansA">{problems[i]}</span>}
                </button>
              </li>
            ))}
          </ol>
          <Button variant="outline" onClick={add}>Add question</Button>
        </aside>

        {/* Editor */}
        <div className="flex flex-col gap-6">
          {q ? (
            <Panel title={`Question ${sel + 1}`} action={
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => move(sel, -1)} aria-label="Move up">↑</Button>
                <Button variant="ghost" onClick={() => move(sel, 1)} aria-label="Move down">↓</Button>
                <Button variant="ghost" onClick={() => duplicate(sel)}>Duplicate</Button>
                <Button variant="ghost" onClick={() => remove(sel)} className="text-ansA">Delete</Button>
              </div>}>
              <div className="flex flex-col gap-4">
                <Select label="Question type" value={q.type} onChange={(e) => changeType(e.target.value as QuestionType)} options={QTYPES.map((t) => ({ value: t.value, label: t.label }))} />
                <Textarea label="Question" value={q.text} onChange={(e) => setQ({ text: e.target.value })} placeholder="Type the question students will see" maxLength={300} hint={`${q.text.length}/300`} />
                <Input label="Image URL (optional)" value={q.image_url ?? ""} onChange={(e) => setQ({ image_url: e.target.value })} placeholder="https://… link to an image shown with the question" />

                {(q.type === "mcq" || q.type === "multi_select" || q.type === "true_false") && (
                  <fieldset>
                    <legend className="mb-2 text-sm font-semibold">Options {quiz.mode === "quiz" && <span className="font-normal text-slate-500">— tick the correct {q.type === "multi_select" ? "answers" : "answer"}</span>}</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((o, i) => {
                        const correct = q.correct_options.includes(i);
                        return (
                          <div key={i} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-slate-50 p-2">
                            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display font-bold text-white shadow-sm ${OPTION_BG[i]}`} aria-hidden>{LETTERS[i]}</span>
                            <input aria-label={`Option ${i + 1}`} value={o} disabled={q.type === "true_false"} onChange={(e) => setQ({ options: q.options.map((x, j) => (j === i ? e.target.value : x)) })}
                              placeholder={`Option ${i + 1}`} className="min-w-0 flex-1 rounded-md bg-white px-2 py-1.5 text-sm font-semibold text-ink border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all" />
                            {quiz.mode === "quiz" && (
                              <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                                <input type={q.type === "multi_select" ? "checkbox" : "radio"} name="correct" checked={correct}
                                  onChange={() => setQ({ correct_options: q.type === "multi_select" ? (correct ? q.correct_options.filter((x) => x !== i) : [...q.correct_options, i]) : [i] })} />
                                Correct
                              </label>
                            )}
                            {q.type !== "true_false" && q.options.length > 2 && (
                              <button type="button" aria-label="Remove option" className="px-1 text-slate-400 hover:text-ansA transition-colors" onClick={() => setQ({ options: q.options.filter((_, j) => j !== i), correct_options: q.correct_options.filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)) })}>✕</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {q.type !== "true_false" && q.options.length < 6 && <Button variant="ghost" className="mt-2" onClick={() => setQ({ options: [...q.options, ""] })}>Add option</Button>}
                  </fieldset>
                )}
                {q.type === "rating" && <Select label="Scale" value={String(q.rating_max ?? 5)} onChange={(e) => setQ({ rating_max: Number(e.target.value) })} options={[{ value: "5", label: "1 to 5" }, { value: "10", label: "1 to 10" }]} />}
                {q.type === "word_cloud" && <Input label="Words per student" type="number" min={1} max={3} value={q.max_words ?? 1} onChange={(e) => setQ({ max_words: Number(e.target.value) })} />}
                {q.type === "open_text" && <Input label="Max characters" type="number" min={20} max={500} value={q.max_chars ?? 200} onChange={(e) => setQ({ max_chars: Number(e.target.value) })} />}

                <div className="grid grid-cols-2 gap-3">
                  <Select label="Time limit" value={String(q.time_limit_sec)} onChange={(e) => setQ({ time_limit_sec: Number(e.target.value) })} options={["5", "10", "15", "20", "30", "45", "60", "90", "120"].map((s) => ({ value: s, label: `${s} seconds` }))} />
                  <Select label="Points" value={String(q.points)} disabled={quiz.mode === "poll" || !isScored(q.type)} onChange={(e) => setQ({ points: Number(e.target.value) })}
                    options={[{ value: "0", label: "No points" }, { value: "500", label: "500 (half)" }, { value: "1000", label: "1000 (standard)" }, { value: "2000", label: "2000 (double)" }]} />
                </div>
                {quiz.mode === "quiz" && isScored(q.type) && <Textarea label="Explanation (optional)" value={q.explanation ?? ""} onChange={(e) => setQ({ explanation: e.target.value })} hint="Shown to students after the answer is revealed." />}
              </div>
            </Panel>
          ) : (
            <Panel><p className="text-center text-slate-500">No questions yet. Use “Add question” to start.</p></Panel>
          )}

          <Panel title="Live settings">
            <div className="grid gap-x-8 md:grid-cols-2">
              <Toggle label="Shuffle question order" checked={quiz.shuffle_questions} onChange={(v) => setQuiz({ ...quiz, shuffle_questions: v })} />
              <Toggle label="Shuffle answer options" checked={quiz.shuffle_options} onChange={(v) => setQuiz({ ...quiz, shuffle_options: v })} />
              <Toggle label="Speed bonus" hint="Faster correct answers earn more points." checked={quiz.speed_bonus} onChange={(v) => setQuiz({ ...quiz, speed_bonus: v })} />
              <Toggle label="Leaderboard after each question" checked={quiz.show_leaderboard_each_question} onChange={(v) => setQuiz({ ...quiz, show_leaderboard_each_question: v })} />
              <Toggle label="Let late students join" hint="Students can join after the first question starts." checked={quiz.allow_late_join} onChange={(v) => setQuiz({ ...quiz, allow_late_join: v })} />
            </div>
            <p className="mt-3 text-sm text-slate-500">{quiz.questions.length} questions · about {Math.ceil(quiz.questions.reduce((s, x) => s + x.time_limit_sec + 10, 0) / 60)} min in class · <Badge tone={quiz.mode === "quiz" ? "blue" : "slate"}>{quiz.mode}</Badge></p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
