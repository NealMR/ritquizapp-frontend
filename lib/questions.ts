import type { Question, QuestionType } from "./types";

export const QTYPES: { value: QuestionType; label: string; scored: boolean }[] = [
  { value: "mcq", label: "Multiple choice (one answer)", scored: true },
  { value: "multi_select", label: "Multiple choice (many answers)", scored: true },
  { value: "true_false", label: "True / false", scored: true },
  { value: "rating", label: "Rating scale", scored: false },
  { value: "word_cloud", label: "Word cloud", scored: false },
  { value: "open_text", label: "Open text answer", scored: false },
];
/** Answer letters and their colours, shared by the projector and phone screens. */
export const LETTERS = ["A", "B", "C", "D", "E", "F"];
export const OPTION_BG = ["bg-ansA", "bg-ansB", "bg-ansC", "bg-ansD", "bg-violet-500", "bg-pink-500"];

export const typeLabel = (t: QuestionType) => QTYPES.find((x) => x.value === t)?.label ?? t;
export const isScored = (t: QuestionType) => QTYPES.find((x) => x.value === t)?.scored ?? false;


export function blankQuestion(order: number, type: QuestionType = "mcq", defaults?: { default_time: number; default_points: number } | null): Question {
  const base = { id: Date.now(), order, type, text: "", options: [] as string[], correct_options: [] as number[], time_limit_sec: defaults?.default_time ?? 30, points: isScored(type) ? defaults?.default_points ?? 1000 : 0 };
  if (type === "mcq" || type === "multi_select") return { ...base, options: ["", "", "", ""] };
  if (type === "true_false") return { ...base, options: ["True", "False"] };
  if (type === "rating") return { ...base, rating_max: 5 };
  if (type === "word_cloud") return { ...base, max_words: 1 };
  return { ...base, max_chars: 200 };
}
