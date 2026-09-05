import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Coins,
  Tv,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
  Users,
  Users2,
  Zap,
  Trophy,
  Bot,
  Globe,
  Award,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Flame,
  Palette,
  Camera,
  Image as ImageIcon,
  BarChart3,
  Gem,
  LogIn,
  UserCheck,
  User as UserIcon,
  Radio,
  Gift,
  Share2,
  Film,
  Megaphone,
  Crown,
  Gamepad2,
} from 'lucide-react';

import {
  GameState,
  Player,
  PlayerColor,
  Token,
  VoiceMessage,
  GameMode,
  AvatarConfig,
  TournamentMatch,
  TournamentStage,
  CustomizationConfig,
  DailyStreakState,
  PlayerStats,
  AccountLevelState,
  LevelUpEventData,
  LevelReward,
  UserProfile,
  AuthModalView,
  VipSubscriptionState,
} from './types';
import {
  COLOR_CONFIG,
  INITIAL_PLAYERS,
  PLAYERS_4,
  SAFE_CELL_INDICES,
  VOICE_REACTIONS,
  DEFAULT_AVATARS,
} from './utils/ludoConstants';
import {
  DEFAULT_CUSTOMIZATION,
  BOARD_THEMES,
  DICE_STYLES,
  TOKEN_STYLES,
  GAME_BACKGROUNDS,
} from './utils/customizationConstants';
import {
  DEFAULT_STREAK_STATE,
  STORAGE_KEY_DAILY_STREAK,
  getLocalDateString,
} from './utils/streakConstants';
import {
  loadPlayerStats,
  savePlayerStats,
  recordMatchInStats,
  recordEventInStats,
  createResetStats,
} from './utils/statsConstants';
import {
  loadAccountLevelState,
  saveAccountLevelState,
  addXPAndCheckLevelUp,
  claimLevelRewardInState,
  getLevelTitle,
  getLevelBadge,
  calculateLevelProgress,
  LEVEL_TIERS,
} from './utils/levelConstants';
import {
  rollDiceValue,
  getEligibleTokens,
  executeTokenMove,
  pickSmartBotToken,
  isTeammate,
} from './utils/ludoLogic';
import { Sound } from './utils/soundEffects';
import { LudoBoard } from './components/LudoBoard';
import { DiceRoller } from './components/DiceRoller';
import { AudioCallWidget } from './components/AudioCallWidget';
import { DailyLoginStreak } from './components/DailyLoginStreak';
import { CoinStoreModal } from './components/CoinStoreModal';
import { WatchAdModal } from './components/WatchAdModal';
import { GameOverModal } from './components/GameOverModal';
import { AvatarDisplay, DEFAULT_AVATAR } from './components/AvatarDisplay';
import { AvatarCustomizerModal } from './components/AvatarCustomizerModal';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { TeamPlayBanner } from './components/TeamPlayBanner';
import { QuickMatchHUD } from './components/QuickMatchHUD';
import { TournamentModal } from './components/TournamentModal';
import { CustomizationModal } from './components/CustomizationModal';
import { GameStatsModal } from './components/GameStatsModal';
import { LevelUpModal } from './components/LevelUpModal';
import { LevelRoadmapModal } from './components/LevelRoadmapModal';
import { AuthModal } from './components/AuthModal';
import { AddaLiveBoardModal } from './components/AddaLiveBoardModal';
import { InviteFriendsModal } from './components/InviteFriendsModal';
import { AgeLimitModal } from './components/AgeLimitModal';
import { ScreenTimeAlertModal } from './components/ScreenTimeAlertModal';
import { JoyVideoStudioModal } from './components/JoyVideoStudioModal';
import { JoyLudoShortsScrollPlayer } from './components/JoyLudoShortsScrollPlayer';
import { HomeReelsFeed } from './components/HomeReelsFeed';
import { AdvertiserContactModal } from './components/AdvertiserContactModal';
import { VipSubscriptionModal } from './components/VipSubscriptionModal';
import { VipBadge } from './components/VipBadge';
import { TopAndBottomNavbar } from './components/navigation/TopAndBottomNavbar';
import { SearchModal } from './components/navigation/SearchModal';
import { MessagesInboxModal } from './components/navigation/MessagesInboxModal';
import { NotificationsModal } from './components/navigation/NotificationsModal';
import { GameModesModal } from './components/navigation/GameModesModal';
import { MenuDrawer } from './components/navigation/MenuDrawer';
import { ApkInstallModal } from './components/ApkInstallModal';
import { ExitConfirmModal } from './components/navigation/ExitConfirmModal';
import { RulesModal } from './components/RulesModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { loadUserSettings, saveUserSettings } from './utils/userSettingsService';
import { loadUserProfile, saveUserProfile } from './utils/authService';
import { detectReferralCodeFromUrl } from './utils/referralService';
import {
  loadVipState,
  saveVipState,
  getVipRemainingDays,
} from './utils/vipService';
import {
  loadUserAgeConfig,
  addScreenTimeMinutes,
  isScreenTimeLimitExceeded,
} from './utils/ageLimitService';
import { AgeVerificationConfig } from './types';


// Factory for Tournament Bracket Matches
const createInitialTournamentMatches = (userAvatar: AvatarConfig): TournamentMatch[] => [
  {
    id: 'qf_1',
    stage: 'quarter',
    stageName: 'Quarter-Final 1',
    matchIndex: 0,
    player1: { name: 'You', color: 'red', isUser: true, avatar: userAvatar },
    player2: { name: 'Tanvir', color: 'green', isUser: false, avatar: DEFAULT_AVATARS.green },
    status: 'current',
  },
  {
    id: 'qf_2',
    stage: 'quarter',
    stageName: 'Quarter-Final 2',
    matchIndex: 1,
    player1: { name: 'Sadia', color: 'yellow', isUser: false, avatar: DEFAULT_AVATARS.yellow },
    player2: { name: 'Rakib', color: 'blue', isUser: false, avatar: DEFAULT_AVATARS.blue },
    status: 'upcoming',
  },
  {
    id: 'qf_3',
    stage: 'quarter',
    stageName: 'Quarter-Final 3',
    matchIndex: 2,
    player1: { name: 'Shakib', color: 'red', isUser: false, avatar: DEFAULT_AVATARS.red },
    player2: { name: 'Afrin', color: 'green', isUser: false, avatar: DEFAULT_AVATARS.green },
    status: 'upcoming',
  },
  {
    id: 'qf_4',
    stage: 'quarter',
    stageName: 'Quarter-Final 4',
    matchIndex: 3,
    player1: { name: 'Fahim', color: 'yellow', isUser: false, avatar: DEFAULT_AVATARS.yellow },
    player2: { name: 'Rubel', color: 'blue', isUser: false, avatar: DEFAULT_AVATARS.blue },
    status: 'upcoming',
  },
  {
    id: 'sf_1',
    stage: 'semi',
    stageName: 'Semi-Final 1',
    matchIndex: 4,
    player1: { name: 'You', color: 'red', isUser: true, avatar: userAvatar },
    player2: { name: 'Sadia', color: 'yellow', isUser: false, avatar: DEFAULT_AVATARS.yellow },
    status: 'upcoming',
  },
  {
    id: 'sf_2',
    stage: 'semi',
    stageName: 'Semi-Final 2',
    matchIndex: 5,
    player1: { name: 'Shakib', color: 'red', isUser: false, avatar: DEFAULT_AVATARS.red },
    player2: { name: 'Rubel', color: 'blue', isUser: false, avatar: DEFAULT_AVATARS.blue },
    status: 'upcoming',
  },
  {
    id: 'fn_1',
    stage: 'final',
    stageName: 'Grand Final 🏆',
    matchIndex: 6,
    player1: { name: 'You', color: 'red', isUser: true, avatar: userAvatar },
    player2: { name: 'Rubel', color: 'blue', isUser: false, avatar: DEFAULT_AVATARS.blue },
    status: 'upcoming',
  },
];

