"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import JoinQR from "@/components/JoinQR";
import { Badge, Button, Input, Modal, Panel, Select, Textarea, Toggle, statusTone } from "@/components/ui";
import { classes, quizzes, users, yearLabel } from "@/lib/mock";

const TABS = ["Quizzes & polls", "Students", "Join & settings"] as const;

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const c = classes.find((x) => x.id === Number(id)) ?? classes[0];
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const [creating, setCreating] = useState(false);
  const [allow, setAllow] = useState(c.allow_join);
  const [search, setSearch] = useState("");
  const qs = quizzes.filter((q) => q.class_id === c.id);
  const students = users.filter((u) => u.role === "student" && (!search || `${u.full_name} ${u.roll_no} ${u.prn}`.toLowerCase().includes(search.toLowerCase())));

  return (
    <AppShell role="teacher">
      <Link href="/teacher" className="text-sm font-semibold text-brand">‹ My classes</Link>
      <PageTitle title={c.name} sub={`${c.subject_code} · ${c.department} · ${yearLabel(c.year)}, Div ${c.division} · Sem ${c.semester} · ${c.academic_year}`}
        action={<Button onClick={() => setCreating(true)}>New quiz or poll</Button>} />

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t ? "border-brand text-brand" : "border-transparent text-slate-600"}`}>{t}</button>
        ))}
      </div>

      {tab === "Quizzes & polls" && (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          {qs.length === 0 && <p className="p-8 text-center text-slate-500">No quizzes yet. Build one before class, then launch it live.</p>}
          <ul className="divide-y divide-line">
            {qs.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><p className="font-semibold">{q.title}</p><Badge tone={statusTone(q.status)}>{q.status}</Badge><Badge>{q.mode}</Badge></div>
                  <p className="text-sm text-slate-500">{q.questions.length} questions{q.scheduled_at && ` · scheduled ${new Date(q.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}`}</p>
                </div>
                <div className="flex gap-2">
                  {q.status === "closed" ? (
                    <Link href={`/teacher/quizzes/${q.id}/report`}><Button variant="outline">View report</Button></Link>
                  ) : (
                    <>
                      <Link href={`/teacher/quizzes/${q.id}/edit`}><Button variant="outline">Edit</Button></Link>
                      <Link href={`/teacher/quizzes/${q.id}/live`}><Button>Launch live</Button></Link>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === "Students" && (
        <Panel title={`Students (${c.student_count})`} action={<Button variant="outline">Export CSV</Button>}>
          <div className="mb-4 max-w-sm"><Input label="Search students" placeholder="Name, roll no or PRN" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="border-b border-line text-slate-500"><tr><th className="py-2 font-semibold">Roll</th><th className="font-semibold">Name</th><th className="font-semibold">PRN</th><th className="font-semibold">Email</th><th className="font-semibold">Quizzes taken</th><th /></tr></thead>
              <tbody className="divide-y divide-line">
                {students.map((s, i) => (
                  <tr key={s.id}><td className="py-3">{s.roll_no}</td><td className="font-semibold">{s.full_name}</td><td>{s.prn}</td><td className="text-slate-500">{s.email}</td><td>{4 - (i % 3)}</td>
                    <td className="text-right"><Button variant="ghost">Remove</Button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === "Join & settings" && (
        <div className="grid gap-6 md:grid-cols-[auto_1fr]">
          <Panel title="Join this class"><JoinQR c={c} size={220} /></Panel>
          <Panel title="Class settings">
            <Toggle label="Allow students to join" hint="Students who scan the QR or enter the code are added immediately." checked={allow} onChange={setAllow} />
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline">Generate new code</Button>
              <Button variant="outline">Edit class details</Button>
              <Button variant="danger">Archive class</Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">A new code makes the old QR stop working. Students already in the class stay.</p>
          </Panel>
        </div>
      )}

      <NewQuizModal open={creating} onClose={() => setCreating(false)} onCreate={() => router.push(`/teacher/quizzes/101/edit`)} />
    </AppShell>
  );
}

function NewQuizModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: () => void }) {
  const [mode, setMode] = useState("quiz");
  const [when, setWhen] = useState("later");
  return (
    <Modal open={open} title="New quiz or poll" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onCreate(); /* POST /classes/{id}/quizzes */ }}>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: "quiz", t: "Quiz", d: "Right answers, points, leaderboard" }, { v: "poll", t: "Poll", d: "Opinions and feedback, no scoring" }].map((o) => (
            <button type="button" key={o.v} onClick={() => setMode(o.v)} aria-pressed={mode === o.v}
              className={`rounded-xl border-2 p-3 text-left ${mode === o.v ? "border-brand bg-brandsoft" : "border-line"}`}>
              <p className="font-semibold">{o.t}</p><p className="text-xs text-slate-600">{o.d}</p>
            </button>
          ))}
        </div>
        <Input label="Title" required placeholder="CNN basics – Unit 2" />
        <Textarea label="Description (optional)" placeholder="Shown to students in the waiting room" />
        <Select label="When will you run it?" value={when} onChange={(e) => setWhen(e.target.value)} options={[{ value: "later", label: "Save as draft, launch manually" }, { value: "scheduled", label: "Schedule for a date and time" }]} />
        {when === "scheduled" && <Input label="Start at" type="datetime-local" required />}
        <Button type="submit">Create and add questions</Button>
      </form>
    </Modal>
  );
}
