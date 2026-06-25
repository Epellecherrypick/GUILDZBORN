"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { initialState, initialGuestUser, defaultAvatar } from "./guild-data";

const GuildContext = createContext(null);
const STORAGE_KEY = "guildwatch-state";
const SPECTATOR_PASSWORD = "spectator123";

function getActiveGuildId(userId, guilds) {
  const accepted = guilds
    .flatMap((guild) =>
      guild.members
        .filter((member) => member.id === userId && member.status === "accepted")
        .map((member) => ({ guild, joinedAt: member.joinedAt }))
    )
    .sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));

  return accepted.length ? accepted[0].guild.id : null;
}

export function useGuildContext() {
  const context = useContext(GuildContext);
  // If context is missing, return a safe, default version of the context
  // to prevent crashes on pages rendered outside the provider (e.g., error pages).
  if (!context) {
    return {
      ...initialState,
      currentUser: initialGuestUser,
      loggedIn: false,
      spectatorMode: false,
      // Provide empty functions for all actions to prevent "is not a function" errors.
      getUserGuildMemberships: () => [],
      getAdminGuilds: () => [],
    };
  }
  return context;
}

function validateChallengeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  if (isNaN(date.getTime())) {
    return "Please select a valid date and time.";
  }
  if (date < now) {
    return "Challenge time must be in the future.";
  }
  if (date - now > oneWeekMs) {
    return "Matches cannot be scheduled more than one week in advance.";
  }
  return null;
}

