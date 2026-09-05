import {
  VipBadgeId,
  VipChatBubbleId,
  VipFrameId,
  VipPackage,
  VipSubscriptionState,
  UserProfile,
} from '../types';
import { DEFAULT_VIP_STATE, VIP_PACKAGES } from './vipConstants';

const STORAGE_KEY_PREFIX = 'joy_ludo_vip_state_';

export function getVipStorageKey(userOrId?: UserProfile | string | null): string {
  if (typeof userOrId === 'string') {
    return `${STORAGE_KEY_PREFIX}${userOrId || 'guest'}`;
  }
  return `${STORAGE_KEY_PREFIX}${userOrId?.id || 'guest'}`;
}

export function loadVipState(userOrId?: UserProfile | string | null): VipSubscriptionState {
  const key = getVipStorageKey(userOrId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_VIP_STATE };
    const parsed = JSON.parse(raw) as VipSubscriptionState;

    // Check expiration if not lifetime
    if (parsed.isActive && parsed.expiresAt !== null && parsed.expiresAt < Date.now()) {
      parsed.isActive = false;
    }

    return parsed;
  } catch (err) {
    console.error('Error loading VIP state', err);
    return { ...DEFAULT_VIP_STATE };
  }
}

export function saveVipState(state: VipSubscriptionState, userOrId?: UserProfile | string | null): void {
  const key = getVipStorageKey(userOrId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving VIP state', err);
  }
}

export function purchaseVipPackage(
  pkg: VipPackage,
  currentState: VipSubscriptionState,
  userDiamonds: number,
  userOrId?: UserProfile | string | null
): { success: boolean; newState: VipSubscriptionState; remainingDiamonds: number; messageBn: string } {
  if (userDiamonds < pkg.diamondPrice) {
    return {
      success: false,
      newState: currentState,
      remainingDiamonds: userDiamonds,
      messageBn: `পর্যাপ্ত ডায়মন্ড নেই! আপনার প্রয়োজন ${pkg.diamondPrice} 💎 কিন্তু আছে ${userDiamonds} 💎।`,
    };
  }

  const now = Date.now();
  let newExpiresAt: number | null = null;

  if (pkg.durationDays === 0) {
    newExpiresAt = null; // Lifetime
  } else {
    const durationMs = pkg.durationDays * 24 * 60 * 60 * 1000;
    if (currentState.isActive && currentState.expiresAt !== null && currentState.expiresAt > now) {
      // Extend existing subscription
      newExpiresAt = currentState.expiresAt + durationMs;
    } else {
      newExpiresAt = now + durationMs;
    }
  }

  // Merge unlocked items
  const combinedFrames = Array.from(
    new Set([...currentState.unlockedFrames, ...pkg.unlockedFrames, 'none'])
  ) as VipFrameId[];

  const combinedChatBubbles = Array.from(
    new Set([...currentState.unlockedChatBubbles, ...pkg.unlockedChatBubbles, 'classic'])
  ) as VipChatBubbleId[];

  const combinedBadges = Array.from(
    new Set([...currentState.unlockedBadges, ...pkg.unlockedBadges])
  ) as VipBadgeId[];

  const newState: VipSubscriptionState = {
    isActive: true,
    tier: pkg.tier,
    passType: pkg.id,
    purchasedAt: now,
    expiresAt: newExpiresAt,
    activeFrameId: (pkg.unlockedFrames && pkg.unlockedFrames.length > 0 ? pkg.unlockedFrames[0] : null) || currentState.activeFrameId,
    activeChatBubbleId: (pkg.unlockedChatBubbles && pkg.unlockedChatBubbles.length > 0 ? pkg.unlockedChatBubbles[0] : null) || currentState.activeChatBubbleId,
    activeBadgeId: (pkg.unlockedBadges && pkg.unlockedBadges.length > 0 ? pkg.unlockedBadges[0] : null) || currentState.activeBadgeId,
    unlockedFrames: combinedFrames,
    unlockedChatBubbles: combinedChatBubbles,
    unlockedBadges: combinedBadges,
    autoRenew: false,
  };

  saveVipState(newState, userOrId);

  return {
    success: true,
    newState,
    remainingDiamonds: userDiamonds - pkg.diamondPrice,
    messageBn: `অভিনন্দন! আপনি সফলভাবে ${pkg.nameBn} সক্রিয় করেছেন।`,
  };
}

export function equipVipFrame(
  frameId: VipFrameId,
  currentState: VipSubscriptionState,
  userOrId?: UserProfile | string | null
): VipSubscriptionState {
  const updated: VipSubscriptionState = {
    ...currentState,
    activeFrameId: frameId,
  };
  saveVipState(updated, userOrId);
  return updated;
}

export function equipVipChatBubble(
  bubbleId: VipChatBubbleId,
  currentState: VipSubscriptionState,
  userOrId?: UserProfile | string | null
): VipSubscriptionState {
  const updated: VipSubscriptionState = {
    ...currentState,
    activeChatBubbleId: bubbleId,
  };
  saveVipState(updated, userOrId);
  return updated;
}

export function equipVipBadge(
  badgeId: VipBadgeId,
  currentState: VipSubscriptionState,
  userOrId?: UserProfile | string | null
): VipSubscriptionState {
  const updated: VipSubscriptionState = {
    ...currentState,
    activeBadgeId: badgeId,
  };
  saveVipState(updated, userOrId);
  return updated;
}

export function getVipRemainingDays(state: VipSubscriptionState): number | 'lifetime' | 0 {
  if (!state.isActive) return 0;
  if (state.expiresAt === null) return 'lifetime';
  const diff = state.expiresAt - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}
