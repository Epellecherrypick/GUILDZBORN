const express = require("express");
const Code = require("../models/Code");
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.post("/issue", authMiddleware, async (req, res) => {
  // only spectator may issue codes
  if (!req.user || req.user.role !== 'spectator') return res.status(403).json({ error: 'Forbidden' });
  const { uid, type, guildId, hours } = req.body;
  if (!uid || !type) {
    return res.status(400).json({ error: "uid and type are required." });
  }
  if (!["creation", "promotion"].includes(type)) {
    return res.status(400).json({ error: "Invalid code type." });
  }
  try {
    const code = `${type === "creation" ? "CC" : "PR"}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + ((hours || 3) * 60 * 60 * 1000));
    const entry = await Code.create({ code, uid, type, guildId, expiresAt, issuedBy: req.user.uid || 'spectator' });
    res.json({ success: true, code: entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify", async (req, res) => {
  const { code, uid, guildId } = req.body;
  if (!code || !uid) {
    return res.status(400).json({ error: "code and uid are required." });
  }
  try {
    const query = { code, uid, used: false };
    if (guildId) query.guildId = guildId;
    const entry = await Code.findOne(query);
    if (!entry) return res.status(404).json({ error: "Invalid or expired code." });
    if (entry.expiresAt < new Date()) return res.status(400).json({ error: "Code expired." });
    entry.used = true;
    await entry.save();
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:code", async (req, res) => {
  try {
    const entry = await Code.findOne({ code: req.params.code });
    if (!entry) return res.status(404).json({ error: "Code not found." });
    res.json({ success: true, entry });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
