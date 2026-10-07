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
  join_expires_at?: string;
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
  quiz_id: number;
  quiz_title: string;
  class_name: string;
  score: number;
  max_score: number;
  correct: number;
  total: number;
  rank: number;
  participants: number;
  played_at: string;
}
