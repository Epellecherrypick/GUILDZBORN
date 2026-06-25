"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AvatarUploader from "../../components/AvatarUploader";
import { useGuildContext } from "../../components/GuildStateProvider";

// This is the Client Component that contains all the interactive logic.
// It receives the initial guild data as a prop from the Server Component.
export default function GuildDetailsClient({ initialGuild }) {
  const { slug } = useParams();
  const {
    getGuildBySlug,
    currentUser,
    activeGuildId,
    getAdminGuilds,
    joinGuild,
    sendChallengeRequest,
    setChallengeTime,
    acceptChallenge,
    rejectChallenge,
    approveMember,
    rejectMember,
    uploadGuildAvatar,
    submitMatchProof,
    getGuildById,
    challenges,
    promoteGuild,
  } = useGuildContext();

  // Use the initial guild data passed from the server, but fall back to the context
  // to ensure the data is always up-to-date after client-side actions.
  const guildFromContext = useMemo(() => getGuildBySlug(slug), [getGuildBySlug, slug]);
  const guild = guildFromContext || initialGuild;
  const isMember = guild?.members.some((member) => member.id === currentUser.id && member.status === "accepted");
  const isCreator = guild?.creator.id === currentUser.id;
  const isAdmin = guild?.members.some(
    (member) => member.id === currentUser.id && (member.role === "creator" || member.role === "admin")
  );
  const isActiveGuild = activeGuildId === guild?.id;
  const hasOtherActiveGuild = activeGuildId && activeGuildId !== guild?.id;
  const pendingRequest = guild?.pendingRequests.some((request) => request.id === currentUser.id);
  const adminGuilds = getAdminGuilds();
  const hasAdminGuild = adminGuilds.length > 0 && adminGuilds.some((adminGuild) => adminGuild.id !== guild.id);
  const guildChallenges = challenges.filter((challenge) => challenge.targetGuildId === guild?.id && challenge.status === "pending");
  const rivalAccepted = challenges.filter((challenge) => challenge.targetGuildId === guild?.id && challenge.status === "accepted");

  const [challengeTimeMap, setChallengeTimeMap] = useState({});
  const [proofScore, setProofScore] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [joinFeedback, setJoinFeedback] = useState("");
  const [challengeFeedback, setChallengeFeedback] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [promotionFeedback, setPromotionFeedback] = useState("");

  if (!guild) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-center px-6 py-20 text-center">
          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-12">
            <h1 className="text-3xl font-semibold">Guild not found</h1>
            <p className="mt-4 text-slate-400">The guild you are looking for does not exist yet.</p>
            <Link href="/" className="mt-6 inline-flex rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              Return home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const handleJoin = () => {
    const result = joinGuild(guild.id);
    setJoinFeedback(result.error || "Your request has been submitted to the creator.");
  };

  const handleChallenge = () => {
    const result = sendChallengeRequest(guild.id);
    setChallengeFeedback(result.error || "Your challenge request has been sent to the guild creator.");
  };

  const handleTimeUpdate = (challengeId, isoTime) => {
    const result = setChallengeTime(challengeId, isoTime);
    if (result.error) {
      setChallengeFeedback(result.error);
      return;
    }
    setChallengeTimeMap((current) => ({ ...current, [challengeId]: isoTime }));
  };

  const handleProofSubmit = (challengeId) => {
    if (!proofScore || !proofUrl) {
      setChallengeFeedback("Provide both a score and proof screenshot URL.");
      return;
    }
    submitMatchProof(challengeId, currentUser.id, proofUrl, proofScore);
    setChallengeFeedback("Proof submitted. The spectator admin will review it.");
  };

  const requestChallengeAction = () => {
    if (!hasAdminGuild) {
      setChallengeFeedback("You need to be a creator or admin in another guild to request a challenge.");
      return;
    }
    handleChallenge();
  };

  const creatorIsViewing = isCreator || isAdmin;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="rounded-[36px] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.18),transparent_28%),_linear-gradient(180deg,_#07121d_0%,_#02050b_100%)] p-8 shadow-2xl shadow-orange-500/10">
          <div className="grid gap-8 xl:grid-cols-[1.4fr_0.95fr] xl:items-center">
            <div className="space-y-5">
              <p className="text-sm uppercase tracking-[0.32em] text-orange-300">Guild profile</p>
              <h1 className="text-5xl font-semibold tracking-tight text-white">{guild.name}</h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">{guild.description}</p>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-orange-500/15 px-4 py-2 text-sm text-orange-100">{guild.game}</span>
                <span className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200">{guild.members.length} members</span>
                <span className="rounded-full bg-slate-900/80 px-4 py-2 text-sm text-slate-200">{guild.points} points</span>
              </div>
            </div>
            <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <img src={guild.creator.avatar} alt="Creator avatar" className="h-20 w-20 rounded-full object-cover" />
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Creator</p>
                  <h2 className="text-2xl font-semibold text-white">{guild.creator.name}</h2>
                </div>
              </div>
              <div className="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p>
                  Guild creator has admin privileges. Only the creator can appoint admins and promote the guild.
                </p>
                <p>Admins may moderate chat and handle complaints, but they cannot remove other admins.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Guild view</p>
                  <h2 className="text-2xl font-semibold text-white">Membership & challenge access</h2>
                </div>
                <span className="rounded-full bg-slate-700/80 px-3 py-1 text-xs uppercase text-slate-300">{isActiveGuild ? "Active member" : isMember ? "Member preview" : "Profile only"}</span>
              </div>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <h3 className="text-lg font-semibold text-white">Creator code</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Use this code to verify guild identity and confirm membership requests.</p>
                  <p className="mt-4 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-100">{guild.joinCode}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <h3 className="text-lg font-semibold text-white">Honored player</h3>
                  <div className="mt-4 flex items-center gap-4">
                    <img src={guild.honoredPlayer.avatar} alt="honored player" className="h-16 w-16 rounded-full object-cover" />
                    <div>
                      <p className="text-base font-semibold text-white">{guild.honoredPlayer.name}</p>
                      <p className="text-sm text-slate-400">{guild.honoredPlayer.title}</p>
                    </div>
                  </div>
                </div>
              </div>

              {!isActiveGuild && !isMember ? (
                <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <p className="text-sm text-slate-300">Only guild profiles are visible until you are accepted into this guild.</p>
                  {pendingRequest ? (
                    <p className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-200">Your join request is waiting for creator approval.</p>
                  ) : (
                    <button
                      onClick={handleJoin}
                      className="rounded-3xl bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                    >
                      Request to join guild
                    </button>
                  )}
                  {hasOtherActiveGuild ? (
                    <p className="text-sm text-slate-400">
                      You are already a member of another guild. Only your first accepted guild remains active.
                    </p>
                  ) : null}
                  {hasAdminGuild ? (
                    <button
                      onClick={requestChallengeAction}
                      className="rounded-3xl border border-white/10 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Request challenge from another admin guild
                    </button>
                  ) : null}
                  {joinFeedback ? <p className="text-sm text-emerald-300">{joinFeedback}</p> : null}
                  {challengeFeedback ? <p className="text-sm text-emerald-300">{challengeFeedback}</p> : null}
                  {promotionFeedback ? <p className="text-sm text-amber-300">{promotionFeedback}</p> : null}
                </div>
              ) : null}

              {isActiveGuild ? (
                <div className="mt-6 space-y-5 rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">Active guild dashboard</h3>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs uppercase text-emerald-200">Full access</span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                      <p className="font-semibold text-white">Guild permissions</p>
                      <p className="mt-2 text-sm leading-6">Only the creator can appoint admins and pin messages. Admins moderate complaints and chat.</p>
                    </div>
                    <div className="rounded-3xl bg-slate-900/90 p-4 text-slate-300">
                      <p className="font-semibold text-white">Score submission</p>
                      <p className="mt-2 text-sm leading-6">After matches, creators can upload proof to the spectator admin panel within two days.</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {creatorIsViewing ? (
              <div className="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Creator actions</p>
                    <h2 className="text-2xl font-semibold text-white">Approve members & manage challenges</h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input
                      value={promotionCode}
                      onChange={(event) => setPromotionCode(event.target.value)}
                      placeholder="Enter paid promotion code"
                      className="rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                    />
                    <button
                      onClick={async () => {
                        const result = await promoteGuild(guild.id, promotionCode);
                        setPromotionFeedback(result.error || "Guild promoted successfully.");
                      }}
                      className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                    >
                      Promote guild
                    </button>
                  </div>
                </div>

                {guild.pendingRequests.length ? (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Waiting list</h3>
                    {guild.pendingRequests.map((request) => (
                      <div key={request.id} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-slate-900/90 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-semibold text-white">{request.name}</p>
                            <p className="text-sm text-slate-400">Requested at {new Date(request.requestedAt).toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveMember(guild.id, request.id)}
                              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectMember(guild.id, request.id)}
                              className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-slate-400">No pending join requests at the moment.</p>
                )}

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold text-white">Challenge requests</h3>
                  {guildChallenges.length ? (
                    guildChallenges.map((challenge) => (
                      <div key={challenge.id} className="rounded-3xl border border-white/10 bg-slate-900/90 p-4">
                        <p className="text-sm text-slate-300">{challenge.message}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-500">Requested: {new Date(challenge.requestedAt).toLocaleString()}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_auto]">
                          <div className="space-y-3">
                            <label className="block text-sm text-slate-300">Match time</label>
                            <input
                              type="datetime-local"
                              className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
                              value={challengeTimeMap[challenge.id] || challenge.matchTime || ""}
                              onChange={(event) => handleTimeUpdate(challenge.id, event.target.value)}
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => acceptChallenge(challenge.id)}
                              className="rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectChallenge(challenge.id)}
                              className="rounded-3xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No challenge requests pending for this guild.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Guild creator</p>
              <div className="mt-4 flex items-center gap-4">
                <img src={guild.creator.avatar} alt="creator avatar" className="h-20 w-20 rounded-full object-cover" />
                <div>
                  <p className="text-xl font-semibold text-white">{guild.creator.name}</p>
                  <p className="text-sm text-slate-400">Guild creator and admin owner</p>
                </div>
              </div>
              {isCreator ? (
                <AvatarUploader currentAvatar={guild.creator.avatar} onUpload={(url) => uploadGuildAvatar(guild.id, url)} />
              ) : null}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Match board</p>
              {rivalAccepted.length ? (
                rivalAccepted.map((challenge) => {
                  const challengerGuild = getGuildById(challenge.challengerGuildId);
                  return (
                    <div key={challenge.id} className="mt-4 rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                      <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Scheduled match</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{challengerGuild?.name} vs {guild.name}</h3>
                      <p className="mt-2 text-sm text-slate-300">Planned for {challenge.matchTime ? new Date(challenge.matchTime).toLocaleString() : "no time set yet"}</p>
                      <Link href="/challenges" className="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
                        Go to challenges board
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="mt-4 text-sm text-slate-400">No accepted matches have been scheduled yet.</p>
              )}
            </div>

            {isCreator && rivalAccepted.length ? (
              <div className="rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Submit proof</p>
                <p className="mt-3 text-sm text-slate-300">Upload your match score screenshot or paste a proof link.</p>
                <input
                  type="text"
                  placeholder="Screenshot or Cloudinary URL"
                  value={proofUrl}
                  onChange={(event) => setProofUrl(event.target.value)}
                  className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Match score or summary"
                  value={proofScore}
                  onChange={(event) => setProofScore(event.target.value)}
                  className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                />
                <button
                  onClick={() => handleProofSubmit(rivalAccepted[0].id)}
                  className="mt-4 w-full rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Submit match proof
                </button>
                {challengeFeedback ? <p className="mt-3 text-sm text-emerald-300">{challengeFeedback}</p> : null}
              </div>
            ) : null}
          </aside>
        </section>

        <div className="flex flex-wrap gap-3 text-sm text-slate-400">
          <Link href="/" className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 transition hover:border-orange-300/50 hover:text-white">
            Back to home
          </Link>
          <Link href="/challenges" className="rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 transition hover:border-cyan-300/50 hover:text-white">
            Challenges board
          </Link>
        </div>
      </div>
    </main>
  );
}