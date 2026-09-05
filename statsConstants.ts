import { PlayerStats, GameMode, MatchHistoryItem, AchievementItem } from '../types';

export const STORAGE_KEY_PLAYER_STATS = 'ludo_player_stats_v2';

export const DEFAULT_PLAYER_STATS: PlayerStats = {
  totalGamesPlayed: 14,
  totalWins: 9,
  totalLosses: 5,
  totalCoinsEarned: 24500,
  highestWinStreak: 4,
  currentWinStreak: 2,
  totalTokensHome: 32,
  totalTokensCaptured: 27,
  totalSixesRolled: 64,
  tournamentTrophies: 1,
  modeBreakdown: {
    'vs-bot': { played: 6, won: 4 },
    'pass-and-play': { played: 2, won: 1 },
    'team-2v2': { played: 2, won: 2 },
    'tournament': { played: 2, won: 1 },
    'quick-match': { played: 2, won: 1 },
    'online-room': { played: 0, won: 0 },
  },
  history: [
    {
      id: 'hist_1',
      date: 'আজকে, ১০:৩০ AM',
      timestamp: Date.now() - 3600000 * 2,
      gameMode: 'tournament',
      result: 'win',
      coinsEarned: 5000,
      tokensReachedHome: 4,
      tokensCaptured: 5,
      opponentNames: ['মায়িশা', 'তানভীর', 'শুভ'],
    },
    {
      id: 'hist_2',
      date: 'গতকাল, ০৮:১৫ PM',
      timestamp: Date.now() - 3600000 * 22,
      gameMode: 'team-2v2',
      result: 'win',
      coinsEarned: 3500,
      tokensReachedHome: 4,
      tokensCaptured: 4,
      opponentNames: ['সবুজ বনাম নীল'],
    },
    {
      id: 'hist_3',
      date: 'গতকাল, ০৪:৪০ PM',
      timestamp: Date.now() - 3600000 * 26,
      gameMode: 'quick-match',
      result: 'loss',
      coinsEarned: 0,
      tokensReachedHome: 1,
      tokensCaptured: 2,
      opponentNames: ['তানভীর', 'শুভ'],
    },
    {
      id: 'hist_4',
      date: '২৬ আগস্ট, ০৭:২০ PM',
      timestamp: Date.now() - 3600000 * 48,
      gameMode: 'vs-bot',
      result: 'win',
      coinsEarned: 2500,
      tokensReachedHome: 4,
      tokensCaptured: 3,
      opponentNames: ['রোবট ১', 'রোবট ২', 'রোবট ৩'],
    },
  ],
  lastUpdated: Date.now(),
};

/**
 * Load statistics from localStorage or return default starter stats
 */
export function loadPlayerStats(): PlayerStats {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYER_STATS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure all modeBreakdown fields exist
      const defaultBreakdown: Record<GameMode, { played: number; won: number }> = {
        'vs-bot': { played: 0, won: 0 },
        'pass-and-play': { played: 0, won: 0 },
        'team-2v2': { played: 0, won: 0 },
        'tournament': { played: 0, won: 0 },
        'quick-match': { played: 0, won: 0 },
        'online-room': { played: 0, won: 0 },
      };

      return {
        ...DEFAULT_PLAYER_STATS,
        ...parsed,
        modeBreakdown: {
          ...defaultBreakdown,
          ...(parsed.modeBreakdown || {}),
        },
        history: Array.isArray(parsed.history) ? parsed.history : DEFAULT_PLAYER_STATS.history,
      };
    }
  } catch (err) {
    console.error('Failed to load player statistics:', err);
  }
  return DEFAULT_PLAYER_STATS;
}

/**
 * Save statistics to localStorage
 */
export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER_STATS, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save player statistics:', err);
  }
}

/**
 * Record a completed match in player statistics
 */
