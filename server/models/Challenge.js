const mongoose = require("mongoose");

const ChallengeSchema = new mongoose.Schema({
  challengerGuildId: { type: String, required: true, index: true },
  targetGuildId: { type: String, required: true, index: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
  message: { type: String },
  requestedAt: { type: Date, default: Date.now },
  matchTime: { type: Date },
  scoreProofs: [
    {
      guildId: String,
      screenshotUrl: String,
      score: String,
      submittedAt: Date,
    },
  ],
  finalResult: { winningGuildId: String, resolvedAt: Date },
});

module.exports = mongoose.model("Challenge", ChallengeSchema);