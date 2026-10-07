"use client";
import { useMemo, useState } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Badge, Button, Input, Modal, Panel, Select } from "@/components/ui";
import { DEPARTMENTS, DESIGNATIONS, classes, quizzes, users as seed, yearLabel } from "@/lib/mock";
import type { User } from "@/lib/types";

export default function AdminUsers() {
  const [list, setList] = useState<User[]>(seed);
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [adding, setAdding] = useState(false);

  const pending = list.filter((u) => u.role === "teacher" && !u.is_approved);
  const filtered = useMemo(() => list.filter((u) =>
    (!q || `${u.full_name} ${u.email} ${u.prn ?? ""} ${u.employee_id ?? ""}`.toLowerCase().includes(q.toLowerCase())) &&
    (!role || u.role === role) && (!dept || u.department === dept) &&
    (!status || (status === "active" ? u.is_active : !u.is_active))), [list, q, role, dept, status]);

  const patch = (id: number, p: Partial<User>) => setList(list.map((u) => (u.id === id ? { ...u, ...p } : u)));

  const stats = [
    { n: list.filter((u) => u.role === "student").length, l: "Students" },
    { n: list.filter((u) => u.role === "teacher").length, l: "Teachers" },
    { n: classes.length, l: "Classes" },
    { n: quizzes.length, l: "Quizzes created" },
  ];

  return (
    <AppShell role="admin">
      <PageTitle title="Users" sub="Approve teachers, manage accounts and roles." action={<Button onClick={() => setAdding(true)}>Add user</Button>} />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="rounded-xl border border-line bg-white px-4 py-3">
            <p className="font-display text-3xl font-bold">{s.n}</p><p className="text-sm text-slate-600">{s.l}</p>
          </div>
        ))}
      </div>

      {pending.length > 0 && (
        <Panel title={`Waiting for approval (${pending.length})`} className="mb-6 border-amber-300">
          <ul className="divide-y divide-line">
            {pending.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><p className="font-semibold">{u.full_name}</p><p className="text-sm text-slate-600">{u.email} · {u.employee_id} · {u.designation}, {u.department}</p></div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setList(list.filter((x) => x.id !== u.id))}>Reject</Button>
                  <Button onClick={() => patch(u.id, { is_approved: true })}>Approve</Button>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-4">
          <Input label="Search" placeholder="Name, email, PRN or employee ID" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={["admin", "teacher", "student"]} placeholder="All roles" />
          <Select label="Department" value={dept} onChange={(e) => setDept(e.target.value)} options={DEPARTMENTS} placeholder="All departments" />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={[{ value: "active", label: "Active" }, { value: "disabled", label: "Disabled" }]} placeholder="Any status" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-slate-500">
              <tr><th className="py-2 pr-3 font-semibold">Name</th><th className="pr-3 font-semibold">Role</th><th className="pr-3 font-semibold">ID</th><th className="pr-3 font-semibold">Department / class</th><th className="pr-3 font-semibold">Status</th><th className="font-semibold">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-3"><p className="font-semibold">{u.full_name}</p><p className="text-slate-500">{u.email}</p></td>
                  <td className="pr-3">
                    <select aria-label={`Role for ${u.full_name}`} value={u.role} onChange={(e) => patch(u.id, { role: e.target.value as User["role"] })} className="rounded-md border border-line px-2 py-1 capitalize">
                      <option value="student">student</option><option value="teacher">teacher</option><option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="pr-3 text-slate-600">{u.prn ?? u.employee_id ?? "—"}</td>
                  <td className="pr-3 text-slate-600">{u.department}{u.year && <><br />{yearLabel(u.year)}, Div {u.division}, Roll {u.roll_no}</>}{u.designation && <><br />{u.designation}</>}</td>
                  <td className="pr-3">{!u.is_approved ? <Badge tone="amber">Pending</Badge> : u.is_active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>}</td>
                  <td className="whitespace-nowrap">
                    <Button variant="ghost" onClick={() => patch(u.id, { is_active: !u.is_active })}>{u.is_active ? "Disable" : "Enable"}</Button>
                    <Button variant="ghost" onClick={() => alert(`Password reset link sent to ${u.email}`)}>Reset password</Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-500">No users match these filters. Clear a filter to see more.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>

      <AddUserModal open={adding} onClose={() => setAdding(false)} onAdd={(u) => { setList([...list, u]); setAdding(false); }} />
    </AppShell>
  );
}

function AddUserModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (u: User) => void }) {
  const [f, setF] = useState({ full_name: "", email: "", role: "teacher", department: "", employee_id: "", designation: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal open={open} title="Add user" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onAdd({ id: Date.now(), ...f, role: f.role as User["role"], is_active: true, is_approved: true, created_at: new Date().toISOString() }); }}>
        <Input label="Full name" value={f.full_name} onChange={set("full_name")} required />
        <Input label="College email" type="email" value={f.email} onChange={set("email")} required />
        <Select label="Role" value={f.role} onChange={set("role")} options={["teacher", "admin", "student"]} />
        <Select label="Department" value={f.department} onChange={set("department")} options={DEPARTMENTS} placeholder="Select" />
        {f.role === "teacher" && <div className="grid grid-cols-2 gap-3"><Input label="Employee ID" value={f.employee_id} onChange={set("employee_id")} /><Select label="Designation" value={f.designation} onChange={set("designation")} options={DESIGNATIONS} placeholder="Select" /></div>}
        <p className="text-xs text-slate-500">They&apos;ll get an email to set their password.</p>
        <Button type="submit">Add user</Button>
      </form>
    </Modal>
  );
}