export function recordMatchInStats(
  prevStats: PlayerStats,
  params: {
    gameMode: GameMode;
    isWin: boolean;
    coinsEarned: number;
    tokensReachedHome: number;
    tokensCaptured: number;
    opponentNames?: string[];
    isTournamentChampion?: boolean;
  }
): PlayerStats {
  const {
    gameMode,
    isWin,
    coinsEarned,
    tokensReachedHome,
    tokensCaptured,
    opponentNames,
    isTournamentChampion,
  } = params;

  const currentModeStat = prevStats.modeBreakdown?.[gameMode] || { played: 0, won: 0 };
  const newCurrentWinStreak = isWin ? prevStats.currentWinStreak + 1 : 0;
  const newHighestWinStreak = Math.max(prevStats.highestWinStreak, newCurrentWinStreak);

  const newHistoryItem: MatchHistoryItem = {
    id: 'hist_' + Math.random().toString(36).substring(2, 9),
    date: 'এইমাত্র',
    timestamp: Date.now(),
    gameMode,
    result: isWin ? 'win' : 'loss',
    coinsEarned,
    tokensReachedHome,
    tokensCaptured,
    opponentNames,
  };

  const updated: PlayerStats = {
    ...prevStats,
    totalGamesPlayed: prevStats.totalGamesPlayed + 1,
    totalWins: prevStats.totalWins + (isWin ? 1 : 0),
    totalLosses: prevStats.totalLosses + (isWin ? 0 : 1),
    totalCoinsEarned: prevStats.totalCoinsEarned + Math.max(0, coinsEarned),
    currentWinStreak: newCurrentWinStreak,
    highestWinStreak: newHighestWinStreak,
    totalTokensHome: prevStats.totalTokensHome + tokensReachedHome,
    totalTokensCaptured: prevStats.totalTokensCaptured + tokensCaptured,
    tournamentTrophies: prevStats.tournamentTrophies + (isTournamentChampion ? 1 : 0),
    modeBreakdown: {
      ...prevStats.modeBreakdown,
      [gameMode]: {
        played: currentModeStat.played + 1,
        won: currentModeStat.won + (isWin ? 1 : 0),
      },
    },
    history: [newHistoryItem, ...(prevStats.history || [])].slice(0, 30),
    lastUpdated: Date.now(),
  };

  savePlayerStats(updated);
  return updated;
}

/**
 * Record single event like sixes or captures
 */
export function recordEventInStats(
  prevStats: PlayerStats,
  event: 'six' | 'capture' | 'home' | 'coins',
  amount: number = 1
): PlayerStats {
  const updated: PlayerStats = {
    ...prevStats,
    totalSixesRolled: prevStats.totalSixesRolled + (event === 'six' ? amount : 0),
    totalTokensCaptured: prevStats.totalTokensCaptured + (event === 'capture' ? amount : 0),
    totalTokensHome: prevStats.totalTokensHome + (event === 'home' ? amount : 0),
    totalCoinsEarned: prevStats.totalCoinsEarned + (event === 'coins' ? amount : 0),
    lastUpdated: Date.now(),
  };
  savePlayerStats(updated);
  return updated;
}

/**
 * Reset player statistics to clean initial zero baseline
 */
export function createResetStats(): PlayerStats {
  const reset: PlayerStats = {
    totalGamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    totalCoinsEarned: 0,
    highestWinStreak: 0,
    currentWinStreak: 0,
    totalTokensHome: 0,
    totalTokensCaptured: 0,
    totalSixesRolled: 0,
    tournamentTrophies: 0,
    modeBreakdown: {
      'vs-bot': { played: 0, won: 0 },
      'pass-and-play': { played: 0, won: 0 },
      'team-2v2': { played: 0, won: 0 },
      'tournament': { played: 0, won: 0 },
      'quick-match': { played: 0, won: 0 },
      'online-room': { played: 0, won: 0 },
    },
    history: [],
    lastUpdated: Date.now(),
  };
  savePlayerStats(reset);
  return reset;
}

/**
 * Calculate Player Level and Title based on total wins & games
 */
export function getPlayerRankInfo(stats: PlayerStats): {
  level: number;
  titleBn: string;
  badgeColor: string;
  progressPercent: number;
  xpCurrent: number;
  xpRequired: number;
} {
  const winPoints = stats.totalWins * 100;
  const gamePoints = stats.totalGamesPlayed * 30;
  const coinPoints = Math.floor(stats.totalCoinsEarned / 200);
  const trophyPoints = stats.tournamentTrophies * 500;
  const totalXp = winPoints + gamePoints + coinPoints + trophyPoints;

  const level = Math.max(1, Math.floor(totalXp / 600) + 1);
  const xpCurrent = totalXp % 600;
  const xpRequired = 600;
  const progressPercent = Math.min(100, Math.round((xpCurrent / xpRequired) * 100));

  let titleBn = 'নবাগত খেলোয়াড়';
  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-300';

  if (level >= 25) {
    titleBn = 'রয়্যাল লুডু সম্রাট 👑';
    badgeColor = 'bg-gradient-to-r from-amber-500 to-yellow-300 text-amber-950 border-amber-400';
  } else if (level >= 18) {
    titleBn = 'গ্র্যান্ড মাস্টার চ্যাম্পিয়ন 🏆';
    badgeColor = 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400';
  } else if (level >= 12) {
    titleBn = 'ডাইস কিংবদন্তি ⚡';
    badgeColor = 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-400';
  } else if (level >= 7) {
    titleBn = 'প্রো লুডু স্টার 🌟';
    badgeColor = 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-400';
  } else if (level >= 4) {
    titleBn = 'দক্ষ খেলোয়াড় 🎯';
    badgeColor = 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-blue-400';
  } else if (level >= 2) {
    titleBn = 'উদীয়মান প্রতিভাবান ✨';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  }

  return {
    level,
    titleBn,
    badgeColor,
    progressPercent,
    xpCurrent,
    xpRequired,
  };
}

