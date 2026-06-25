const express = require("express");
const Challenge = require("../models/Challenge");
const Guild = require("../models/Guild");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

// GET all challenges
router.get("/", async (req, res) => {
  try {
    const challenges = await Challenge.find({}).sort({ requestedAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST a new challenge
router.post("/create", authMiddleware, async (req, res) => {
  const { targetGuildId } = req.body;
  const uid = req.user?.uid;

  try {
    const adminGuilds = await Guild.find({ admins: uid });
    if (adminGuilds.length === 0) {
      return res.status(403).json({ error: "You must be an admin of a guild to issue a challenge." });
    }
    const challengerGuild = adminGuilds[0]; // Assuming user is admin of one guild for simplicity

    const newChallenge = await Challenge.create({
      challengerGuildId: challengerGuild.id,
      targetGuildId,
      message: `${challengerGuild.name} is requesting a challenge.`,
    });

    res.status(201).json({ success: true, challenge: newChallenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;