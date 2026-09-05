import { PlayerColor, CoinPackage, Player, AvatarConfig } from '../types';

export interface BoardCoord {
  r: number;
  c: number;
}

// 52 Common perimeter path coordinates on 15x15 grid
export const PERIMETER_PATH: BoardCoord[] = [
  /* 0  Red Start (Star) */ { r: 13, c: 6 },
  /* 1                   */ { r: 12, c: 6 },
  /* 2                   */ { r: 11, c: 6 },
  /* 3                   */ { r: 10, c: 6 },
  /* 4                   */ { r: 9,  c: 6 },
  /* 5                   */ { r: 8,  c: 5 },
  /* 6                   */ { r: 8,  c: 4 },
  /* 7                   */ { r: 8,  c: 3 },
  /* 8  Safe Star        */ { r: 8,  c: 2 },
  /* 9                   */ { r: 8,  c: 1 },
  /* 10                  */ { r: 8,  c: 0 },
  /* 11                  */ { r: 7,  c: 0 },
  /* 12                  */ { r: 6,  c: 0 },
  /* 13 Green Start (Star)*/{ r: 6,  c: 1 },
  /* 14                  */ { r: 6,  c: 2 },
  /* 15                  */ { r: 6,  c: 3 },
  /* 16                  */ { r: 6,  c: 4 },
  /* 17                  */ { r: 6,  c: 5 },
  /* 18                  */ { r: 5,  c: 6 },
  /* 19                  */ { r: 4,  c: 6 },
  /* 20                  */ { r: 3,  c: 6 },
  /* 21 Safe Star        */ { r: 2,  c: 6 },
  /* 22                  */ { r: 1,  c: 6 },
  /* 23                  */ { r: 0,  c: 6 },
  /* 24                  */ { r: 0,  c: 7 },
  /* 25                  */ { r: 0,  c: 8 },
  /* 26 Yellow Start(Star)*/{ r: 1,  c: 8 },
  /* 27                  */ { r: 2,  c: 8 },
  /* 28                  */ { r: 3,  c: 8 },
  /* 29                  */ { r: 4,  c: 8 },
  /* 30                  */ { r: 5,  c: 8 },
  /* 31                  */ { r: 6,  c: 9 },
  /* 32                  */ { r: 6,  c: 10 },
  /* 33                  */ { r: 6,  c: 11 },
  /* 34 Safe Star        */ { r: 6,  c: 12 },
  /* 35                  */ { r: 6,  c: 13 },
  /* 36                  */ { r: 6,  c: 14 },
  /* 37                  */ { r: 7,  c: 14 },
  /* 38                  */ { r: 8,  c: 14 },
  /* 39 Blue Start (Star)*/ { r: 8,  c: 13 },
  /* 40                  */ { r: 8,  c: 12 },
  /* 41                  */ { r: 8,  c: 11 },
  /* 42                  */ { r: 8,  c: 10 },
  /* 43                  */ { r: 8,  c: 9 },
  /* 44                  */ { r: 9,  c: 8 },
  /* 45                  */ { r: 10, c: 8 },
  /* 46                  */ { r: 11, c: 8 },
  /* 47 Safe Star        */ { r: 12, c: 8 },
  /* 48                  */ { r: 13, c: 8 },
  /* 49                  */ { r: 14, c: 8 },
  /* 50                  */ { r: 14, c: 7 },
  /* 51                  */ { r: 14, c: 6 },
];

export const START_INDICES: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe spot indices on perimeter path (star cells)
export const SAFE_PERIMETER_INDICES = [0, 8, 13, 21, 26, 34, 39, 47];

// Home run paths (steps 51 to 55) and Center Home (step 56)
export const HOME_PATHS: Record<PlayerColor, BoardCoord[]> = {
  red: [
    { r: 13, c: 7 },
    { r: 12, c: 7 },
    { r: 11, c: 7 },
    { r: 10, c: 7 },
    { r: 9,  c: 7 },
    { r: 8,  c: 7 }, // Home
  ],
  green: [
    { r: 7, c: 1 },
    { r: 7, c: 2 },
    { r: 7, c: 3 },
    { r: 7, c: 4 },
    { r: 7, c: 5 },
    { r: 7, c: 6 }, // Home
  ],
  yellow: [
    { r: 1, c: 7 },
    { r: 2, c: 7 },
    { r: 3, c: 7 },
    { r: 4, c: 7 },
    { r: 5, c: 7 },
    { r: 6, c: 7 }, // Home
  ],
  blue: [
    { r: 7, c: 13 },
    { r: 7, c: 12 },
    { r: 7, c: 11 },
    { r: 7, c: 10 },
    { r: 7, c: 9 },
    { r: 7, c: 8 }, // Home
  ],
};

