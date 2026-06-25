const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const SPECTATOR_PASSWORD = process.env.SPECTATOR_PASSWORD || 'spectator123';

router.post('/signup', async (req, res) => {
  const { uid, name, email, avatar } = req.body;
  if (!uid || !name || !email) return res.status(400).json({ error: 'uid,name,email required' });
  try {
    let user = await User.findOne({ uid });
    if (user) return res.status(400).json({ error: 'UID already exists' });
    user = await User.create({ uid, name, email, avatar });
    const token = jwt.sign({ uid: user.uid, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { uid, email } = req.body;
  if (!uid && !email) return res.status(400).json({ error: 'Provide uid or email to login' });
  try {
    let user;
    if (uid && email) {
      user = await User.findOne({ uid, email });
    } else if (email) {
      user = await User.findOne({ email });
    }
    if (!user) return res.status(404).json({ error: 'User not found' });
    const token = jwt.sign({ uid: user.uid, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/spectator', async (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'password required' });
  if (password !== SPECTATOR_PASSWORD) return res.status(401).json({ error: 'Invalid spectator password' });
  // ensure spectator user exists
  let user = await User.findOne({ uid: 'spectator-user' });
  if (!user) {
    user = await User.create({ uid: 'spectator-user', name: 'Spectator', email: 'spectator@local', role: 'spectator' });
  }
  const token = jwt.sign({ uid: user.uid, role: 'spectator', name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, user, token });
});

module.exports = router;
