import Link from "next/link";

export default function BloodStrikePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#3a0f16,#0a080a_40%,#020204_100%)] text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
        <div className="rounded-[36px] border border-white/10 bg-slate-950/70 p-10 shadow-2xl backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-pink-300">Blood Strike</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">Blood Strike guild system</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            Coming soon with a dedicated theme, community pages, and the same creator-first guild controls for admin approvals, pinned messages, and announcements.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="rounded-full border border-white/10 bg-pink-500/20 px-6 py-3 text-sm font-semibold text-pink-100 transition hover:bg-pink-500/30">
              Back to home
            </Link>
            <Link href="/free-fire" className="rounded-full border border-white/10 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/90">
              Explore Free Fire
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
