const mongoose = require("mongoose");

const CodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  uid: { type: String, required: true },
  guildId: { type: String },
  type: { type: String, enum: ["creation", "promotion"], required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  issuedBy: { type: String, default: "spectator" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Code", CodeSchema);
