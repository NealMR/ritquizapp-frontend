import type { ClassRoom, Quiz, Question, QuizResult, Report, Settings, Student, User, StudentQuizOverview } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = API_URL.replace(/^http/, "ws");
export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("rq_token"));

async function req<T = any>(path: string, opts: { method?: string; body?: unknown; raw?: boolean } = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    method: opts.method ?? "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  if (res.status === 401 && token && !path.startsWith("/auth/")) {
    localStorage.removeItem("rq_token");
    localStorage.removeItem("rq_user");
    window.location.href = "/login";
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : `Request failed (${res.status})`);
  }
  return (opts.raw ? res : res.json()) as Promise<T>;
}

/** Fetch a file with the auth header and hand it to the browser as a download. */
async function download(path: string, filename: string) {
  const blob = await (await req<Response>(path, { raw: true })).blob();
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: filename });
  a.click();
  URL.revokeObjectURL(a.href);
}

export const api = {
  signup: (data: unknown) => req("/auth/signup", { method: "POST", body: data }),
  forgotPassword: (email: string) => req("/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) => req("/auth/reset-password", { method: "POST", body: { token, password } }),
  updateMe: (p: Partial<User>) => req<User>("/users/me", { method: "PUT", body: p }),
  changePassword: (current_password: string, new_password: string) => req("/users/me/password", { method: "POST", body: { current_password, new_password } }),
  resetUserPassword: (id: number) => req<{ temp_password: string }>(`/users/${id}/reset-password`, { method: "POST" }),

  getSettings: () => req<Settings>("/settings"),
  saveSettings: (s: Settings) => req<Settings>("/settings", { method: "PUT", body: s }),

  getUsers: () => req<User[]>("/users"),
  getStats: () => req<{ total_users: number; total_classes: number; total_quizzes: number }>("/users/stats"),
  addUser: (u: Partial<User>) => req<{ user: User; temp_password: string }>("/users", { method: "POST", body: u }),
  updateUser: (id: number, p: Partial<User>) => req<User>(`/users/${id}`, { method: "PATCH", body: p }),
  deleteUser: (id: number) => req(`/users/${id}`, { method: "DELETE" }),
  exportUsers: () => download("/users/export.csv", "all-users.csv"),
  exportResults: () => download("/results/export.csv", "all-results.csv"),

  getClasses: () => req<ClassRoom[]>("/classes"),
  getClass: (id: number) => req<ClassRoom>(`/classes/${id}`),
  createClass: (data: Partial<ClassRoom>) => req<ClassRoom>("/classes", { method: "POST", body: data }),
  updateClass: (id: number, data: Partial<ClassRoom>) => req<ClassRoom>(`/classes/${id}`, { method: "PATCH", body: data }),
  regenerateCode: (id: number) => req<ClassRoom>(`/classes/${id}/regenerate-code`, { method: "POST" }),
  archiveClass: (id: number) => req(`/classes/${id}`, { method: "DELETE" }),
  getClassByToken: (token: string) => req<ClassRoom>(`/classes/by-token/${encodeURIComponent(token.trim())}`),
  joinClass: (token: string) => req<{ class_id: number; message?: string }>(`/classes/${encodeURIComponent(token.trim())}/join`, { method: "POST" }),
  getClassStudents: (id: number) => req<Student[]>(`/classes/${id}/students`),
  removeStudent: (id: number, userId: number) => req(`/classes/${id}/students/${userId}`, { method: "DELETE" }),
  exportStudents: (c: ClassRoom) => download(`/classes/${c.id}/students.csv`, `${c.subject_code}-students.csv`),

  getQuizzes: (classId?: number) => req<Quiz[]>(classId ? `/quizzes?class_id=${classId}` : "/quizzes"),
  getQuiz: (id: number) => req<Quiz>(`/quizzes/${id}`),
  createQuiz: (data: Partial<Quiz>) => req<Quiz>("/quizzes", { method: "POST", body: data }),
  updateQuiz: (id: number, data: Partial<Quiz>) => req<Quiz>(`/quizzes/${id}`, { method: "PUT", body: data }),
  deleteQuiz: (id: number) => req(`/quizzes/${id}`, { method: "DELETE" }),
  updateQuestions: (quizId: number, qs: Partial<Question>[]) =>
    req<Question[]>(`/quizzes/${quizId}/questions`, { method: "PUT", body: qs.map(({ id, ...q }) => ({ ...q, quiz_id: quizId })) }),
  getReport: (id: number) => req<Report>(`/quizzes/${id}/report`),
  exportReport: (id: number) => download(`/quizzes/${id}/report.csv`, `quiz-${id}-report.csv`),

  getMyResults: (classId?: number) => req<QuizResult[]>(classId ? `/results/me?class_id=${classId}` : "/results/me"),
  getQuizOverview: (quizId: number) => req<StudentQuizOverview>(`/quizzes/${quizId}/overview`),
};
