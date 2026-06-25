"use client";

import { useState } from "react";
import Link from "next/link";
import { useGuildContext } from "../components/GuildStateProvider";

export default function ProfilePage() {
  const {
    currentUser,
    getUserGuildMemberships,
    disbandGuild,
    transferOwnership,
    leaveGuild,
    issueCreationCode,
  } = useGuildContext();

  const memberships = getUserGuildMemberships();
  const [transferTarget, setTransferTarget] = useState("");
  const [message, setMessage] = useState("");
  const [codeUid, setCodeUid] = useState("");
  const [codeResult, setCodeResult] = useState(null);

  if (!currentUser) return <div>Loading...</div>;

  const handleDisband = async (guildId) => {
    if (window.confirm("Are you sure you want to disband this guild? This action cannot be undone.")) {
      const res = await disbandGuild(guildId);
      if (res.error) setMessage(res.error);
      else setMessage("Guild disbanded.");
    }
  };

  const handleTransfer = async (guildId) => {
    if (!transferTarget) return setMessage("Enter member id to transfer to.");
    if (window.confirm(`Are you sure you want to transfer ownership to ${transferTarget}? You will lose creator privileges.`)) {
      const res = await transferOwnership(guildId, transferTarget);
      if (res.error) setMessage(res.error);
      else setMessage("Ownership transferred.");
    }
  };

  const handleLeave = async (guildId) => {
    if (window.confirm("Are you sure you want to leave this guild?")) {
      const res = await leaveGuild(guildId);
      if (res.error) setMessage(res.error);
      else setMessage("Left guild.");
    }
  };

  const handleIssueCode = async () => {
    const target = codeUid || currentUser.id;
    const res = await issueCreationCode(target, 3);
    setCodeResult(res);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-3xl font-semibold">Your profile</h1>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <p className="text-sm text-slate-400">UID</p>
          <p className="font-mono text-sm text-white">{currentUser.id}</p>
          <p className="mt-4 text-sm text-slate-400">Name</p>
          <p className="text-lg font-semibold text-white">{currentUser.name}</p>
          <p className="mt-4 text-sm text-slate-400">Email</p>
          <p className="text-sm text-slate-300">{currentUser.email || '—'}</p>
          <p className="mt-4 text-sm text-slate-400">Role</p>
          <p className="text-sm text-slate-300">{currentUser.role}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold">Your guilds</h2>
          {memberships.length ? (
            memberships.map(({ guild, member }) => (
              <div key={guild.id} className="mt-4 rounded-2xl border border-white/5 p-4">
                <p className="text-sm text-slate-400">{guild.game}</p>
                <p className="text-lg font-semibold text-white">{guild.name}</p>
                <p className="text-sm text-slate-300">Role: {member.role}</p>
                <div className="mt-3 flex gap-3">
                  {member.role === "creator" ? (
                    <>
                      <button onClick={() => handleDisband(guild.id)} className="rounded-full bg-red-600 px-3 py-2 text-sm">Disband</button>
                      <input
                        placeholder="member id to transfer"
                        value={transferTarget}
                        onChange={(e) => setTransferTarget(e.target.value)}
                        className="px-3 py-2 rounded-2xl bg-slate-800 text-sm"
                      />
                      <button onClick={() => handleTransfer(guild.id)} className="rounded-full bg-amber-500 px-3 py-2 text-sm">Transfer</button>
                    </>
                  ) : (
                    <button onClick={() => handleLeave(guild.id)} className="rounded-full bg-slate-700 px-3 py-2 text-sm">Leave</button>
                  )}
                  <Link href={`/guild/${guild.slug}`} className="rounded-full bg-cyan-500 px-3 py-2 text-sm">View</Link>
                </div>
              </div>
            ))
          ) : (
            <p className="mt-3 text-sm text-slate-400">You are not a member of any guilds.</p>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-xl font-semibold">Request paid second guild</h2>
          <p className="text-sm text-slate-400">Contact via WhatsApp to purchase; the spectator can issue a one-time code valid for 3 hours.</p>
          <p className="mt-2 text-sm">WhatsApp: <a className="text-cyan-300" href={`https://wa.me/2547049128975?text=Purchase%20second%20guild%20for%20UID:%20${currentUser.id}`}>Contact</a></p>

          <div className="mt-4">
            <p className="text-sm text-slate-400">If you already have a code, enter it below:</p>
            <input value={codeUid} onChange={(e) => setCodeUid(e.target.value)} placeholder="Enter code (or leave blank to issue for yourself as spectator)" className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none" />
            <div className="mt-3 flex gap-3">
              <button onClick={handleIssueCode} className="rounded-full bg-emerald-500 px-4 py-2 text-sm">Issue code (spectator only)</button>
              {codeResult ? <p className="text-sm text-emerald-300">{codeResult.code ? `Code: ${codeResult.code.code}` : JSON.stringify(codeResult)}</p> : null}
            </div>
          </div>
        </div>

        {message ? <p className="text-sm text-amber-300">{message}</p> : null}
      </div>
    </main>
  );
}
