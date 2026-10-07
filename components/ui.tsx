"use client";
import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "outline" };
export function Button({ variant = "primary", className = "", ...p }: BtnProps) {
  const styles = {
    primary: "bg-gradient-brand text-white shadow-soft hover:shadow-float active:scale-[0.98]",
    outline: "border border-line bg-white text-ink hover:border-brand/40 shadow-sm active:scale-[0.98]",
    ghost: "text-brand hover:bg-brandsoft/50 active:scale-[0.98]",
    danger: "bg-ansA text-white shadow-soft hover:shadow-float active:scale-[0.98]",
  }[variant];
  return <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none ${styles} ${className}`} />;
}

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: (id: string) => React.ReactNode }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-bold tracking-wide text-slate-700 uppercase text-[11px]">{label}</label>
      {children(id)}
      {error ? <p className="text-xs font-medium text-ansA mt-1">{error}</p> : hint ? <p className="text-xs text-slate-500 mt-1">{hint}</p> : null}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 focus:border-brand shadow-sm transition-all";

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
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-brand" : "bg-slate-300"}`}>
        <span className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

export function Panel({ title, action, children, className = "", delay = 0 }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-2xl border border-line bg-white shadow-soft hover:shadow-float transition-shadow duration-300 ${className}`}
    >
      {title && (
        <header className="flex items-center justify-between border-b border-line/60 px-6 py-5">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-6">{children}</div>
    </motion.section>
  );
}

export function Badge({ tone = "slate", children }: { tone?: "slate" | "green" | "amber" | "red" | "blue"; children: React.ReactNode }) {
  const t = {
    slate: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/50",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50",
    red: "bg-red-50 text-red-700 ring-1 ring-red-200/50",
    blue: "bg-brandsoft text-brand ring-1 ring-brand/10"
  }[tone];
  return <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${t}`}>{children}</span>;
}

export function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl border border-slate-200/50"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/90 px-6 py-5 backdrop-blur">
              <h2 className="font-display text-xl font-bold tracking-tight">{title}</h2>
              <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors" aria-label="Close">✕</button>
            </header>
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export const statusTone = (s: string) => (s === "live" ? "green" : s === "scheduled" ? "blue" : s === "closed" ? "slate" : "amber") as "green" | "blue" | "slate" | "amber";
