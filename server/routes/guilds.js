const express = require("express");
const Guild = require("../models/Guild");
const Code = require("../models/Code");
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// GET all guilds
router.get("/", async (req, res) => {
  try {
    const guilds = await Guild.find({}).sort({ promoted: -1, createdAt: -1 });
    res.json(guilds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/create", authMiddleware, async (req, res) => {
  const uid = req.user?.uid;
  const { game, name, description, joinCode, promotionCode } = req.body;
  if (!uid || !game || !name || !joinCode) {
    return res.status(400).json({ error: "uid (from token), game, name and joinCode are required." });
  }
  try {
    const existingGuilds = await Guild.find({ "creator.id": uid });
    if (existingGuilds.length >= 1) {
      if (!promotionCode) {
        return res.status(400).json({ error: "A second guild requires payment and a valid creation code." });
      }
      const codeEntry = await Code.findOne({ code: promotionCode, uid, type: "creation", used: false });
      if (!codeEntry || codeEntry.expiresAt < new Date()) {
        return res.status(400).json({ error: "Invalid or expired creation code." });
      }
      codeEntry.used = true;
      await codeEntry.save();
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 40);
    const guild = await Guild.create({
      uid,
      slug,
      game,
      name,
      description,
      creator: { id: uid, name: req.user.name || req.body.creatorName || "Player", avatar: req.user.avatar || req.body.creatorAvatar || "" },
      honoredPlayer: { name: "First Recruit", title: "Founding Member", avatar: "" },
      promoted: false,
      inviteCount: 0,
      admins: [uid],
      members: [{ id: uid, name: req.user.name || req.body.creatorName || "Player", role: "creator", status: "accepted", joinedAt: new Date() }],
      pendingRequests: [],
      joinCode,
    });
    res.json({ success: true, guild });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:guildId/promote', authMiddleware, async (req, res) => {
  const { promotionCode } = req.body;
  const uid = req.user?.uid;
  if (!uid || !promotionCode) {
    return res.status(400).json({ error: 'uid and promotionCode are required.' });
  }
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });
    if (guild.creator.id !== uid) {
      return res.status(403).json({ error: 'Only the guild creator can promote the guild.' });
    }
    const codeEntry = await Code.findOne({ code: promotionCode, uid, guildId: guild.id, type: 'promotion', used: false });
    if (!codeEntry || codeEntry.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired promotion code.' });
    }
    codeEntry.used = true;
    await codeEntry.save();
    guild.promoted = true;
    guild.inviteCount = Math.min((guild.inviteCount || 0) + 10, 10);
    await guild.save();
    res.json({ success: true, guild });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const guild = await Guild.findOne({ slug: req.params.slug });
    if (!guild) return res.status(404).json({ error: "Guild not found." });
    res.json({ success: true, guild });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:guildId/disband', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.uid;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });
    if (guild.creator.id !== uid) return res.status(403).json({ error: 'Only the creator can disband the guild.' });
    await Guild.findByIdAndDelete(guild.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:guildId/transfer', authMiddleware, async (req, res) => {
  const { newOwnerId } = req.body;
  const uid = req.user?.uid;
  if (!newOwnerId) return res.status(400).json({ error: 'newOwnerId required' });
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });
    if (guild.creator.id !== uid) return res.status(403).json({ error: 'Only the creator can transfer ownership.' });
    if (!guild.members.some((m) => m.id === newOwnerId)) return res.status(400).json({ error: 'New owner must be a member.' });
    guild.creator = guild.members.find((m) => m.id === newOwnerId) || guild.creator;
    guild.admins = Array.from(new Set([...(guild.admins || []), newOwnerId]));
    guild.members = guild.members.map((m) => (m.id === newOwnerId ? { ...m, role: 'creator' } : m.id === uid ? { ...m, role: 'member' } : m));
    await guild.save();
    res.json({ success: true, guild });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:guildId/leave', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.uid;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });
    const member = guild.members.find((m) => m.id === uid);
    if (!member) return res.status(400).json({ error: 'You are not a member of this guild.' });
    if (member.role === 'creator') return res.status(400).json({ error: 'Creator cannot leave guild. Transfer ownership or disband first.' });
    guild.members = guild.members.filter((m) => m.id !== uid);
    await guild.save();
    res.json({ success: true, guild });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:guildId/join', authMiddleware, async (req, res) => {
  try {
    const uid = req.user?.uid;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });

    const allUserGuilds = await Guild.find({ 'members.id': uid });
    const hasAcceptedGuild = allUserGuilds.some(g => g.members.some(m => m.id === uid && m.status === 'accepted'));

    if (hasAcceptedGuild) {
      return res.status(400).json({ error: 'You already have an active guild membership.' });
    }
    if (guild.members.some(m => m.id === uid) || guild.pendingRequests.some(p => p.id === uid)) {
      return res.status(400).json({ error: 'You have already joined or requested to join this guild.' });
    }

    guild.pendingRequests.push({ id: uid, name: req.user.name, requestedAt: new Date() });
    await guild.save();
    res.json({ success: true, message: 'Your join request has been submitted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:guildId/approve', authMiddleware, async (req, res) => {
  const { userId } = req.body;
  const creatorId = req.user?.uid;
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'Guild not found.' });
    if (guild.creator.id !== creatorId && !guild.admins.includes(creatorId)) return res.status(403).json({ error: 'Only an admin can approve members.' });
    const request = guild.pendingRequests.find(p => p.id === userId);
    if (!request) return res.status(404).json({ error: 'Pending request not found.' });
    guild.pendingRequests = guild.pendingRequests.filter(p => p.id !== userId);
    guild.members.push({ id: request.id, name: request.name, role: 'member', status: 'accepted', joinedAt: new Date() });
    await guild.save();
    res.json({ success: true, guild });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
