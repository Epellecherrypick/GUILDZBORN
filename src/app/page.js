﻿"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useGuildContext } from "./components/GuildStateProvider";

export default function Home() {
  const context = useGuildContext();

  // Gracefully handle when context is not available (e.g., during error page rendering)
  if (!context.guilds) {
    return null; // Render nothing if the context is not the full, hydrated state
  }

  const { currentGuilds, currentUser, loggedIn, selectedGame, activeGuildId, getUserGuild, signupUser, loginUser, login, logout, setSelectedGame, loginAsSpectator, createGuild } = context;
  const [selectedSlug, setSelectedSlug] = useState(currentGuilds?.[0]?.slug || "");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [spectatorPassword, setSpectatorPassword] = useState("");
  const [guildName, setGuildName] = useState("");
  const [guildDescription, setGuildDescription] = useState("");
  const [guildCode, setGuildCode] = useState("");
  const [guildPaymentCode, setGuildPaymentCode] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [createFeedback, setCreateFeedback] = useState("");

  const gameOptions = useMemo(
    () => [...new Set(currentGuilds.map((guild) => guild.game))],
    [currentGuilds]
  );

  const filteredGuilds = useMemo(
    () => (selectedGame ? currentGuilds.filter((guild) => guild.game === selectedGame) : currentGuilds),
    [currentGuilds, selectedGame]
  );

  useEffect(() => {
    if (filteredGuilds.length && !filteredGuilds.some((guild) => guild.slug === selectedSlug)) {
      setSelectedSlug(filteredGuilds[0].slug);
    }
  }, [filteredGuilds, selectedSlug]);

  const selectedGuild = useMemo(
    () => filteredGuilds.find((guild) => guild.slug === selectedSlug) || filteredGuilds?.[0],
    [filteredGuilds, selectedSlug]
  );

  const userGuild = getUserGuild();
  const showGuildButton = loggedIn && userGuild;
  const showCreateJoinButtons = loggedIn && !userGuild && currentUser.role !== "spectator";
  const showSpectatorLogin = !loggedIn || currentUser.role !== "spectator";

  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setAuthMessage(`Game selected: ${game}. Create an account to continue.`);
  };

  const handleCreateAccount = () => {
    return (async () => {
      if (!selectedGame) {
        setAuthMessage("Choose your game first.");
        return;
      }
      if (!name || !email) {
        setAuthMessage("Enter both a name and email to create your account.");
        return;
      }
      const uid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}-${Math.floor(Math.random()*1e6)}`;
      const result = await signupUser({ uid, name, email, avatar: "https://res.cloudinary.com/demo/image/upload/w_128,h_128,c_fill,q_auto/v1/sample.jpg" });
      if (result.error) {
        setAuthMessage(result.error);
        return;
      }
      setAuthMessage("Welcome! Account created and signed in.");
    })();
  };

  const handleLogin = () => {
    return (async () => {
      if (!selectedGame) {
        setAuthMessage("Choose a game first.");
        return;
      }
      if (!loginEmail) {
        setAuthMessage("Enter your login email.");
        return;
      }
      // try backend login by email
      const result = await loginUser({ email: loginEmail });
      if (result.error) {
        // fallback to local session-only login
        const uid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}-${Math.floor(Math.random()*1e6)}`;
        login({
          id: uid,
          name: loginName || "Player",
          email: loginEmail,
          avatar: "https://res.cloudinary.com/demo/image/upload/w_128,h_128,c_fill,q_auto/v1/sample.jpg",
          role: "member",
        });
        setAuthMessage(`Signed in locally as ${loginName || "Player"}.`);
        return;
      }
      setAuthMessage(`Signed in as ${result.user.name || loginName || "Player"}.`);
    })();
  };

  const handleSpectatorLogin = async () => {
    const result = await loginAsSpectator(spectatorPassword);
    if (result.error) {
      setAuthMessage(result.error);
    } else {
      setAuthMessage("Spectator access granted.");
    }
  };

  const handleCreateGuild = async (creationCode) => {
    const result = await createGuild({
      game: selectedGame,
      name: guildName,
      description: guildDescription,
      joinCode: guildCode,
      code: creationCode,
    });
    if (result.error) {
      setCreateFeedback(result.error);
      return;
    }
    setCreateFeedback(`Guild created: ${result.guild.name}`);
    setGuildName("");
    setGuildDescription("");
    setGuildCode("");
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <section className="rounded-3xl border border-white/10 bg-slate-950 p-8 shadow-2xl">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-wide text-slate-400">Guild Watch</p>
              <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                Discover guilds, review creators, and request your team entry.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Select a guild below to explore creator-led teams, apply for membership, and access the leaderboard once accepted.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-cyan-600/10">
              <p className="text-sm uppercase tracking-wide text-cyan-300">Your profile</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{currentUser?.name || "Guest"}</h2>
              <p className="mt-4 text-slate-300">
                {activeGuildId
                  ? "You already have one active guild membership. Pending requests are held until your current guild is accepted."
                  : "Request access to one guild at a time and get approved to unlock full features."}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {userGuild ? (
                  <Link
                    href={`/guild/${userGuild.slug}`}
                    className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    My Guild
                  </Link>
                ) : null}
                {loggedIn && !userGuild && currentUser.role !== "spectator" ? (
                  <Link
                    href={`/guild/${selectedGuild?.slug}`}
                    className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                  >
                    Join selected guild
                  </Link>
                ) : null}
                <Link href="/challenges" className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                  View challenges
                </Link>
                <Link href="/admin-spectator" className="rounded-full border border-white/10 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-300/50 hover:text-orange-200">
                  Spectator panel
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Start here</p>
                <h2 className="text-3xl font-semibold text-white">Pick your game and unlock access</h2>
              </div>
              <div className="rounded-full border border-slate-700/80 bg-slate-950/90 px-4 py-2 text-sm text-slate-300">
                {selectedGame || "No game selected"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {gameOptions.map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => handleSelectGame(game)}
                  className={`rounded-3xl border px-5 py-4 text-left text-sm font-semibold transition ${
                    selectedGame === game
                      ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                      : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-300/50 hover:bg-slate-950/90"
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-300">First-time guests must choose a game before creating an account or requesting guild membership.</p>
              {authMessage ? <p className="mt-3 text-sm text-emerald-300">{authMessage}</p> : null}
            </div>
          </div>

          <aside className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Account access</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">{loggedIn ? "Welcome back" : "Create your account"}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {loggedIn
                  ? "You are signed in. Browse guilds for your chosen game and access your profile."
                  : "Create an account after choosing your game. Spectator access is available with the secret password."}
              </p>
            </div>

            {!loggedIn ? (
              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Existing user login</p>
                  <div>
                    <label className="block text-sm text-slate-300">Email</label>
                    <input
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300">Name (optional)</label>
                    <input
                      value={loginName}
                      onChange={(event) => setLoginName(event.target.value)}
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Login
                  </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Create a new account</p>
                  <div>
                    <label className="block text-sm text-slate-300">Name</label>
                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300">Email</label>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button
                    onClick={handleCreateAccount}
                    className="w-full rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                  >
                    Create account
                  </button>
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">Spectator login</p>
                  <p className="mt-2 text-sm text-slate-400">Use a spectator password to access admin review tools.</p>
                  <input
                    value={spectatorPassword}
                    onChange={(event) => setSpectatorPassword(event.target.value)}
                    className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                    placeholder="Spectator password"
                  />
                  <button
                    type="button"
                    onClick={handleSpectatorLogin}
                    className="mt-3 w-full rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Login as spectator
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
                  <p className="text-sm text-slate-300">Signed in as {currentUser.name}.</p>
                  <button
                    onClick={logout}
                    className="w-full rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
                  >
                    Sign out
                  </button>
                </div>

                {currentUser.role !== "spectator" ? (
                  <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 space-y-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Create a guild</p>
                    <div>
                      <label className="block text-sm text-slate-300">Guild name</label>
                      <input
                        value={guildName}
                        onChange={(event) => setGuildName(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                        placeholder="Name your guild"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300">Description</label>
                      <textarea
                        value={guildDescription}
                        onChange={(event) => setGuildDescription(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                        rows={3}
                        placeholder="Describe your guild"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300">Invite code</label>
                      <input
                        value={guildCode}
                        onChange={(event) => setGuildCode(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                        placeholder="Enter a join code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300">Paid creation code (optional)</label>
                      <input
                        value={guildPaymentCode}
                        onChange={(event) => setGuildPaymentCode(event.target.value)}
                        className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
                        placeholder="Enter creation code if you paid"
                      />
                      <p className="mt-2 text-xs text-slate-400">If you need to purchase a second guild, contact us on WhatsApp: <a href={`https://wa.me/2547049128975?text=Purchase%20second%20guild%20for%20UID:%20${currentUser.id}`} className="text-cyan-300">WhatsApp</a></p>
                    </div>
                    <button
                      onClick={() => handleCreateGuild(guildPaymentCode)}
                      className="w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Create guild
                    </button>
                    {createFeedback ? <p className="text-sm text-emerald-300">{createFeedback}</p> : null}
                  </div>
                ) : null}
              </>
            )}
          </aside>
        </section>

        {selectedGame ? (
          <section className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Guild list</p>
                <h2 className="text-3xl font-semibold text-white">Available guilds</h2>
              </div>
              <div className="rounded-full border border-slate-700/80 bg-slate-950/90 px-4 py-2 text-sm text-slate-300">
                Select a guild to explore details
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {filteredGuilds.map((guild) => (
                <button
                  key={guild.id}
                  type="button"
                  onClick={() => setSelectedSlug(guild.slug)}
                  className={`group w-full rounded-3xl border px-6 py-5 text-left transition ${
                    selectedGuild?.id === guild.id
                      ? "border-cyan-400/50 bg-slate-950/80 shadow-lg"
                      : "border-white/10 bg-slate-900/70 hover:border-cyan-300/50 hover:bg-slate-950/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{guild.game}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{guild.name}</h3>
                    </div>
                    {guild.promoted ? (
                      <span className="rounded-full bg-emerald-400/15 px-3 py-2 text-xs uppercase tracking-[0.24em] text-emerald-200">
                        Promoted
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">{guild.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span>{guild.members.length} member(s)</span>
                    <span className="inline-flex h-2 w-2 rounded-full bg-slate-500" />
                    <span>{guild.pendingRequests.length} waiting</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-5 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur-xl">
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Selected guild</p>
              <h3 className="mt-3 text-3xl font-semibold text-white">{selectedGuild?.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{selectedGuild?.description}</p>
              <div className="mt-6 grid gap-4 border-t border-white/10 pt-5 text-sm text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Creator</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">{selectedGuild?.creator.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Honored player</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">{selectedGuild?.honoredPlayer.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Guild code</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">{selectedGuild?.joinCode}</span>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/guild/${selectedGuild?.slug}`}
                  className="inline-flex items-center rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
                >
                  View guild page
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Creator profile</p>
              <div className="mt-4 flex items-center gap-4">
                <img src={selectedGuild?.creator.avatar} alt="Creator avatar" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="text-lg font-semibold text-white">{selectedGuild?.creator.name}</p>
                  <p className="text-sm text-slate-400">Guild creator</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Honored member</p>
              <div className="mt-4 flex items-center gap-4">
                <img src={selectedGuild?.honoredPlayer.avatar} alt="Honored player avatar" className="h-16 w-16 rounded-full object-cover" />
                <div>
                  <p className="text-lg font-semibold text-white">{selectedGuild?.honoredPlayer.name}</p>
                  <p className="text-sm text-slate-400">{selectedGuild?.honoredPlayer.title}</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Guild reach</p>
                  <p className="text-sm text-slate-300">Invitation push and promoted placement for new players.</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-200">
                  {selectedGuild?.inviteCount || 0} invites
                </span>
              </div>
            </div>
          </aside>
        </section>
        ) : (
          <section className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
            <div className="max-w-3xl space-y-5">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Game selection required</p>
              <h2 className="text-3xl font-semibold text-white">Choose a game before browsing guilds</h2>
              <p className="text-slate-300">
                Pick the game you want to play first, then sign in or create an account. This keeps your membership requests aligned with the guild theme.
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                {gameOptions.map((game) => (
                  <button
                    key={game}
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    className={`rounded-3xl border px-5 py-4 text-left text-sm font-semibold transition ${
                      selectedGame === game
                        ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-100"
                        : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-300/50 hover:bg-slate-950/90"
                    }`}
                  >
                    {game}
                  </button>
                ))}
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-300">
                {authMessage || "After selecting a game, create an account to continue."}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
