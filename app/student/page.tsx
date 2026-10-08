"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import AppShell, { PageTitle } from "@/components/AppShell";
import { Panel, Badge, Button, Modal, statusTone } from "@/components/ui";
import { useData } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { QuizResult } from "@/lib/types";
import QuizOverviewModal from "@/components/QuizOverviewModal";
import { motion } from "framer-motion";

export default function StudentHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { classes, quizzes, refresh } = useData();
  useEffect(() => { const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [refresh]); // spot quizzes going live
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [myResults, setMyResults] = useState<QuizResult[]>([]);
  const [overviewQuizId, setOverviewQuizId] = useState<number | null>(null);
  const [classSearch, setClassSearch] = useState("");
  const [resultSearch, setResultSearch] = useState("");

  useEffect(() => {
    api.getMyResults().then(setMyResults).catch(console.error);
  }, []);

  const mine = classes;
  const upcoming = quizzes.filter((q) => q.status !== "closed" && mine.some((c) => c.id === q.class_id));
  const pastQuizzes = quizzes.filter((q) => q.status === "closed" && mine.some((c) => c.id === q.class_id));
  const live = quizzes.find((q) => q.status === "live");
  const liveClass = classes.find((c) => c.id === live?.class_id);

  const filteredClasses = useMemo(() => {
    if (!classSearch.trim()) return mine;
    const q = classSearch.toLowerCase().trim();
    return mine.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.subject_code.toLowerCase().includes(q) ||
        (c.teacher_name && c.teacher_name.toLowerCase().includes(q)) ||
        (c.join_code && c.join_code.toLowerCase().includes(q))
    );
  }, [mine, classSearch]);

  const filteredRecentResults = useMemo(() => {
    if (!resultSearch.trim()) return myResults.slice(0, 5);
    const q = resultSearch.toLowerCase().trim();
    return myResults
      .filter((r) => r.quiz_title.toLowerCase().includes(q) || r.class_name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [myResults, resultSearch]);

  const join = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "");
    if (cleanCode.length !== 6) {
      setSuccess("");
      return setErr("Code must be 6 characters.");
    }
    setJoining(true);
    setErr("");
    setSuccess("");
    try {
      const res = await api.joinClass(cleanCode);
      setCode("");
      setSuccess(res.message || "Successfully enrolled in class!");
      await refresh();
    } catch (e: any) {
      setErr(e.message || "Failed to join class");
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppShell role="student">
      <PageTitle
        title={`Hi, ${user?.full_name?.split(' ')[0] || "Student"}!`}
        sub="Jump into a live quiz, view your classes, or inspect your test results."
        action={
          <Button onClick={() => { setJoinModalOpen(true); setErr(""); setSuccess(""); }}>
            + Join class
          </Button>
        }
      />

      {live && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-ansD to-emerald-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/80">Live now in {liveClass?.name}</p>
            <p className="mt-1 font-display text-2xl font-bold">{live.title}</p>
          </div>
          <Link href={`/play/${live.id}`}><button className="w-full rounded-xl bg-white px-6 py-3 font-bold text-emerald-700 shadow-soft hover:shadow-float active:scale-[0.98] transition-all sm:w-auto">Join quiz</button></Link>
        </motion.div>
      )}

      {/* Main content: My classes clean layout */}
      <Panel
        title="My classes"
        delay={0.1}
        action={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="relative w-36 sm:w-56">
              <input
                type="text"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                placeholder="Search classes..."
                className="w-full rounded-xl border border-line bg-slate-50/80 px-3 py-1.5 pl-8 text-xs text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
              />
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                🔍
              </span>
              {classSearch && (
                <button
                  type="button"
                  onClick={() => setClassSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                  aria-label="Clear class search"
                >
                  ✕
                </button>
              )}
            </div>
            <Button variant="outline" className="text-xs px-3 py-1.5 whitespace-nowrap" onClick={() => { setJoinModalOpen(true); setErr(""); setSuccess(""); }}>
              + Join with code
            </Button>
          </div>
        }
      >
        {classSearch.trim() && (
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <p>
              Found <span className="font-bold text-ink">{filteredClasses.length}</span> of {mine.length} classes matching &ldquo;{classSearch}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setClassSearch("")}
              className="font-semibold text-brand hover:underline"
            >
              Clear search
            </button>
          </div>
        )}
        <ul className="divide-y divide-line/60">
          {filteredClasses.map((c) => (
            <li key={c.id} className="py-4 hover:bg-slate-50 transition-colors -mx-6 px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-display font-bold text-lg text-ink">{c.name}</p>
                <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Code: {c.join_code}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1">{c.subject_code} · {c.teacher_name}</p>
              
              <ul className="mt-3 flex flex-col gap-2 empty:hidden">
                {/* Upcoming/Live quizzes */}
                {upcoming.filter((q) => q.class_id === c.id).map((q) => (
                  <li key={q.id} className="flex items-center gap-2 text-sm font-medium">
                    <Badge tone={statusTone(q.status)}>{q.status}</Badge>
                    {q.status === "live" ? (
                      <Link href={`/play/${q.id}`} className="font-semibold text-brand hover:underline">
                        {q.title} →
                      </Link>
                    ) : (
                      <span>{q.title}</span>
                    )}
                    {q.scheduled_at && (
                      <span className="text-slate-500">· {new Date(q.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    )}
                  </li>
                ))}

                {/* Completed/Closed quizzes with clickable result overview */}
                {pastQuizzes.filter((q) => q.class_id === c.id).map((q) => (
                  <li key={q.id} className="flex items-center gap-2 text-sm font-medium">
                    <Badge tone="slate">closed</Badge>
                    <button
                      type="button"
                      onClick={() => setOverviewQuizId(q.id)}
                      className="font-semibold text-slate-700 hover:text-brand hover:underline transition-colors text-left"
                    >
                      {q.title} <span className="text-xs text-brand font-medium">· View result overview →</span>
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {mine.length === 0 && (
            <li className="py-8 text-center text-sm text-slate-500">
              <p>You haven&apos;t joined any classes yet.</p>
              <Button className="mt-4" onClick={() => { setJoinModalOpen(true); setErr(""); setSuccess(""); }}>
                Join your first class
              </Button>
            </li>
          )}
          {mine.length > 0 && filteredClasses.length === 0 && (
            <li className="py-8 text-center text-sm text-slate-500">
              <p>No classes match &ldquo;{classSearch}&rdquo;</p>
              <Button variant="outline" className="mt-3 text-xs" onClick={() => setClassSearch("")}>
                Clear search
              </Button>
            </li>
          )}
        </ul>
      </Panel>

      {/* Recent results with clickable test overview */}
      <Panel
        title="Recent results"
        className="mt-8"
        delay={0.2}
        action={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {myResults.length > 0 && (
              <div className="relative w-36 sm:w-48">
                <input
                  type="text"
                  value={resultSearch}
                  onChange={(e) => setResultSearch(e.target.value)}
                  placeholder="Filter recent..."
                  className="w-full rounded-xl border border-line bg-slate-50/80 px-3 py-1.5 pl-8 text-xs text-ink placeholder:text-slate-400 focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all"
                />
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                  🔍
                </span>
                {resultSearch && (
                  <button
                    type="button"
                    onClick={() => setResultSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                    aria-label="Clear results search"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
            <Link href="/student/results" className="text-sm font-bold text-brand hover:text-brand/80 transition-colors whitespace-nowrap">
              See all →
            </Link>
          </div>
        }
      >
        {resultSearch.trim() && (
          <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
            <p>
              Found <span className="font-bold text-ink">{filteredRecentResults.length}</span> results matching &ldquo;{resultSearch}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setResultSearch("")}
              className="font-semibold text-brand hover:underline"
            >
              Clear
            </button>
          </div>
        )}
        <ul className="divide-y divide-line/60">
          {myResults.length === 0 && (
            <li className="py-6 text-center text-sm text-slate-500">
              Your quiz results will show up here after you complete a test.
            </li>
          )}
          {myResults.length > 0 && filteredRecentResults.length === 0 && (
            <li className="py-6 text-center text-sm text-slate-500">
              <p>No recent results match &ldquo;{resultSearch}&rdquo;</p>
              <Button variant="outline" className="mt-3 text-xs" onClick={() => setResultSearch("")}>
                Clear search
              </Button>
            </li>
          )}
          {filteredRecentResults.map((r, idx) => (
            <li
              key={`${r.quiz_id}-${r.played_at}-${r.id || idx}`}
              onClick={() => setOverviewQuizId(r.quiz_id)}
              className="flex items-center justify-between py-4 hover:bg-slate-50 transition-all -mx-6 px-6 cursor-pointer group"
              role="button"
              tabIndex={0}
              title="Click to view test overview"
            >
              <div>
                <p className="font-display font-bold text-lg text-ink group-hover:text-brand transition-colors flex items-center gap-2">
                  {r.quiz_title}
                  <span className="text-xs font-semibold text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    View overview →
                  </span>
                </p>
                <p className="text-sm font-medium text-slate-500 mt-1">{r.class_name}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-2xl font-extrabold text-brand">
                  {r.rank ? `#${r.rank}` : "Unranked"}
                  {r.rank ? <span className="text-sm font-medium text-slate-500 ml-1">of {r.participants}</span> : null}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mt-1">
                  {r.correct}/{r.total} correct
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Join Class Modal */}
      <Modal open={joinModalOpen} title="Join a class" onClose={() => setJoinModalOpen(false)}>
        <form onSubmit={join} className="flex flex-col gap-4">
          <label htmlFor="code" className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Class code</label>
          <input
            id="code"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase().replace(/\s+/g, "")); setErr(""); setSuccess(""); }}
            maxLength={6}
            placeholder="DL7K2Q"
            className="rounded-xl border border-line px-4 py-3 text-center font-display text-xl font-bold tracking-widest uppercase focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all bg-slate-50"
          />
          {err && <p className="text-sm font-medium text-ansA bg-red-50 p-3 rounded-lg border border-red-100">{err}</p>}
          {success && <p className="text-sm font-medium text-emerald-700 bg-emerald-50 p-3 rounded-lg border border-emerald-200">{success}</p>}
          <Button type="submit" disabled={joining || code.trim().length !== 6}>
            {joining ? "Joining..." : "Join class"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setScanning(true)}>
            Scan QR code
          </Button>
        </form>
      </Modal>

      {/* Scan QR Modal */}
      <Modal open={scanning} title="Scan class QR" onClose={() => setScanning(false)}>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm text-slate-700">
          <li>Open your phone&apos;s <b>camera app</b> (or Google Lens).</li>
          <li>Point it at the QR code on the classroom screen.</li>
          <li>Tap the link that pops up. It opens this app and adds you to the class.</li>
        </ol>
        <p className="mt-4 text-xs text-slate-500">Can&apos;t scan? Type the 6-character code shown under the QR instead.</p>
        <Button className="mt-4 w-full" variant="outline" onClick={() => setScanning(false)}>Got it</Button>
      </Modal>

      {/* Test Overview Modal */}
      <QuizOverviewModal
        quizId={overviewQuizId}
        onClose={() => setOverviewQuizId(null)}
      />
    </AppShell>
  );
}
