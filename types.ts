export type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';

export type BoardThemeId = 'classic' | 'wooden' | 'neon' | 'marble' | 'nature';
export type DiceStyleId = 'classic' | 'golden' | 'crystal' | 'wooden' | 'ruby';
export type DiceFaceStyle = 'dots' | 'bengali_numbers' | 'english_numbers';
export type TokenStyleId = 'classic' | 'crown' | 'shield' | 'diamond' | 'star';
export type GameBackgroundId =
  | 'bd_flag'
  | 'classic_amber'
  | 'casino_green'
  | 'royal_purple'
  | 'cyber_neon'
  | 'marble_palace'
  | 'sunset_red'
  | 'ocean_breeze'
  | 'midnight_carbon'
  | 'custom_photo';

export interface CustomizationConfig {
  boardTheme: BoardThemeId;
  diceStyle: DiceStyleId;
  diceFace: DiceFaceStyle;
  tokenStyle: TokenStyleId;
  gameBackground: GameBackgroundId;
  customBgUrl?: string; // Data URL for uploaded background wallpaper
  bgPattern?: 'none' | 'velvet' | 'wood' | 'stars' | 'hex' | 'marble' | 'damask';
  bgBrightness?: number; // 50 to 120
}

export interface AvatarConfig {
  skinColor: string;
  hairStyle: 'short' | 'curly' | 'wavy' | 'cap' | 'crown' | 'turban' | 'hijab' | 'ponytail';
  hairColor: string;
  eyes: 'normal' | 'happy' | 'wink' | 'cool' | 'sparkle';
  mouth: 'smile' | 'laugh' | 'smirk' | 'open';
  clothing: 'punjabi' | 'hoodie' | 'tshirt' | 'suit' | 'jersey' | 'royal_robe';
  clothingColor: string;
  accessory: 'none' | 'glasses' | 'sunglasses' | 'headphone' | 'mustache' | 'golden_chain';
  bgGradient: string;
  avatarType?: 'vector' | 'photo';
  photoUrl?: string; // Data URL or URL from user gallery/files
  photoScale?: number;
  photoFilter?: 'none' | 'vivid' | 'warm' | 'cool' | 'golden' | 'bw';
}

export interface Token {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1 = in yard, 0 = start cell, 1..50 = circuit, 51..56 = home run, 57 = home (finished)
  isHome: boolean;
}

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isBot: boolean;
  coins: number;
  tokens: Token[];
  hasFinished: boolean;
  rank?: number;
  isMuted: boolean;
  isSpeaking: boolean;
  avatar: AvatarConfig;
  isVip?: boolean;
  vipTier?: VipTierId;
  vipBadge?: string;
  vipFrameId?: VipFrameId;
  vipChatBubbleId?: VipChatBubbleId;
}

export type GameMode =
  | 'vs-bot'
  | 'pass-and-play'
  | 'online-room'
  | 'team-2v2'
  | 'tournament'
  | 'quick-match';

export type TournamentStage = 'quarter' | 'semi' | 'final' | 'champion';

export interface TournamentMatchPlayer {
  name: string;
  color: PlayerColor;
  isUser: boolean;
  avatar: AvatarConfig;
  score?: number;
}

export interface TournamentMatch {
  id: string;
  stage: TournamentStage;
  stageName: string;
  matchIndex: number;
  player1: TournamentMatchPlayer;
  player2: TournamentMatchPlayer;
  winnerColor?: PlayerColor;
  winnerName?: string;
  status: 'upcoming' | 'current' | 'completed';
}

export interface TeamScore {
  teamId: 1 | 2;
  name: string;
  colors: PlayerColor[];
  tokensHome: number;
  targetTokens: number;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  roomId?: string;
  entryFee: number;
  prizePool: number;
  currentTurnIndex: number;
  diceValue: number | null;
  isRolling: boolean;
  consecutiveSixes: number;
  lastActionText: string;
  hasRolled: boolean;
  eligibleTokenIds: number[];
  winner: PlayerColor | null;
  rankings: PlayerColor[];
}

export interface CoinPackage {
  id: string;
  title: string;
  coins: number;
  bonus: number;
  priceBDT: number;
  badge?: string;
  color: string;
}

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket' | 'card';

export interface VoiceMessage {
  id: string;
  senderName: string;
  senderColor: PlayerColor;
  text: string;
  time: number;
}

export interface DailyStreakDayReward {
  day: number;
  coins: number;
  diamonds?: number;
  titleBn: string;
  badge?: string;
  isMega?: boolean;
}

export interface DailyStreakState {
  currentStreak: number;
  lastClaimDate: string | null; // YYYY-MM-DD
  highestStreak: number;
  totalCoinsClaimed: number;
  totalDiamondsClaimed?: number;
  totalDaysClaimed: number;
}

export interface DiamondPackage {
  id: string;
  title: string;
  diamonds: number;
  bonus: number;
  priceBDT: number;
  badge?: string;
  color: string;
}

