"use client";
import { useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Button, Input, Panel, Select, Toggle } from "@/components/ui";

export default function AdminSettings() {
  const [s, setS] = useState({
    domain: "@ritindia.edu", institute: "Rajarambapu Institute of Technology", academic_year: "2026-27",
    teacher_approval: true, student_self_signup: true, default_time: "30", default_points: "1000",
    speed_bonus: true, max_class_size: "120", join_code_expiry_hours: "0", data_retention_days: "365",
  });
  const [saved, setSaved] = useState(false);
  const set = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setS({ ...s, [k]: e.target.value }); setSaved(false); };
  const tog = (k: keyof typeof s) => (v: boolean) => { setS({ ...s, [k]: v }); setSaved(false); };

  return (
    <AppShell role="admin">
      <PageTitle title="Settings" sub="Rules that apply across the whole college." />
      <form onSubmit={(e) => { e.preventDefault(); setSaved(true); /* PUT /admin/settings */ }} className="grid gap-6 lg:grid-cols-2">
        <Panel title="Institute">
          <div className="flex flex-col gap-4">
            <Input label="Institute name" value={s.institute} onChange={set("institute")} />
            <Input label="Allowed email domain" value={s.domain} onChange={set("domain")} hint="Only emails ending with this can sign up or log in." />
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
            <Input label="Time per question (sec)" type="number" min={5} value={s.default_time} onChange={set("default_time")} />
            <Input label="Points per question" type="number" min={0} step={100} value={s.default_points} onChange={set("default_points")} />
          </div>
          <Toggle label="Speed bonus on by default" hint="Faster correct answers earn more points." checked={s.speed_bonus} onChange={tog("speed_bonus")} />
        </Panel>
        <Panel title="Data">
          <Input label="Keep quiz responses for (days)" type="number" min={30} value={s.data_retention_days} onChange={set("data_retention_days")} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline">Export all users (CSV)</Button>
            <Button type="button" variant="outline">Export all results (CSV)</Button>
          </div>
        </Panel>
        <div className="flex items-center gap-3 lg:col-span-2">
          <Button type="submit">Save settings</Button>
          {saved && <span className="text-sm text-emerald-700">Settings saved.</span>}
        </div>
      </form>
    </AppShell>
  );
}