/**
 * Format bangla date string
 */
export function formatBanglaDate(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 5) return 'এইমাত্র';
  if (minutes < 60) return `${minutes.toLocaleString('bn-BD')} মিনিট আগে`;
  if (hours < 24) return `${hours.toLocaleString('bn-BD')} ঘণ্টা আগে`;
  if (days === 1) return 'গতকাল';
  if (days < 7) return `${days.toLocaleString('bn-BD')} দিন আগে`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('bn-BD', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate all achievements with real-time status
 */
export function calculateAchievements(stats: PlayerStats): AchievementItem[] {
  return [
    {
      id: 'first_win',
      titleBn: 'প্রথম বিজয় (First Victory)',
      descriptionBn: 'যেকোনো মোডে আপনার প্রথম লুডু ম্যাচ জয়ী হোন।',
      iconName: 'Trophy',
      isUnlocked: stats.totalWins >= 1,
      progress: Math.min(1, stats.totalWins),
      maxProgress: 1,
      rewardCoins: 500,
    },
    {
      id: 'win_10',
      titleBn: '১০টি ম্যাচ বিজয়ী (10 Victories)',
      descriptionBn: 'মোট ১০টি লুডু ম্যাচে জয়লাভ করুন।',
      iconName: 'Crown',
      isUnlocked: stats.totalWins >= 10,
      progress: Math.min(10, stats.totalWins),
      maxProgress: 10,
      rewardCoins: 2000,
    },
    {
      id: 'streak_3',
      titleBn: 'হ্যাটট্রিক জয় (3-Win Streak)',
      descriptionBn: 'টানা ৩টি খেলায় টানা বিজয়ী হোন।',
      iconName: 'Flame',
      isUnlocked: stats.highestWinStreak >= 3,
      progress: Math.min(3, stats.highestWinStreak),
      maxProgress: 3,
      rewardCoins: 1500,
    },
    {
      id: 'coins_50k',
      titleBn: 'কয়েন টাইকুন (50K Coins)',
      descriptionBn: 'খেলে ও জিতে মোট ৫০,০০০ কয়েন অর্জন করুন।',
      iconName: 'Coins',
      isUnlocked: stats.totalCoinsEarned >= 50000,
      progress: Math.min(50000, stats.totalCoinsEarned),
      maxProgress: 50000,
      rewardCoins: 3500,
    },
    {
      id: 'capture_25',
      titleBn: 'গুটি শিকারি (25 Captures)',
      descriptionBn: 'প্রতিপক্ষের ২৫টি গুটি কেটে বোর্ডে আধিপত্য বিস্তার করুন।',
      iconName: 'Swords',
      isUnlocked: stats.totalTokensCaptured >= 25,
      progress: Math.min(25, stats.totalTokensCaptured),
      maxProgress: 25,
      rewardCoins: 1200,
    },
    {
      id: 'tournament_champion',
      titleBn: 'টুর্নামেন্ট চ্যাম্পিয়ন (Tournament Trophy)',
      descriptionBn: 'নকআউট টুর্নামেন্টে গ্র্যান্ড ফাইনাল জয়ী হোন।',
      iconName: 'Medal',
      isUnlocked: stats.tournamentTrophies >= 1,
      progress: Math.min(1, stats.tournamentTrophies),
      maxProgress: 1,
      rewardCoins: 4000,
    },
    {
      id: 'six_master',
      titleBn: 'ছক্কার ওস্তাদ (50 Sixes Rolled)',
      descriptionBn: 'ডাইসে মোট ৫০ বার ছক্কা (৬) ফেলুন।',
      iconName: 'Dice5',
      isUnlocked: stats.totalSixesRolled >= 50,
      progress: Math.min(50, stats.totalSixesRolled),
      maxProgress: 50,
      rewardCoins: 1000,
    },
    {
      id: 'home_run_50',
      titleBn: 'হোম রান স্টার (50 Pawns Home)',
      descriptionBn: 'মোট ৫০টি গুটি সফলভাবে নিজ ঘরে নিয়ে যান।',
      iconName: 'Target',
      isUnlocked: stats.totalTokensHome >= 50,
      progress: Math.min(50, stats.totalTokensHome),
      maxProgress: 50,
      rewardCoins: 2500,
    },
  ];
}
