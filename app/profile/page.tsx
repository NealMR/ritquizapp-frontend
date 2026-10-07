"use client";
import { useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Button, Input, Panel, Select } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { DEPARTMENTS, DESIGNATIONS, YEARS } from "@/lib/mock";

export default function Profile() {
  const { user } = useAuth();
  const [saved, setSaved] = useState("");
  return (
    <AppShell>
      {user && (
        <>
          <PageTitle title="Profile" sub={user.email} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Your details">
              <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setSaved("details"); /* PUT /users/me */ }}>
                <Input label="Full name" defaultValue={user.full_name} />
                <Input label="College email" defaultValue={user.email} disabled hint="Email can't be changed. Contact the admin office." />
                <Input label="Mobile number" type="tel" defaultValue={user.phone} />
                <Select label="Department" defaultValue={user.department} options={DEPARTMENTS} />
                {user.role === "student" && <>
                  <div className="grid grid-cols-1 gap-3"><Input label="PRN / Roll no." defaultValue={user.prn} disabled /></div>
                  <div className="grid grid-cols-2 gap-3"><Select label="Year" defaultValue={user.year} options={YEARS} /><Input label="Division" defaultValue={user.division} /></div>
                </>}
                {user.role === "teacher" && <div className="grid grid-cols-2 gap-3"><Input label="Employee ID" defaultValue={user.employee_id} disabled /><Select label="Designation" defaultValue={user.designation} options={DESIGNATIONS} /></div>}
                <div className="flex items-center gap-3"><Button type="submit">Save details</Button>{saved === "details" && <span className="text-sm text-emerald-700">Details saved.</span>}</div>
              </form>
            </Panel>
            <Panel title="Change password">
              <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setSaved("pw"); /* POST /auth/change-password */ }}>
                <Input label="Current password" type="password" autoComplete="current-password" required />
                <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters." required minLength={8} />
                <Input label="Confirm new password" type="password" autoComplete="new-password" required />
                <div className="flex items-center gap-3"><Button type="submit">Change password</Button>{saved === "pw" && <span className="text-sm text-emerald-700">Password changed.</span>}</div>
              </form>
            </Panel>
          </div>
        </>
      )}
    </AppShell>
  );
}
