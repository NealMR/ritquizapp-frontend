// Mock data so the UI runs without a backend.
// Replace each export with a real fetch() to the FastAPI backend.
import type { ClassRoom, LeaderboardEntry, Quiz, QuizResult, User } from "./types";

export const DEPARTMENTS = [
  "Computer Science & Engineering",
  "CSE (AI & ML)",
  "Information Technology",
  "Electronics & Telecommunication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
];
export const YEARS = [
  { value: "FY", label: "First Year" },
  { value: "SY", label: "Second Year" },
  { value: "TY", label: "Third Year" },
  { value: "LY", label: "Final Year" },
];
export const DIVISIONS = ["A", "B", "C", "D"];
export const DESIGNATIONS = ["Assistant Professor", "Associate Professor", "Professor", "Head of Department", "Lab Instructor", "Visiting Faculty"];
export const COLLEGE_DOMAIN = "@ritindia.edu";

export const users: User[] = [
  { id: 1, full_name: "Admin Office", email: "admin@ritindia.edu", role: "admin", department: "Administration", is_active: true, is_approved: true, created_at: "2026-07-01" },
  { id: 2, full_name: "Prof. Sneha Patil", email: "sneha.patil@ritindia.edu", role: "teacher", department: "CSE (AI & ML)", employee_id: "RIT-F-1042", designation: "Assistant Professor", phone: "9876500011", is_active: true, is_approved: true, created_at: "2026-07-04" },
  { id: 3, full_name: "Prof. Rahul Jadhav", email: "rahul.jadhav@ritindia.edu", role: "teacher", department: "Information Technology", employee_id: "RIT-F-1107", designation: "Associate Professor", is_active: true, is_approved: false, created_at: "2026-09-28" },
  { id: 4, full_name: "Atharv Thorat", email: "atharv.thorat@ritindia.edu", role: "student", department: "CSE (AI & ML)", prn: "2251010042", roll_no: "42", year: "LY", division: "A", is_active: true, is_approved: true, created_at: "2026-07-10" },
  { id: 5, full_name: "Priya Kulkarni", email: "priya.kulkarni@ritindia.edu", role: "student", department: "CSE (AI & ML)", prn: "2251010017", roll_no: "17", year: "LY", division: "A", is_active: true, is_approved: true, created_at: "2026-07-10" },
  { id: 6, full_name: "Omkar Shinde", email: "omkar.shinde@ritindia.edu", role: "student", department: "CSE (AI & ML)", prn: "2251010055", roll_no: "55", year: "LY", division: "A", is_active: true, is_approved: true, created_at: "2026-07-11" },
  { id: 7, full_name: "Sakshi More", email: "sakshi.more@ritindia.edu", role: "student", department: "CSE (AI & ML)", prn: "2251010061", roll_no: "61", year: "LY", division: "A", is_active: false, is_approved: true, created_at: "2026-07-12" },
];

export const classes: ClassRoom[] = [
  { id: 1, name: "Deep Learning – LY A", subject_name: "Deep Learning", subject_code: "AI401", department: "CSE (AI & ML)", year: "LY", division: "A", semester: 7, academic_year: "2026-27", join_code: "DL7K2Q", join_token: "c1-dl-7k2q", allow_join: true, teacher_id: 2, teacher_name: "Prof. Sneha Patil", student_count: 64, created_at: "2026-07-15" },
  { id: 2, name: "Robotics Lab – LY A", subject_name: "Robotics Lab", subject_code: "AI427", department: "CSE (AI & ML)", year: "LY", division: "A", semester: 7, academic_year: "2026-27", join_code: "RB4M9X", join_token: "c2-rb-4m9x", allow_join: false, teacher_id: 2, teacher_name: "Prof. Sneha Patil", student_count: 31, created_at: "2026-07-16" },
  { id: 3, name: "NLP – TY B", subject_name: "Natural Language Processing", subject_code: "AI305", department: "CSE (AI & ML)", year: "TY", division: "B", semester: 5, academic_year: "2026-27", join_code: "NL2P8Z", join_token: "c3-nl-2p8z", allow_join: true, teacher_id: 2, teacher_name: "Prof. Sneha Patil", student_count: 58, created_at: "2026-07-20" },
];

