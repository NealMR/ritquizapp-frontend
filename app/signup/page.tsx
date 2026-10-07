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
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const handleGoogleSignup = () => {
    // In a real app, this would trigger OAuth popup and get profile
    setIsGoogleAuth(true);
    setF(prev => ({
      ...prev,
      full_name: role === "teacher" ? "Sneha Patil" : "Atharv Thorat",
      email: role === "teacher" ? "sneha.patil@ritindia.edu" : "2303026@ritindia.edu",
      google_id: "google_123456",
      auth_provider: "google",
      password: "",
      confirm: ""
    }));
  };

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
          <button key={r} role="tab" aria-selected={role === r} type="button" onClick={() => { setRole(r); setIsGoogleAuth(false); setF(empty); }}
            className={`rounded-md py-2 text-sm font-semibold capitalize ${role === r ? "bg-ink text-white" : "text-slate-600"}`}>I&apos;m a {r}</button>
        ))}
      </div>

      {!isGoogleAuth && (
        <div className="mb-6">
          <Button variant="outline" type="button" className="flex w-full items-center justify-center gap-2 py-3" onClick={handleGoogleSignup}>
            <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            Sign up with Google
          </Button>
          <div className="my-4 flex items-center gap-3 text-sm text-slate-400">
            <div className="h-px flex-1 bg-line" /> OR <div className="h-px flex-1 bg-line" />
          </div>
        </div>
      )}

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
