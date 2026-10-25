// Video feed dataset with creator profiles, sound info, and comment threads

export const initialVideos = [
  {
    id: "vid-1",
    videoUrl: "/videos/v1.mp4",
    author: {
      id: "u-1",
      name: "Maya Lin",
      username: "mayaflows",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Chasing sunset blooms and macro beauty 🌸 | Digital Creator",
      followers: "842.1K",
      following: 219,
      likes: "14.2M"
    },
    caption: "Watching nature wake up frame by frame ✨ Nature hits differently in super slow-mo! Who else loves timelapse botanics?",
    tags: ["nature", "timelapse", "macro", "aesthetic", "satisfying", "fyp"],
    sound: {
      title: "Golden Hour Bloom (Acoustic Lo-Fi)",
      author: "mayaflows",
      cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=120&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 384200,
      comments: 2940,
      bookmarks: 48100,
      shares: 19200
    },
    isLiked: false,
    isBookmarked: false,
    isFollowing: false,
    comments: [
      {
        id: "c-1",
        user: {
          name: "Liam Vance",
          username: "liamvance",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
          verified: false
        },
        text: "The petals opening at 0:04 gave me actual chills! Stunning cinematography 😍",
        timestamp: "3h ago",
        likes: 1420,
        isLiked: false
      },
      {
        id: "c-2",
        user: {
          name: "Chloe Chen",
          username: "chloegardens",
          avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
          verified: true
        },
        text: "What lens and interval did you shoot this with?? Absolutely mesmerizing!",
        timestamp: "5h ago",
        likes: 893,
        isLiked: false
      },
      {
        id: "c-3",
        user: {
          name: "Zen Beats",
          username: "zen_lofi",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
          verified: true
        },
        text: "The audio sync with the flower unfurling is pure magic 🎵🌸",
        timestamp: "7h ago",
        likes: 421,
        isLiked: false
      }
    ]
  },
  {
    id: "vid-2",
    videoUrl: "/videos/v2.mp4",
    author: {
      id: "u-2",
      name: "Marcus Cole",
      username: "marcusbeats",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Producer & Beatmaker 🎹 New drop every Friday! Spotify 2M+ monthly",
      followers: "1.4M",
      following: 412,
      likes: "29.8M"
    },
    caption: "FRIDAY VIBES ARE HERE! ⚡ Drops tonight at midnight. Turn the volume all the way up and tell me what you think in the comments!",
    tags: ["friday", "vibes", "weekend", "newmusic", "synthwave", "dance"],
    sound: {
      title: "Weekend Anthem (Club Mix 2026)",
      author: "marcusbeats",
      cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=120&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 629400,
      comments: 5120,
      bookmarks: 84300,
      shares: 43100
    },
    isLiked: true,
    isBookmarked: false,
    isFollowing: true,
    comments: [
      {
        id: "c-4",
        user: {
          name: "Elena Rostova",
          username: "elenasound",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
          verified: true
        },
        text: "This bassline is dangerously catchy 🔥 Already saving to my main playlist!",
        timestamp: "2h ago",
        likes: 3120,
        isLiked: true
      },
      {
        id: "c-5",
        user: {
          name: "Samir K.",
          username: "samir_dj",
          avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80",
          verified: false
        },
        text: "Drop the stem packs bro, DJs need this urgently for the weekend sets!",
        timestamp: "4h ago",
        likes: 914,
        isLiked: false
      }
    ]
  },
  {
    id: "vid-3",
    videoUrl: "/videos/v3.mp4",
    author: {
      id: "u-3",
      name: "Deep Ocean Explorer",
      username: "abyss_wonders",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Documenting the mysterious creatures of the midnight zone 🌊 Bioluminescence & beyond",
      followers: "2.1M",
      following: 98,
      likes: "45.1M"
    },
    caption: "Bioluminescent jellyfish floating 3,000 meters below sea level in the Pacific Mariana Trench. Aliens exist on Earth 🪼✨",
    tags: ["ocean", "jellyfish", "deepsea", "wildlife", "marinebiology", "fyp"],
    sound: {
      title: "Abyssal Echoes - Deep Sea Ambience",
      author: "abyss_wonders",
      cover: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=120&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 921400,
      comments: 7840,
      bookmarks: 142000,
      shares: 61800
    },
    isLiked: false,
    isBookmarked: true,
    isFollowing: false,
    comments: [
      {
        id: "c-6",
        user: {
          name: "Dr. Alicia Ramos",
          username: "aliciaramos_phd",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
          verified: true
        },
        text: "Crossota norvegica! One of the most spectacular hydromedusae in the world. Exceptional capture quality 🔬",
        timestamp: "1h ago",
        likes: 5420,
        isLiked: false
      },
      {
        id: "c-7",
        user: {
          name: "Neo SciFi",
          username: "neoscifi_art",
          avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
          verified: false
        },
        text: "You cannot convince me this isn't an alien mothership cruising through space 🌌",
        timestamp: "3h ago",
        likes: 2190,
        isLiked: false
      }
    ]
  },
  {
    id: "vid-4",
    videoUrl: "/videos/v4.mp4",
    author: {
      id: "u-4",
      name: "Pixel Animation Studios",
      username: "pixelcraft_3d",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Open Source 3D Animation & Blender Tutorials 🐰 Rigging, Lighting, Render",
      followers: "910.5K",
      following: 165,
      likes: "18.4M"
    },
    caption: "The famous forest awakening! 🐰🥕 Test render for character expressions and fur physics. Tag an animator who needs to see this!",
    tags: ["3danimation", "blender", "cgi", "characterdesign", "b3d", "art"],
    sound: {
      title: "Woodland Symphony & Birdsong",
      author: "pixelcraft_3d",
      cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 412900,
      comments: 3200,
      bookmarks: 39500,
      shares: 14800
    },
    isLiked: false,
    isBookmarked: false,
    isFollowing: false,
    comments: [
      {
        id: "c-8",
        user: {
          name: "Jordan Fox",
          username: "jordan3d",
          avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80",
          verified: false
        },
        text: "The subsurface scattering on the bunny ears is top tier render quality 🤌",
        timestamp: "6h ago",
        likes: 1200,
        isLiked: false
      }
    ]
  },
  {
    id: "vid-5",
    videoUrl: "/videos/v5.mp4",
    author: {
      id: "u-5",
      name: "Aria Winters",
      username: "aria_fantasy",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
      verified: true,
      bio: "Fantasy Worldbuilding & Cinematic CGI Storyteller 🏹 New short film coming",
      followers: "3.2M",
      following: 280,
      likes: "68.9M"
    },
    caption: "The dragon's valley at dawn 🐉 Shading and cloth simulation pass completed! Would you survive in this realm?",
    tags: ["fantasy", "cinematic", "storytelling", "dragon", "vfx", "fyp"],
    sound: {
      title: "Epic Orchestral Legend - Hans Style",
      author: "aria_fantasy",
      cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=120&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 1104000,
      comments: 9410,
      bookmarks: 189200,
      shares: 98400
    },
    isLiked: true,
    isBookmarked: true,
    isFollowing: true,
    comments: [
      {
        id: "c-9",
        user: {
          name: "Leo Sterling",
          username: "leofilms",
          avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80",
          verified: true
        },
        text: "Need this to be a full feature length movie in IMAX right now!! 🎬🔥",
        timestamp: "30m ago",
        likes: 8430,
        isLiked: true
      }
    ]
  }
];

export const currentUser = {
  name: "Rajuzet",
  username: "rajuzet",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  verified: true,
  bio: "Building next-gen web apps and AI tools 💻🚀 | Coffee, Code & Creative Vibes",
  followers: "48.2K",
  following: 184,
  likes: "3.1M"
};

export const suggestedAccounts = [
  {
    name: "Sarah Jenkins",
    username: "sarah_vibes",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80",
    verified: true,
    followers: "1.8M",
    isFollowing: false
  },
  {
    name: "Cyber Dev",
    username: "cyber_dev",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    verified: true,
    followers: "940K",
    isFollowing: false
  },
  {
    name: "Elena Rostova",
    username: "elenasound",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    verified: false,
    followers: "620K",
    isFollowing: true
  },
  {
    name: "Liam Vance",
    username: "liamvance",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    verified: true,
    followers: "410K",
    isFollowing: false
  }
];

export const trendingTags = [
  { tag: "dancechallenge", count: "4.8B views" },
  { tag: "webdev", count: "1.2B views" },
  { tag: "aiart", count: "890M views" },
  { tag: "satisfying", count: "6.4B views" },
  { tag: "naturevibes", count: "980M views" },
  { tag: "cookinghacks", count: "2.3B views" }
];
