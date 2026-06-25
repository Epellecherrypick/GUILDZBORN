const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const userRoutes = require("./routes/users");
const guildRoutes = require("./routes/guilds");
const codeRoutes = require("./routes/codes");
const challengeRoutes = require("./routes/challenges");
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 4000;

const corsOptions = {
  origin: 'https://guildzborn.onrender.com', // Allow only your frontend to make requests
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/guilds", guildRoutes);
app.use("/api/codes", codeRoutes);
app.use("/api/challenges", challengeRoutes);
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.json({ message: "GuildWatch backend is running." });
});

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
