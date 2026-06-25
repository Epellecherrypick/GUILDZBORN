"use client";

import Link from "next/link";
import { useState } from "react";
import { useGuildContext } from "../components/GuildStateProvider";

export default function AdminSpectatorPage() {
  const {
    websiteComplaints,
    challenges,
    getGuildById,
    submitWebsiteComplaint,
    finalizeMatch,
  } = useGuildContext();
  const [complaintTitle, setComplaintTitle] = useState("");
  const [complaintBody, setComplaintBody] = useState("");
  const [feedback, setFeedback] = useState("");

  const pendingScores = challenges.filter((challenge) => challenge.status === "accepted");

  const handleComplaintSubmit = () => {
    if (!complaintTitle || !complaintBody) {
      setFeedback("Please provide both title and details.");
      return;
    }
    submitWebsiteComplaint(complaintTitle, complaintBody);
    setComplaintTitle("");
    setComplaintBody("");
    setFeedback("Complaint submitted successfully.");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
        <section className="rounded-[36px] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Admin spectator</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Spectator dashboard</h1>
          <p className="mt-4 max-w-3xl text-slate-300">
            Review match proofs, finalize results, and manage website complaints from this admin-only panel.
          </p>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-6 rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Website complaints</h2>
            <div className="space-y-4">
              {websiteComplaints.map((complaint) => (
                <div key={complaint.id} className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-slate-300">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">{complaint.title}</h3>
                    <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{new Date(complaint.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6">{complaint.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-semibold text-white">Submit new complaint</h2>
            <label className="block text-sm text-slate-300">Title</label>
            <input
              value={complaintTitle}
              onChange={(event) => setComplaintTitle(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
              placeholder="Complaint title"
            />
            <label className="mt-4 block text-sm text-slate-300">Details</label>
            <textarea
              value={complaintBody}
              onChange={(event) => setComplaintBody(event.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
              rows={4}
              placeholder="Describe the website issue"
            />
            <button
              onClick={handleComplaintSubmit}
              className="mt-4 inline-flex rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
            >
              Submit complaint
            </button>
            {feedback ? <p className="mt-3 text-sm text-emerald-300">{feedback}</p> : null}
          </div>
        </section>

        <section className="space-y-6 rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-cyan-300">Match reports</p>
              <h2 className="text-3xl font-semibold text-white">Pending proofs and final scores</h2>
            </div>
          </div>

          <div className="grid gap-5">
            {pendingScores.length ? (
              pendingScores.map((challenge) => {
                const challenger = getGuildById(challenge.challengerGuildId);
                const target = getGuildById(challenge.targetGuildId);
                return (
                  <div key={challenge.id} className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Match</p>
                        <h3 className="mt-2 text-xl font-semibold text-white">{challenger?.name} vs {target?.name}</h3>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-2 text-sm uppercase text-emerald-200">Pending</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">Scheduled for {challenge.matchTime ? new Date(challenge.matchTime).toLocaleString() : "not set"}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Proofs</p>
                        {challenge.scoreProofs.length ? (
                          <ul className="mt-3 space-y-2 text-sm text-slate-200">
                            {challenge.scoreProofs.map((proof) => (
                              <li key={`${challenge.id}-${proof.guildId}`}>
                                {getGuildById(proof.guildId)?.name}: {proof.score}
                                <div className="text-xs text-slate-500">{proof.screenshotUrl}</div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 text-sm text-slate-400">No proof submitted yet.</p>
                        )}
                      </div>
                      <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Finalize result</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          <button
                            onClick={() => finalizeMatch(challenge.id, challenger.id)}
                            className="rounded-3xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                          >
                            {challenger?.name} wins
                          </button>
                          <button
                            onClick={() => finalizeMatch(challenge.id, target.id)}
                            className="rounded-3xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                          >
                            {target?.name} wins
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[28px] border border-white/10 bg-slate-950/80 p-5 text-slate-300">
                <p className="text-sm text-slate-400">No accepted matches waiting for final score updates.</p>
              </div>
            )}
          </div>
        </section>

        <Link href="/" className="inline-flex w-fit rounded-full border border-white/10 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50 hover:text-cyan-200">
          Back to home
        </Link>
      </div>
    </main>
  );
}
