"use client";

import { useState } from "react";
import Link from "next/link";

export default function CallOfDutyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_#0f2138,_#020810_35%,_#020305_100%)] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(18,184,255,0.18),transparent_35%)]" />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-6 rounded-[32px] border border-slate-500/10 bg-slate-950/50 p-6 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Call Of Duty Guild Hub</p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Build your squad with the COD frontline look.
            </h1>
            <p className="max-w-2xl text-slate-300 sm:text-lg">
              Maintain admin-led announcements, member approvals, pinned strategy notes, and a powerful waiting list experience.
            </p>
          </div>

          <div className="relative self-start md:self-auto">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/95 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:bg-cyan-500/90"
            >
              Menu
              <span aria-hidden="true">▾</span>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-[calc(100%_+_10px)] z-20 w-56 rounded-3xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
                <button className="w-full rounded-2xl bg-cyan-500/15 px-4 py-3 text-left text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/25">
                  Create a guild
                </button>
                <button className="mt-3 w-full rounded-2xl bg-slate-900/90 px-4 py-3 text-left text-sm font-semibold text-slate-100 transition hover:bg-slate-800/90">
                  Join guilds
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <section className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 rounded-3xl border border-cyan-300/20 bg-cyan-500/10 p-5 text-cyan-100 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/80">Guild ID</p>
                  <h2 className="text-3xl font-semibold">COD-3221</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-2 text-sm font-semibold text-cyan-100">
                  Creator only
                </div>
              </div>
              <p className="text-sm leading-6 text-cyan-100/80">
                Only the creator may assign admins. Admins help moderate but cannot remove each other.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <article className="space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Announcements</p>
                    <h3 className="text-xl font-semibold text-white">Mission briefings</h3>
                  </div>
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs uppercase text-cyan-200">Admin only</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Admin announcements help set the next drop zone, command roles, and tournament schedules.
                </p>
                <div className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-slate-300">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Night ops scheduled for 10:00 PM.</p>
                    <p className="text-sm">Team Alpha covers the east flank, B covers support.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>by Admin Venom</span>•<span>Locked</span>
                  </div>
                </div>
              </article>

              <article className="space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Pinned message</p>
                    <h3 className="text-xl font-semibold text-white">Tactical note</h3>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-3 py-1 text-xs uppercase text-amber-200">Pinned</span>
                </div>
                <p className="text-sm leading-6 text-slate-300">
                  Pins are ideal for important rules and group coordination so everyone sees the same objectives.
                </p>
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 text-slate-200">
                  <p className="font-semibold">Always hold the ridge until reinforcements arrive.</p>
                  <p className="mt-2 text-sm text-slate-400">Pinned by creator only.</p>
                </div>
              </article>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Group chat</p>
                  <h3 className="text-2xl font-semibold text-white">Combat channel</h3>
                </div>
                <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs uppercase text-slate-300">Crew</span>
              </div>
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl bg-slate-950/90 p-4 text-slate-200 shadow-inner shadow-black/20">
                  <p className="text-sm font-semibold text-white">Creator Ghost</p>
                  <p className="mt-2 text-sm text-slate-300">"Stack up on the left ridge and wait for the flash. No charge without orders."</p>
                </div>
                <div className="rounded-3xl bg-slate-950/80 p-4 text-slate-200">
                  <p className="text-sm font-semibold text-cyan-300">Admin Venom</p>
                  <p className="mt-2 text-sm text-slate-300">"Squad 2, secure the supply line and protect the rear gate."</p>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Honorable mention</p>
              <div className="mt-4 flex items-center gap-4 rounded-3xl bg-cyan-500/10 p-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-2xl">🎖️</div>
                <div>
                  <p className="text-xl font-semibold text-white">Venom</p>
                  <p className="text-sm text-slate-300">Most reliable support and objective control.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Waiting list</p>
                  <h3 className="text-2xl font-semibold text-white">Pending recruits</h3>
                </div>
                <span className="rounded-full bg-slate-700/75 px-3 py-1 text-xs uppercase text-slate-200">2 waiting</span>
              </div>
              <ul className="mt-5 space-y-3 text-sm text-slate-300">
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">DeltaFox — waiting for creator approval</li>
                <li className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">BladeRunner — waiting for creator approval</li>
              </ul>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Complaints</p>
                  <h3 className="text-2xl font-semibold text-white">Issue tracker</h3>
                </div>
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs uppercase text-amber-200">Review</span>
              </div>
              <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-slate-300">
                <p className="font-semibold text-white">Team coordination needs faster response time.</p>
                <p className="mt-2 text-sm leading-6">Only the guild creator approves new members and resolves complaints.</p>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Connect</p>
                  <h3 className="text-2xl font-semibold text-white">WhatsApp</h3>
                </div>
                <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs uppercase text-cyan-200">Optional</span>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                Share a group number for outside coordination if the creator wants to connect players over chat.
              </p>
              <button className="mt-5 w-full rounded-3xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                Connect to WhatsApp
              </button>
            </div>
          </aside>
        </section>

        <div className="flex flex-col gap-3 rounded-[32px] border border-white/10 bg-slate-950/60 p-6 text-slate-400 shadow-2xl">
          <p className="text-sm uppercase tracking-[0.2em]">Guild rules</p>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/90 p-4">Creator appoints up to 5 admins.</div>
            <div className="rounded-3xl bg-slate-900/90 p-4">Admins moderate announcements and chat.</div>
            <div className="rounded-3xl bg-slate-900/90 p-4">New users join only after approval.</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-400">
          <Link href="/" className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 transition hover:border-cyan-300/50 hover:text-white">
            Back to home
          </Link>
          <Link href="/free-fire" className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 transition hover:border-orange-300/50 hover:text-white">
            View Free Fire theme
          </Link>
        </div>
      </div>
    </main>
  );
}
