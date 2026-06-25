"use client";

import { useState } from "react";
import Link from "next/link";

export default function FreeFirePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#ff5f22,_#0c1220_35%,_#02050b_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.12),transparent_45%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-slate-500/10 bg-slate-950/50 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-orange-300">
              Free Fire Guild Hub
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Command your squad with live guild controls.
            </h1>
            <p className="max-w-2xl text-slate-300 sm:text-lg">
              Manage your guild, approve members, pin messages, and keep announcements locked to admins only.
            </p>
          </div>

          <div className="relative self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5 hover:bg-orange-500/90"
            >
              Menu
              <span aria-hidden="true">▾</span>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%_+_10px)] z-20 w-56 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <button className="w-full rounded-2xl bg-orange-500/15 px-4 py-3 text-left text-sm font-semibold text-orange-200 transition hover:bg-orange-500/25">
                  Create a guild
                </button>
                <button className="mt-3 w-full rounded-2xl bg-slate-900/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800/90">
                  Join guilds
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-6 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 rounded-3xl border border-orange-300/20 bg-orange-500/10 p-5 text-orange-100 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-orange-200/80">Guild ID</p>
                  <h2 className="text-3xl font-semibold">FF-8081</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/20 px-3 py-2 text-sm font-semibold text-orange-100">
                  Creator only
                </div>
              </div>
              <p className="text-sm leading-6 text-orange-100/80">
                The original creator has exclusive rights to appoint admins, pin messages, and manage membership approvals. Admins can moderate without removing fellow admins.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Announcements</p>
                    <h3 className="text-xl font-semibold text-white">Admin-only broadcast</h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase text-emerald-200">Locked</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Only admins can post announcements. Use this area to share event times, raid strategies, or guild rules.
                </p>
                <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-slate-300">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-100">Guild War Tonight</p>
                    <p className="text-sm">Ready squads at 8:00 PM. Winners earn the hero badge.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>by Creator</span>•<span>Admin only</span>
                  </div>
                </div>
              </article>

              <article className="space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pinned message</p>
                    <h3 className="text-xl font-semibold text-white">Pinned Strategy</h3>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs uppercase text-amber-200">Pinned</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Admins and creator can pin important chat updates. This is perfect for rules, event links, and squad assignments.
                </p>
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-slate-200">
                  <p className="font-semibold">Team formation closes at 7:45 PM for the next raid.</p>
                  <p className="mt-2 text-sm text-slate-400">Only creator and appointed admins can pin these updates.</p>
                </div>
              </article>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Group chat</p>
                  <h3 className="text-2xl font-semibold text-white">Guild conversation</h3>
                </div>
                <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs uppercase text-slate-300">Live preview</span>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl bg-slate-950/90 p-4 text-slate-200 shadow-inner shadow-black/20">
                  <p className="text-sm font-semibold text-white">Creator</p>
                  <p className="mt-2 text-sm text-slate-300">"Prepare the squad. Team A takes the dropship left flank."</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-200">
                  <p className="text-sm font-semibold text-emerald-300">Admin Haze</p>
                  <p className="mt-2 text-sm text-slate-300">"Reminder: Only approved members may join. Pending players stay in queue."</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-200">
                  <p className="text-sm font-semibold text-slate-100">Member Blaze</p>
                  <p className="mt-2 text-sm text-slate-300">"Ready for the 3rd round. Need medkits and cover."</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Honorable mention</p>
              <div className="mt-4 flex items-center gap-4 rounded-3xl bg-orange-500/10 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500/20 text-2xl">🔥</div>
                <div>
                  <p className="text-xl font-semibold text-white">RoguePhoenix</p>
                  <p className="text-sm text-slate-300">Top damage dealer and squad strategist this week.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Waiting list</p>
                  <h3 className="text-2xl font-semibold text-white">Pending approvals</h3>
                </div>
                <span className="rounded-full bg-slate-700/75 px-3 py-1 text-xs uppercase text-slate-200">3 waiting</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">PhoenixRider — waiting for approval</li>
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">Maverick94 — waiting for approval</li>
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">SkyeBlade — waiting for approval</li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Complaints</p>
                  <h3 className="text-2xl font-semibold text-white">Guild issues</h3>
                </div>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs uppercase text-amber-200">Report</span>
              </div>
              <div className="mt-5 space-y-4 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-slate-300">
                <p className="font-semibold text-white">Member delay in squad readiness</p>
                <p className="text-sm leading-6">The creator reviews and approves complaints before they become visible to the full guild.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Connect</p>
                  <h3 className="text-2xl font-semibold text-white">WhatsApp</h3>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase text-emerald-200">Optional</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                The creator can add a contact number or group link for external coordination if desired.
              </p>
              <button className="mt-5 w-full rounded-3xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                Connect to WhatsApp
              </button>
            </div>
          </aside>
        </section>

        <div className="flex flex-col gap-3 rounded-[32px] border border-white/10 bg-slate-950/60 p-6 text-slate-400 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em]">Guild rules</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/90 p-4">Creator appoints up to 5 admins.</div>
            <div className="rounded-3xl bg-slate-900/90 p-4">Admins can moderate chat and complaints.</div>
            <div className="rounded-3xl bg-slate-900/90 p-4">Users join only after creator approval.</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-400">
          <Link href="/" className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 transition hover:border-orange-300/50 hover:text-white">
            Back to home
          </Link>
          <Link href="/call-of-duty" className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 transition hover:border-cyan-300/50 hover:text-white">
            View Call of Duty theme
          </Link>
        </div>
      </div>
    </main>
  );
}