// Yard positions for 4 tokens
export const YARD_COORDS: Record<PlayerColor, BoardCoord[]> = {
  green: [
    { r: 2, c: 2 },
    { r: 2, c: 3 },
    { r: 3, c: 2 },
    { r: 3, c: 3 },
  ],
  yellow: [
    { r: 2, c: 11 },
    { r: 2, c: 12 },
    { r: 3, c: 11 },
    { r: 3, c: 12 },
  ],
  red: [
    { r: 11, c: 2 },
    { r: 11, c: 3 },
    { r: 12, c: 2 },
    { r: 12, c: 3 },
  ],
  blue: [
    { r: 11, c: 11 },
    { r: 11, c: 12 },
    { r: 12, c: 11 },
    { r: 12, c: 12 },
  ],
};

export const COLOR_CONFIG: Record<PlayerColor, {
  name: string;
  bnName: string;
  hex: string;
  bgHex: string;
  borderHex: string;
  glowHex: string;
  tokenGradient: string;
  avatar: string;
}> = {
  red: {
    name: "Red",
    bnName: "লাল",
    hex: "#EF4444",
    bgHex: "#FEE2E2",
    borderHex: "#DC2626",
    glowHex: "rgba(239, 68, 68, 0.4)",
    tokenGradient: "from-rose-500 to-red-600",
    avatar: "🦁",
  },
  green: {
    name: "Green",
    bnName: "সবুজ",
    hex: "#10B981",
    bgHex: "#D1FAE5",
    borderHex: "#059669",
    glowHex: "rgba(16, 185, 129, 0.4)",
    tokenGradient: "from-emerald-500 to-green-600",
    avatar: "🐯",
  },
  yellow: {
    name: "Yellow",
    bnName: "হলুদ",
    hex: "#F59E0B",
    bgHex: "#FEF3C7",
    borderHex: "#D97706",
    glowHex: "rgba(245, 158, 11, 0.4)",
    tokenGradient: "from-amber-400 to-yellow-600",
    avatar: "👑",
  },
  blue: {
    name: "Blue",
    bnName: "নীল",
    hex: "#3B82F6",
    bgHex: "#DBEAFE",
    borderHex: "#2563EB",
    glowHex: "rgba(59, 130, 246, 0.4)",
    tokenGradient: "from-blue-500 to-indigo-600",
    avatar: "🦅",
  },
};

// Coin store packages (Benchmark: 50,000 Coins = 1,000 BDT)
export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: "pkg_2500",
    title: "স্টার্টার প্যাক",
    coins: 2500,
    bonus: 0,
    priceBDT: 50,
    color: "from-emerald-500 to-teal-600",
    badge: "জনপ্রিয়",
  },
  {
    id: "pkg_5000",
    title: "সিলভার প্যাক",
    coins: 5000,
    bonus: 500,
    priceBDT: 100,
    color: "from-blue-500 to-indigo-600",
    badge: "+৫০০ বোনাস",
  },
  {
    id: "pkg_12500",
    title: "গোল্ড প্যাক",
    coins: 12500,
    bonus: 2000,
    priceBDT: 250,
    color: "from-amber-500 to-orange-600",
    badge: "সেরা ডিল 🔥",
  },
  {
    id: "pkg_25000",
    title: "প্লাটিনাম ভল্ট প্যাক",
    coins: 25000,
    bonus: 5000,
    priceBDT: 500,
    color: "from-purple-500 to-pink-600",
    badge: "মেগা বোনাস",
  },
  {
    id: "pkg_50000",
    title: "৫০ হাজার মেগা চ্যাম্পিয়ন প্যাক",
    coins: 50000,
    bonus: 15000,
    priceBDT: 1000,
    color: "from-amber-500 to-red-600",
    badge: "৫০K মেগা 👑",
  },
];