export default function GuildStateProvider({ children }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  // Start with the same initial state on server and client to avoid
  // hydration mismatches. Load persisted state from localStorage after
  // hydration in an effect so the first client render matches the server.
  const [state, setState] = useState(() => ({
    ...initialState,
    currentUser: initialGuestUser,
    loggedIn: false,
    selectedGame: null,
    spectatorMode: false,
    authToken: null,
  }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {
      // ignore parse errors and keep the initial state
    }
  }, []);

  const issueCreationCode = useCallback(async (targetUid, hours = 3) => {
    if (state.currentUser.role !== "spectator") {
      return { error: "Only spectator can issue creation codes." };
    }
    try {
      const headers = { "Content-Type": "application/json" };
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const resp = await fetch(`${API_BASE}/api/codes/issue`, {
        method: "POST",
        headers,
        body: JSON.stringify({ uid: targetUid, type: "creation", hours }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: data.error || "Failed to issue code" };
      const entry = data.code;
      setState((current) => ({ ...current, creationCodes: [...(current.creationCodes || []), entry] }));
      return { success: true, code: entry };
    } catch (err) {
      return { error: err.message };
    }
  }, [state.currentUser, state.authToken, API_BASE]);

  const issuePromotionCode = useCallback(async (targetUid, guildId, hours = 3) => {
    if (state.currentUser.role !== "spectator") {
      return { error: "Only spectator can issue promotion codes." };
    }
    try {
      const headers = { "Content-Type": "application/json" };
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const resp = await fetch(`${API_BASE}/api/codes/issue`, {
        method: "POST",
        headers,
        body: JSON.stringify({ uid: targetUid, type: "promotion", guildId, hours }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: data.error || "Failed to issue promotion code" };
      const entry = data.code;
      setState((current) => ({ ...current, promotionCodes: [...(current.promotionCodes || []), entry] }));
      return { success: true, code: entry };
    } catch (err) {
      return { error: err.message };
    }
  }, [state.currentUser, state.authToken, API_BASE]);

  const verifyAndConsumeCreationCode = useCallback((code, uid) => {
    const entry = (state.creationCodes || []).find((c) => c.code === code && c.uid === uid && !c.used);
    if (!entry) return { valid: false, reason: "Invalid or missing code." };
    if (new Date(entry.expiresAt) < new Date()) return { valid: false, reason: "Code expired." };
    const updated = (state.creationCodes || []).map((c) => (c.code === code ? { ...c, used: true } : c));
    setState((current) => ({ ...current, creationCodes: updated }));
    return { valid: true };
  }, [state.creationCodes]);

  const verifyAndConsumePromotionCode = useCallback((code, uid, guildId) => {
    const entry = (state.promotionCodes || []).find(
      (c) => c.code === code && c.uid === uid && !c.used && c.guildId === guildId
    );
    if (!entry) return { valid: false, reason: "Invalid or missing promotion code." };
    if (new Date(entry.expiresAt) < new Date()) return { valid: false, reason: "Promotion code expired." };
    const updated = (state.promotionCodes || []).map((c) => (c.code === code ? { ...c, used: true } : c));
    setState((current) => ({ ...current, promotionCodes: updated }));
    return { valid: true };
  }, [state.promotionCodes]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  useEffect(() => {
    if (!state) return;
    const now = new Date();
    const updatedChallenges = state.challenges.filter((challenge) => {
      if (challenge.status !== "accepted" || !challenge.matchTime) {
        return true;
      }
      return new Date(challenge.matchTime) > now;
    });
    if (updatedChallenges.length !== state.challenges.length) {
      setState((current) => ({ ...current, challenges: updatedChallenges }));
    }
  }, [state.challenges]);

  const activeGuildId = getActiveGuildId(state.currentUser.id, state.guilds);

  const currentGuilds = useMemo(() => {
    const promoted = state.guilds.filter((guild) => guild.promoted);
    const others = state.guilds.filter((guild) => !guild.promoted);
    return [...promoted, ...others];
  }, [state.guilds]);

  const login = useCallback((user) => {
    setState((current) => ({ ...current, currentUser: user, loggedIn: true, spectatorMode: false }));
  }, []);

  const signupUser = useCallback(async ({ uid, name, email, avatar }) => {
    try {
      const resp = await fetch(`${API_BASE}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, name, email, avatar }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: data.error || 'Signup failed' };
      setState((current) => ({ ...current, currentUser: data.user, loggedIn: true, spectatorMode: false, authToken: data.token }));
      return { success: true, user: data.user };
    } catch (err) {
      return { error: err.message };
    }
  }, [API_BASE]);

  const loginUser = useCallback(async ({ uid, email }) => {
    try {
      const payload = {};
      if (uid) payload.uid = uid;
      if (email) payload.email = email;
      const resp = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: data.error || 'Login failed' };
      setState((current) => ({ ...current, currentUser: data.user, loggedIn: true, spectatorMode: false, authToken: data.token }));
      return { success: true, user: data.user };
    } catch (err) {
      return { error: err.message };
    }
  }, [API_BASE]);

  const logout = useCallback(() => {
    setState((current) => ({
      ...current,
      currentUser: initialGuestUser,
      loggedIn: false,
      selectedGame: null,
      spectatorMode: false,
      authToken: null,
    }));
  }, []);

  const setSelectedGame = useCallback((game) => {
    setState((current) => ({ ...current, selectedGame: game }));
  }, []);

  const loginAsSpectator = useCallback((password) => {
    // authenticate via backend to obtain spectator token
    return (async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/auth/spectator`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
        const data = await resp.json();
        if (!resp.ok) return { error: data.error || 'Spectator login failed' };
        setState((current) => ({ ...current, currentUser: data.user, spectatorMode: true, loggedIn: true, authToken: data.token }));
        return { success: true };
      } catch (err) {
        return { error: err.message };
      }
    })();
  }, [API_BASE]);

  const getGuildBySlug = useCallback((slug) => state.guilds.find((guild) => guild.slug === slug), [state.guilds]);

  const getGuildById = useCallback((id) => state.guilds.find((guild) => guild.id === id), [state.guilds]);

  const getUserGuildMemberships = useCallback(() =>
    state.guilds.flatMap((guild) =>
      guild.members
        .filter((member) => member.id === state.currentUser.id)
        .map((member) => ({ guild, member }))
    ), [state.guilds, state.currentUser.id]);

  const getAdminGuilds = useCallback(() =>
    state.guilds.filter((guild) =>
      guild.members.some(
        (member) =>
          member.id === state.currentUser.id && (member.role === "creator" || member.role === "admin")
      )
    ), [state.guilds, state.currentUser.id]);

  const getUserGuild = useCallback(() => {
    const memberships = state.guilds.flatMap((guild) =>
      guild.members
        .filter((member) => member.id === state.currentUser.id)
        .map((member) => ({ guild, member }))
    );
    return memberships.length ? memberships[0].guild : null;
  }, [state.guilds, state.currentUser.id]);

  const createGuild = useCallback(async ({ game, name, description, joinCode, code } = {}) => {
    if (!state.loggedIn || state.currentUser.role === "spectator") {
      return { error: "Log in as a player before creating a guild." };
    }
    if (!game || !name || !description || !joinCode) {
      return { error: "Complete all fields to create a guild." };
    }

    // Try server-side creation first
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const resp = await fetch(`${API_BASE}/api/guilds/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          uid: state.currentUser.id,
          game,
          name,
          description,
          joinCode,
          promotionCode: code,
          creatorName: state.currentUser.name,
          creatorAvatar: state.currentUser.avatar,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: data.error || "Server error creating guild" };
      const guild = data.guild;
      setState((current) => ({ ...current, guilds: [guild, ...current.guilds] }));
      return { success: true, guild };
    } catch (err) {
      return { error: `Network error: ${err.message}. Please try again.` };
    }
  }, [state.loggedIn, state.currentUser, state.authToken, API_BASE]);

  const disbandGuild = (guildId) => {
    const guild = getGuildById(guildId);
    if (!guild) return { error: "Guild not found." };
    if (state.currentUser.id !== guild.creator.id) return { error: "Only the creator can disband this guild." };
    const updated = state.guilds.filter((g) => g.id !== guildId);
    setState((current) => ({ ...current, guilds: updated }));
    return { success: true };
  };

  const transferOwnership = useCallback((guildId, newOwnerId) => {
    const guild = state.guilds.find((guild) => guild.id === guildId);
    if (!guild) return { error: "Guild not found." };
    if (state.currentUser.id !== guild.creator.id) return { error: "Only the creator can transfer ownership." };
    if (!guild.members.some((m) => m.id === newOwnerId)) return { error: "New owner must be a member." };
    const updatedGuilds = state.guilds.map((g) =>
      g.id === guildId
        ? {
            ...g,
            creator: guild.members.find((m) => m.id === newOwnerId) || g.creator,
            admins: Array.from(new Set([...g.admins, newOwnerId])),
            members: g.members.map((m) => (m.id === newOwnerId ? { ...m, role: "creator" } : m.id === state.currentUser.id ? { ...m, role: "member" } : m)),
          }
        : g
    );
    setState((current) => ({ ...current, guilds: updatedGuilds }));
    return { success: true };
  }, [state.guilds, state.currentUser.id]);

  const leaveGuild = useCallback((guildId) => {
    const guild = state.guilds.find((guild) => guild.id === guildId);
    if (!guild) return { error: "Guild not found." };
    if (!guild.members.some((m) => m.id === state.currentUser.id)) return { error: "You are not a member." };
    const member = guild.members.find((m) => m.id === state.currentUser.id);
    if (member.role === "creator") {
      return { error: "Creator cannot leave guild. Transfer ownership or disband the guild first." };
    }
    const updatedGuilds = state.guilds.map((g) =>
      g.id === guildId ? { ...g, members: g.members.filter((m) => m.id !== state.currentUser.id) } : g
    );
    setState((current) => ({ ...current, guilds: updatedGuilds }));
    return { success: true };
  }, [state.guilds, state.currentUser.id]);

  const joinGuild = useCallback((guildId) => {
    if (activeGuildId) {
      return { error: "You have already joined a guild. Only one active guild is allowed." };
    }
    const guild = state.guilds.find((guild) => guild.id === guildId);
    if (!guild) {
      return { error: "Guild not found." };
    }
    if (guild.members.some((member) => member.id === state.currentUser.id)) {
      return { error: "You are already a member of this guild." };
    }
    if (guild.pendingRequests.some((request) => request.id === state.currentUser.id)) {
      return { error: "You already have a pending request for this guild." };
    }

    const updatedGuilds = state.guilds.map((target) =>
      target.id === guildId
        ? {
            ...target,
            pendingRequests: [
              ...target.pendingRequests,
              {
                id: state.currentUser.id,
                name: state.currentUser.name,
                requestedAt: new Date().toISOString(),
              },
            ],
          }
        : target
    );

    setState((current) => ({ ...current, guilds: updatedGuilds }));
    return { success: true };
  }, [activeGuildId, state.guilds, state.currentUser]);

  const approveMember = useCallback((guildId, userId) => {
    const updatedGuilds = state.guilds.map((guild) => {
      if (guild.id !== guildId) return guild;
      const request = guild.pendingRequests.find((request) => request.id === userId);
      if (!request) return guild;
      return {
        ...guild,
        pendingRequests: guild.pendingRequests.filter((request) => request.id !== userId),
        members: [
          ...guild.members,
          {
            id: request.id,
            name: request.name,
            role: "member",
            status: "accepted",
            joinedAt: new Date().toISOString(),
          },
        ],
      };
    });
    setState((current) => ({ ...current, guilds: updatedGuilds }));
  }, [state.guilds]);

  const rejectMember = useCallback((guildId, userId) => {
    const updatedGuilds = state.guilds.map((guild) =>
      guild.id === guildId
        ? {
            ...guild,
            pendingRequests: guild.pendingRequests.filter((request) => request.id !== userId),
          }
        : guild
    );
    setState((current) => ({ ...current, guilds: updatedGuilds }));
  }, [state.guilds]);

  const promoteGuild = useCallback(async (guildId, code) => {
    if (!state.loggedIn || state.currentUser.role === "spectator") {
      return { error: "Only a signed-in guild creator may promote a guild with a valid paid code." };
    }
    const guild = state.guilds.find((guild) => guild.id === guildId);
    if (!guild) return { error: "Guild not found." };
    if (guild.creator.id !== state.currentUser.id) {
      return { error: "Only the creator can promote this guild." };
    }
    if (!code) {
      return {
        error:
          "Promotion requires payment. Contact WhatsApp to purchase a promotion code, then enter the code here.",
      };
    }
    // Try server-side promotion
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (state.authToken) headers.Authorization = `Bearer ${state.authToken}`;
      const resp = await fetch(`${API_BASE}/api/guilds/${guild.id}/promote`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ uid: state.currentUser.id, promotionCode: code }),
      });
      const data = await resp.json();
      if (!resp.ok) return { error: data.error || "Server error promoting guild" };
      const updatedGuild = data.guild;
      const updatedGuilds = state.guilds.map((g) => (g.id === updatedGuild.id ? updatedGuild : g));
      setState((current) => ({ ...current, guilds: updatedGuilds }));
      return { success: true, guild: updatedGuild };
    } catch (err) {
      return { error: `Network error: ${err.message}. Please try again.` };
    }
  }, [state.loggedIn, state.currentUser, state.guilds, state.authToken, API_BASE]);

  const sendChallengeRequest = useCallback((targetGuildId) => {
    const adminGuild = getAdminGuilds()[0];
    if (!adminGuild) {
      return { error: "You must be a guild admin or creator to request a challenge." };
    }
    if (adminGuild.id === targetGuildId) {
      return { error: "You cannot challenge your own guild." };
    }
    const alreadyRequested = state.challenges.some(
      (challenge) =>
        challenge.challengerGuildId === adminGuild.id &&
        challenge.targetGuildId === targetGuildId &&
        challenge.status === "pending"
    );
    if (alreadyRequested) {
      return { error: "A challenge request is already pending." };
    }
    const challenge = {
      id: `challenge-${Date.now()}`,
      challengerGuildId: adminGuild.id,
      targetGuildId,
      status: "pending",
      message: `${adminGuild.name} is requesting a challenge.`,
      requestedAt: new Date().toISOString(),
      matchTime: null,
      scoreProofs: [],
      finalResult: null,
    };
    setState((current) => ({ ...current, challenges: [...current.challenges, challenge] }));
    return { success: true };
  }, [state.challenges, getAdminGuilds]);

  const setChallengeTime = useCallback((challengeId, isoString) => {
    const validationError = validateChallengeTime(isoString);
    if (validationError) return { error: validationError };
    const updatedChallenges = state.challenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, matchTime: isoString } : challenge
    );
    setState((current) => ({ ...current, challenges: updatedChallenges }));
    return { success: true };
  }, [state.challenges]);

  const acceptChallenge = useCallback((challengeId) => {
    const challenge = state.challenges.find((item) => item.id === challengeId);
    if (!challenge) return { error: "Challenge request not found." };
    if (!challenge.matchTime) return { error: "Set a match time before accepting." };
    const updatedChallenges = state.challenges.map((item) =>
      item.id === challengeId ? { ...item, status: "accepted" } : item
    );
    setState((current) => ({ ...current, challenges: updatedChallenges }));
    return { success: true };
  }, [state.challenges]);

  const rejectChallenge = useCallback((challengeId) => {
    const updatedChallenges = state.challenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, status: "rejected" } : challenge
    );
    setState((current) => ({ ...current, challenges: updatedChallenges }));
  }, [state.challenges]);

  const uploadGuildAvatar = useCallback((guildId, avatarUrl) => {
    const updatedGuilds = state.guilds.map((guild) =>
      guild.id === guildId ? { ...guild, creator: { ...guild.creator, avatar: avatarUrl } } : guild
    );
    setState((current) => ({ ...current, guilds: updatedGuilds }));
  }, [state.guilds]);

  const submitMatchProof = useCallback((challengeId, guildId, screenshotUrl, score) => {
    const updatedChallenges = state.challenges.map((challenge) => {
      if (challenge.id !== challengeId) return challenge;
      const existingProof = challenge.scoreProofs.find((proof) => proof.guildId === guildId);
      const proofs = existingProof
        ? challenge.scoreProofs.map((proof) =>
          proof.guildId === guildId ? { ...proof, screenshotUrl, score, submittedAt: new Date().toISOString() } : proof
        )
        : [
          ...challenge.scoreProofs,
          {
            guildId,
            screenshotUrl,
            score,
            submittedAt: new Date().toISOString(),
          },
        ];
      return { ...challenge, scoreProofs: proofs };
    });
    setState((current) => ({ ...current, challenges: updatedChallenges }));
  }, [state.challenges]);

  const finalizeMatch = useCallback((challengeId, winningGuildId) => {
    const updatedChallenges = state.challenges.map((challenge) => {
      if (challenge.id !== challengeId) return challenge;
      return { ...challenge, finalResult: { winningGuildId, resolvedAt: new Date().toISOString() } };
    });
    const updatedGuilds = state.guilds.map((guild) =>
      guild.id === winningGuildId ? { ...guild, points: (guild.points || 0) + 10 } : guild
    );
    setState((current) => ({ ...current, challenges: updatedChallenges, guilds: updatedGuilds }));
  }, [state.challenges, state.guilds]);

  const submitWebsiteComplaint = useCallback((title, body) => {
    const complaint = {
      id: `complaint-${Date.now()}`,
      title,
      body,
      submittedAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, websiteComplaints: [...current.websiteComplaints, complaint] }));
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      currentGuilds,
      activeGuildId,
      getGuildBySlug,
      getGuildById,
      getUserGuildMemberships,
      getUserGuild,
      getAdminGuilds,
      createGuild,
      joinGuild,
      approveMember,
      rejectMember,
      promoteGuild,
      sendChallengeRequest,
      setChallengeTime,
      acceptChallenge,
      rejectChallenge,
      uploadGuildAvatar,
      submitMatchProof,
      finalizeMatch,
      submitWebsiteComplaint,
      issueCreationCode,
      issuePromotionCode,
      disbandGuild,
      transferOwnership,
      leaveGuild,
      signupUser,
      loginUser,
      login,
      logout,
      setSelectedGame,
      loginAsSpectator,
    }),
    [
      state,
      currentGuilds,
      activeGuildId,
      // Add all functions to dependency array
      getGuildBySlug,
      getGuildById,
      getUserGuildMemberships,
      getUserGuild,
      getAdminGuilds,
      createGuild,
      joinGuild,
      approveMember,
      rejectMember,
      promoteGuild,
      sendChallengeRequest,
      setChallengeTime,
      acceptChallenge,
      rejectChallenge,
      uploadGuildAvatar,
      submitMatchProof,
      finalizeMatch,
      submitWebsiteComplaint,
      issueCreationCode,
      issuePromotionCode,
      disbandGuild,
      transferOwnership,
      leaveGuild,
      signupUser,
      loginUser,
      login,
      logout,
      setSelectedGame,
      loginAsSpectator,
    ]
  );

  return <GuildContext.Provider value={value}>{children}</GuildContext.Provider>;
}
