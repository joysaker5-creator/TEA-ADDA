import { VideoContent } from '../types';
import { INITIAL_SEED_VIDEOS } from './videoMonetizationService';

const STORAGE_OFFLINE_VIDEOS_KEY = 'joy_ludo_offline_cached_videos_v2';
const STORAGE_OFFLINE_SIMULATION_MODE = 'joy_ludo_offline_simulation_mode';

// Pre-cached videos for offline viewing (Just like TikTok offline video watching)
export const DEFAULT_OFFLINE_VIDEOS: VideoContent[] = INITIAL_SEED_VIDEOS.slice(0, 6).map((vid, idx) => ({
  ...vid,
  isKidsSafe: true,
  offlineCachedAt: Date.now() - 1000 * 60 * (idx * 30 + 10),
  offlineSizeBytes: 1024 * 1024 * (1.2 + idx * 0.4), // approx 1.2MB - 3.2MB per reel
}));

/**
 * Initialize offline cache with default seed videos if empty
 */
export const initOfflineVideoCache = (): VideoContent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_OFFLINE_VIDEOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load offline videos from storage:', e);
  }

  // Pre-seed offline cache with default essential shorts
  try {
    localStorage.setItem(STORAGE_OFFLINE_VIDEOS_KEY, JSON.stringify(DEFAULT_OFFLINE_VIDEOS));
  } catch (e) {
    console.error('Failed to pre-seed offline cache:', e);
  }
  return DEFAULT_OFFLINE_VIDEOS;
};

/**
 * Get all offline cached videos
 */
export const getOfflineCachedVideos = (): VideoContent[] => {
  return initOfflineVideoCache();
};

/**
 * Check if a specific video is cached offline
 */
export const isVideoOfflineCached = (videoId: string): boolean => {
  const list = getOfflineCachedVideos();
  return list.some((v) => v.id === videoId);
};

/**
 * Save / Download video to offline cache
 */
export const saveVideoToOfflineCache = (video: VideoContent): { success: boolean; totalCached: number; messageBn: string } => {
  try {
    const list = getOfflineCachedVideos();
    const existingIndex = list.findIndex((v) => v.id === video.id);

    const videoToSave: VideoContent = {
      ...video,
      offlineCachedAt: Date.now(),
      offlineSizeBytes: 1024 * 1024 * (1.5 + Math.random() * 1.5),
    };

    let updatedList: VideoContent[];
    if (existingIndex >= 0) {
      updatedList = list.map((v) => (v.id === video.id ? videoToSave : v));
    } else {
      updatedList = [videoToSave, ...list];
    }

    localStorage.setItem(STORAGE_OFFLINE_VIDEOS_KEY, JSON.stringify(updatedList));
    return {
      success: true,
      totalCached: updatedList.length,
      messageBn: `ভিডিওটি অফলাইনে সফলভাবে সেভ হয়েছে! ইন্টারনেট ছাড়াই যেকোনো সময় দেখতে পারবেন।`,
    };
  } catch (e) {
    return {
      success: false,
      totalCached: 0,
      messageBn: 'অফলাইন ক্যাশে সেভ করতে সমস্যা হয়েছে। মেমোরি খালি করুন।',
    };
  }
};

/**
 * Remove video from offline cache
 */
export const removeVideoFromOfflineCache = (videoId: string): { success: boolean; totalCached: number } => {
  try {
    const list = getOfflineCachedVideos();
    const updatedList = list.filter((v) => v.id !== videoId);
    localStorage.setItem(STORAGE_OFFLINE_VIDEOS_KEY, JSON.stringify(updatedList));
    return { success: true, totalCached: updatedList.length };
  } catch (e) {
    return { success: false, totalCached: 0 };
  }
};

/**
 * Storage metrics for offline videos
 */
export interface OfflineStorageMetrics {
  totalVideos: number;
  totalSizeKB: number;
  totalSizeMB: string;
  cacheLimitVideos: number;
}

export const getOfflineStorageMetrics = (): OfflineStorageMetrics => {
  const list = getOfflineCachedVideos();
  let totalBytes = 0;
  list.forEach((v) => {
    totalBytes += v.offlineSizeBytes || 1024 * 1024 * 1.8;
  });

  const totalSizeKB = Math.round(totalBytes / 1024);
  const totalSizeMB = (totalBytes / (1024 * 1024)).toFixed(1);

  return {
    totalVideos: list.length,
    totalSizeKB,
    totalSizeMB,
    cacheLimitVideos: 30,
  };
};

/**
 * Clear offline cache and reseed essentials
 */
export const resetOfflineVideoCache = (): VideoContent[] => {
  localStorage.setItem(STORAGE_OFFLINE_VIDEOS_KEY, JSON.stringify(DEFAULT_OFFLINE_VIDEOS));
  return DEFAULT_OFFLINE_VIDEOS;
};

/**
 * Network state helper with optional offline simulation switch
 */
export const getOfflineSimulationMode = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_OFFLINE_SIMULATION_MODE) === 'true';
  } catch {
    return false;
  }
};

export const setOfflineSimulationMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(STORAGE_OFFLINE_SIMULATION_MODE, enabled ? 'true' : 'false');
  } catch {}
};

/**
 * Check if app should act in offline video mode
 */
export const isAppInOfflineMode = (): boolean => {
  if (getOfflineSimulationMode()) return true;
  if (typeof navigator !== 'undefined' && !navigator.onLine) return true;
  return false;
};
