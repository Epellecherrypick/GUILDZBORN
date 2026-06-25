"use client";

import Link from "next/link";
import { useGuildContext } from "../components/GuildStateProvider";

export default function ChallengesPage() {
  const { challenges, getGuildById } = useGuildContext();
  const upcomingMatches = challenges.filter((challenge) => challenge.status === "accepted" && challenge.matchTime);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="rounded-[36px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Challenges</p>
            <h1 className="text-4xl font-semibold text-white">Current match board</h1>
            <p className="max-w-3xl text-slate-300">
              Matches accepted by guild creators show here with the agreed time, participating teams, and proof submissions.
            </p>
          </div>

          {upcomingMatches.length ? (
            <div className="mt-10 grid gap-6">
              {upcomingMatches.map((challenge) => {
                const challenger = getGuildById(challenge.challengerGuildId);
                const target = getGuildById(challenge.targetGuildId);
                return (
                  <div key={challenge.id} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 shadow-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Match request</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">
                          {challenger?.name} vs {target?.name}
                        </h2>
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-3 py-2 text-sm uppercase text-cyan-200">
                        Scheduled
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Match time</p>
                        <p className="mt-3 text-base text-white">{new Date(challenge.matchTime).toLocaleString()}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Creators</p>
                        <p className="mt-3 text-base text-white">{challenger?.creator.name} & {target?.creator.name}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Proofs submitted</p>
                        <p className="mt-3 text-base text-white">{challenge.scoreProofs.length} total</p>
                      </div>
                    </div>
                    {challenge.finalResult ? (
                      <div className="mt-6 rounded-3xl bg-emerald-500/10 p-4 text-slate-100">
                        <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">Final result</p>
                        <p className="mt-2 text-base leading-6">
                          Winner: {getGuildById(challenge.finalResult.winningGuildId)?.name}
                        </p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-[32px] border border-white/10 bg-slate-950/80 p-10 text-center text-slate-300">
              <p className="text-lg font-semibold text-white">No active matches are scheduled yet.</p>
              <p className="mt-3">Challenge requests will appear here once a creator accepts and sets the match time.</p>
            </div>
          )}
        </section>

        <Link href="/" className="inline-flex w-fit rounded-full border border-white/10 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:text-cyan-200">
          Back to home
        </Link>
      </div>
    </main>
  );
}
