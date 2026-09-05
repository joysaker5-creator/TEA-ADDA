import { UserProfile, ReferralState, ReferralMilestone, InvitedFriendRecord } from '../types';
import { DEFAULT_AVATARS } from './ludoConstants';

const STORAGE_PREFIX = 'ludo_referral_state_';
const STORAGE_USED_REFERRAL_KEY = 'ludo_used_referral_code';

export const REFERRAL_PER_INVITE_COINS = 5000;
export const REFERRAL_PER_INVITE_DIAMONDS = 20;

export const REFERRAL_WELCOME_COINS = 2500;
export const REFERRAL_WELCOME_DIAMONDS = 10;

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  {
    id: 'mile_1',
    targetCount: 1,
    bonusCoins: 5000,
    bonusDiamonds: 20,
    titleBn: 'প্রথম বন্ধু ইনভাইট',
    badgeBn: '🤝 ফ্রেন্ডস স্টার',
    icon: '🤝',
    exclusivePerkBn: 'স্পেশাল ফ্রেন্ডস ব্যাজ আনলক',
  },
  {
    id: 'mile_3',
    targetCount: 3,
    bonusCoins: 15000,
    bonusDiamonds: 50,
    titleBn: '৩ জন বন্ধু গ্যাং',
    badgeBn: '⭐ আড্ডা স্টার',
    icon: '⭐',
    exclusivePerkBn: 'গোল্ডেন ডাইস স্কিন ট্রায়াল',
  },
  {
    id: 'mile_5',
    targetCount: 5,
    bonusCoins: 30000,
    bonusDiamonds: 100,
    titleBn: '৫ জন বন্ধু স্কোয়াড',
    badgeBn: '👑 স্কোয়াড লিডার',
    icon: '👑',
    exclusivePerkBn: 'রয়্যাল সাউন্ডবোর্ড প্যাক',
  },
  {
    id: 'mile_10',
    targetCount: 10,
    bonusCoins: 75000,
    bonusDiamonds: 250,
    titleBn: '১০ জন মেগা টিম',
    badgeBn: '🔥 লুডো গ্যাংস্টার',
    icon: '🔥',
    exclusivePerkBn: 'ভিআইপি চ্যাট কালার ও ফ্রেম',
  },
  {
    id: 'mile_25',
    targetCount: 25,
    bonusCoins: 200000,
    bonusDiamonds: 800,
    titleBn: '২৫ জন রয়্যাল অ্যাম্বাসেডর',
    badgeBn: '💎 গ্র্যান্ড অ্যাম্বাসেডর',
    icon: '💎',
    exclusivePerkBn: 'লাইফটাইম অ্যাম্বাসেডর ব্যাজ',
  },
];

// Generate clean unique referral code based on user
export const generateUniqueReferralCode = (user: UserProfile): string => {
  if (!user || !user.id) {
    return 'LUDO-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  }
  // Sanitize user name or use user id
  const namePart = (user.name || 'USER')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const idPart = user.id.replace(/[^a-zA-Z0-9]/g, '').slice(-3).toUpperCase();
  const codeSuffix = namePart.length >= 2 ? `${namePart}${idPart}` : user.id.slice(-5).toUpperCase();
  return `LUDO-${codeSuffix}`;
};

// Initial Seed Sample Friends for demo realism if empty
const getInitialSampleFriends = (): InvitedFriendRecord[] => {
  return [
    {
      id: 'inv_1',
      name: 'তানভীর হাসান',
      joinedAt: Date.now() - 86400000 * 2,
      status: 'played_game',
      coinsAwarded: 5000,
      diamondsAwarded: 20,
      countryFlag: '🇧🇩',
      avatarConfig: DEFAULT_AVATARS.green,
    },
    {
      id: 'inv_2',
      name: 'সাদিয়া সুলতানা',
      joinedAt: Date.now() - 86400000 * 1,
      status: 'level_up',
      coinsAwarded: 5000,
      diamondsAwarded: 20,
      countryFlag: '🇧🇩',
      avatarConfig: DEFAULT_AVATARS.yellow,
    },
  ];
};

// Load user referral state
export const loadReferralState = (user: UserProfile): ReferralState => {
  try {
    const key = STORAGE_PREFIX + (user.id || 'default');
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.referralCode) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading referral state:', err);
  }

  // Create fresh state
  const newCode = generateUniqueReferralCode(user);
  const sampleFriends = getInitialSampleFriends();
  const initialState: ReferralState = {
    referralCode: newCode,
    hasClaimedWelcomeBonus: false,
    totalInvitedCount: sampleFriends.length,
    totalCoinsEarned: sampleFriends.length * REFERRAL_PER_INVITE_COINS,
    totalDiamondsEarned: sampleFriends.length * REFERRAL_PER_INVITE_DIAMONDS,
    claimedMilestoneIds: ['mile_1'],
    invitedFriends: sampleFriends,
    lastUpdated: Date.now(),
  };

  saveReferralState(user.id, initialState);
  return initialState;
};

// Save user referral state
export const saveReferralState = (userId: string, state: ReferralState): void => {
  try {
    const key = STORAGE_PREFIX + (userId || 'default');
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving referral state:', err);
  }
};

// Detect referral code from URL
export const detectReferralCodeFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('invite') || params.get('code');
    if (ref && ref.trim()) {
      return ref.trim().toUpperCase();
    }
  } catch (e) {
    console.error('Error parsing referral from URL:', e);
  }
  return null;
};

