export const defaultAvatar = "https://res.cloudinary.com/demo/image/upload/w_128,h_128,c_fill,q_auto/v1/sample.jpg";

export const initialGuestUser = {
  id: "guest-user",
  name: "Guest",
  avatar: defaultAvatar,
  role: "guest",
  email: "",
};

export const initialUser = {
  id: "user-maverick",
  name: "Maverick",
  avatar: "https://res.cloudinary.com/demo/image/upload/w_128,h_128,c_fill,q_auto/v1/sample.jpg",
  role: "admin",
  email: "maverick@guildwatch.com",
};

export const initialGuilds = [
  {
    id: "ff-1",
    slug: "rise-of-flames",
    game: "Free Fire",
    name: "Flame Syndicate",
    description: "A fast-strike Free Fire guild led by creator-first strategy.",
    creator: {
      id: "creator-ff1",
      name: "Sera Blaze",
      avatar: defaultAvatar,
    },
    honoredPlayer: {
      name: "RoguePhoenix",
      title: "Top Strategist",
      avatar: "https://res.cloudinary.com/demo/image/upload/w_96,h_96,c_fill,q_auto/v1/sample2.jpg",
    },
    themeAccent: "from-orange-500 to-orange-700",
    points: 82,
    promoted: false,
    inviteCount: 0,
    admins: ["creator-ff1"],
    members: [
      {
        id: "creator-ff1",
        name: "Sera Blaze",
        role: "creator",
        status: "accepted",
        joinedAt: "2026-06-01T10:00:00.000Z",
      },
    ],
    pendingRequests: [
      {
        id: "user-pending1",
        name: "SkyBlade",
        requestedAt: "2026-06-22T13:30:00.000Z",
      },
    ],
    joinCode: "FF-8081",
  },
  {
    id: "cod-1",
    slug: "shadow-ops",
    game: "Call of Duty",
    name: "Shadow Ops",
    description: "A frontline COD team built around elite coordination and ranked raids.",
    creator: {
      id: "creator-cod1",
      name: "Ghost",
      avatar: "https://res.cloudinary.com/demo/image/upload/w_128,h_128,c_fill,q_auto/v1/sample3.jpg",
    },
    honoredPlayer: {
      name: "Venom",
      title: "Objective Specialist",
      avatar: "https://res.cloudinary.com/demo/image/upload/w_96,h_96,c_fill,q_auto/v1/sample4.jpg",
    },
    themeAccent: "from-cyan-500 to-slate-900",
    points: 116,
    promoted: true,
    inviteCount: 3,
    admins: ["creator-cod1", "user-maverick"],
    members: [
      {
        id: "creator-cod1",
        name: "Ghost",
        role: "creator",
        status: "accepted",
        joinedAt: "2026-06-02T09:30:00.000Z",
      },
      {
        id: "user-maverick",
        name: "Maverick",
        role: "admin",
        status: "accepted",
        joinedAt: "2026-06-15T09:00:00.000Z",
      },
    ],
    pendingRequests: [],
    joinCode: "COD-3221",
  },
  {
    id: "bs-1",
    slug: "blood-strike-elite",
    game: "Blood Strike",
    name: "Blood Strike Elite",
    description: "Coming soon with a dedicated scoreboard and elite event invites.",
    creator: {
      id: "creator-bs1",
      name: "Night Reaper",
      avatar: "https://res.cloudinary.com/demo/image/upload/w_128,h_128,c_fill,q_auto/v1/sample5.jpg",
    },
    honoredPlayer: {
      name: "Crimson",
      title: "Tactical MVP",
      avatar: "https://res.cloudinary.com/demo/image/upload/w_96,h_96,c_fill,q_auto/v1/sample6.jpg",
    },
    themeAccent: "from-pink-500 to-rose-700",
    points: 64,
    promoted: false,
    inviteCount: 0,
    admins: ["creator-bs1"],
    members: [
      {
        id: "creator-bs1",
        name: "Night Reaper",
        role: "creator",
        status: "accepted",
        joinedAt: "2026-06-03T08:10:00.000Z",
      },
    ],
    pendingRequests: [],
    joinCode: "BS-5501",
  },
];

export const initialChallenges = [
  {
    id: "challenge-1",
    challengerGuildId: "cod-1",
    targetGuildId: "ff-1",
    status: "pending",
    message: "Shadow Ops is requesting a challenge",
    requestedAt: "2026-06-23T10:00:00.000Z",
    matchTime: null,
    scoreProofs: [],
    finalResult: null,
  },
];

export const initialState = {
  guilds: initialGuilds,
  challenges: initialChallenges,
  websiteComplaints: [
    {
      id: "complaint-1",
      title: "Guild approval notifications",
      body: "I did not receive a notification when my guild request was approved.",
      submittedAt: "2026-06-23T16:45:00.000Z",
    },
  ],
  currentUser: initialUser,
  creationCodes: [],
};
