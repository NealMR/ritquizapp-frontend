"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types";

export default function Leaderboard({ rows, highlight, dark }: { rows: LeaderboardEntry[]; highlight?: number; dark?: boolean }) {
  return (
    <ol className="flex flex-col gap-2">
      <AnimatePresence>
        {rows.map((r, i) => (
          <motion.li key={r.student_id} layout initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (rows.length - i) * 0.12, type: "spring", stiffness: 260, damping: 24 }}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 ${r.student_id === highlight ? "bg-ansC text-ink" : dark ? "bg-white/10 text-white" : "border border-line bg-white"}`}>
            <span className="w-8 font-display text-2xl font-extrabold">{r.rank}</span>
            <span className="flex-1"><span className="block font-semibold">{r.full_name}</span><span className="text-xs opacity-70">Roll {r.roll_no} · {r.correct} correct</span></span>
            <span className="font-display text-xl font-bold tabular-nums">{r.score.toLocaleString("en-IN")}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ol>
  );
}