// Build unique referral share link
export const buildReferralShareLink = (referralCode: string): string => {
  if (typeof window === 'undefined') {
    return `https://ludolive.app/?ref=${referralCode}`;
  }
  const origin = window.location.origin;
  const path = window.location.pathname;
  return `${origin}${path}?ref=${referralCode}`;
};

// Build Bangla share message text
export const buildShareMessage = (referralCode: string, shareLink: string): string => {
  return `🎮 জয় লুডু (Joy Ludo) এ আমার সাথে খেলুন!\n\n🎁 আমার ইনভাইট লিঙ্ক দিয়ে যোগ দিলেই পাবেন ২,৫০০ ফ্রি কয়েন 🪙 এবং ১০ ডায়মন্ড 💎!\n\n👇 এখনই যোগ দিন:\n${shareLink}\n\n👉 রেফারেল কোড: ${referralCode}`;
};

// Share via Web Share API or fallback
export const triggerWebShare = async (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err) {
      // User canceled or unsupported
      return false;
    }
  }
  return false;
};

// Apply a friend's referral code to get 2,500 Coins + 10 Diamonds
export const applyReferralCodeService = async (
  code: string,
  user: UserProfile,
  onRewardGranted: (coins: number, diamonds: number) => void
): Promise<{ success: boolean; message: string; coins?: number; diamonds?: number }> => {
  const cleanCode = code.trim().toUpperCase();
  const myState = loadReferralState(user);

  if (myState.referralCode === cleanCode) {
    return {
      success: false,
      message: 'আপনি নিজের রেফারেল কোড ব্যবহার করতে পারবেন না!',
    };
  }

  if (myState.hasClaimedWelcomeBonus) {
    return {
      success: false,
      message: 'আপনি ইতিমধ্যে রেফারেল বোনাস গ্রহণ করেছেন!',
    };
  }

  // Attempt server synchronization
  try {
    const res = await fetch('/api/referral/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referralCode: cleanCode,
        refereeUserId: user.id,
        refereeName: user.name,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        // Update local state
        myState.hasClaimedWelcomeBonus = true;
        myState.referredByCode = cleanCode;
        myState.lastUpdated = Date.now();
        saveReferralState(user.id, myState);
        localStorage.setItem(STORAGE_USED_REFERRAL_KEY, cleanCode);

        onRewardGranted(REFERRAL_WELCOME_COINS, REFERRAL_WELCOME_DIAMONDS);
        return {
          success: true,
          message: `অভিনন্দন! রেফারেল কোড সফলভাবে যুক্ত হয়েছে এবং আপনি পেয়েছেন ${REFERRAL_WELCOME_COINS.toLocaleString('bn-BD')} কয়েন ও ${REFERRAL_WELCOME_DIAMONDS} ডায়মন্ড! 🎉`,
          coins: REFERRAL_WELCOME_COINS,
          diamonds: REFERRAL_WELCOME_DIAMONDS,
        };
      }
    }
  } catch (err) {
    console.warn('Server offline, applying locally:', err);
  }

  // Local fallback application
  myState.hasClaimedWelcomeBonus = true;
  myState.referredByCode = cleanCode;
  myState.lastUpdated = Date.now();
  saveReferralState(user.id, myState);
  localStorage.setItem(STORAGE_USED_REFERRAL_KEY, cleanCode);

  onRewardGranted(REFERRAL_WELCOME_COINS, REFERRAL_WELCOME_DIAMONDS);

  return {
    success: true,
    message: `অভিনন্দন! আপনি পেয়েছেন ${REFERRAL_WELCOME_COINS.toLocaleString('bn-BD')} ওয়েলকাম কয়েন ও ${REFERRAL_WELCOME_DIAMONDS} ডায়মন্ড! 🎉`,
    coins: REFERRAL_WELCOME_COINS,
    diamonds: REFERRAL_WELCOME_DIAMONDS,
  };
};

// Simulate adding a friend for instant demo testing
export const simulateAddFriendInvite = (
  user: UserProfile,
  friendName?: string
): {
  updatedState: ReferralState;
  coinsEarned: number;
  diamondsEarned: number;
  newFriend: InvitedFriendRecord;
} => {
  const state = loadReferralState(user);
  const randomNames = ['রাকিবুল ইসলাম', 'ফাহমিদা হক', 'মেহেদী হাসান', 'সুমাইয়া আক্তার', 'মাহির চৌধুরী', 'তন্ময় রয়'];
  const name = friendName || randomNames[Math.floor(Math.random() * randomNames.length)];
  const friendId = 'inv_' + Date.now().toString(36);

  const colors = [DEFAULT_AVATARS.red, DEFAULT_AVATARS.blue, DEFAULT_AVATARS.green, DEFAULT_AVATARS.yellow];
  const randomAvatar = colors[Math.floor(Math.random() * colors.length)];

  const newFriend: InvitedFriendRecord = {
    id: friendId,
    name,
    joinedAt: Date.now(),
    status: 'registered',
    coinsAwarded: REFERRAL_PER_INVITE_COINS,
    diamondsAwarded: REFERRAL_PER_INVITE_DIAMONDS,
    countryFlag: '🇧🇩',
    avatarConfig: randomAvatar,
  };

  state.invitedFriends.unshift(newFriend);
  state.totalInvitedCount += 1;
  state.totalCoinsEarned += REFERRAL_PER_INVITE_COINS;
  state.totalDiamondsEarned += REFERRAL_PER_INVITE_DIAMONDS;
  state.lastUpdated = Date.now();

  saveReferralState(user.id, state);

  return {
    updatedState: state,
    coinsEarned: REFERRAL_PER_INVITE_COINS,
    diamondsEarned: REFERRAL_PER_INVITE_DIAMONDS,
    newFriend,
  };
};
