"use client";
import { useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Button, Input, Panel, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { DEPARTMENTS, DESIGNATIONS, YEARS } from "@/lib/mock";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const run = (key: string, fn: (f: FormData) => Promise<void>) => async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setSaved(""); setError("");
    const form = e.currentTarget, data = new FormData(form);
    try { await fn(data); setSaved(key); if (key === "pw") form.reset(); } catch (err) { setError((err as Error).message); }
  };
  return (
    <AppShell>
      {user && (
        <>
          <PageTitle title="Profile" sub={user.email} />
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Your details">
              <form className="flex flex-col gap-4" onSubmit={run("details", async (f) => { updateUser(await api.updateMe(Object.fromEntries([...f.entries()].filter(([, v]) => v !== "")) as any)); })}>
                <Input name="full_name" label="Full name" defaultValue={user.full_name} />
                <Input label="College email" defaultValue={user.email} disabled hint="Email can't be changed. Contact the admin office." />
                <Input name="phone" label="Mobile number" type="tel" defaultValue={user.phone} />
                <Select name="department" label="Department" defaultValue={user.department} options={DEPARTMENTS} />
                {user.role === "student" && <>
                  <div className="grid grid-cols-1 gap-3"><Input label="PRN / Roll no." defaultValue={user.prn} disabled /></div>
                  <div className="grid grid-cols-2 gap-3"><Select name="year" label="Year" defaultValue={user.year} options={YEARS} /><Input name="division" label="Division" defaultValue={user.division} /></div>
                </>}
                {user.role === "teacher" && <div className="grid grid-cols-2 gap-3"><Input label="Employee ID" defaultValue={user.employee_id} disabled /><Select name="designation" label="Designation" defaultValue={user.designation} options={DESIGNATIONS} /></div>}
                <div className="flex items-center gap-3"><Button type="submit">Save details</Button>{saved === "details" && <span className="text-sm text-emerald-700">Details saved.</span>}</div>
              </form>
            </Panel>
            <Panel title="Change password">
              <form className="flex flex-col gap-4" onSubmit={run("pw", async (f) => {
                if (f.get("new") !== f.get("confirm")) throw new Error("New passwords don't match.");
                await api.changePassword(String(f.get("current")), String(f.get("new")));
              })}>
                <Input name="current" label="Current password" type="password" autoComplete="current-password" required />
                <Input name="new" label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." required minLength={8} />
                <Input name="confirm" label="Confirm new password" type="password" autoComplete="new-password" required />
                <div className="flex items-center gap-3"><Button type="submit">Change password</Button>{saved === "pw" && <span className="text-sm text-emerald-700">Password changed.</span>}</div>
              </form>
            </Panel>
          </div>
        </>
      )}
    </AppShell>
  );
}