export default function App() {
  // Game mode & room state
  const [gameMode, setGameMode] = useState<GameMode>('vs-bot');
  const [localPlayerColor, setLocalPlayerColor] = useState<PlayerColor>('red');

  // Team 2v2 state
  const [teamWon, setTeamWon] = useState<1 | 2 | null>(null);

  // Tournament state
  const [tournamentStage, setTournamentStage] = useState<TournamentStage>('quarter');
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>(() =>
    createInitialTournamentMatches(DEFAULT_AVATARS.red)
  );
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState<boolean>(false);
  const [isTournamentOver, setIsTournamentOver] = useState<boolean>(false);
  const [championName, setChampionName] = useState<string>('');
  const [championColor, setChampionColor] = useState<PlayerColor>('red');
  const tournamentPrizePool = 5000;

  // Online Room & Matchmaking state
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState<boolean>(false);
  const [onlineRoomPlayers, setOnlineRoomPlayers] = useState<Player[]>([]);
  const [playerId] = useState<string>(() => {
    let id = localStorage.getItem('ludo_player_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('ludo_player_id', id);
    }
    return id;
  });

  // User's custom avatar (persisted locally)
  const [userAvatar, setUserAvatar] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('ludo_player_avatar');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_AVATARS.red || DEFAULT_AVATAR;
  });

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState<boolean>(false);

  const [players, setPlayers] = useState<Player[]>(() => {
    let initialAvatar = DEFAULT_AVATARS.red;
    try {
      const saved = localStorage.getItem('ludo_player_avatar');
      if (saved) initialAvatar = JSON.parse(saved);
    } catch {}

    const initialVip = loadVipState('usr_local_main');

    return PLAYERS_4.map((p) => {
      const isRed = p.color === 'red';
      return {
        ...p,
        isBot: !isRed,
        avatar: isRed ? initialAvatar : p.avatar,
        isVip: isRed ? initialVip.isActive : false,
        vipTier: isRed ? initialVip.tier : undefined,
        vipBadge: isRed ? initialVip.activeBadgeId : undefined,
        vipFrameId: isRed ? initialVip.activeFrameId : undefined,
        vipChatBubbleId: isRed ? initialVip.activeChatBubbleId : undefined,
      };
    });
  });

  // User coins state (persisted locally & synced with mock server)
  const [userCoins, setUserCoins] = useState<number>(() => {
    const saved = localStorage.getItem('ludo_user_coins');
    return saved ? parseInt(saved, 10) : 5000;
  });

  // Save coins on change
  useEffect(() => {
    localStorage.setItem('ludo_user_coins', userCoins.toString());
  }, [userCoins]);

  // User authentication profile state (persisted locally)
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => loadUserProfile());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialView, setAuthModalInitialView] = useState<AuthModalView>('login');

  // VIP Subscription state (persisted locally)
  const [vipState, setVipState] = useState<VipSubscriptionState>(() => loadVipState(currentUser.id));
  const [isVipModalOpen, setIsVipModalOpen] = useState<boolean>(false);

  // Modals state
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(false);
  const [storeTab, setStoreTab] = useState<'coins' | 'diamonds' | 'exchange'>('coins');
  const [isAdOpen, setIsAdOpen] = useState<boolean>(false);
  const [showRules, setShowRules] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState<boolean>(false);
  const [customizationTab, setCustomizationTab] = useState<'background' | 'board' | 'dice' | 'token' | 'presets'>('background');
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false);
  const [isAddaModalOpen, setIsAddaModalOpen] = useState<boolean>(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState<boolean>(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState<boolean>(false);
  const [isJoyVideoModalOpen, setIsJoyVideoModalOpen] = useState<boolean>(false);
  const [isShortsScrollPlayerOpen, setIsShortsScrollPlayerOpen] = useState<boolean>(false);
  const [isAdvertiserModalOpen, setIsAdvertiserModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState<boolean>(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isGameModesModalOpen, setIsGameModesModalOpen] = useState<boolean>(false);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [isExitConfirmModalOpen, setIsExitConfirmModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [userSettings, setUserSettings] = useState(() => {
    const loaded = loadUserSettings();
    return { ...loaded, language: 'en' };
  });
  const isEn = userSettings.language === 'en';

  const handleToggleLanguage = () => {
    Sound.playClick();
    const nextLang = userSettings.language === 'en' ? 'bn' : 'en';
    const updated = { ...userSettings, language: nextLang };
    setUserSettings(updated);
    saveUserSettings(updated);
  };
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'game'>('game');
  const [ageConfig, setAgeConfig] = useState<AgeVerificationConfig>(() => loadUserAgeConfig(currentUser));
  const [isScreenTimeAlertOpen, setIsScreenTimeAlertOpen] = useState<boolean>(false);
  const [screenTimeInfo, setScreenTimeInfo] = useState<{ used: number; limit: number }>({ used: 0, limit: 0 });
  const [incomingReferralCode] = useState<string | null>(() => detectReferralCodeFromUrl());
  const [hasDismissedReferralBanner, setHasDismissedReferralBanner] = useState<boolean>(false);

  // Daily Login Streak State (persisted locally)
  const [dailyStreakState, setDailyStreakState] = useState<DailyStreakState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY_STREAK);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STREAK_STATE;
  });
  const [isDailyStreakModalOpen, setIsDailyStreakModalOpen] = useState<boolean>(false);

  const handleClaimStreakReward = (rewardCoins: number, rewardDiamonds: number, newStreak: number) => {
    const today = getLocalDateString();
    const updated: DailyStreakState = {
      currentStreak: newStreak,
      lastClaimDate: today,
      highestStreak: Math.max(dailyStreakState.highestStreak, newStreak),
      totalCoinsClaimed: dailyStreakState.totalCoinsClaimed + rewardCoins,
      totalDiamondsClaimed: (dailyStreakState.totalDiamondsClaimed || 0) + rewardDiamonds,
      totalDaysClaimed: dailyStreakState.totalDaysClaimed + 1,
    };
    setDailyStreakState(updated);
    try {
      localStorage.setItem(STORAGE_KEY_DAILY_STREAK, JSON.stringify(updated));
    } catch {}

    if (rewardCoins > 0) {
      setUserCoins((prev) => prev + rewardCoins);
      setPlayerStats((prev) => recordEventInStats(prev, 'coins', rewardCoins));
    }
    if (rewardDiamonds > 0) {
      setLevelState((prev) => ({
        ...prev,
        diamonds: prev.diamonds + rewardDiamonds,
        totalDiamondsEarned: prev.totalDiamondsEarned + rewardDiamonds,
      }));
    }
    awardXP(100, 'দৈনিক লগইন বোনাস');
  };

  // Screen time tracking interval (every 60s)
  useEffect(() => {
    const timer = setInterval(() => {
      if (ageConfig.dailyScreenTimeLimitMinutes > 0) {
        const used = addScreenTimeMinutes(currentUser.id, 1);
        const check = isScreenTimeLimitExceeded(currentUser.id, ageConfig.dailyScreenTimeLimitMinutes);
        if (check.exceeded && !isScreenTimeAlertOpen) {
          setScreenTimeInfo({ used: check.usedMinutes, limit: check.limitMinutes });
          setIsScreenTimeAlertOpen(true);
        }
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [currentUser.id, ageConfig.dailyScreenTimeLimitMinutes, isScreenTimeAlertOpen]);

  // Referral Reward Granted Callback
  const handleReferralRewardGranted = useCallback((coins: number, diamonds: number) => {
    if (coins > 0) {
      setUserCoins((prev) => prev + coins);
      setPlayerStats((prev) => recordEventInStats(prev, 'coins', coins));
    }
    if (diamonds > 0) {
      setLevelState((prev) => ({
        ...prev,
        diamonds: prev.diamonds + diamonds,
        totalDiamondsEarned: prev.totalDiamondsEarned + diamonds,
      }));
    }
    Sound.playCoinSound();
  }, []);

  // Account Level & Diamonds state (persisted locally)
  const [levelState, setLevelState] = useState<AccountLevelState>(() => loadAccountLevelState());
  const [isLevelRoadmapOpen, setIsLevelRoadmapOpen] = useState<boolean>(false);
  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpEventData | null>(null);

  // User updated handler
  const handleUserUpdated = useCallback(
    (updatedUser: UserProfile, isNewRegistration?: boolean) => {
      setCurrentUser(updatedUser);
      saveUserProfile(updatedUser);

      // Update Red player / User Name
      if (updatedUser.name && updatedUser.name !== 'গেস্ট খেলোয়াড়') {
        setPlayers((prev) =>
          prev.map((p) => (p.color === 'red' ? { ...p, name: updatedUser.name } : p))
        );
      }

      // If new registration or first auth, give reward bonus!
      if (isNewRegistration) {
        const bonusCoins = 500;
        const bonusDiamonds = 20;
        setUserCoins((c) => c + bonusCoins);
        setLevelState((prev) => ({
          ...prev,
          diamonds: prev.diamonds + bonusDiamonds,
          totalDiamondsEarned: prev.totalDiamondsEarned + bonusDiamonds,
        }));
        setPlayerStats((prev) => recordEventInStats(prev, 'coins', bonusCoins));
        Sound.playDiamondCollect();
      }
    },
    []
  );

  // Helper to award XP and trigger Level Up modal if leveled up
  const awardXP = useCallback((xpAmount: number, _reason: string) => {
    setLevelState((prev) => {
      const { updatedState, levelUpEvent: newEvent } = addXPAndCheckLevelUp(prev, xpAmount);
      if (newEvent) {
        setLevelUpEvent(newEvent);
        Sound.playLevelUp();
      }
      return updatedState;
    });
  }, []);

  // Claim level roadmap reward
  const handleClaimLevelReward = (reward: LevelReward) => {
    setLevelState((prev) => {
      const updated = claimLevelRewardInState(prev, reward.level);
      return updated;
    });

    if (reward.coins && reward.coins > 0) {
      setUserCoins((c) => c + reward.coins!);
      setPlayerStats((prev) => recordEventInStats(prev, 'coins', reward.coins!));
    }
    if (reward.diamonds && reward.diamonds > 0) {
      Sound.playDiamondCollect();
    }
    Sound.playWin();
  };

  // Player Long-Term Statistics state (persisted locally)
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => loadPlayerStats());

  // Customization state (Game background, board theme, dice material, dice numbers, token style)
  const [customization, setCustomization] = useState<CustomizationConfig>(() => {
    try {
      const saved = localStorage.getItem('ludo_customization_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If stored background was the old default 'classic_amber' or empty, switch to Bangladesh flag ('bd_flag')
          const bg = !parsed.gameBackground || parsed.gameBackground === 'classic_amber' ? 'bd_flag' : parsed.gameBackground;
          return { ...DEFAULT_CUSTOMIZATION, ...parsed, gameBackground: bg };
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_CUSTOMIZATION;
  });

  const currentBgDef =
    GAME_BACKGROUNDS.find((bg) => bg.id === customization?.gameBackground) || GAME_BACKGROUNDS[0];

  const handleSaveCustomization = (newConfig: CustomizationConfig) => {
    setCustomization(newConfig);
    try {
      localStorage.setItem('ludo_customization_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }
  };

  // Daily Login Streak state (persisted locally)
  const [streakState, setStreakState] = useState<DailyStreakState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY_STREAK);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_STREAK_STATE;
  });

  const handleClaimDailyStreak = (rewardCoins: number, rewardDiamonds: number, newStreak: number) => {
    const todayStr = getLocalDateString();
    setStreakState((prev) => {
      const updated: DailyStreakState = {
        currentStreak: newStreak,
        lastClaimDate: todayStr,
        highestStreak: Math.max(prev.highestStreak, newStreak),
        totalCoinsClaimed: prev.totalCoinsClaimed + rewardCoins,
        totalDaysClaimed: prev.totalDaysClaimed + 1,
      };
      try {
        localStorage.setItem(STORAGE_KEY_DAILY_STREAK, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Add extra coins to user's wallet & update stats
    setUserCoins((prev) => prev + rewardCoins);
    setPlayerStats((prev) => recordEventInStats(prev, 'coins', rewardCoins));

    // Add diamonds & XP
    if (rewardDiamonds > 0) {
      setLevelState((prev) => {
        const updated = {
          ...prev,
          diamonds: prev.diamonds + rewardDiamonds,
          totalDiamondsEarned: prev.totalDiamondsEarned + rewardDiamonds,
        };
        saveAccountLevelState(updated);
        return updated;
      });
    }

    // Award +100 XP for claiming daily login streak
    awardXP(100, 'দৈনিক লগইন বোনাস');
  };

  // Core Ludo turn state
  const [currentTurnColor, setCurrentTurnColor] = useState<PlayerColor>('red');
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState<number>(0);
  const [lastActionText, setLastActionText] = useState<string>(
    isEn ? "Game started! Red player's turn." : 'খেলা শুরু হয়েছে! লাল দলের চাল।'
  );
  const [winner, setWinner] = useState<Player | null>(null);
  const [recentVoiceMessage, setRecentVoiceMessage] = useState<VoiceMessage | null>(null);

  // Web socket / connection simulation
  const wsRef = useRef<WebSocket | null>(null);

  // Audio voice reaction auto-reply simulation for bots
  const triggerBotVoiceReaction = useCallback((botName: string, soundKey: string) => {
    const reaction = VOICE_REACTIONS.find((r) => r.soundKey === soundKey) || VOICE_REACTIONS[0];
    const botPlayer = players.find(p => p.name === botName);
    setRecentVoiceMessage({
      id: 'bot_' + Math.random().toString(36).substring(2, 9),
      senderName: botName,
      senderColor: botPlayer?.color || 'yellow',
      text: reaction.text,
      time: Date.now(),
    });
    Sound.playReaction(reaction.soundKey);

    setTimeout(() => {
      setRecentVoiceMessage(null);
    }, 3500);
  }, [players]);

  // Update current player coins in player array
  useEffect(() => {
    setPlayers((prev) =>
      prev.map((p) => (p.color === localPlayerColor ? { ...p, coins: userCoins } : p))
    );
  }, [userCoins, localPlayerColor]);

  // Determine eligible tokens for current player and rolled dice
  const currentPlayer = players.find((p) => p.color === currentTurnColor) || players[0];
  const isMyTurn =
    gameMode === 'pass-and-play'
      ? true
      : currentPlayer.color === localPlayerColor && !currentPlayer.isBot;

  const isQuickMode = gameMode === 'quick-match';
  const eligibleTokenIds =
    hasRolled && diceValue
      ? getEligibleTokens(currentPlayer.tokens, diceValue, isQuickMode)
      : [];

  // Switch to next player in rotation
  const nextTurn = useCallback(() => {
    const activeColors = players.map((p) => p.color);
    if (!activeColors.length) return;
    const currentIndex = activeColors.indexOf(currentTurnColor);
    const nextColor = activeColors[currentIndex >= 0 ? (currentIndex + 1) % activeColors.length : 0];
    const nextCfg = (nextColor && COLOR_CONFIG[nextColor]) || COLOR_CONFIG.red;

    setDiceValue(null);
    setHasRolled(false);
    setConsecutiveSixes(0);
    setCurrentTurnColor(nextColor || 'red');

    setLastActionText(`${nextCfg.name}'s turn.`);
  }, [currentTurnColor, players]);

  // Roll Dice Action
  const handleRollDice = useCallback(() => {
    if (isRolling || hasRolled || winner) return;

    setIsRolling(true);
    Sound.playDiceRoll();

    setTimeout(() => {
      const rolled = rollDiceValue();
      setDiceValue(rolled);
      setIsRolling(false);
      setHasRolled(true);
      Sound.playDiceResult(rolled);

      if (rolled === 6) {
        Sound.playSixCheer();
        if (currentPlayer.color === localPlayerColor) {
          setPlayerStats((prev) => recordEventInStats(prev, 'six', 1));
          awardXP(15, 'ছক্কার বোনাস');
        }
        const newConsecutive = consecutiveSixes + 1;
        setConsecutiveSixes(newConsecutive);

        if (newConsecutive === 3) {
          // 3 consecutive 6s penalty: turn lost!
          setLastActionText(isEn ? 'Three consecutive sixes! Turn skipped.' : `টানা ৩ বার ছক্কা! তাই চাল বাতিল হলো।`);
          setTimeout(nextTurn, 1400);
          return;
        } else {
          setLastActionText(isEn ? 'Rolled a 6! You get an extra roll after this move.' : `ছক্কা পড়েছে! চাল শেষে আবারও চাল পাবেন।`);
        }
      } else {
        setConsecutiveSixes(0);
        setLastActionText(isEn ? `Rolled a ${rolled}.` : `ডাইসে ${rolled} পড়েছে।`);
      }

      // Check if player has any legal moves
      const isQuick = gameMode === 'quick-match';
      const legalTokens = getEligibleTokens(currentPlayer.tokens, rolled, isQuick);

      if (legalTokens.length === 0) {
        setLastActionText(isEn ? `Rolled a ${rolled}, but no valid moves available.` : `ডাইসে ${rolled} পড়েছে, তবে কোনো চাল সম্ভব নয়।`);
        setTimeout(() => {
          nextTurn();
        }, 1200);
      } else if (legalTokens.length === 1 && currentPlayer.isBot) {
        // Bot single move auto execute
        setTimeout(() => {
          handleTokenClick(legalTokens[0]);
        }, 800);
      }
    }, 600);
  }, [isRolling, hasRolled, winner, consecutiveSixes, currentPlayer, nextTurn, gameMode]);

  // Handle Token Click & Move
  const handleTokenClick = useCallback(
    (tokenId: number) => {
      if (!hasRolled || !diceValue || winner) return;

      const currP = players.find((p) => p.color === currentTurnColor);
      if (!currP) return;

      const isQuick = gameMode === 'quick-match';
      const isTournament = gameMode === 'tournament';
      const isTeam = gameMode === 'team-2v2';

      const legalIds = getEligibleTokens(currP.tokens, diceValue, isQuick);
      if (!legalIds.includes(tokenId)) return;

      Sound.playTokenMove();
      const { updatedPlayers, result } = executeTokenMove(
        currP.color,
        tokenId,
        diceValue,
        players,
        gameMode
      );

      if (result.reachedHome) {
        Sound.playHomeGoal();
        if (currP.color === localPlayerColor) {
          setPlayerStats((prev) => recordEventInStats(prev, 'home', 1));
          awardXP(100, 'গুটি ঘরে প্রবেশ');
        }
      }

      if (result.capturedToken) {
        Sound.playCapture();
        if (currP.color === localPlayerColor) {
          setPlayerStats((prev) => recordEventInStats(prev, 'capture', 1));
          awardXP(60, 'গুটি কাটা বোনাস');
        }
        const opponent = players.find((p) => p.color === result.capturedToken?.color);
        setLastActionText(
          isEn
            ? `${currP.name} captured ${opponent?.name || 'opponent'}'s token!`
            : `${currP.name} এর গুটি ${opponent?.name || 'প্রতিপক্ষ'} এর গুটি কেটেছে!`
        );
        if (currP.isBot) {
          triggerBotVoiceReaction(currP.name, 'celebrate');
        }
      }

      setPlayers(updatedPlayers);

      if (result.wonGame) {
        Sound.playWin();

        const opponents = players
          .filter((p) => p.color !== localPlayerColor)
          .map((p) => p.name);

        const myTokensHome =
          updatedPlayers.find((p) => p.color === localPlayerColor)?.tokens.filter((t) => t.isHome)
            .length || 0;

        if (isTeam) {
          const wonTeam = result.teamWon || 1;
          setTeamWon(wonTeam);
          setWinner(currP);
          const isUserTeamWin = wonTeam === 1;
          const coinsEarned = isUserTeamWin ? 3500 : 0;
          if (isUserTeamWin) {
            setUserCoins((prev) => prev + 3500);
            awardXP(500, isEn ? 'Team 2v2 Victory' : 'টিম ২v২ ম্যাচ জয়');
            setLastActionText(
              isEn
                ? 'Congratulations! Team 1 (Red & Yellow) are Team Champions! 🏆'
                : 'অভিনন্দন! দল ১ (লাল ও হলুদ) যৌথভাবে টিম চ্যাম্পিয়ন হয়েছে! 🏆'
            );
          } else {
            setLastActionText(
              isEn
                ? 'Team 2 (Green & Blue) won the match!'
                : 'দল ২ (সবুজ ও নীল) যৌথভাবে টিম চ্যাম্পিয়ন হয়েছে!'
            );
          }
          setPlayerStats((prev) =>
            recordMatchInStats(prev, {
              gameMode: 'team-2v2',
              isWin: isUserTeamWin,
              coinsEarned,
              tokensReachedHome: myTokensHome,
              tokensCaptured: 0,
              opponentNames: [isEn ? 'Team 2 (Green & Blue)' : 'দল ২ (সবুজ ও নীল)'],
            })
          );
          return;
        }

        if (isTournament) {
          setWinner(currP);
          const isUserWin = currP.color === 'red';
          let coinsEarned = 0;
          let isChampion = false;

          if (isUserWin) {
            if (tournamentStage === 'quarter') {
              coinsEarned = 1000;
              setUserCoins((prev) => prev + 1000);
              awardXP(300, isEn ? 'Quarter-Final Victory' : 'কোয়ার্টার-ফাইনাল জয়');
              setLastActionText(
                isEn
                  ? 'Congratulations! Won the Quarter-Final and advanced to Semi-Finals!'
                  : 'অভিনন্দন! কোয়ার্টার-ফাইনালে জয়ী হয়ে সেমি-ফাইনালে উত্তীর্ণ হয়েছেন!'
              );
            } else if (tournamentStage === 'semi') {
              coinsEarned = 2000;
              setUserCoins((prev) => prev + 2000);
              awardXP(600, isEn ? 'Semi-Final Victory' : 'সেমি-ফাইনাল জয়');
              setLastActionText(
                isEn
                  ? 'Congratulations! Won the Semi-Final and advanced to Grand Final!'
                  : 'অভিনন্দন! সেমি-ফাইনালে জয়ী হয়ে গ্র্যান্ড ফাইনালে উত্তীর্ণ হয়েছেন!'
              );
            } else if (tournamentStage === 'final') {
              coinsEarned = 5000;
              isChampion = true;
              setUserCoins((prev) => prev + 5000);
              awardXP(1500, isEn ? 'Grand Champion Victory' : 'গ্র্যান্ড চ্যাম্পিয়ন জয়');
              setIsTournamentOver(true);
              setChampionName(isEn ? 'You' : 'আপনি');
              setChampionColor('red');
              setLastActionText(
                isEn
                  ? 'Outstanding! You are the Tournament Grand Champion! 🏆'
                  : 'অসাধারণ! আপনি টুর্নামেন্টের গ্র্যান্ড চ্যাম্পিয়ন হয়েছেন! 🏆'
              );
            }
          }

          setPlayerStats((prev) =>
            recordMatchInStats(prev, {
              gameMode: 'tournament',
              isWin: isUserWin,
              coinsEarned,
              tokensReachedHome: myTokensHome,
              tokensCaptured: 0,
              opponentNames: [currP.color === 'red' ? (isEn ? 'Opponent' : 'প্রতিপক্ষ') : currP.name],
              isTournamentChampion: isChampion,
            })
          );
          return;
        }

        if (isQuick) {
          setWinner(currP);
          const isUserWin = currP.color === localPlayerColor;
          const coinsEarned = isUserWin ? 1500 : 0;
          if (isUserWin) {
            setUserCoins((prev) => prev + 1500);
            awardXP(250, isEn ? 'Quick Match Victory' : 'কুইক ম্যাচ জয়');
          }
          setLastActionText(
            isEn
              ? `${currP.name} moved 2 tokens home to win Quick Match! ⚡`
              : `${currP.name} মাত্র ২টি গুটি ঘরে নিয়ে কুইক ম্যাচ জয়ী হয়েছেন! ⚡`
          );

          setPlayerStats((prev) =>
            recordMatchInStats(prev, {
              gameMode: 'quick-match',
              isWin: isUserWin,
              coinsEarned,
              tokensReachedHome: myTokensHome,
              tokensCaptured: 0,
              opponentNames: opponents,
            })
          );
          return;
        }

        // Standard 4 player win (vs-bot, pass-and-play, online-room)
        setWinner(currP);
        const isUserWin = gameMode === 'pass-and-play' ? true : currP.color === localPlayerColor;
        const coinsEarned = isUserWin ? 2500 : 0;
        if (isUserWin) {
          setUserCoins((prev) => prev + 2500);
          awardXP(400, isEn ? 'Ludo Match Victory' : 'লুডু ম্যাচ জয়');
        }
        setPlayerStats((prev) =>
          recordMatchInStats(prev, {
            gameMode,
            isWin: isUserWin,
            coinsEarned,
            tokensReachedHome: myTokensHome,
            tokensCaptured: 0,
            opponentNames: opponents,
          })
        );
        return;
      }

      // Extra turn for 6, capture, or reaching home
      if (diceValue === 6 || result.capturedToken || result.reachedHome) {
        setDiceValue(null);
        setHasRolled(false);
        setLastActionText(
          isEn
            ? `${currP.name} gets an extra turn (${diceValue === 6 ? 'Rolled a 6' : result.capturedToken ? 'Captured token' : 'Reached home'})!`
            : `${currP.name} আবারও চাল পেয়েছেন (${diceValue === 6 ? 'ছক্কার বোনাস' : result.capturedToken ? 'গুটি কাটার বোনাস' : 'ঘরে পৌঁছানোর বোনাস'})!`
        );
      } else {
        nextTurn();
      }
    },
    [
      hasRolled,
      diceValue,
      winner,
      players,
      currentTurnColor,
      nextTurn,
      triggerBotVoiceReaction,
      gameMode,
      tournamentStage,
      localPlayerColor,
    ]
  );

  // Auto-play for Bots
  useEffect(() => {
    if (winner) return;

    if (currentPlayer.isBot) {
      if (!hasRolled && !isRolling) {
        // Bot rolls dice after human-like thought delay
        const timer = setTimeout(() => {
          handleRollDice();
        }, 900);
        return () => clearTimeout(timer);
      } else if (hasRolled && diceValue) {
        // Bot picks best token
        const timer = setTimeout(() => {
          const isQuick = gameMode === 'quick-match';
          const eligible = getEligibleTokens(currentPlayer.tokens, diceValue, isQuick);
          if (eligible.length > 0) {
            const bestTokenId = pickSmartBotToken(
              currentPlayer.color,
              currentPlayer.tokens,
              diceValue,
              players,
              gameMode
            );
            if (bestTokenId !== null) {
              handleTokenClick(bestTokenId);
            }
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [
    currentPlayer,
    hasRolled,
    isRolling,
    diceValue,
    winner,
    handleRollDice,
    handleTokenClick,
    players,
    gameMode,
  ]);

  // Save Avatar Handler
  const handleSaveAvatar = (newAvatar: AvatarConfig) => {
    setUserAvatar(newAvatar);
    localStorage.setItem('ludo_player_avatar', JSON.stringify(newAvatar));
    setPlayers((prev) =>
      prev.map((p) => (p.color === localPlayerColor ? { ...p, avatar: newAvatar } : p))
    );
    Sound.playWin();
    setLastActionText('আপনার অবতার রূপ সফলভাবে সেভ করা হয়েছে!');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'update-avatar',
          payload: {
            avatar: newAvatar,
          },
        })
      );
    }
  };

  // Connect to WebSocket server for online matches
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { type, payload } = msg;

        switch (type) {
          case 'room-created': {
            setIsSearchingMatch(false);
            setCurrentRoomId(payload.roomId);
            setIsHost(true);
            setOnlineRoomPlayers(payload.players || []);
            Sound.playWin();
            setLastActionText(`রুম তৈরি হয়েছে: ${payload.roomId}`);
            break;
          }
          case 'player-joined': {
            setIsSearchingMatch(false);
            setCurrentRoomId(payload.roomId);
            setOnlineRoomPlayers(payload.players || []);
            Sound.playClick();
            setLastActionText(`${payload.newPlayer?.name || 'নতুন খেলোয়াড়'} রুমে যুক্ত হয়েছেন!`);
            break;
          }
          case 'avatar-updated': {
            setOnlineRoomPlayers((prev) =>
              prev.map((p) => (p.id === payload.playerId ? { ...p, avatar: payload.avatar } : p))
            );
            setPlayers((prev) =>
              prev.map((p) => (p.id === payload.playerId ? { ...p, avatar: payload.avatar } : p))
            );
            break;
          }
          case 'game-started': {
            setIsOnlineModalOpen(false);
            setGameMode('online-room');
            Sound.playDiceRoll();
            setLastActionText('অনলাইন খেলা শুরু হয়েছে! শুভকামনা!');
            break;
          }
          case 'game-action': {
            if (payload.action === 'roll-dice') {
              setDiceValue(payload.diceValue);
              setHasRolled(true);
              Sound.playDiceRoll();
            } else if (payload.action === 'move-token') {
              setPlayers((prev) =>
                prev.map((p) => {
                  if (p.color === payload.color) {
                    return {
                      ...p,
                      tokens: p.tokens.map((t) => (t.id === payload.tokenId ? payload.updatedToken : t)),
                    };
                  }
                  return p;
                })
              );
              Sound.playTokenStep();
            }
            break;
          }
          case 'error': {
            setIsSearchingMatch(false);
            setLastActionText(payload.message || 'ত্রুটি দেখা দিয়েছে!');
            break;
          }
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    return ws;
  }, []);

  const handleQuickMatch = (fee: number) => {
    if (userCoins < fee) {
      setIsStoreOpen(true);
      return;
    }
    setIsSearchingMatch(true);
    setUserCoins((prev) => Math.max(0, prev - fee));
    const ws = connectWebSocket();
    const send = () => {
      ws.send(
        JSON.stringify({
          type: 'quick-match',
          payload: {
            playerId,
            playerName: 'আপনি',
            avatar: userAvatar,
            entryFee: fee,
          },
        })
      );
    };
    if (ws.readyState === WebSocket.OPEN) {
      send();
    } else {
      ws.onopen = send;
    }
  };

  const handleCreateRoom = (fee: number) => {
    if (userCoins < fee) {
      setIsStoreOpen(true);
      return;
    }
    setUserCoins((prev) => Math.max(0, prev - fee));
    const ws = connectWebSocket();
    const send = () => {
      ws.send(
        JSON.stringify({
          type: 'create-room',
          payload: {
            playerId,
            playerName: 'আপনি',
            avatar: userAvatar,
            entryFee: fee,
            isPublic: false,
          },
        })
      );
    };
    if (ws.readyState === WebSocket.OPEN) {
      send();
    } else {
      ws.onopen = send;
    }
  };

  const handleJoinRoom = (roomId: string) => {
    const ws = connectWebSocket();
    const send = () => {
      ws.send(
        JSON.stringify({
          type: 'join-room',
          payload: {
            roomId,
            playerId,
            playerName: 'আপনি',
            avatar: userAvatar,
          },
        })
      );
    };
    if (ws.readyState === WebSocket.OPEN) {
      send();
    } else {
      ws.onopen = send;
    }
  };

  const handleStartOnlineGame = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'start-game',
          payload: {
            roomId: currentRoomId,
          },
        })
      );
    }
    setIsOnlineModalOpen(false);
    setGameMode('online-room');
    Sound.playDiceRoll();
  };

  const handleLeaveRoom = () => {
    setCurrentRoomId(null);
    setOnlineRoomPlayers([]);
    setIsHost(false);
    setIsSearchingMatch(false);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  // Tournament progression handlers
  const handleNextTournamentMatch = () => {
    if (tournamentStage === 'quarter') {
      setTournamentStage('semi');
      setTournamentMatches((prev) =>
        prev.map((m) => {
          if (m.id === 'qf_1') return { ...m, winnerColor: 'red', winnerName: isEn ? 'You' : 'আপনি', status: 'completed' };
          if (m.id === 'qf_2') return { ...m, winnerColor: 'yellow', winnerName: isEn ? 'Sadia' : 'সাদিয়া', status: 'completed' };
          if (m.id === 'qf_3') return { ...m, winnerColor: 'red', winnerName: isEn ? 'Sakib' : 'সাকিব', status: 'completed' };
          if (m.id === 'qf_4') return { ...m, winnerColor: 'blue', winnerName: isEn ? 'Rubel' : 'রুবেল', status: 'completed' };
          if (m.id === 'sf_1') return { ...m, status: 'current' };
          return m;
        })
      );
      restartGame();
      setLastActionText(isEn ? 'Semi-Final round started! Opponent: Sadia (Yellow).' : 'সেমি-ফাইনাল রাউন্ড শুরু হয়েছে! প্রতিপক্ষ: সাদিয়া (হলুদ)।');
    } else if (tournamentStage === 'semi') {
      setTournamentStage('final');
      setTournamentMatches((prev) =>
        prev.map((m) => {
          if (m.id === 'sf_1') return { ...m, winnerColor: 'red', winnerName: isEn ? 'You' : 'আপনি', status: 'completed' };
          if (m.id === 'sf_2') return { ...m, winnerColor: 'blue', winnerName: isEn ? 'Rubel' : 'রুবেল', status: 'completed' };
          if (m.id === 'fn_1') return { ...m, status: 'current' };
          return m;
        })
      );
      restartGame();
      setLastActionText(isEn ? 'Grand Final started! Opponent: Rubel (Blue). Win the trophy!' : 'গ্র্যান্ড ফাইনাল শুরু হয়েছে! প্রতিপক্ষ: রুবেল (নীল)। ট্রফি জিতুন!');
    }
  };

  const handleResetTournament = () => {
    setTournamentStage('quarter');
    setIsTournamentOver(false);
    setChampionName('');
    setTournamentMatches(createInitialTournamentMatches(userAvatar));
    restartGame();
    setLastActionText(isEn ? 'New Knockout Tournament started!' : 'নতুন নকআউট টুর্নামেন্ট শুরু হয়েছে!');
    Sound.playClick();
  };

  // Quick match auto timeout action (15s limit)
  const handleQuickMatchTimeOut = useCallback(() => {
    if (winner || gameMode !== 'quick-match') return;
    const currP = players.find((p) => p.color === currentTurnColor) || players[0];

    if (!hasRolled && !isRolling) {
      handleRollDice();
    } else if (hasRolled && diceValue) {
      const eligible = getEligibleTokens(currP.tokens, diceValue, true);
      if (eligible.length > 0) {
        handleTokenClick(eligible[0]);
      } else {
        nextTurn();
      }
    }
  }, [
    winner,
    gameMode,
    players,
    currentTurnColor,
    hasRolled,
    isRolling,
    diceValue,
    handleRollDice,
    handleTokenClick,
    nextTurn,
  ]);

  // Restart / Reset Game
  const restartGame = () => {
    setTeamWon(null);
    setPlayers(
      PLAYERS_4.map((p) => ({
        ...p,
        avatar: p.color === localPlayerColor ? userAvatar : p.avatar,
        isBot: gameMode === 'pass-and-play' ? false : p.color !== localPlayerColor,
        tokens: [
          { id: 0, color: p.color, step: -1, isHome: false },
          { id: 1, color: p.color, step: -1, isHome: false },
          { id: 2, color: p.color, step: -1, isHome: false },
          { id: 3, color: p.color, step: -1, isHome: false },
        ],
      }))
    );
    setCurrentTurnColor('red');
    setDiceValue(null);
    setHasRolled(false);
    setConsecutiveSixes(0);
    setWinner(null);
    setLastActionText(isEn ? 'New game started!' : 'নতুন খেলা শুরু হয়েছে!');
    Sound.playClick();
  };

  // Change Game Mode
  const handleModeSelect = (mode: GameMode) => {
    Sound.playClick();
    setGameMode(mode);
    setTeamWon(null);
    setPlayers(
      PLAYERS_4.map((p) => ({
        ...p,
        avatar: p.color === localPlayerColor ? userAvatar : p.avatar,
        isBot: mode === 'pass-and-play' ? false : p.color !== localPlayerColor,
        tokens: [
          { id: 0, color: p.color, step: -1, isHome: false },
          { id: 1, color: p.color, step: -1, isHome: false },
          { id: 2, color: p.color, step: -1, isHome: false },
          { id: 3, color: p.color, step: -1, isHome: false },
        ],
      }))
    );
    setCurrentTurnColor('red');
    setDiceValue(null);
    setHasRolled(false);
    setWinner(null);

    let modeName = '';
    if (isEn) {
      if (mode === 'vs-bot') modeName = 'Vs Computer Bot';
      else if (mode === 'pass-and-play') modeName = 'Pass & Play (4 Players)';
      else if (mode === 'team-2v2') modeName = 'Team Play (2 vs 2)';
      else if (mode === 'tournament') modeName = 'Knockout Tournament Championship';
      else if (mode === 'quick-match') modeName = 'Quick Match (Fast 2-Token Game)';
      else if (mode === 'online-room') modeName = 'Live Online Room';
      setLastActionText(`Active Mode: ${modeName}!`);
    } else {
      if (mode === 'vs-bot') modeName = 'রোবট বনাম খেলুন';
      else if (mode === 'pass-and-play') modeName = 'বন্ধুদের সাথে খেলুন (৪ জন)';
      else if (mode === 'team-2v2') modeName = 'টিম প্লে (২ বনাম ২)';
      else if (mode === 'tournament') modeName = 'নকআউট টুর্নামেন্ট চ্যাম্পিয়নশিপ';
      else if (mode === 'quick-match') modeName = 'কুইক ম্যাচ (দ্রুত খেলা - মাত্র ২টি গুটি জয়)';
      else if (mode === 'online-room') modeName = 'লাইভ অনলাইন রুম';
      setLastActionText(`মোড সক্রিয়: ${modeName}!`);
    }
  };

  // Broadcast voice reaction
  const handleSendVoiceReaction = (reaction: { text: string; soundKey: string }) => {
    const localP = players.find((p) => p.color === localPlayerColor);
    setRecentVoiceMessage({
      id: 'local_' + Math.random().toString(36).substring(2, 9),
      senderName: localP?.name || (isEn ? 'You' : 'আপনি'),
      senderColor: localPlayerColor,
      text: reaction.text,
      time: Date.now(),
    });

    // Simulated bot reaction back occasionally
    setTimeout(() => {
      const bots = players.filter((p) => p.isBot);
      if (bots.length > 0 && Math.random() > 0.4) {
        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        const botReactions = ['hurry', 'laugh', 'cheer', 'lucky'];
        const replySound = botReactions[Math.floor(Math.random() * botReactions.length)];
        triggerBotVoiceReaction(randomBot.name, replySound);
      }
    }, 2200);

    setTimeout(() => {
      setRecentVoiceMessage(null);
    }, 4000);
  };

  // Dedicated Navigation Handlers
  const handleHomeClick = useCallback(() => {
    setActiveNavTab('home');
    setIsStoreOpen(false);
    setIsCustomizationModalOpen(false);
    setIsShortsScrollPlayerOpen(false);
    setIsJoyVideoModalOpen(false);
    setIsAddaModalOpen(false);
    setIsStatsModalOpen(false);
    setIsVipModalOpen(false);
    setIsInviteModalOpen(false);
    setIsLevelRoadmapOpen(false);
    setIsAuthModalOpen(false);
    setIsAgeModalOpen(false);
    setIsAdvertiserModalOpen(false);
    setIsSearchModalOpen(false);
    setIsMessagesModalOpen(false);
    setIsNotificationsModalOpen(false);
    setIsGameModesModalOpen(false);
    setIsMenuDrawerOpen(false);
    setIsExitConfirmModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsOnlineModalOpen(false);
    setIsTournamentModalOpen(false);
    setShowRules(false);
    setIsAdOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    Sound.playClick();
  }, []);

  const handleGameClick = useCallback(() => {
    setActiveNavTab('game');
    Sound.playClick();
    setIsJoyVideoModalOpen(false);
    setIsAddaModalOpen(false);
    setIsStatsModalOpen(false);
    setIsVipModalOpen(false);
    setIsInviteModalOpen(false);
    setIsLevelRoadmapOpen(false);
    setIsAuthModalOpen(false);
    setIsAgeModalOpen(false);
    setIsAdvertiserModalOpen(false);
    setIsSearchModalOpen(false);
    setIsMessagesModalOpen(false);
    setIsNotificationsModalOpen(false);
    setIsGameModesModalOpen(false);
    setIsMenuDrawerOpen(false);
    setIsExitConfirmModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsOnlineModalOpen(false);
    setIsTournamentModalOpen(false);
    setShowRules(false);
    setIsAdOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSelectGameModeFromModal = useCallback(
    (mode: '2p' | '4p' | 'vs_computer' | 'pass_play' | 'team_2v2' | 'adda_10p' | 'tournament') => {
      if (mode === '2p') {
        setGameMode('quick-match');
        restartGame();
      } else if (mode === '4p') {
        setGameMode('vs-bot');
        restartGame();
      } else if (mode === 'team_2v2') {
        setGameMode('team-2v2');
        restartGame();
      } else if (mode === 'adda_10p') {
        setIsAddaModalOpen(true);
      } else if (mode === 'vs_computer') {
        setGameMode('vs-bot');
        restartGame();
      } else if (mode === 'pass_play') {
        setGameMode('pass-and-play');
        restartGame();
      } else if (mode === 'tournament') {
        setIsTournamentModalOpen(true);
      }
    },
    [restartGame]
  );

  return (
    <div
      className={`flex flex-col min-h-screen font-sans select-none relative transition-colors duration-500 pb-28 sm:pb-32 ${
        customization.gameBackground === 'custom_photo' && customization.customBgUrl
          ? 'bg-slate-950 text-white'
          : `${currentBgDef.containerBgClass} ${currentBgDef.themeTone === 'dark' ? 'text-slate-100' : 'text-slate-900'}`
      }`}
    >
      {/* Top and Bottom Navigation Bars (Matching user design schematic) */}
      <TopAndBottomNavbar
        onOpenMenu={() => setIsMenuDrawerOpen(true)}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenMessages={() => setIsMessagesModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenStore={() => setIsStoreOpen(true)}
        onOpenDailyBonus={() => setIsDailyStreakModalOpen(true)}
        onOpenVip={() => setIsVipModalOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        vipState={vipState}
        userLevel={levelState.currentLevel}
        soundMuted={soundMuted}
        onToggleSound={() => {
          const isNowMuted = Sound.toggleMute();
          setSoundMuted(isNowMuted);
        }}
        currentLanguage={userSettings.language}
        onToggleLanguage={handleToggleLanguage}
        userCoins={userCoins}
        userDiamonds={levelState.diamonds}
        onHomeClick={handleHomeClick}
        onReelsClick={() => setIsShortsScrollPlayerOpen(true)}
        onAudioLiveClick={() => setIsAddaModalOpen(true)}
        onCloseClick={() => setIsExitConfirmModalOpen(true)}
        onNotificationClick={() => setIsNotificationsModalOpen(true)}
        onGameClick={handleGameClick}
        isMyTurn={isMyTurn}
        activeTab={activeNavTab}
        onProfileClick={() => {
          setAuthModalInitialView('profile');
          setIsAuthModalOpen(true);
        }}
      />
      {/* Bangladesh Flag Dynamic Background Layer */}
      {customization.gameBackground === 'bd_flag' && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Official Emerald / Bottle Green Field */}
          <div className="absolute inset-0 bg-[#006a4e]" />

          {/* Soft ambient lighting & cloth gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-transparent to-black/30" />

          {/* Iconic Crimson Red Circle (National Sun) positioned behind the game arena */}
          <div className="absolute top-[42%] sm:top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] md:w-[600px] md:h-[600px] rounded-full bg-[#f42a41] shadow-[0_0_100px_rgba(244,42,65,0.45)]" />

          {/* Ambient red radiant glow */}
          <div className="absolute top-[42%] sm:top-[44%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] sm:w-[560px] sm:h-[560px] md:w-[720px] md:h-[720px] rounded-full bg-radial from-[#f42a41]/25 via-[#f42a41]/5 to-transparent" />

          {/* Elegant silk flag fabric wave texture */}
          <div
            className="absolute inset-0 opacity-10 mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(115deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 40px, transparent 40px, transparent 90px)',
            }}
          />
        </div>
      )}

      {/* Dynamic Fullscreen Wallpaper / Custom Photo Background Layer */}
      {customization.gameBackground === 'custom_photo' && customization.customBgUrl && (
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
          style={{
            backgroundImage: `url(${customization.customBgUrl})`,
            filter: `brightness(${(customization.bgBrightness ?? 100) / 100})`,
          }}
        />
      )}

      {/* Atmospheric Pattern Texture Overlay Layer */}
      {(customization.bgPattern && customization.bgPattern !== 'none') || (currentBgDef.patternType && currentBgDef.patternType !== 'none') ? (
        <div
          className="fixed inset-0 pointer-events-none z-0 opacity-15 mix-blend-overlay"
          style={{
            backgroundImage:
              (customization.bgPattern || currentBgDef.patternType) === 'hex'
                ? `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`
                : (customization.bgPattern || currentBgDef.patternType) === 'stars'
                ? `radial-gradient(circle, rgba(255,255,255,0.8) 1.5px, transparent 1.5px)`
                : `repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 12px)`,
            backgroundSize:
              (customization.bgPattern || currentBgDef.patternType) === 'hex'
                ? '24px 24px'
                : (customization.bgPattern || currentBgDef.patternType) === 'stars'
                ? '36px 36px'
                : '16px 16px',
          }}
        />
      ) : null}

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Incoming Referral Welcome Alert Banner */}
        {incomingReferralCode && !hasDismissedReferralBanner && (
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-yellow-400 text-amber-950 flex items-center justify-center font-bold shrink-0 text-sm shadow-xs animate-bounce">
                🎁
              </div>
              <div>
                <span className="font-black text-yellow-300">{isEn ? 'Invite Offer:' : 'আমন্ত্রণ অফার:'}</span>{' '}
                <span>
                  {isEn
                    ? 'Your friend invited you to play Ludo Live (Code: '
                    : 'আপনার বন্ধু আপনাকে লুডু লাইভে আমন্ত্রণ জানিয়েছেন (কোড: '}
                  <strong className="font-mono bg-emerald-800/80 px-1.5 py-0.5 rounded text-yellow-200">{incomingReferralCode}</strong>)!
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  Sound.playClick();
                  setIsInviteModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-amber-950 font-black rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer text-xs flex items-center gap-1"
              >
                <span>{isEn ? 'Claim Bonus (+2,500 🪙)' : 'বোনাস ক্লেইম করুন (+২,৫০০ 🪙)'}</span>
              </button>
              <button
                onClick={() => setHasDismissedReferralBanner(true)}
                className="text-white/80 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer font-bold"
                title={isEn ? 'Close' : 'বন্ধ করুন'}
              >
                ✕
              </button>
            </div>
          </div>
        )}

      {/* Rules Drawer */}
      {showRules && (
        <div className="bg-amber-100 border-b-2 border-amber-300 px-6 py-3 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-2 animate-fade-in">
          <div className="flex flex-wrap gap-4 font-medium">
            <span>🎲 {isEn ? <>Roll a <strong>1 or 6</strong> to release token from yard.</> : <><strong>১ বা ৬</strong> পড়লে গুটি ঘর থেকে বের হবে।</>}</span>
            <span>⭐ {isEn ? <>Tokens on <strong>Star (★)</strong> cells are safe from capture.</> : <><strong>তারকা (★)</strong> চিহ্নযুক্ত ঘরগুলোতে গুটি নিরাপদ থাকবে (কাটা যাবে না)।</>}</span>
            <span>⚡ {isEn ? <>Capturing a token or rolling 6 gives an <strong>extra turn</strong>.</> : <>গুটি কাটলে বা ছক্কা পড়লে আপনি <strong>অতিরিক্ত এক চাল</strong> পাবেন।</>}</span>
            <span>🎙️ {isEn ? <>Talk with friends in live voice rooms during gameplay.</> : <>খেলার সময় উপরে লাইভ অডিও কলে কথা বলতে পারেন।</>}</span>
          </div>
          <button
            onClick={() => setShowRules(false)}
            className="text-xs font-bold bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded-lg cursor-pointer"
          >
            {isEn ? 'Got it ✕' : 'বুঝেছি ✕'}
          </button>
        </div>
      )}

      {/* Main Workspace Layout matching Vibrant Palette */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeNavTab === 'game' ? (
          /* GAME VIEW: Ludo Board & Dice Roller */
          <div id="ludo-board-section" className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-4xl mx-auto scroll-mt-16 animate-fade-in">
            {/* Quick Game Mode & Action Bar (খেলার মোড ও ইনস্ট্যান্ট কন্ট্রোল বার) */}
            <div className="w-full max-w-[560px] bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800 p-2 sm:p-2.5 shadow-xl flex flex-col gap-2">
              {/* Row 1: Mode Switcher Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'vs-bot', label: isEn ? '🤖 Vs Bot' : '🤖 রোবট', title: isEn ? 'Single player vs Computer' : 'কম্পিউটার বনাম একক খেলা' },
                  { id: 'pass-and-play', label: isEn ? '👥 4 Players' : '👥 ৪ জন বন্ধু', title: isEn ? 'Pass & play on one device' : 'একই ডিভাইসে ৪ জনের খেলা' },
                  { id: 'quick-match', label: isEn ? '⚡ Quick Match' : '⚡ কুইক ম্যাচ', title: isEn ? 'Fast 2-token blitz game' : 'দ্রুত ২ গুটির খেলা' },
                  { id: 'team-2v2', label: isEn ? '🤝 Team 2v2' : '🤝 টিম ২v২', title: isEn ? '2 vs 2 Partner Team Game' : '২ জনের দলগত খেলা' },
                  { id: 'tournament', label: isEn ? '🏆 Tournament' : '🏆 টুর্নামেন্ট', title: isEn ? 'Knockout Tournament' : 'নকআউট টুর্নামেন্ট' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      Sound.playClick();
                      if (mode.id === 'tournament') {
                        setIsTournamentModalOpen(true);
                      } else {
                        handleModeSelect(mode.id as GameMode);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                      gameMode === mode.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                    }`}
                    title={mode.title}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Row 2: Instant Game Utilities & Actions */}
              <div className="flex items-center justify-between gap-1 pt-1.5 border-t border-slate-800 text-xs overflow-x-auto no-scrollbar">
                {/* Restart / New Game */}
                <button
                  onClick={() => {
                    Sound.playClick();
                    restartGame();
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title={isEn ? 'Start a new game' : 'নতুন খেলা শুরু করুন'}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEn ? 'New Game' : 'নতুন খেলা'}</span>
                </button>

                {/* 10-Person Audio Live Adda */}
                <button
                  onClick={() => {
                    Sound.playClick();
                    setIsAddaModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title={isEn ? 'Join 10-player live voice adda' : '১০ জনের লাইভ ভয়েস আড্ডারুমে যোগ দিন'}
                >
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{isEn ? 'Voice Room' : '১০ জনের আড্ডা'}</span>
                </button>

                {/* Board & Dice Customization */}
                <button
                  onClick={() => {
                    Sound.playClick();
                    setIsCustomizationModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title={isEn ? 'Change board, background & dice themes' : 'বোর্ড ও ডাইস থিম পরিবর্তন করুন'}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Themes' : 'থিম ও গুটি'}</span>
                </button>

                {/* Daily Bonus */}
                <button
                  onClick={() => {
                    Sound.playClick();
                    setIsDailyStreakModalOpen(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title={isEn ? 'Claim daily login reward' : 'দৈনিক বোনাস সংগ্রহ করুন'}
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                  <span>{isEn ? 'Bonus' : 'বোনাস'}</span>
                </button>

                {/* Rules */}
                <button
                  onClick={() => {
                    Sound.playClick();
                    setShowRules((prev) => !prev);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title={isEn ? 'View Game Rules' : 'খেলার নিয়ম দেখুন'}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Rules' : 'নিয়ম'}</span>
                </button>

                {/* Quick Language Toggle */}
                <button
                  onClick={handleToggleLanguage}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  title={isEn ? 'বাংলা ভাষায় পরিবর্তন করুন' : 'Switch to English'}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isEn ? 'EN' : 'বাং'}</span>
                </button>
              </div>
            </div>
            {/* Mode-Specific Heads Up Display (HUD) */}
            {gameMode === 'team-2v2' && (
              <TeamPlayBanner players={players} />
            )}

            {gameMode === 'quick-match' && (
              <QuickMatchHUD
                players={players}
                currentTurnColor={currentTurnColor}
                onTimeOut={handleQuickMatchTimeOut}
                isMyTurn={isMyTurn}
              />
            )}

            {gameMode === 'tournament' && (
              <div className="w-full max-w-[500px] p-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md border-b-4 border-rose-700 flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-200" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-200 block">
                      {isEn ? 'Knockout Tournament' : 'নকআউট টুর্নামেন্ট'} • {
                        tournamentStage === 'quarter'
                          ? (isEn ? 'Quarter-Final' : 'কোয়ার্টার-ফাইনাল')
                          : tournamentStage === 'semi'
                          ? (isEn ? 'Semi-Final' : 'সেমি-ফাইনাল')
                          : (isEn ? 'Grand Final' : 'গ্র্যান্ড ফাইনাল')
                      }
                    </span>
                    <span className="text-xs font-black">
                      {isEn ? 'Goal: Move any 2 tokens home to win the match!' : 'লক্ষ্য: যেকোনো ২টি গুটি হোমে নিলেই ম্যাচ জয়!'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    Sound.playClick();
                    setIsTournamentModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white text-rose-700 font-black text-xs rounded-xl shadow-sm hover:bg-rose-50 active:scale-95 transition-all cursor-pointer"
                >
                  {isEn ? 'Bracket' : 'ব্র্যাকেট'}
                </button>
              </div>
            )}

            {/* Ludo Board */}
            <div className="w-full flex justify-center">
              <LudoBoard
                players={players}
                currentTurnColor={currentTurnColor}
                hasRolled={hasRolled}
                eligibleTokenIds={eligibleTokenIds}
                onTokenClick={handleTokenClick}
                boardTheme={customization.boardTheme}
                tokenStyle={customization.tokenStyle}
              />
            </div>

            {/* Dice & Turn Controller Bar */}
            <DiceRoller
              currentPlayer={currentPlayer}
              isMyTurn={isMyTurn}
              diceValue={diceValue}
              isRolling={isRolling}
              hasRolled={hasRolled}
              eligibleCount={eligibleTokenIds.length}
              consecutiveSixes={consecutiveSixes}
              lastActionText={lastActionText}
              onRollDice={handleRollDice}
              diceStyle={customization.diceStyle}
              diceFace={customization.diceFace}
            />
          </div>
        ) : (
          /* HOME VIEW: Dedicated Reels Video Feed - Continuous video playback */
          <div className="w-full flex justify-center items-center py-1 animate-fade-in">
            <HomeReelsFeed
              currentUser={currentUser}
              userDiamonds={levelState.diamonds}
              onDeductDiamonds={(count) => {
                setLevelState((prev) => ({
                  ...prev,
                  diamonds: Math.max(0, prev.diamonds - count),
                }));
              }}
              onOpenStudioModal={() => setIsJoyVideoModalOpen(true)}
              onPlayGameClick={handleGameClick}
              onOpenLiveAdda={() => setIsAddaModalOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Footer matching Vibrant Palette */}
      <footer
        id="app-footer"
        className="bg-white px-6 sm:px-8 py-3.5 border-t-2 border-amber-200 flex flex-wrap justify-between items-center text-xs font-bold text-slate-600 mt-auto gap-2"
      >
        <div className="flex items-center gap-2">
          <span>{isEn ? '© 2025 Ludo Royal Live' : '© ২০২৫ লুডু রয়্যাল লাইভ'}</span>
          <span>•</span>
          <span className="text-emerald-700 flex items-center gap-1 font-extrabold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {isEn ? 'Real-Time Multiplayer & Voice Ready' : 'রিয়েল-টাইম মাল্টিপ্লেয়ার ও ভয়েস রেডি'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              Sound.playClick();
              setIsStatsModalOpen(true);
            }}
            className="text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>{isEn ? 'Stats' : 'পরিসংখ্যান'}</span>
          </button>
          <span>•</span>
          <button
            onClick={() => setIsStoreOpen(true)}
            className="hover:text-amber-900 transition-colors cursor-pointer"
          >
            {isEn ? 'Store' : 'কয়েন রিচার্জ'}
          </button>
          <span>•</span>
          <button
            onClick={() => setIsAdOpen(true)}
            className="text-purple-700 hover:text-purple-900 transition-colors font-extrabold cursor-pointer"
          >
            {isEn ? 'Free Coins Video' : 'ফ্রি কয়েন ভিডিও'}
          </button>
          <span>•</span>
          <button
            onClick={() => setShowRules(true)}
            className="hover:text-amber-900 transition-colors cursor-pointer"
          >
            {isEn ? 'Rules' : 'খেলার নিয়ম'}
          </button>
          <span>•</span>
          <button
            onClick={() => {
              Sound.playClick();
              setIsAdvertiserModalOpen(true);
            }}
            className="text-amber-800 hover:text-amber-950 transition-colors font-extrabold flex items-center gap-1 cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-orange-600" />
            <span>{isEn ? 'Advertiser Portal' : 'বিজ্ঞাপন ও স্পনসরশিপ'}</span>
          </button>
        </div>
      </footer>
      </div>

      {/* Long-term Player Game Statistics Modal */}
      <GameStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        stats={playerStats}
        onResetStats={() => setPlayerStats(createResetStats())}
        onClaimAchievementReward={(coins) => {
          setUserCoins((prev) => prev + coins);
          setPlayerStats((prev) => recordEventInStats(prev, 'coins', coins));
        }}
        userCoins={userCoins}
      />

      {/* Avatar Customizer Modal */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={userAvatar}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Game Customization Modal (Background, Board Theme, Dice Material & Token Shape) */}
      <CustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        config={customization}
        onSaveConfig={handleSaveCustomization}
        defaultTab={customizationTab}
        isEn={isEn}
      />

      {/* Online Matchmaking & Room Modal */}
      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        userCoins={userCoins}
        userAvatar={userAvatar}
        currentRoomId={currentRoomId}
        onlinePlayers={onlineRoomPlayers}
        isHost={isHost}
        isSearchingMatch={isSearchingMatch}
        onQuickMatch={handleQuickMatch}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onStartGame={handleStartOnlineGame}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* Coin & Diamond Store Modal */}
      <CoinStoreModal
        isOpen={isStoreOpen}
        isEn={isEn}
        onClose={() => setIsStoreOpen(false)}
        currentCoins={userCoins}
        currentDiamonds={levelState.diamonds}
        initialTab={storeTab}
        onCoinsPurchased={(added) => {
          setUserCoins((prev) => prev + added);
          setPlayerStats((prev) => recordEventInStats(prev, 'coins', added));
        }}
        onDiamondsPurchased={(added) => {
          setLevelState((prev) => {
            const updated = {
              ...prev,
              diamonds: prev.diamonds + added,
              totalDiamondsEarned: prev.totalDiamondsEarned + added,
            };
            saveAccountLevelState(updated);
            return updated;
          });
          Sound.playDiamondCollect();
        }}
        onExchangeCoinsForDiamonds={(coinsCost, diamondsGained) => {
          setUserCoins((prev) => Math.max(0, prev - coinsCost));
          setLevelState((prev) => {
            const updated = {
              ...prev,
              diamonds: prev.diamonds + diamondsGained,
              totalDiamondsEarned: prev.totalDiamondsEarned + diamondsGained,
            };
            saveAccountLevelState(updated);
            return updated;
          });
        }}
        onExchangeDiamondsForCoins={(diamondsCost, coinsGained) => {
          setLevelState((prev) => {
            const updated = {
              ...prev,
              diamonds: Math.max(0, prev.diamonds - diamondsCost),
            };
            saveAccountLevelState(updated);
            return updated;
          });
          setUserCoins((prev) => prev + coinsGained);
          setPlayerStats((prev) => recordEventInStats(prev, 'coins', coinsGained));
        }}
      />

      {/* Watch Ad Modal */}
      <WatchAdModal
        isOpen={isAdOpen}
        onClose={() => setIsAdOpen(false)}
        onRewardClaimed={(rewardCoins, rewardDiamonds) => {
          setUserCoins((prev) => prev + rewardCoins);
          setPlayerStats((prev) => recordEventInStats(prev, 'coins', rewardCoins));
          if (rewardDiamonds > 0) {
            setLevelState((prev) => {
              const updated = {
                ...prev,
                diamonds: prev.diamonds + rewardDiamonds,
                totalDiamondsEarned: prev.totalDiamondsEarned + rewardDiamonds,
              };
              saveAccountLevelState(updated);
              return updated;
            });
          }
          awardXP(50, 'ভিডিও এড রিওয়ার্ড');
        }}
      />

      {/* Daily Login Streak Bonus Modal */}
      {isDailyStreakModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl border-2 border-amber-400/80 shadow-2xl p-4 sm:p-5 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                <h3 className="text-base font-black text-amber-300">
                  {isEn ? 'Daily Free Login Bonus' : 'দৈনিক ফ্রি লগইন বোনাস'}
                </h3>
              </div>
              <button
                onClick={() => setIsDailyStreakModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <DailyLoginStreak
              streakState={dailyStreakState}
              onClaimReward={handleClaimStreakReward}
            />
          </div>
        </div>
      )}

      {/* Account Level Milestone Roadmap Modal */}
      <LevelRoadmapModal
        isOpen={isLevelRoadmapOpen}
        onClose={() => setIsLevelRoadmapOpen(false)}
        levelState={levelState}
        onClaimReward={handleClaimLevelReward}
      />

      {/* Level Up Celebration Modal */}
      <LevelUpModal
        isOpen={!!levelUpEvent}
        eventData={levelUpEvent}
        onClose={() => setLevelUpEvent(null)}
        onClaimReward={() => {
          if (levelUpEvent) {
            const r = levelUpEvent.reward;
            if (r.coins && r.coins > 0) {
              setUserCoins((c) => c + r.coins!);
              setPlayerStats((prev) => recordEventInStats(prev, 'coins', r.coins!));
            }
            if (r.diamonds && r.diamonds > 0) {
              Sound.playDiamondCollect();
            }
            setLevelState((prev) => claimLevelRewardInState(prev, levelUpEvent.newLevel));
            setLevelUpEvent(null);
            Sound.playWin();
          }
        }}
        onOpenRoadmap={() => {
          setLevelUpEvent(null);
          setIsLevelRoadmapOpen(true);
        }}
      />

      {/* Tournament Bracket Modal */}
      <TournamentModal
        isOpen={isTournamentModalOpen}
        onClose={() => setIsTournamentModalOpen(false)}
        stage={tournamentStage}
        matches={tournamentMatches}
        prizePool={tournamentPrizePool}
        isTournamentOver={isTournamentOver}
        championName={championName}
        championColor={championColor}
        onPlayNextMatch={() => {
          setIsTournamentModalOpen(false);
          handleNextTournamentMatch();
        }}
        onResetTournament={handleResetTournament}
      />

      {/* User Authentication & Account Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onUserUpdated={handleUserUpdated}
        initialView={authModalInitialView}
      />

      {/* 10-Person Live Adda Board & Voice Stage Modal */}
      <AddaLiveBoardModal
        isOpen={isAddaModalOpen}
        onClose={() => setIsAddaModalOpen(false)}
        currentUser={currentUser}
        userAvatar={userAvatar}
        userCoins={userCoins}
        onUpdateCoins={(newCoins) => setUserCoins(newCoins)}
      />

      {/* Invite Friends & Referral System Modal */}
      <InviteFriendsModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
        userAvatar={userAvatar}
        userCoins={userCoins}
        userDiamonds={levelState.diamonds}
        onRewardGranted={handleReferralRewardGranted}
      />

      {/* Age Limit & Child Safety Modal */}
      <AgeLimitModal
        isOpen={isAgeModalOpen}
        onClose={() => setIsAgeModalOpen(false)}
        currentUser={currentUser}
        onAgeConfigUpdated={(updated) => setAgeConfig(updated)}
      />

      {/* Screen Time Daily Limit Alert Modal */}
      <ScreenTimeAlertModal
        isOpen={isScreenTimeAlertOpen}
        onClose={() => setIsScreenTimeAlertOpen(false)}
        usedMinutes={screenTimeInfo.used}
        limitMinutes={screenTimeInfo.limit}
        isKidMode={ageConfig.ageCategory === 'under_13'}
      />

      {/* Joy Video Content Studio & Monetization Modal */}
      <JoyVideoStudioModal
        isOpen={isJoyVideoModalOpen}
        onClose={() => setIsJoyVideoModalOpen(false)}
        currentUser={currentUser}
        userCoins={userCoins}
        userDiamonds={levelState.diamonds}
        onDeductDiamonds={(count) => {
          setLevelState((prev) => ({
            ...prev,
            diamonds: Math.max(0, prev.diamonds - count),
          }));
        }}
        onOpenAdvertiserModal={() => setIsAdvertiserModalOpen(true)}
        onOpenShortsScrollPlayer={() => {
          setIsJoyVideoModalOpen(false);
          setIsShortsScrollPlayerOpen(true);
        }}
      />

      {/* Joy Ludo Shorts TikTok-style Vertical Scroll Player & Offline Video Viewer */}
      <JoyLudoShortsScrollPlayer
        isOpen={isShortsScrollPlayerOpen}
        onClose={() => setIsShortsScrollPlayerOpen(false)}
        currentUser={currentUser}
        userDiamonds={levelState.diamonds}
        onDeductDiamonds={(count) => {
          setLevelState((prev) => ({
            ...prev,
            diamonds: Math.max(0, prev.diamonds - count),
          }));
        }}
        onOpenStudioModal={() => {
          setIsShortsScrollPlayerOpen(false);
          setIsJoyVideoModalOpen(true);
        }}
      />

      {/* Advertiser Contact & Business Sponsorship Modal */}
      <AdvertiserContactModal
        isOpen={isAdvertiserModalOpen}
        isEn={isEn}
        onClose={() => setIsAdvertiserModalOpen(false)}
      />

      {/* Game Over Celebration Modal */}
      {winner && (
        <GameOverModal
          winner={winner}
          isEn={isEn}
          onRestart={restartGame}
          onHome={() => {
            setWinner(null);
            handleModeSelect('vs-bot');
          }}
          prizeCoins={
            gameMode === 'team-2v2'
              ? 3500
              : gameMode === 'tournament'
              ? tournamentStage === 'final'
                ? 5000
                : tournamentStage === 'semi'
                ? 2000
                : 1000
              : gameMode === 'quick-match'
              ? 1500
              : 2500
          }
          gameMode={gameMode}
          teamWon={teamWon || undefined}
          winningTeamPlayers={
            teamWon
              ? players.filter((p) =>
                  teamWon === 1
                    ? p.color === 'red' || p.color === 'yellow'
                    : p.color === 'green' || p.color === 'blue'
                )
              : []
          }
          onNextTournamentMatch={() => {
            setWinner(null);
            handleNextTournamentMatch();
          }}
          xpEarned={
            gameMode === 'team-2v2'
              ? 500
              : gameMode === 'tournament'
              ? tournamentStage === 'final'
                ? 1500
                : tournamentStage === 'semi'
                ? 600
                : 300
              : gameMode === 'quick-match'
              ? 250
              : 400
          }
          isTournamentFinal={tournamentStage === 'final'}
        />
      )}

      {/* ========================================================
          DEDICATED NAVIGATION SYSTEM MODALS
          ======================================================== */}
      {/* 1. Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        isEn={isEn}
        onClose={() => setIsSearchModalOpen(false)}
        onJoinRoom={(code) => {
          handleJoinRoom(code);
        }}
        onOpenShorts={() => {
          setIsSearchModalOpen(false);
          setIsShortsScrollPlayerOpen(true);
        }}
        onOpenAdda={() => {
          setIsSearchModalOpen(false);
          setIsAddaModalOpen(true);
        }}
      />

      {/* 2. Messages & Inbox Modal */}
      <MessagesInboxModal
        isOpen={isMessagesModalOpen}
        isEn={isEn}
        onClose={() => setIsMessagesModalOpen(false)}
        onClaimGift={(coins) => {
          setUserCoins((prev) => prev + coins);
          Sound.playCoinSound();
        }}
      />

      {/* 3. Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        isEn={isEn}
        onClose={() => setIsNotificationsModalOpen(false)}
        onOpenStore={() => {
          setIsNotificationsModalOpen(false);
          setIsStoreOpen(true);
        }}
        onOpenInvite={() => {
          setIsNotificationsModalOpen(false);
          setIsInviteModalOpen(true);
        }}
        onOpenShorts={() => {
          setIsNotificationsModalOpen(false);
          setIsShortsScrollPlayerOpen(true);
        }}
      />

      {/* 4. Game Mode Selector Modal */}
      <GameModesModal
        isOpen={isGameModesModalOpen}
        isEn={isEn}
        onClose={() => setIsGameModesModalOpen(false)}
        onSelectMode={handleSelectGameModeFromModal}
      />

      {/* 5. Menu Drawer (☰) */}
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onClose={() => setIsMenuDrawerOpen(false)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenRules={() => setShowRules(true)}
        onOpenCustomization={() => setIsCustomizationModalOpen(true)}
        onOpenStore={() => setIsStoreOpen(true)}
        onOpenVip={() => setIsVipModalOpen(true)}
        onOpenAgeSafety={() => setIsAgeModalOpen(true)}
        onOpenInvite={() => setIsInviteModalOpen(true)}
        onOpenShorts={() => setIsShortsScrollPlayerOpen(true)}
        onOpenStudio={() => setIsJoyVideoModalOpen(true)}
        onOpenAdvertiser={() => setIsAdvertiserModalOpen(true)}
        onOpenAdda={() => setIsAddaModalOpen(true)}
        onOpenStats={() => setIsStatsModalOpen(true)}
        onOpenLevelRoadmap={() => setIsLevelRoadmapOpen(true)}
        onOpenWatchAd={() => setIsAdOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        soundMuted={soundMuted}
        onToggleSound={() => {
          const isNowMuted = Sound.toggleMute();
          setSoundMuted(isNowMuted);
        }}
      />

      {/* 6. Exit / Close Match Modal */}
      <ExitConfirmModal
        isOpen={isExitConfirmModalOpen}
        isEn={isEn}
        onClose={() => setIsExitConfirmModalOpen(false)}
        onConfirmExit={handleHomeClick}
        onRestartMatch={restartGame}
      />

      {/* 7. Game Rules & Coin Bonus Guide Modal */}
      <RulesModal
        isOpen={showRules}
        isEn={isEn}
        onClose={() => setShowRules(false)}
      />

      {/* 8. User Settings System (ইউজারদের জন্য সেটিংস ব্যবস্থা) */}
      <UserSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenProfile={() => {
          setIsSettingsModalOpen(false);
          setAuthModalInitialView('profile');
          setIsAuthModalOpen(true);
        }}
        onOpenAgeSafety={() => {
          setIsSettingsModalOpen(false);
          setIsAgeModalOpen(true);
        }}
        onOpenRules={() => {
          setIsSettingsModalOpen(false);
          setShowRules(true);
        }}
        onSettingsUpdated={(newSettings) => {
          setUserSettings(newSettings);
        }}
      />

      {/* 9. APK Install & Mobile Generator Modal */}
      <ApkInstallModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        isEn={isEn}
      />
    </div>
  );
}
