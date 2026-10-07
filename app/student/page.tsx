"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Badge, Button, Modal, Panel, statusTone } from "@/components/ui";
import { classes, myResults, quizzes } from "@/lib/mock";

export default function StudentHome() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [scanning, setScanning] = useState(false);
  const mine = classes.slice(0, 2);
  const upcoming = quizzes.filter((q) => q.status !== "closed" && mine.some((c) => c.id === q.class_id));

  const join = (e: React.FormEvent) => {
    e.preventDefault();
    const c = classes.find((x) => x.join_code === code.trim().toUpperCase());
    if (!c) return setErr("That code doesn't match any class. Check the code on the classroom screen.");
    router.push(`/join/${c.join_token}`);
  };

  return (
    <AppShell role="student">
      <PageTitle title="Hi, Atharv" sub="Join a class or jump into a live quiz." />

      <div className="mb-6 rounded-2xl bg-ansD p-5 text-white sm:flex sm:items-center sm:justify-between">
        <div><p className="text-sm text-white/80">Live now in Deep Learning – LY A</p><p className="font-display text-2xl font-bold">CNN basics – Unit 2</p></div>
        <Link href="/play/101"><button className="mt-3 rounded-xl bg-white px-6 py-3 font-semibold text-ansD sm:mt-0">Join quiz</button></Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Join a class">
          <form onSubmit={join} className="flex flex-col gap-3">
            <label htmlFor="code" className="text-sm font-semibold">Class code</label>
            <input id="code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setErr(""); }} maxLength={6} placeholder="DL7K2Q"
              className="rounded-xl border-2 border-line px-4 py-3 text-center font-display text-3xl font-bold tracking-[0.3em] uppercase" />
            {err && <p className="text-sm text-ansA">{err}</p>}
            <Button type="submit" disabled={code.length !== 6}>Join class</Button>
            <Button type="button" variant="outline" onClick={() => setScanning(true)}>Scan QR code</Button>
          </form>
        </Panel>

        <Panel title="My classes">
          <ul className="divide-y divide-line">
            {mine.map((c) => (
              <li key={c.id} className="py-3">
                <p className="font-semibold">{c.name}</p>
                <p className="text-sm text-slate-500">{c.subject_code} · {c.teacher_name}</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {upcoming.filter((q) => q.class_id === c.id).map((q) => (
                    <li key={q.id} className="flex items-center gap-2 text-sm"><Badge tone={statusTone(q.status)}>{q.status}</Badge>{q.title}{q.scheduled_at && <span className="text-slate-500">· {new Date(q.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Recent results" className="mt-6" action={<Link href="/student/results" className="text-sm font-semibold text-brand">See all</Link>}>
        <ul className="divide-y divide-line">
          {myResults.map((r) => (
            <li key={r.quiz_id} className="flex items-center justify-between py-3">
              <div><p className="font-semibold">{r.quiz_title}</p><p className="text-sm text-slate-500">{r.class_name}</p></div>
              <div className="text-right"><p className="font-display text-xl font-bold">#{r.rank}<span className="text-sm font-normal text-slate-500"> of {r.participants}</span></p><p className="text-sm text-slate-500">{r.correct}/{r.total} correct</p></div>
            </li>
          ))}
        </ul>
      </Panel>

      <Modal open={scanning} title="Scan class QR" onClose={() => setScanning(false)}>
        <div className="grid aspect-square place-items-center rounded-xl bg-ink text-center text-white/70">
          <div><div className="mx-auto mb-3 h-40 w-40 rounded-2xl border-4 border-dashed border-white/40" />Camera preview goes here<br /><span className="text-xs">(html5-qrcode → navigate to /join/&lt;token&gt;)</span></div>
        </div>
        <Button className="mt-4 w-full" variant="outline" onClick={() => { setScanning(false); router.push(`/join/${classes[0].join_token}`); }}>Simulate a successful scan</Button>
      </Modal>
    </AppShell>
  );
}
