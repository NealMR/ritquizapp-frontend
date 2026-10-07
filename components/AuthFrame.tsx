export default function AuthFrame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="font-display text-2xl font-bold">RIT Quiz</p>
        <div>
          <div className="mb-8 grid w-72 grid-cols-2 gap-3" aria-hidden>
            <div className="h-20 rounded-xl bg-ansA" /><div className="h-20 rounded-xl bg-ansB" />
            <div className="h-20 rounded-xl bg-ansC" /><div className="h-20 rounded-xl bg-ansD" />
          </div>
          <p className="max-w-sm font-display text-4xl font-bold leading-tight">Ask the whole class. Get every answer in seconds.</p>
          <p className="mt-4 max-w-sm text-white/70">Live quizzes and polls for Rajarambapu Institute of Technology. Sign in with your college email.</p>
        </div>
        <p className="text-sm text-white/50">Only @ritindia.edu accounts can sign in.</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <p className="mb-6 font-display text-2xl font-bold lg:hidden">RIT Quiz</p>
          <h1 className="font-display text-3xl font-bold">{title}</h1>
          <p className="mb-7 mt-1 text-slate-600">{sub}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
