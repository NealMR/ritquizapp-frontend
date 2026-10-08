"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import ClassOverview from "@/components/ClassOverview";
import JoinQR from "@/components/JoinQR";
import { Badge, Button, Input, Modal, Panel, Select, Textarea, Toggle, statusTone } from "@/components/ui";
import { YEARS, yearLabel } from "@/lib/mock";
import { useData } from "@/lib/data";
import { api } from "@/lib/api";
import type { ClassRoom, Quiz, QuizMode, Student } from "@/lib/types";

const TABS = ["Overview", "Quizzes & polls", "Students", "Join & settings"] as const;

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const classId = Number(id);
  const router = useRouter();
  const { refresh } = useData();
  const [c, setC] = useState<ClassRoom | null>(null);
  const [qs, setQs] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    Promise.all([api.getClass(classId), api.getQuizzes(classId)])
      .then(([cls, quizzes]) => { setC(cls); setQs(quizzes); })
      .catch((e) => setMsg(e.message));
  }, [classId]);
  const loadStudents = useCallback(() => { api.getClassStudents(classId).then(setStudents).catch((e) => setMsg(e.message)); }, [classId]);

  useEffect(load, [load]);
  useEffect(() => { if (tab === "Students") loadStudents(); }, [tab, loadStudents]);

  const act = (fn: () => Promise<unknown>) => fn().catch((e) => setMsg(e.message));

  if (!c) return <AppShell role="teacher"><p className="text-slate-500">{msg || "Loading…"}</p></AppShell>;

  const shown = students.filter((u) => !search || `${u.full_name} ${u.roll_no} ${u.prn}`.toLowerCase().includes(search.toLowerCase()));
  const filteredQuizzes = qs.filter((q) =>
    !quizSearch.trim() ||
    q.title.toLowerCase().includes(quizSearch.toLowerCase().trim()) ||
    q.mode.toLowerCase().includes(quizSearch.toLowerCase().trim()) ||
    q.status.toLowerCase().includes(quizSearch.toLowerCase().trim())
  );
  const update = (p: Partial<ClassRoom>) => act(async () => { setC(await api.updateClass(c.id, p)); refresh(); });

  return (
    <AppShell role="teacher">
      <Link href="/teacher" className="text-sm font-semibold text-brand">‹ My classes</Link>
      <PageTitle title={c.name} sub={`${c.subject_code} · ${c.department} · ${yearLabel(c.year)}, Div ${c.division} · Sem ${c.semester} · ${c.academic_year}`}
        action={<Button onClick={() => setCreating(true)}>New quiz or poll</Button>} />

      {msg && <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">{msg} <button className="ml-2 font-semibold underline" onClick={() => setMsg("")}>Dismiss</button></p>}

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t ? "border-brand text-brand" : "border-transparent text-slate-600"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && <ClassOverview classId={c.id} onExport={() => act(() => api.exportClassResults(c))} />}

      {tab === "Quizzes & polls" && (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-3">
            <div className="flex items-center gap-2">
              {qs.length > 0 && (
                <div className="relative w-56 sm:w-72">
                  <input
                    type="text"
                    value={quizSearch}
                    onChange={(e) => setQuizSearch(e.target.value)}
                    placeholder="Search quizzes & polls..."
                    className="w-full rounded-xl border border-line bg-slate-50/80 px-3 py-1.5 pl-8 text-xs text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
                  />
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    🔍
                  </span>
                  {quizSearch && (
                    <button
                      type="button"
                      onClick={() => setQuizSearch("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                      aria-label="Clear quiz search"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
              {quizSearch.trim() && (
                <span className="text-xs text-slate-500">
                  Found <strong className="text-ink">{filteredQuizzes.length}</strong> of {qs.length}
                </span>
              )}
            </div>
            <Button variant="outline" onClick={() => act(() => api.exportClassResults(c))}>Export all results (CSV)</Button>
          </div>
          {qs.length === 0 && <p className="p-8 text-center text-slate-500">No quizzes yet. Build one before class, then launch it live.</p>}
          {qs.length > 0 && filteredQuizzes.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <p>No quizzes match &ldquo;{quizSearch}&rdquo;.</p>
              <Button variant="outline" className="mt-3 text-xs" onClick={() => setQuizSearch("")}>Clear search</Button>
            </div>
          )}
          <ul className="divide-y divide-line">
            {filteredQuizzes.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="font-semibold">{q.title}</p><Badge tone={statusTone(q.status)}>{q.status}</Badge><Badge>{q.mode}</Badge></div>
                  <p className="text-sm text-slate-500">{q.questions.length} questions{q.scheduled_at && ` · scheduled ${new Date(q.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`}</p>
                </div>
                <div className="flex gap-2">
                  {q.status === "closed" ? (
                    <Link href={`/teacher/quizzes/${q.id}/report`}><Button variant="outline">View report</Button></Link>
                  ) : q.status === "live" ? (
                    <Link href={`/teacher/quizzes/${q.id}/live`}><Button>Open host screen</Button></Link>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => confirm(`Delete "${q.title}"?`) && act(async () => { await api.deleteQuiz(q.id); setQs(qs.filter((x) => x.id !== q.id)); refresh(); })}>Delete</Button>
                      <Link href={`/teacher/quizzes/${q.id}/edit`}><Button variant="outline">Edit</Button></Link>
                      <Link href={`/teacher/quizzes/${q.id}/live`}><Button disabled={q.questions.length === 0}>Launch live</Button></Link>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "Students" && (
        <Panel title={`Students (${students.length})`} action={<Button variant="outline" onClick={() => act(() => api.exportStudents(c))}>Export CSV</Button>}>
          <div className="mb-4 max-w-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students (Name, roll no or PRN)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-line bg-slate-50/80 px-3.5 py-2 pl-9 text-xs text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                  aria-label="Clear student search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-line text-slate-500"><tr><th className="py-2 font-semibold">Roll</th><th className="font-semibold">Name</th><th className="font-semibold">PRN</th><th className="font-semibold">Email</th><th className="font-semibold">Quizzes taken</th><th /></tr></thead>
              <tbody className="divide-y divide-line">
                {shown.map((s) => (
                  <tr key={s.id}><td className="py-3">{s.roll_no}</td><td className="font-semibold">{s.full_name}</td><td>{s.prn}</td><td className="text-slate-500">{s.email}</td><td>{s.quizzes_taken}</td>
                    <td className="text-right"><Button variant="ghost" onClick={() => confirm(`Remove ${s.full_name} from this class?`) && act(async () => { await api.removeStudent(c.id, s.id); loadStudents(); })}>Remove</Button></td></tr>
                ))}
                {shown.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">{students.length ? "No students match." : "No students yet. Share the QR or join code."}</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "Join & settings" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
          <Panel title="Join this class"><JoinQR c={c} size={220} /></Panel>
          <Panel title="Class settings">
            <Toggle label="Allow students to join" hint="Students who scan the QR or enter the code are added immediately." checked={c.allow_join} onChange={(v) => update({ allow_join: v })} />
            {c.join_expires_at && <p className="text-sm text-slate-600">Joining closes {new Date(c.join_expires_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => confirm("Make a new code? The old QR and code stop working.") && act(async () => setC(await api.regenerateCode(c.id)))}>Generate new code</Button>
              <Button variant="outline" onClick={() => setEditing(true)}>Edit class details</Button>
              <Button variant="danger" onClick={() => confirm(`Archive ${c.name}? It disappears for you and your students.`) && act(async () => { await api.archiveClass(c.id); await refresh(); router.push("/teacher"); })}>Archive class</Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">A new code makes the old QR stop working. Students already in the class stay.</p>
          </Panel>
        </div>
      )}

      <NewQuizModal classId={c.id} open={creating} onClose={() => setCreating(false)} onCreate={(q) => { refresh(); router.push(`/teacher/quizzes/${q.id}/edit`); }} />
      <EditClassModal c={c} open={editing} onClose={() => setEditing(false)} onSave={(p) => { update(p); setEditing(false); }} />
    </AppShell>
  );
}

function NewQuizModal({ classId, open, onClose, onCreate }: { classId: number; open: boolean; onClose: () => void; onCreate: (q: Quiz) => void }) {
  const [mode, setMode] = useState<QuizMode>("quiz");
  const [when, setWhen] = useState("later");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [err, setErr] = useState("");

  return (
    <Modal open={open} title="New quiz or poll" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        try {
          const settings = await api.getSettings().catch(() => null);
          onCreate(await api.createQuiz({
            class_id: classId, title, mode, description: description || undefined,
            scheduled_at: when === "scheduled" && startAt ? new Date(startAt).toISOString() : undefined,
            speed_bonus: settings?.speed_bonus ?? true,
          }));
        } catch (e: any) { setErr(e.message); }
      }}>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: "quiz", t: "Quiz", d: "Right answers, points, leaderboard" }, { v: "poll", t: "Poll", d: "Opinions and feedback, no scoring" }].map((o) => (
            <button type="button" key={o.v} onClick={() => setMode(o.v as QuizMode)} aria-pressed={mode === o.v}
              className={`rounded-xl border-2 p-3 text-left ${mode === o.v ? "border-brand bg-brandsoft" : "border-line"}`}>
              <p className="font-semibold">{o.t}</p><p className="text-xs text-slate-600">{o.d}</p>
            </button>
          ))}
        </div>
        <Input label="Title" required placeholder="CNN basics – Unit 2" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea label="Description (optional)" placeholder="Shown to students in the waiting room" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Select label="When will you run it?" value={when} onChange={(e) => setWhen(e.target.value)} options={[{ value: "later", label: "Save as draft, launch manually" }, { value: "scheduled", label: "Schedule for a date and time" }]} />
        {when === "scheduled" && <Input label="Start at" type="datetime-local" required value={startAt} onChange={(e) => setStartAt(e.target.value)} />}
        {err && <p className="text-sm text-ansA">{err}</p>}
        <Button type="submit">Create and add questions</Button>
      </form>
    </Modal>
  );
}

const toLocalInput = (iso?: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

function EditClassModal({ c, open, onClose, onSave }: { c: ClassRoom; open: boolean; onClose: () => void; onSave: (p: Partial<ClassRoom>) => void }) {
  const [f, setF] = useState({ name: c.name, subject_name: c.subject_name, subject_code: c.subject_code, year: c.year as string, division: c.division, semester: String(c.semester), academic_year: c.academic_year, expires: toLocalInput(c.join_expires_at) });
  useEffect(() => { if (open) setF({ name: c.name, subject_name: c.subject_name, subject_code: c.subject_code, year: c.year, division: c.division, semester: String(c.semester), academic_year: c.academic_year, expires: toLocalInput(c.join_expires_at) }); }, [open, c]);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={open} title="Edit class details" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault();
        const { expires, semester, year, ...rest } = f;
        onSave({ ...rest, year: year as ClassRoom["year"], semester: Number(semester), join_expires_at: expires ? new Date(expires).toISOString() : null });
      }}>
        <Input label="Class display name" value={f.name} onChange={set("name")} required />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
          <Input label="Subject name" value={f.subject_name} onChange={set("subject_name")} required />
          <Input label="Subject code" value={f.subject_code} onChange={set("subject_code")} required />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select label="Year" value={f.year} onChange={set("year")} options={YEARS} required />
          <Input label="Division" value={f.division} onChange={set("division")} required />
          <Select label="Semester" value={f.semester} onChange={set("semester")} options={["1", "2", "3", "4", "5", "6", "7", "8"]} required />
        </div>
        <Select label="Academic year" value={f.academic_year} onChange={set("academic_year")} options={["2025-26", "2026-27", "2027-28"]} />
        <Input label="Stop accepting joins after (optional)" type="datetime-local" value={f.expires} onChange={set("expires")} />
        <Button type="submit">Save changes</Button>
      </form>
    </Modal>
  );
}
