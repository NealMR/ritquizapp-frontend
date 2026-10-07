"use client";
import { useId } from "react";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" };
export function Button({ variant = "primary", className = "", ...p }: BtnProps) {
  const styles = {
    primary: "bg-brand text-white hover:bg-[#2233a8]",
    outline: "border border-line bg-white text-ink hover:border-brand",
    ghost: "text-brand hover:bg-brandsoft",
    danger: "bg-ansA text-white hover:opacity-90",
  }[variant];
  return <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${styles} ${className}`} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">{label}</label>
      {children(id)}
      {error ? <p className="text-xs text-ansA">{error}</p> : hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 focus:border-brand";

export function Input({ label, hint, error, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  return <Field label={label} hint={hint} error={error}>{(id) => <input id={id} {...p} className={inputCls} />}</Field>;
}
export function Textarea({ label, hint, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; hint?: string }) {
  return <Field label={label} hint={hint}>{(id) => <textarea id={id} {...p} className={inputCls + " min-h-[88px]"} />}</Field>;
}
export function Select({ label, hint, options, placeholder, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string; placeholder?: string; options: (string | { value: string; label: string })[] }) {
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <select id={id} {...p} className={inputCls}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      )}
    </Field>
  );
}
export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-2">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-slate-500">{hint}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-brand" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-line bg-white ${className}`}>
      {title && (
        <header className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Badge({ tone = "slate", children }: { tone?: "slate" | "green" | "amber" | "red" | "blue"; children: React.ReactNode }) {
  const t = { slate: "bg-slate-100 text-slate-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", red: "bg-red-50 text-red-700", blue: "bg-brandsoft text-brand" }[tone];
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <header className="sticky top-0 flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <h2 className="font-display text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-slate-500 hover:bg-paper" aria-label="Close">✕</button>
        </header>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export const statusTone = (s: string) => (s === "live" ? "green" : s === "scheduled" ? "blue" : s === "closed" ? "slate" : "amber") as "green" | "blue" | "slate" | "amber";