export interface LevelReward {
  level: number;
  titleBn: string;
  rewardCoins: number;
  rewardDiamonds: number;
  coins?: number;
  diamonds?: number;
  tierNameBn: string;
  badge?: string;
  exclusiveItem?: string;
  isMilestone?: boolean;
}

export interface AccountLevelState {
  currentLevel: number;
  currentXP: number;
  totalAccumulatedXP: number;
  diamonds: number;
  totalDiamondsEarned: number;
  claimedLevelRewards: number[]; // Array of level numbers claimed
  lastLevelUpTimestamp?: number;
}

export interface LevelUpEventData {
  previousLevel: number;
  newLevel: number;
  rewardCoins: number;
  rewardDiamonds: number;
  reward: {
    coins?: number;
    diamonds?: number;
  };
  tierTitleBn: string;
  exclusivePerk?: string;
}

export interface MatchHistoryItem {
  id: string;
  date: string;
  timestamp: number;
  gameMode: GameMode;
  result: 'win' | 'loss';
  coinsEarned: number;
  tokensReachedHome: number;
  tokensCaptured: number;
  opponentNames?: string[];
}

export interface ModeStats {
  played: number;
  won: number;
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  totalCoinsEarned: number;
  highestWinStreak: number;
  currentWinStreak: number;
  totalTokensHome: number;
  totalTokensCaptured: number;
  totalSixesRolled: number;
  tournamentTrophies: number;
  modeBreakdown: Record<GameMode, ModeStats>;
  history: MatchHistoryItem[];
  lastUpdated: number;
}

export interface AchievementItem {
  id: string;
  titleBn: string;
  descriptionBn: string;
  iconName: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins?: number;
}

export type AuthProvider = 'google' | 'facebook' | 'phone' | 'email' | 'guest';

export type AgeCategory = 'under_13' | 'teen_13_17' | 'adult_18_plus';

export interface AgeVerificationConfig {
  isAgeVerified: boolean;
  age: number;
  birthDate?: string;
  ageCategory: AgeCategory;
  childSafeMode: boolean;
  dailyScreenTimeLimitMinutes: number; // 0 = unlimited, 30, 60, 90, 120
  hasParentalPin: boolean;
  parentalPin?: string;
  verifiedAt?: number;
  voiceChatAllowed: boolean;
  textChatAllowed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  provider: AuthProvider;
  linkedProviders: AuthProvider[];
  isVerified: boolean;
  hasPassword?: boolean;
  createdAt: number;
  lastLoginAt: number;
  age?: number;
  birthDate?: string;
  ageCategory?: AgeCategory;
  isAgeVerified?: boolean;
  childSafeMode?: boolean;
  dailyScreenTimeLimitMinutes?: number;
  parentalPin?: string;
}

export type AuthModalView =
  | 'login'
  | 'register'
  | 'phone_otp'
  | 'facebook_access'
  | 'google_access'
  | 'whatsapp_access'
  | 'forgot_password'
  | 'reset_password'
  | 'change_password'
  | 'profile';

export interface ReferralMilestone {
  id: string;
  targetCount: number;
  bonusCoins: number;
  bonusDiamonds: number;
  titleBn: string;
  badgeBn: string;
  icon: string;
  exclusivePerkBn?: string;
}

export interface InvitedFriendRecord {
  id: string;
  name: string;
  avatarType?: 'vector' | 'photo';
  avatarConfig?: AvatarConfig;
  joinedAt: number;
  status: 'registered' | 'played_game' | 'level_up';
  coinsAwarded: number;
  diamondsAwarded: number;
  countryFlag?: string;
}

export interface ReferralState {
  referralCode: string;
  referredByCode?: string;
  hasClaimedWelcomeBonus: boolean;
  totalInvitedCount: number;
  totalCoinsEarned: number;
  totalDiamondsEarned: number;
  claimedMilestoneIds: string[];
  invitedFriends: InvitedFriendRecord[];
  lastUpdated: number;
}

export interface VideoComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: AvatarConfig;
  userPhoto?: string;
  text: string;
  createdAt: number;
  likes: number;
}


export type VideoContentType =
  | 'funny_moment'
  | 'educational_guide'
  | 'tutorial'
  | 'gameplay_highlight'
  | 'epic_win'
  | 'voice_adda_clip'
  | 'creative_good_content';

export interface VideoContent {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: AvatarConfig;
  creatorPhoto?: string;
  creatorCountry: string; // e.g. 'BD'
  videoUrl?: string; // Video file or generated animation/canvas stream
  thumbnailUrl?: string;
  videoType: VideoContentType;
  categoryLabelBn?: string;
  gameSnippet?: {
    playerColor: PlayerColor;
    diceRoll: number;
    tokensCaptured: number;
    coinsWon: number;
  };
  durationSeconds: number;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  earningsBDT: number; // Total Taka earned from this video
  rpmRateBDT?: number; // Rate per 1k views (higher for funny & educational)
  qualityBonusBDT?: number; // Special bonus for good content
  diamondsReceived: number;
  isMonetized: boolean;
  isKidsSafe: boolean;
  status: 'published' | 'under_review' | 'rejected_child_safety' | 'rejected_policy_violation';
  createdAt: number;
  tags: string[];
  offlineCachedAt?: number;
  offlineSizeBytes?: number;
}

