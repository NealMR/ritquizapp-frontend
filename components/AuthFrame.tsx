"use client";
import { motion } from "framer-motion";

export default function AuthFrame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-gradient-brand opacity-20" />
        <div className="absolute -top-[30%] -right-[20%] h-[800px] w-[800px] rounded-full bg-brand/30 blur-3xl" />
        <p className="relative z-10 font-display text-2xl font-extrabold tracking-tight">RIT Quiz</p>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative z-10">
          <div className="mb-8 grid w-72 grid-cols-2 gap-3" aria-hidden>
            <div className="h-20 rounded-2xl bg-ansA/90 shadow-lg backdrop-blur-sm" /><div className="h-20 rounded-2xl bg-ansB/90 shadow-lg backdrop-blur-sm" />
            <div className="h-20 rounded-2xl bg-ansC/90 shadow-lg backdrop-blur-sm" /><div className="h-20 rounded-2xl bg-ansD/90 shadow-lg backdrop-blur-sm" />
          </div>
          <p className="max-w-sm font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md">Ask the whole class.<br/><span className="text-brandsoft">Get every answer in seconds.</span></p>
          <p className="mt-6 max-w-sm text-lg font-medium text-white/80 leading-relaxed">Live quizzes and polls for Rajarambapu Institute of Technology. Sign in with your college email.</p>
        </motion.div>
        <p className="relative z-10 text-sm font-bold uppercase tracking-wider text-white/50">Only @ritindia.edu accounts can sign in.</p>
      </aside>
      <main className="flex items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-paper">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-float border border-slate-200/50">
          <p className="mb-8 font-display text-2xl font-extrabold text-ink lg:hidden text-center tracking-tight">RIT Quiz</p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
          <p className="mb-8 mt-2 text-slate-500 font-medium">{sub}</p>
          {children}
        </motion.div>
      </main>
    </div>
  );
}
