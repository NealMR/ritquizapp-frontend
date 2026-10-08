// Data shapes the UI expects. The backend developer should return these
// fields (snake_case) from the API. See FIELDS.md for the full spec.

export type Role = "admin" | "teacher" | "student";
export type Year = "FY" | "SY" | "TY" | "LY";
export type QuestionType = "mcq" | "multi_select" | "true_false" | "open_text" | "rating" | "word_cloud";
export type QuizStatus = "draft" | "scheduled" | "live" | "closed";
export type QuizMode = "quiz" | "poll";

export interface User {
  id: number;
  full_name: string;
  email: string;            // must end with @ritindia.edu
  role: Role;
  phone?: string;
  department: string;
  is_active: boolean;
  is_approved: boolean;     // teachers need admin approval
  created_at: string;
  // student only
  prn?: string;
  roll_no?: string;
  year?: Year;
  division?: string;
  // teacher only
  employee_id?: string;
  designation?: string;
}

export interface ClassRoom {
  id: number;
  name: string;
  subject_name: string;
  subject_code: string;
  department: string;
  year: Year;
  division: string;
  semester: number;
  academic_year: string;    // e.g. "2026-27"
  join_code: string;        // 6 chars, typed by students
  join_token: string;       // encoded in the QR
  allow_join: boolean;
  join_expires_at?: string | null;
  teacher_id: number;
  teacher_name: string;
  student_count: number;
  created_at: string;
}

export interface Question {
  id: number;
  order: number;
  type: QuestionType;
  text: string;
  image_url?: string;
  options: string[];               // mcq, multi_select, true_false
  correct_options: number[];       // indexes into options; empty for polls
  time_limit_sec: number;
  points: number;
  explanation?: string;
  rating_max?: number;             // rating
  max_chars?: number;              // open_text
  max_words?: number;              // word_cloud
}

export interface Quiz {
  id: number;
  class_id: number;
  title: string;
  description?: string;
  mode: QuizMode;
  status: QuizStatus;
  scheduled_at?: string;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  speed_bonus: boolean;
  show_leaderboard_each_question: boolean;
  allow_late_join: boolean;
  questions: Question[];
  created_at: string;
}

export interface LeaderboardEntry {
  student_id: number;
  full_name: string;
  roll_no: string;
  score: number;
  correct: number;
  avg_time_ms: number;
  rank: number;
}

export interface QuizResult {
  id: number;
  quiz_id: number;
  quiz_title: string;
  class_name: string;
  score: number;
  max_score: number;
  correct: number;
  total: number;
  rank: number | null;
  participants: number;
  played_at: string;
}

export interface StudentQuizOverviewQuestion {
  id: number;
  order: number;
  type: QuestionType;
  text: string;
  options: string[];
  correct_options: number[];
  explanation?: string;
  points: number;
  student_answer?: any;
  is_correct: boolean;
  points_awarded: number;
  response_time_ms?: number | null;
}

export interface StudentQuizOverview {
  quiz_id: number;
  quiz_title: string;
  description?: string;
  class_name: string;
  subject_code: string;
  mode: QuizMode;
  status: QuizStatus;
  played_at: string | null;
  score: number;
  max_score: number;
  correct: number;
  total: number;
  rank: number | null;
  participants: number;
  questions: StudentQuizOverviewQuestion[];
  leaderboard: { student_id: number; full_name: string; roll_no: string; score: number; rank: number | null }[];
}

export interface Student extends User {
  quizzes_taken: number;
}

export interface Settings {
  domain: string;
  institute: string;
  academic_year: string;
  student_self_signup: boolean;
  teacher_approval: boolean;
  max_class_size: number;
  join_code_expiry_hours: number;
  default_time: number;
  default_points: number;
  speed_bonus: boolean;
  data_retention_days: number;
}

export interface ReportQuestion {
  id: number;
  order: number;
  type: QuestionType;
  text: string;
  options: string[];
  correct_options: number[];
  responses: number;
  distribution?: number[];
  accuracy?: number;
  rating_avg?: number | null;
  words?: [string, number][];
  texts?: string[];
}

export interface Report {
  quiz_id: number;
  title: string;
  mode: QuizMode;
  status: QuizStatus;
  played_at: string | null;
  participants: number;
  class_size: number;
  avg_accuracy: number | null;
  avg_time_ms: number | null;
  hardest_question: number | null;
  questions: ReportQuestion[];
  students: LeaderboardEntry[];
}

/** Snapshot the live-quiz server sends on every event (see backend/api/routers/ws.py). */
export interface LiveState {
  quiz_id: number;
  title: string;
  description?: string;
  mode: QuizMode;
  phase: "lobby" | "question" | "reveal" | "leaderboard" | "final";
  index: number;
  total: number;
  question: Omit<Question, "correct_options" | "explanation"> | null;
  time_left_ms: number;
  paused: boolean;
  answered: number;
  joined: { id: number; name: string; roll: string }[];
  participants: number;
  reveal: {
    correct_options: number[];
    explanation?: string;
    distribution?: number[];
    rating_avg?: number | null;
    words?: [string, number][];
    texts?: string[];
  } | null;
  leaderboard: LeaderboardEntry[] | null;
  me?: { score: number; rank: number | null; answered: boolean; result: { is_correct: boolean | null; points: number } | null };
}

export interface ClassOverview {
  students: number;
  quizzes: { draft: number; scheduled: number; live: number; closed: number };
  live_quiz: { id: number; title: string } | null;
  avg_accuracy: number | null;
  avg_participation: number | null;
  last_activity: string | null;
  recent_quizzes: { quiz_id: number; title: string; mode: string; played_at: string | null; participants: number; accuracy: number | null }[];
  top_students: { id: number; full_name: string; roll_no: string; score: number; quizzes: number; accuracy: number | null }[];
  struggling: { id: number; full_name: string; roll_no: string; accuracy: number; quizzes: number }[];
  not_participated: { id: number; full_name: string; roll_no: string }[];
  recent_joins: { id: number; full_name: string; roll_no: string; at: string }[];
  deletes_on: string | null;
}