export type CreatorTier = 'bronze' | 'silver' | 'gold' | 'diamond_star';

export interface CreatorMonetizationProfile {
  userId: string;
  isEligible: boolean;
  isMonetized: boolean;
  appliedAt?: number;
  approvedAt?: number;
  countryCode: string; // 'BD' eligible, others pending
  isCountrySupported: boolean;
  balanceBDT: number; // Available Taka balance for cashout
  totalEarnedBDT: number;
  pendingWithdrawalBDT: number;
  totalViews: number;
  totalLikes: number;
  totalDiamondsGifted: number;
  totalVideosCount: number;
  funnyVideosEarnedBDT?: number;
  educationalVideosEarnedBDT?: number;
  creativeVideosEarnedBDT?: number;
  creatorTier?: CreatorTier;
  monthlyLeaderboardRank?: number;
  payoutMethod?: 'bkash' | 'nagad' | 'rocket' | 'bank';
  payoutAccountNumber?: string;
  payoutAccountName?: string;
  bankName?: string;
  branchName?: string;
}

export interface WithdrawalTransaction {
  id: string;
  userId: string;
  amountBDT: number;
  method: 'bkash' | 'nagad' | 'rocket' | 'bank';
  accountNumber: string;
  accountName?: string;
  status: 'pending' | 'completed' | 'processing';
  requestedAt: number;
  completedAt?: number;
  txId?: string;
}

export interface PolicyScanResult {
  isSafe: boolean;
  violationType?: 'minor_child_detected' | 'political' | 'religious_hate' | 'rumor_fake_news' | 'abusive_profanity' | 'instigating_threat' | 'underage_creator';
  reasonBn?: string;
  flaggedKeywords?: string[];
}

export interface AdvertiserInquiry {
  id: string;
  brandName: string;
  contactPerson: string;
  phone: string;
  email: string;
  adType: 'board_banner' | 'video_sponsor' | 'voice_adda_sponsor' | 'tournament_partner' | 'rewarded_ad' | 'custom_partnership';
  budgetRange: 'under_50k' | '50k_to_200k' | '200k_to_500k' | '500k_plus';
  targetAudience?: string;
  message: string;
  submittedAt: number;
  status: 'received' | 'in_review' | 'contacted';
}

export type VipTierId = 'vip_silver' | 'vip_gold' | 'vip_diamond' | 'vip_royal';

export type VipFrameId =
  | 'none'
  | 'vip_gold_dragon'
  | 'vip_diamond_crown'
  | 'vip_neon_cyber'
  | 'vip_flame_phoenix'
  | 'vip_galaxy_star'
  | 'vip_royal_emperor';

export type VipChatBubbleId =
  | 'classic'
  | 'vip_gold_royal'
  | 'vip_neon_violet'
  | 'vip_dragon_fire'
  | 'vip_cyber_matrix'
  | 'vip_diamond_glimmer';

export type VipBadgeId = 'vip_crown' | 'vip_gold' | 'vip_diamond' | 'vip_flame';

export interface VipSubscriptionState {
  isActive: boolean;
  tier: VipTierId;
  passType: '7_days' | '30_days' | '90_days' | 'lifetime';
  expiresAt: number | null; // timestamp or null for lifetime
  purchasedAt: number;
  activeFrameId: VipFrameId;
  activeChatBubbleId: VipChatBubbleId;
  activeBadgeId: VipBadgeId;
  unlockedFrames: VipFrameId[];
  unlockedChatBubbles: VipChatBubbleId[];
  unlockedBadges: VipBadgeId[];
  autoRenew?: boolean;
}

export interface VipPackage {
  id: '7_days' | '30_days' | '90_days' | 'lifetime';
  tier: VipTierId;
  nameBn: string;
  nameEn: string;
  durationDays: number; // 0 for lifetime
  durationLabelBn: string;
  originalDiamondPrice: number;
  diamondPrice: number;
  badgeBn: string;
  xpBoosterPercent: number;
  unlockedFrames: VipFrameId[];
  unlockedChatBubbles: VipChatBubbleId[];
  unlockedBadges: VipBadgeId[];
  perksBn: string[];
  isPopular?: boolean;
  isBestValue?: boolean;
}

export interface VipFrameItem {
  id: VipFrameId;
  nameBn: string;
  descriptionBn: string;
  minTier: VipTierId;
  previewGradient: string;
  icon: string;
  glowColor: string;
}

export interface VipChatBubbleItem {
  id: VipChatBubbleId;
  nameBn: string;
  descriptionBn: string;
  minTier: VipTierId;
  themeStyle: {
    bubbleBg: string;
    bubbleBorder: string;
    textColor: string;
    senderColor: string;
    accentGlow: string;
    badgeIcon: string;
  };
}




