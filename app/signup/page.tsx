"use client";
import Link from "next/link";
import { useState } from "react";
import AuthFrame from "@/components/AuthFrame";
import { Button, Input, Select } from "@/components/ui";
import { COLLEGE_DOMAIN, DEPARTMENTS, DESIGNATIONS, YEARS } from "@/lib/mock";
import { api } from "@/lib/api";

type Form = Record<string, string>;
const empty: Form = { full_name: "", email: "", phone: "", password: "", confirm: "", department: "", prn: "", roll_no: "", year: "", division: "", employee_id: "", designation: "" };

export default function SignupPage() {
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [f, setF] = useState<Form>(empty);
  const [errors, setErrors] = useState<Form>({});
  const [done, setDone] = useState(false);
  const isGoogleAuth = false; // real Google sign-in lands with the auth phase

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const er: Form = {};
    if (!f.full_name.trim()) er.full_name = "Enter your full name.";
    if (!f.email.toLowerCase().endsWith(COLLEGE_DOMAIN)) {
      er.email = `Must end with ${COLLEGE_DOMAIN}.`;
    } else {
      const prefix = f.email.split("@")[0];
      if (role === "student" && !/^\d{7}$/.test(prefix)) {
        er.email = "Student email must use your 7-digit roll number (e.g., 2303026@ritindia.edu).";
      } else if (role === "teacher" && !/^[a-zA-Z.]+$/.test(prefix)) {
        er.email = "Teacher email should use your name (e.g., sneha.patil@ritindia.edu), not a roll number.";
      }
    }
    if (f.phone && !/^[6-9]\d{9}$/.test(f.phone)) er.phone = "Enter a 10-digit mobile number.";
    if (!isGoogleAuth) {
      if (f.password.length < 8) er.password = "At least 8 characters.";
      if (f.confirm !== f.password) er.confirm = "Passwords don't match.";
    }
    if (!f.department) er.department = "Choose a department.";
    if (role === "student") {
      if (!/^\d{7}$/.test(f.prn)) er.prn = "PRN / Roll no. must be exactly 7 digits.";
      if (!f.year) er.year = "Choose year.";
      if (!f.division.trim()) er.division = "Enter division.";
    } else {
      if (!f.employee_id) er.employee_id = "Enter employee ID.";
      if (!f.designation) er.designation = "Choose designation.";
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (role === "student") f.roll_no = f.prn; // PRN and roll no are identical
    try {
      const payload: any = { ...f, role };
      if (isGoogleAuth) {
        delete payload.password;
        delete payload.confirm;
      }
      await api.signup(payload);
      setDone(true);
    } catch (err: any) {
      alert(err.message || "Signup failed");
    }
  };

  if (done) {
    return (
      <AuthFrame title="Account created" sub={role === "teacher" ? "An admin will approve your teacher account. You'll get an email once it's active." : "You can log in and join your classes now."}>
        <Link href="/login"><Button className="w-full py-3">Go to log in</Button></Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Create account" sub="Sign up with your RIT email.">
      <div className="mb-6 grid grid-cols-2 rounded-lg border border-line bg-white p-1" role="tablist">
        {(["student", "teacher"] as const).map((r) => (
          <button key={r} role="tab" aria-selected={role === r} type="button" onClick={() => { setRole(r); setF(empty); }}
            className={`rounded-md py-2 text-sm font-semibold capitalize ${role === r ? "bg-ink text-white" : "text-slate-600"}`}>I&apos;m a {r}</button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input label="Full name" value={f.full_name} onChange={set("full_name")} error={errors.full_name} placeholder="As on your college ID" disabled={isGoogleAuth} />
        <Input label="College email" type="email" value={f.email} onChange={set("email")} error={errors.email} placeholder={role === "student" ? `2303026${COLLEGE_DOMAIN}` : `sneha.patil${COLLEGE_DOMAIN}`} disabled={isGoogleAuth} />
        <Input label="Mobile number (optional)" type="tel" value={f.phone} onChange={set("phone")} error={errors.phone} placeholder="98XXXXXXXX" />
        <Select label="Department" value={f.department} onChange={set("department")} options={DEPARTMENTS} placeholder="Select department" />
        {errors.department && <p className="-mt-3 text-xs text-ansA">{errors.department}</p>}

        {role === "student" ? (
          <>
            <Input label="PRN / Roll no." value={f.prn} onChange={set("prn")} error={errors.prn} inputMode="numeric" placeholder="7 digits (e.g., 2303026)" disabled={isGoogleAuth} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Year" value={f.year} onChange={set("year")} options={YEARS} placeholder="Select" />
              <Input label="Division" value={f.division} onChange={set("division")} error={errors.division} placeholder="e.g., A, B, or C" />
            </div>
            {errors.year && <p className="-mt-3 text-xs text-ansA">Choose your year.</p>}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Employee ID" value={f.employee_id} onChange={set("employee_id")} error={errors.employee_id} placeholder="RIT-F-0000" />
            <Select label="Designation" value={f.designation} onChange={set("designation")} options={DESIGNATIONS} placeholder="Select" />
          </div>
        )}

        {!isGoogleAuth && (
          <>
            <Input label="Password" type="password" value={f.password} onChange={set("password")} error={errors.password} hint="At least 8 characters." autoComplete="new-password" />
            <Input label="Confirm password" type="password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
          </>
        )}
        <Button type="submit" className="mt-2 py-3">Create account</Button>
      </form>
      <p className="mt-6 text-sm text-slate-600">Already have an account? <Link href="/login" className="font-semibold text-brand">Log in</Link></p>
    </AuthFrame>
  );
}
