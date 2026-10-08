"use client";
import { useEffect, useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Button, Input, Panel, Select, Toggle } from "@/components/ui";
import { api } from "@/lib/api";
import type { Settings } from "@/lib/types";

export default function AdminSettings() {
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => { api.getSettings().then(setS).catch((e) => setMsg(e.message)); }, []);
  if (!s) return <AppShell role="admin"><p className="text-slate-500">{msg || "Loading…"}</p></AppShell>;

  const set = (k: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setS({ ...s, [k]: e.target.type === "number" ? Number(e.target.value) : e.target.value }); setMsg("");
  };
  const tog = (k: keyof Settings) => (v: boolean) => { setS({ ...s, [k]: v }); setMsg(""); };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { setS(await api.saveSettings(s)); setMsg("Settings saved."); } catch (err: any) { setMsg(err.message); }
  };
  const run = (fn: () => Promise<void>) => () => fn().catch((e) => setMsg(e.message));

  return (
    <AppShell role="admin">
      <PageTitle title="Settings" sub="Rules that apply across the whole college." />
      <form onSubmit={save} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Institute">
          <div className="flex flex-col gap-4">
            <Input label="Institute name" value={s.institute} onChange={set("institute")} />
            <Input label="Allowed email domain" value={s.domain} onChange={set("domain")} hint="Only emails ending with this can be added." />
            <Select label="Current academic year" value={s.academic_year} onChange={set("academic_year")} options={["2025-26", "2026-27", "2027-28"]} />
          </div>
        </Panel>
        <Panel title="Sign-up">
          <Toggle label="Students can sign up themselves" checked={s.student_self_signup} onChange={tog("student_self_signup")} />
          <Toggle label="Teachers need admin approval" hint="New teacher accounts stay pending until approved." checked={s.teacher_approval} onChange={tog("teacher_approval")} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Input label="Max students per class" type="number" min={1} value={s.max_class_size} onChange={set("max_class_size")} />
            <Input label="Join code expiry (hours)" type="number" min={0} value={s.join_code_expiry_hours} onChange={set("join_code_expiry_hours")} hint="0 = never expires" />
          </div>
        </Panel>
        <Panel title="Quiz defaults">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Time per question (sec)" type="number" min={5} max={120} value={s.default_time} onChange={set("default_time")} />
            <Input label="Points per question" type="number" min={0} step={100} value={s.default_points} onChange={set("default_points")} />
          </div>
          <Toggle label="Speed bonus on by default" hint="Faster correct answers earn more points." checked={s.speed_bonus} onChange={tog("speed_bonus")} />
        </Panel>
        <Panel title="Data">
          <Input label="Keep quiz responses for (days)" type="number" min={30} value={s.data_retention_days} onChange={set("data_retention_days")} hint="Older answers are deleted when the server starts. Scores and ranks are kept." />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={run(api.exportUsers)}>Export all users (CSV)</Button>
            <Button type="button" variant="outline" onClick={run(api.exportResults)}>Export all results (CSV)</Button>
          </div>
        </Panel>
        <div className="flex items-center gap-3 lg:col-span-2">
          <Button type="submit">Save settings</Button>
          {msg && <span className="text-sm text-emerald-700">{msg}</span>}
        </div>
      </form>
    </AppShell>
  );
}