export const quizzes: Quiz[] = [
  {
    id: 101, class_id: 1, title: "CNN basics – Unit 2", description: "Quick check after the convolution lecture.", mode: "quiz", status: "draft",
    shuffle_questions: false, shuffle_options: true, speed_bonus: true, show_leaderboard_each_question: true, allow_late_join: true, created_at: "2026-09-30",
    questions: [
      { id: 1, order: 1, type: "mcq", text: "What does a pooling layer mainly reduce?", options: ["Number of channels", "Spatial size of feature maps", "Learning rate", "Batch size"], correct_options: [1], time_limit_sec: 20, points: 1000, explanation: "Pooling downsamples height and width." },
      { id: 2, order: 2, type: "multi_select", text: "Which of these are activation functions?", options: ["ReLU", "Adam", "Sigmoid", "Dropout"], correct_options: [0, 2], time_limit_sec: 30, points: 1000 },
      { id: 3, order: 3, type: "true_false", text: "A 3×3 kernel with stride 1 and padding 1 keeps the output size the same.", options: ["True", "False"], correct_options: [0], time_limit_sec: 15, points: 500 },
      { id: 4, order: 4, type: "rating", text: "How confident are you with backpropagation?", options: [], correct_options: [], time_limit_sec: 20, points: 0, rating_max: 5 },
      { id: 5, order: 5, type: "word_cloud", text: "One word that describes today's lecture", options: [], correct_options: [], time_limit_sec: 30, points: 0, max_words: 1 },
      { id: 6, order: 6, type: "open_text", text: "Which topic should we revise next class?", options: [], correct_options: [], time_limit_sec: 45, points: 0, max_chars: 200 },
    ],
  },
  { id: 102, class_id: 1, title: "Optimisers recap", mode: "quiz", status: "closed", shuffle_questions: true, shuffle_options: true, speed_bonus: true, show_leaderboard_each_question: true, allow_late_join: false, created_at: "2026-09-22", questions: [] },
  { id: 103, class_id: 1, title: "Mid-sem feedback poll", mode: "poll", status: "scheduled", scheduled_at: "2026-10-08T10:15", shuffle_questions: false, shuffle_options: false, speed_bonus: false, show_leaderboard_each_question: false, allow_late_join: true, created_at: "2026-10-01", questions: [] },
];

export const leaderboard: LeaderboardEntry[] = [
  { student_id: 5, full_name: "Priya Kulkarni", roll_no: "17", score: 4720, correct: 5, avg_time_ms: 6200, rank: 1 },
  { student_id: 4, full_name: "Atharv Thorat", roll_no: "42", score: 4385, correct: 5, avg_time_ms: 7900, rank: 2 },
  { student_id: 6, full_name: "Omkar Shinde", roll_no: "55", score: 3610, correct: 4, avg_time_ms: 8800, rank: 3 },
  { student_id: 8, full_name: "Tanvi Deshmukh", roll_no: "23", score: 2950, correct: 3, avg_time_ms: 9400, rank: 4 },
  { student_id: 9, full_name: "Yash Pawar", roll_no: "48", score: 2105, correct: 2, avg_time_ms: 12100, rank: 5 },
];

export const myResults: QuizResult[] = [
  { quiz_id: 102, quiz_title: "Optimisers recap", class_name: "Deep Learning – LY A", score: 4385, max_score: 5000, correct: 5, total: 5, rank: 2, participants: 58, played_at: "2026-09-22" },
  { quiz_id: 98, quiz_title: "Kinematics warm-up", class_name: "Robotics Lab – LY A", score: 2800, max_score: 4000, correct: 3, total: 4, rank: 6, participants: 29, played_at: "2026-09-15" },
];

export const yearLabel = (y?: string) => YEARS.find((x) => x.value === y)?.label ?? "";
