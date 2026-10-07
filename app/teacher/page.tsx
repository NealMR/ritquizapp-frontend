"use client";
import Link from "next/link";
import { useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import JoinQR from "@/components/JoinQR";
import { Badge, Button, Input, Modal, Select, Toggle } from "@/components/ui";
import { classes as seed, DEPARTMENTS, DIVISIONS, quizzes, YEARS, yearLabel } from "@/lib/mock";
import type { ClassRoom, Year } from "@/lib/types";

const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();

export default function TeacherHome() {
  const [list, setList] = useState<ClassRoom[]>(seed);
  const [creating, setCreating] = useState(false);
  const [qrFor, setQrFor] = useState<ClassRoom | null>(null);
  const live = quizzes.find((q) => q.status === "live");

  return (
    <AppShell role="teacher">
      <PageTitle title="My classes" sub="Create a class, share the QR, then run quizzes and polls." action={<Button onClick={() => setCreating(true)}>Create class</Button>} />

      {live && <div className="mb-6 rounded-xl bg-ansD p-4 text-white">“{live.title}” is live now. <Link href={`/teacher/quizzes/${live.id}/live`} className="font-semibold underline">Open host screen</Link></div>}

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-display text-xl font-semibold">No classes yet</p>
          <p className="mb-4 text-slate-600">Create your first class to get a QR code students can scan.</p>
          <Button onClick={() => setCreating(true)}>Create class</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const qs = quizzes.filter((q) => q.class_id === c.id);
            return (
              <article key={c.id} className="flex flex-col rounded-xl border border-line bg-white">
                <div className="border-b border-line p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-brand">{c.subject_code}</span>
                    {c.allow_join ? <Badge tone="green">Joining open</Badge> : <Badge>Joining closed</Badge>}
                  </div>
                  <h2 className="font-display text-xl font-semibold leading-snug">{c.name}</h2>
                  <p className="mt-1 text-sm text-slate-600">{yearLabel(c.year)} · Div {c.division} · Sem {c.semester}</p>
                </div>
                <dl className="grid grid-cols-2 gap-2 p-5 text-sm">
                  <div><dt className="text-slate-500">Students</dt><dd className="font-display text-2xl font-bold">{c.student_count}</dd></div>
                  <div><dt className="text-slate-500">Quizzes</dt><dd className="font-display text-2xl font-bold">{qs.length}</dd></div>
                </dl>
                <div className="mt-auto flex gap-2 p-5 pt-0">
                  <Link href={`/teacher/classes/${c.id}`} className="flex-1"><Button className="w-full">Open</Button></Link>
                  <Button variant="outline" onClick={() => setQrFor(c)}>Show QR</Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <CreateClassModal open={creating} onClose={() => setCreating(false)} onCreate={(c) => { setList([c, ...list]); setCreating(false); setQrFor(c); }} />
      <Modal open={!!qrFor} title={qrFor ? `Join ${qrFor.name}` : ""} onClose={() => setQrFor(null)}>
        {qrFor && <><JoinQR c={qrFor} size={240} /><p className="mt-4 text-center text-sm text-slate-500">Project this on the classroom screen. Students scan it from the RIT Quiz student home.</p></>}
      </Modal>
    </AppShell>
  );
}

function CreateClassModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (c: ClassRoom) => void }) {
  const [f, setF] = useState({ subject_name: "", subject_code: "", department: "", year: "", division: "", semester: "", academic_year: "2026-27", name: "", expires: "" });
  const [allow, setAllow] = useState(true);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const autoName = f.subject_name && f.year && f.division ? `${f.subject_name} – ${f.year} ${f.division}` : "";

  return (
    <Modal open={open} title="Create class" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => {
        e.preventDefault();
        const c = code();
        // Real app: POST /classes → backend generates join_code + join_token
        onCreate({ id: Date.now(), name: f.name || autoName, subject_name: f.subject_name, subject_code: f.subject_code, department: f.department, year: f.year as Year, division: f.division, semester: Number(f.semester), academic_year: f.academic_year, join_code: c, join_token: `t-${c.toLowerCase()}`, allow_join: allow, join_expires_at: f.expires || undefined, teacher_id: 2, teacher_name: "You", student_count: 0, created_at: new Date().toISOString() });
      }}>
        <div className="grid grid-cols-[1fr_8rem] gap-3">
          <Input label="Subject name" value={f.subject_name} onChange={set("subject_name")} required placeholder="Deep Learning" />
          <Input label="Subject code" value={f.subject_code} onChange={set("subject_code")} required placeholder="AI401" />
        </div>
        <Select label="Department" value={f.department} onChange={set("department")} options={DEPARTMENTS} placeholder="Select" required />
        <div className="grid grid-cols-3 gap-3">
          <Select label="Year" value={f.year} onChange={set("year")} options={YEARS} placeholder="Select" required />
          <Select label="Division" value={f.division} onChange={set("division")} options={DIVISIONS} placeholder="Select" required />
          <Select label="Semester" value={f.semester} onChange={set("semester")} options={["1", "2", "3", "4", "5", "6", "7", "8"]} placeholder="Select" required />
        </div>
        <Select label="Academic year" value={f.academic_year} onChange={set("academic_year")} options={["2025-26", "2026-27", "2027-28"]} />
        <Input label="Class display name" value={f.name} onChange={set("name")} placeholder={autoName || "Auto-filled from subject, year and division"} hint="Leave blank to use the suggested name." />
        <Toggle label="Allow students to join" hint="Turn off once everyone has joined." checked={allow} onChange={setAllow} />
        <Input label="Stop accepting joins after (optional)" type="datetime-local" value={f.expires} onChange={set("expires")} />
        <Button type="submit">Create class and show QR</Button>
      </form>
    </Modal>
  );
}