// Fun Bengali audio reactions for In-Game Audio Call soundboard
export const VOICE_REACTIONS = [
  { id: "six", text: "ছক্কা মারো!", soundKey: "six", icon: "🎲" },
  { id: "kill", text: "কাটলি কেন রে ভাই!", soundKey: "kill", icon: "⚔️" },
  { id: "game", text: "আজ খেলা জমবে!", soundKey: "game", icon: "🔥" },
  { id: "fast", text: "তাড়াতাড়ি চাল দাও!", soundKey: "fast", icon: "⏳" },
  { id: "laugh", text: "হা হা হা! দারুণ চাল!", soundKey: "laugh", icon: "😂" },
  { id: "safe", text: "আমি নিরাপদে আছি!", soundKey: "safe", icon: "🛡️" },
];

export const DEFAULT_AVATARS: Record<PlayerColor, AvatarConfig> = {
  red: {
    skinColor: '#fcd34d',
    hairStyle: 'short',
    hairColor: '#1f2937',
    eyes: 'happy',
    mouth: 'smile',
    clothing: 'punjabi',
    clothingColor: '#dc2626',
    accessory: 'glasses',
    bgGradient: 'from-amber-400 to-red-500',
  },
  green: {
    skinColor: '#fed7aa',
    hairStyle: 'curly',
    hairColor: '#78350f',
    eyes: 'sparkle',
    mouth: 'laugh',
    clothing: 'hoodie',
    clothingColor: '#16a34a',
    accessory: 'headphone',
    bgGradient: 'from-emerald-400 to-teal-600',
  },
  yellow: {
    skinColor: '#fbb6ce',
    hairStyle: 'crown',
    hairColor: '#b45309',
    eyes: 'cool',
    mouth: 'smirk',
    clothing: 'royal_robe',
    clothingColor: '#d97706',
    accessory: 'golden_chain',
    bgGradient: 'from-amber-400 to-yellow-500',
  },
  blue: {
    skinColor: '#f59e0b',
    hairStyle: 'wavy',
    hairColor: '#1f2937',
    eyes: 'wink',
    mouth: 'smile',
    clothing: 'jersey',
    clothingColor: '#2563eb',
    accessory: 'sunglasses',
    bgGradient: 'from-blue-500 to-indigo-600',
  },
};

export const PLAYERS_4: Player[] = [
  {
    id: 'p_red',
    name: 'You (Red)',
    color: 'red',
    isBot: false,
    coins: 5000,
    hasFinished: false,
    isMuted: false,
    isSpeaking: false,
    avatar: DEFAULT_AVATARS.red,
    tokens: [
      { id: 0, color: 'red', step: -1, isHome: false },
      { id: 1, color: 'red', step: -1, isHome: false },
      { id: 2, color: 'red', step: -1, isHome: false },
      { id: 3, color: 'red', step: -1, isHome: false },
    ],
  },
  {
    id: 'p_green',
    name: 'Tanvir (Green)',
    color: 'green',
    isBot: true,
    coins: 4200,
    hasFinished: false,
    isMuted: false,
    isSpeaking: false,
    avatar: DEFAULT_AVATARS.green,
    tokens: [
      { id: 0, color: 'green', step: -1, isHome: false },
      { id: 1, color: 'green', step: -1, isHome: false },
      { id: 2, color: 'green', step: -1, isHome: false },
      { id: 3, color: 'green', step: -1, isHome: false },
    ],
  },
  {
    id: 'p_yellow',
    name: 'Sadia (Yellow)',
    color: 'yellow',
    isBot: true,
    coins: 6500,
    hasFinished: false,
    isMuted: false,
    isSpeaking: false,
    avatar: DEFAULT_AVATARS.yellow,
    tokens: [
      { id: 0, color: 'yellow', step: -1, isHome: false },
      { id: 1, color: 'yellow', step: -1, isHome: false },
      { id: 2, color: 'yellow', step: -1, isHome: false },
      { id: 3, color: 'yellow', step: -1, isHome: false },
    ],
  },
  {
    id: 'p_blue',
    name: 'Rakib (Blue)',
    color: 'blue',
    isBot: true,
    coins: 3800,
    hasFinished: false,
    isMuted: false,
    isSpeaking: false,
    avatar: DEFAULT_AVATARS.blue,
    tokens: [
      { id: 0, color: 'blue', step: -1, isHome: false },
      { id: 1, color: 'blue', step: -1, isHome: false },
      { id: 2, color: 'blue', step: -1, isHome: false },
      { id: 3, color: 'blue', step: -1, isHome: false },
    ],
  },
];

export const INITIAL_PLAYERS = PLAYERS_4;
export const SAFE_CELL_INDICES = SAFE_PERIMETER_INDICES;

