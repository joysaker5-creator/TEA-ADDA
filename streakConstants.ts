import { DailyStreakDayReward, DailyStreakState } from '../types';

export const DAILY_STREAK_REWARDS: DailyStreakDayReward[] = [
  { day: 1, coins: 150, diamonds: 0, titleBn: '১ম দিন - শুরুয়াতি গিফট', badge: '🎁' },
  { day: 2, coins: 250, diamonds: 1, titleBn: '২য় দিন - ডাবল বোনাস', badge: '⚡' },
  { day: 3, coins: 400, diamonds: 2, titleBn: '৩য় দিন - লাকি ডাইস', badge: '🎲' },
  { day: 4, coins: 600, diamonds: 3, titleBn: '৪র্থ দিন - সুপার বুস্টার', badge: '🔥' },
  { day: 5, coins: 850, diamonds: 5, titleBn: '৫ম দিন - রাজকীয় উপহার', badge: '💎' },
  { day: 6, coins: 1200, diamonds: 8, titleBn: '৬ষ্ঠ দিন - মাস্টার প্লেয়ার', badge: '🏆' },
  { day: 7, coins: 2500, diamonds: 15, titleBn: '৭ম দিন - মেগা জ্যাকপট', badge: '👑', isMega: true },
];

export const DEFAULT_STREAK_STATE: DailyStreakState = {
  currentStreak: 0,
  lastClaimDate: null,
  highestStreak: 0,
  totalCoinsClaimed: 0,
  totalDaysClaimed: 0,
};

export const STORAGE_KEY_DAILY_STREAK = 'ludo_daily_streak_v1';

// Convert date to YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateString(date: Date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
}

// Convert English digits to Bengali digits
export function toBnNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return num
    .toString()
    .split('')
    .map((char) => {
      const parsed = parseInt(char, 10);
      return isNaN(parsed) ? char : bnDigits[parsed];
    })
    .join('');
}

export interface StreakEvaluation {
  canClaimToday: boolean;
  isAlreadyClaimedToday: boolean;
  isStreakBroken: boolean;
  activeRewardDay: number; // 1 to 7
  activeRewardCoins: number;
  activeRewardDiamonds: number;
  nextRewardDay: number; // 1 to 7
  nextRewardCoins: number;
  nextRewardDiamonds: number;
  displayStreakCount: number;
  isMegaDay: boolean;
}

export function evaluateStreak(state: DailyStreakState, now: Date = new Date()): StreakEvaluation {
  const todayStr = getLocalDateString(now);
  const yesterdayStr = getYesterdayDateString(now);

  const lastClaim = state.lastClaimDate;

  // Case 1: Already claimed today
  if (lastClaim === todayStr) {
    const activeDay = ((state.currentStreak - 1) % 7) + 1;
    const nextDay = (state.currentStreak % 7) + 1;
    const activeReward = DAILY_STREAK_REWARDS.find((r) => r.day === activeDay) || DAILY_STREAK_REWARDS[0];
    const nextReward = DAILY_STREAK_REWARDS.find((r) => r.day === nextDay) || DAILY_STREAK_REWARDS[0];

    return {
      canClaimToday: false,
      isAlreadyClaimedToday: true,
      isStreakBroken: false,
      activeRewardDay: activeDay,
      activeRewardCoins: activeReward.coins,
      activeRewardDiamonds: activeReward.diamonds || 0,
      nextRewardDay: nextDay,
      nextRewardCoins: nextReward.coins,
      nextRewardDiamonds: nextReward.diamonds || 0,
      displayStreakCount: state.currentStreak,
      isMegaDay: activeDay === 7,
    };
  }

  // Case 2: Claimed yesterday -> Continuing streak today!
  if (lastClaim === yesterdayStr) {
    const pendingDay = (state.currentStreak % 7) + 1;
    const nextDay = ((state.currentStreak + 1) % 7) + 1;
    const activeReward = DAILY_STREAK_REWARDS.find((r) => r.day === pendingDay) || DAILY_STREAK_REWARDS[0];
    const nextReward = DAILY_STREAK_REWARDS.find((r) => r.day === nextDay) || DAILY_STREAK_REWARDS[0];

    return {
      canClaimToday: true,
      isAlreadyClaimedToday: false,
      isStreakBroken: false,
      activeRewardDay: pendingDay,
      activeRewardCoins: activeReward.coins,
      activeRewardDiamonds: activeReward.diamonds || 0,
      nextRewardDay: nextDay,
      nextRewardCoins: nextReward.coins,
      nextRewardDiamonds: nextReward.diamonds || 0,
      displayStreakCount: state.currentStreak,
      isMegaDay: pendingDay === 7,
    };
  }

  // Case 3: First time ever or missed one or more days -> Streak resets to Day 1
  const activeReward = DAILY_STREAK_REWARDS[0];
  const nextReward = DAILY_STREAK_REWARDS[1];
  const isBroken = lastClaim !== null && lastClaim !== yesterdayStr && lastClaim !== todayStr;

  return {
    canClaimToday: true,
    isAlreadyClaimedToday: false,
    isStreakBroken: isBroken,
    activeRewardDay: 1,
    activeRewardCoins: activeReward.coins,
    activeRewardDiamonds: activeReward.diamonds || 0,
    nextRewardDay: 2,
    nextRewardCoins: nextReward.coins,
    nextRewardDiamonds: nextReward.diamonds || 0,
    displayStreakCount: 0,
    isMegaDay: false,
  };
}
