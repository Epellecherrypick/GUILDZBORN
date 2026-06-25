const express = require("express");
const User = require("../models/User");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { uid, name, email, avatar, role } = req.body;
  if (!uid || !name || !email) {
    return res.status(400).json({ error: "uid, name, and email are required." });
  }
  try {
    const existing = await User.findOne({ uid });
    if (existing) {
      return res.status(400).json({ error: "UID already exists." });
    }
    const user = await User.create({ uid, name, email, avatar, role: role || "member" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { uid, email } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: "uid and email are required." });
  }
  try {
    const user = await User.findOne({ uid, email });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:uid", async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
