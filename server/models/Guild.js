const mongoose = require("mongoose");

const GuildSchema = new mongoose.Schema({
  uid: { type: String, required: true, index: true },
  slug: { type: String, required: true, unique: true, index: true },
  game: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  creator: {
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    avatar: { type: String, default: "" },
  },
  honoredPlayer: {
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    avatar: { type: String, default: "" },
  },
  promoted: { type: Boolean, default: false },
  inviteCount: { type: Number, default: 0 },
  admins: [{ type: String }],
  members: [
    {
      id: String,
      name: String,
      role: String,
      status: String,
      joinedAt: Date,
    },
  ],
  pendingRequests: [
    {
      id: String,
      name: String,
      requestedAt: Date,
    },
  ],
  joinCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Guild", GuildSchema);
