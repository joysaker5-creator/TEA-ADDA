export interface UserSettings {
  // Sound & Haptics
  soundEffects: boolean;
  soundVolume: number; // 0 - 100
  backgroundMusic: boolean;
  musicVolume: number; // 0 - 100
  vibration: boolean;
  voiceChatEnabled: boolean;

  // Gameplay Settings
  autoMoveSingleToken: boolean;
  diceSpeed: 'normal' | 'fast' | 'turbo';
  highlightMovableTokens: boolean;
  quickTurnTimer: boolean;

  // Language & Notifications
  language: 'bn' | 'en';
  notifTournament: boolean;
  notifFriendMessages: boolean;
  notifDailyBonus: boolean;

  // Privacy & Performance
  allowInvitesFromStrangers: boolean;
  lowDataMode: boolean;
  highQualityGraphics: boolean;
}

const SETTINGS_STORAGE_KEY = 'joy_ludo_user_settings_v1';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  soundEffects: true,
  soundVolume: 80,
  backgroundMusic: true,
  musicVolume: 60,
  vibration: true,
  voiceChatEnabled: true,

  autoMoveSingleToken: true,
  diceSpeed: 'normal',
  highlightMovableTokens: true,
  quickTurnTimer: false,

  language: 'en',
  notifTournament: true,
  notifFriendMessages: true,
  notifDailyBonus: true,

  allowInvitesFromStrangers: true,
  lowDataMode: false,
  highQualityGraphics: true,
};

export function loadUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_SETTINGS, ...parsed, language: 'en' };
  } catch {
    return DEFAULT_USER_SETTINGS;
  }
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage error
  }
}
