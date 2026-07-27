export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-16 text-white">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          Canvo Whiteboard
        </p>
        <h1 className="text-4xl font-semibold sm:text-5xl">
          Collaborate in real time with Tailwind styling.
        </h1>
        <p className="mt-4 text-lg text-slate-300">
          This page now uses Tailwind utility classes, so the stylesheet is being generated correctly.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="/signin"
            className="rounded-full bg-cyan-400 px-5 py-2 font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            Sign in
          </a>
          <a
            href="/canvas"
            className="rounded-full border border-white/20 px-5 py-2 font-medium text-white transition hover:bg-white/10"
          >
            Open canvas
          </a>
        </div>
      </div>
    </main>
  );
}