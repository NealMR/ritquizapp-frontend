"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import JoinQR from "@/components/JoinQR";
import { Badge, Button, Input, Modal, Select, Toggle } from "@/components/ui";
import { DEPARTMENTS, YEARS, yearLabel } from "@/lib/mock";
import type { ClassRoom, Year, Quiz } from "@/lib/types";
import { api } from "@/lib/api";
import { useData } from "@/lib/data";
import { motion } from "framer-motion";

export default function TeacherHome() {
  const [list, setList] = useState<ClassRoom[]>([]);
  const [quizzesList, setQuizzesList] = useState<Quiz[]>([]);
  const [creating, setCreating] = useState(false);
  const [qrFor, setQrFor] = useState<ClassRoom | null>(null);
  const { refresh } = useData();

  useEffect(() => {
    api.getClasses().then(setList).catch(console.error);
    api.getQuizzes().then(setQuizzesList).catch(console.error);
  }, []);

  const live = quizzesList.find((q) => q.status === "live");

  return (
    <AppShell role="teacher">
      <PageTitle title="My classes" sub="Create a class, share the QR, then run quizzes and polls." action={<Button onClick={() => setCreating(true)}>Create class</Button>} />

      {live && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl bg-gradient-brand p-6 text-white shadow-lg flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Live right now</p>
            <p className="mt-1 font-display text-2xl font-bold">“{live.title}”</p>
          </div>
          <Link href={`/teacher/quizzes/${live.id}/live`}>
            <button className="w-full rounded-xl bg-white px-6 py-3 font-bold text-brand shadow-soft hover:shadow-float active:scale-[0.98] transition-all sm:w-auto">Open host screen</button>
          </Link>
        </motion.div>
      )}

      {list.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border-2 border-dashed border-line p-12 text-center bg-white/50">
          <p className="font-display text-xl font-bold">No classes yet</p>
          <p className="mt-2 mb-6 text-slate-500 font-medium">Create your first class to get a QR code students can scan.</p>
          <Button onClick={() => setCreating(true)}>Create class</Button>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => {
            const qs = quizzesList.filter((q) => q.class_id === c.id);
            return (
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                key={c.id}
                className="flex flex-col rounded-2xl border border-line bg-white shadow-soft hover:shadow-float transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="border-b border-line/60 p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-bold tracking-tight text-brand">{c.subject_code}</span>
                    {c.allow_join ? <Badge tone="green">Joining open</Badge> : <Badge>Joining closed</Badge>}
                  </div>
                  <h2 className="font-display text-xl font-bold leading-tight group-hover:text-brand transition-colors">{c.name}</h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">{yearLabel(c.year)} · Div {c.division} · Sem {c.semester}</p>
                </div>
                <dl className="grid grid-cols-2 gap-4 p-6 text-sm">
                  <div><dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Students</dt><dd className="font-display text-3xl font-extrabold text-ink">{c.student_count || 0}</dd></div>
                  <div><dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quizzes</dt><dd className="font-display text-3xl font-extrabold text-ink">{qs.length}</dd></div>
                </dl>
                <div className="mt-auto flex gap-3 p-6 pt-0">
                  <Link href={`/teacher/classes/${c.id}`} className="flex-1"><Button className="w-full">Open Dashboard</Button></Link>
                  <Button variant="outline" onClick={() => setQrFor(c)} className="px-4">Show QR</Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      <CreateClassModal open={creating} onClose={() => setCreating(false)} onCreate={(c) => { setList([c, ...list]); setCreating(false); setQrFor(c); refresh(); }} />
      <Modal open={!!qrFor} title={qrFor ? `Join ${qrFor.name}` : ""} onClose={() => setQrFor(null)}>
        {qrFor && <><JoinQR c={qrFor} size={240} /><p className="mt-4 text-center text-sm text-slate-500">Project this on the classroom screen. Students scan it with their phone camera or type the code on their RIT Quiz home.</p></>}
      </Modal>
    </AppShell>
  );
}

function CreateClassModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (c: ClassRoom) => void }) {
  const [f, setF] = useState({ subject_name: "", subject_code: "", department: "", year: "", division: "", semester: "", academic_year: "2026-27", name: "", expires: "" });
  const [allow, setAllow] = useState(true);
  const [err, setErr] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const autoName = f.subject_name && f.year && f.division ? `${f.subject_name} – ${f.year} ${f.division}` : "";

  return (
    <Modal open={open} title="Create class" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        try {
          const c = await api.createClass({ name: f.name || autoName, subject_name: f.subject_name, subject_code: f.subject_code, department: f.department, year: f.year as Year, division: f.division, semester: Number(f.semester), academic_year: f.academic_year, allow_join: allow, join_expires_at: f.expires ? new Date(f.expires).toISOString() : undefined });
          onCreate(c);
        } catch (e: any) {
          setErr(e.message);
        }
      }}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem]">
          <Input label="Subject name" value={f.subject_name} onChange={set("subject_name")} required placeholder="Deep Learning" />
          <Input label="Subject code" value={f.subject_code} onChange={set("subject_code")} required placeholder="AI401" />
        </div>
        <Select label="Department" value={f.department} onChange={set("department")} options={DEPARTMENTS} placeholder="Select" required />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select label="Year" value={f.year} onChange={set("year")} options={YEARS} placeholder="Select" required />
          <Input label="Division" value={f.division} onChange={set("division")} placeholder="e.g. A" required />
          <Select label="Semester" value={f.semester} onChange={set("semester")} options={["1", "2", "3", "4", "5", "6", "7", "8"]} placeholder="Select" required />
        </div>
        <Select label="Academic year" value={f.academic_year} onChange={set("academic_year")} options={["2025-26", "2026-27", "2027-28"]} />
        <Input label="Class display name" value={f.name} onChange={set("name")} placeholder={autoName || "Auto-filled from subject, year and division"} hint="Leave blank to use the suggested name." />
        <Toggle label="Allow students to join" hint="Turn off once everyone has joined." checked={allow} onChange={setAllow} />
        <Input label="Stop accepting joins after (optional)" type="datetime-local" value={f.expires} onChange={set("expires")} />
        {err && <p className="text-sm text-ansA">{err}</p>}
        <Button type="submit">Create class and show QR</Button>
      </form>
    </Modal>
  );
}
