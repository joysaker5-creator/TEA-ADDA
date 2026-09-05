import {
  VideoContent,
  VideoComment,
  CreatorMonetizationProfile,
  WithdrawalTransaction,
  PolicyScanResult,
  UserProfile,
} from '../types';

const STORAGE_VIDEOS_KEY = 'joy_ludo_video_feed_v1';
const STORAGE_MONETIZATION_PREFIX = 'joy_ludo_monetization_profile_';
const STORAGE_WITHDRAWALS_KEY = 'joy_ludo_withdrawals_v1';

// Supported countries for monetization
// Bangladesh (BD) is currently Active, other countries are waiting for regional permission
export const MONETIZATION_COUNTRY_STATUS: Record<string, { active: boolean; nameBn: string; flag: string; currency: string }> = {
  BD: { active: true, nameBn: 'বাংলাদেশ', flag: '🇧🇩', currency: 'BDT (৳)' },
  IN: { active: false, nameBn: 'ভারত', flag: '🇮🇳', currency: 'INR (₹)' },
  PK: { active: false, nameBn: 'পাকিস্তান', flag: '🇵🇰', currency: 'PKR (Rs)' },
  US: { active: false, nameBn: 'যুক্তরাষ্ট্র', flag: '🇺🇸', currency: 'USD ($)' },
  SA: { active: false, nameBn: 'সৌদি আরব', flag: '🇸🇦', currency: 'SAR (﷼)' },
  AE: { active: false, nameBn: 'সংযুক্ত আরব আমিরাত', flag: '🇦🇪', currency: 'AED (د.إ)' },
  GB: { active: false, nameBn: 'যুক্তরাজ্য', flag: '🇬🇧', currency: 'GBP (£)' },
  MY: { active: false, nameBn: 'মালয়েশিয়া', flag: '🇲🇾', currency: 'MYR (RM)' },
  SG: { active: false, nameBn: 'সিঙ্গাপুর', flag: '🇸🇬', currency: 'SGD ($)' },
  QA: { active: false, nameBn: 'কাতার', flag: '🇶🇦', currency: 'QAR (﷼)' },
  KW: { active: false, nameBn: 'কুয়েত', flag: '🇰🇼', currency: 'KWD (د.ك)' },
  OM: { active: false, nameBn: 'ওমান', flag: '🇴🇲', currency: 'OMR (﷼)' },
  IT: { active: false, nameBn: 'ইতালি', flag: '🇮🇹', currency: 'EUR (€)' },
  CA: { active: false, nameBn: 'কানাডা', flag: '🇨🇦', currency: 'CAD ($)' },
  AU: { active: false, nameBn: 'অস্ট্রেলিয়া', flag: '🇦🇺', currency: 'AUD ($)' },
};

// Check if a country code is eligible for monetization
export const isCountryMonetizationEligible = (countryCode: string = 'BD'): boolean => {
  const norm = (countryCode || 'BD').toUpperCase();
  return MONETIZATION_COUNTRY_STATUS[norm]?.active ?? false;
};

// Strict Prohibited Content Keywords
// 1. Political keywords (রাজনীতি)
const POLITICAL_KEYWORDS = [
  'রাজনীতি', 'রাজনৈতিক', 'আওয়ামী', 'বিএনপি', 'জামায়াত', 'জাতীয় পার্টি', 'নির্বাচন',
  'ভোট চাই', 'সরকার পতন', 'হরতাল', 'অবরোধ', 'মন্ত্রী', 'প্রধানমন্ত্রী', 'এমপি', 'দলীয়',
  'politics', 'election', 'minister', 'parliament', 'political'
];

// 2. Religious hate / Defamation keywords (ধর্মীয় বিদ্বেষ)
const RELIGIOUS_HATE_KEYWORDS = [
  'ধর্ম অবমাননা', 'কাফের', 'নাস্তিক হামলা', 'দাঙ্গা', 'সাম্প্রদায়িক', 'ধর্মীয় উস্কানি',
  'হিন্দু নিধন', 'মুসলিম বিরোধী', 'জিহাদ ঘোষণা', 'ধর্ম যুদ্ধ', 'মাজার ভাঙ্গা', 'মালাউন',
  'religious hate', 'blasphemy', 'sectarian'
];

// 3. Rumors & Fake news keywords (গুজব ও মিথ্যা তথ্য)
const RUMOR_KEYWORDS = [
  'গুজব', 'চাঞ্চল্যকর ফাঁস', 'ব্রেকিং ভুয়া', 'মারা গেছেন খবর সত্য নয়', 'ভূতুড়ে খবর',
  'সবাই শেয়ার করুন নইলে ক্ষতি হবে', 'আজ রাতেই পৃথিবী ধ্বংস', 'ভুয়া খবর', 'fake news',
  'rumor', 'scam alert fake'
];

// 4. Abusive / Profanity / Swearing keywords (গালাগালি ও অশ্লীল ভাষা)
const PROFANITY_KEYWORDS = [
  'কুত্তা', 'শুয়োর', 'হারামি', 'শালা', 'খানকির', 'মাদারচোদ', 'চোদা', 'বেশ্যা', 'লম্পট',
  'কুত্তার বাচ্চা', 'শালা বদমাশ', 'মাগির', 'শুয়োরের বাচ্চা', 'গালি', 'গালাগালি', 'অশ্লীল',
  'f***', 'bitch', 'asshole', 'bastard', 'slur', 'curse'
];

// 5. Instigating / Threat / Violence keywords (উস্কানিমূলক ও সহিংসতা)
const INSTIGATING_KEYWORDS = [
  'মারামারি', 'খুন করব', 'কাটাকাটি', 'আক্রমণ কর', 'উস্কানি', 'পিটিয়ে মার', 'বোমা হামলা',
  'জ্বালিয়ে দাও', 'হুমকি', 'সহিংসতা', ' riot', 'attack', 'kill you', 'violence', 'threat'
];

// 6. Child / Minor Detection Keywords (বাচ্চাদের কন্টেন্ট অটো-ডিটেকশন)
const CHILD_DETECTION_KEYWORDS = [
  'বাচ্চা', 'শিশু', 'শিশুর', 'ছোট বাবু', 'বাচ্চাদের', 'বেবি', 'বাবু', 'নাবালক', 'অপ্রাপ্তবয়স্ক',
  'baby', 'kid', 'child', 'toddler', 'infant', 'minor', 'newborn', 'little boy', 'little girl'
];

// Automated Policy Scanner
export const scanContentForPolicyViolation = (
  title: string,
  description: string,
  tags: string[],
  creatorAge?: number,
  isChildPhotoDetected?: boolean
): PolicyScanResult => {
  // 1. Creator Age Check (18+)
  if (creatorAge !== undefined && creatorAge < 18) {
    return {
      isSafe: false,
      violationType: 'underage_creator',
      reasonBn: '🔞 বয়স সীমা সতর্কতা: সরকারি ও ডিজিটাল সুরক্ষা নীতি অনুযায়ী ১৮ বছরের নিচে কেউ ভিডিও আপলোড বা মনিটাইজ করতে পারবে না।',
    };
  }

  const combinedText = `${title} ${description} ${tags.join(' ')}`.toLowerCase();

  // 2. Child / Minor Safety Auto-Removal Check
  if (isChildPhotoDetected) {
    return {
      isSafe: false,
      violationType: 'minor_child_detected',
      reasonBn: '🚫 শিশু সুরক্ষা নীতি (Child Safety): বাচ্চাদের ভিডিও বা ফটো আপলোড করা সম্পূর্ণ নিষিদ্ধ এবং সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে বাতিল ও রিমুভ করা হয়েছে।',
    };
  }

  for (const kw of CHILD_DETECTION_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) {
      return {
        isSafe: false,
        violationType: 'minor_child_detected',
        reasonBn: '🚫 শিশু সুরক্ষা নীতি (Child Safety): বাচ্চাদের ভিডিও বা ফটো আপলোড করা সম্পূর্ণ নিষিদ্ধ এবং সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে বাতিল ও রিমুভ করা হয়েছে।',
        flaggedKeywords: [kw],
      };
    }
  }

  // 3. Political Content Check
  for (const kw of POLITICAL_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) {
      return {
        isSafe: false,
        violationType: 'political',
        reasonBn: '🚫 রাজনৈতিক কন্টেন্ট নিষিদ্ধ: জয় লুডুতে যেকোনো প্রকার রাজনৈতিক প্রচার, দলীয় বক্তব্য বা উস্কানিমূলক রাজনৈতিক কন্টেন্ট আপলোড সম্পূর্ণ নিষিদ্ধ।',
        flaggedKeywords: [kw],
      };
    }
  }

  // 4. Religious Hate / Defamation Check
  for (const kw of RELIGIOUS_HATE_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) {
      return {
        isSafe: false,
        violationType: 'religious_hate',
        reasonBn: '🚫 ধর্মীয় বিদ্বেষমূলক কন্টেন্ট নিষিদ্ধ: সকল ধর্মের প্রতি সম্মান প্রদর্শন বাধ্যতামূলক। কোনো প্রকার ধর্মীয় কটূক্তি, অবমাননা বা বিদ্বেষ গ্রহণযোগ্য নয়।',
        flaggedKeywords: [kw],
      };
    }
  }

  // 5. Rumor & Fake News Check
  for (const kw of RUMOR_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) {
      return {
        isSafe: false,
        violationType: 'rumor_fake_news',
        reasonBn: '🚫 গুজব ও ভুয়া তথ্য নিষিদ্ধ: কোনো প্রকার গুজব, বিভ্রান্তিকর বা অপতথ্যযুক্ত ভিডিও প্রকাশ করা সম্পূর্ণ নিষিদ্ধ।',
        flaggedKeywords: [kw],
      };
    }
  }

  // 6. Abusive language / Profanity Check
  for (const kw of PROFANITY_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) {
      return {
        isSafe: false,
        violationType: 'abusive_profanity',
        reasonBn: '🚫 গালাগালি ও অশ্লীল ভাষা নিষিদ্ধ: ভদ্র ও সম্মানজনক ভাষা বজায় রাখুন। গালাগালি, অশালীন ও কুরুচিপূর্ণ শব্দ নিষিদ্ধ।',
        flaggedKeywords: [kw],
      };
    }
  }

  // 7. Instigating / Threat Check
  for (const kw of INSTIGATING_KEYWORDS) {
    if (combinedText.includes(kw.toLowerCase())) {
      return {
        isSafe: false,
        violationType: 'instigating_threat',
        reasonBn: '🚫 উস্কানিমূলক আচরণ ও হুমকি নিষিদ্ধ: যেকোনো প্রকার সহিংসতা, হুমকি বা উস্কানিমূলক আচরণ কঠোরভাবে নিষিদ্ধ।',
        flaggedKeywords: [kw],
      };
    }
  }

  return { isSafe: true };
};

// Category configurations and monetization multiplier rates
export interface ContentCategoryMeta {
  type: VideoContent['videoType'];
  titleBn: string;
  badge: string;
  icon: string;
  rpmRateBDT: number; // e.g. 100 BDT per 1000 views
  viewBonusRateBDT: number; // rate per view in BDT
  programNameBn: string;
  descriptionBn: string;
  bonusPerkBn: string;
  gradient: string;
}

export const CREATOR_MONETIZATION_CATEGORIES: Record<string, ContentCategoryMeta> = {
  funny_moment: {
    type: 'funny_moment',
    titleBn: 'ফানি ও কমেডি ভিডিও',
    badge: '😂 ভাইরাল ফানি ফান্ড',
    icon: '😂',
    rpmRateBDT: 100.0, // ৳১০০ প্রতি ১০০০ ভিউ
    viewBonusRateBDT: 0.10, // ৳০.১০ প্রতি ভিউ
    programNameBn: 'হাসির খোরাক ক্রিয়েটর ফান্ড (Viral Comedy Pool)',
    descriptionBn: 'লুডুর ফানি ভুল, কমেডি ডায়লগ, হাসির মিউজিক এবং মজার মুহূর্ত তৈরি করে সর্বোচ্চ আয় করুন।',
    bonusPerkBn: '৫০০+ লাইকে ৳১০০ নগদ ভাইরাল বোনাস + গিফট টিপিং ১০০% সরাসরি বিকাশ/নগদে!',
    gradient: 'from-amber-500 via-orange-500 to-rose-500',
  },
  educational_guide: {
    type: 'educational_guide',
    titleBn: 'শিক্ষামূলক ও স্ট্র্যাটেজি ভিডিও',
    badge: '🧠 এডু মাস্টারক্লাস ফান্ড',
    icon: '📚',
    rpmRateBDT: 120.0, // ৳১২০ প্রতি ১০০০ ভিউ
    viewBonusRateBDT: 0.12, // ৳০.১২ প্রতি ভিউ
    programNameBn: 'লুডু এডু মাস্টারক্লাস ও টিউটোরিয়াল ফান্ড (Master Educator Pool)',
    descriptionBn: 'লুডুর চাল, সেফ জোন সিক্রেট, উইনিং স্ট্র্যাটেজি ও টুর্নামেন্ট টিপস শিখিয়ে নিশ্চিত প্রিমিয়াম আয় করুন।',
    bonusPerkBn: 'প্রিমিয়াম আরপিএম ৳১২০/১k ভিউ + টপ টিউটোরিয়াল ভিডিওতে ৳১৫০ বিশেষ স্কলারশিপ অ্যাওয়ার্ড!',
    gradient: 'from-blue-600 via-indigo-600 to-teal-500',
  },
  tutorial: {
    type: 'tutorial',
    titleBn: 'টিপস, ট্রিকস ও টিউটোরিয়াল',
    badge: '🎯 প্রো টিপস ফান্ড',
    icon: '💡',
    rpmRateBDT: 110.0,
    viewBonusRateBDT: 0.11,
    programNameBn: 'প্রো ট্রিকস অ্যান্ড টেকনিক ফান্ড',
    descriptionBn: 'শর্ট টিউটোরিয়াল, গুটি কাটার টেকনিক এবং ডাইস প্রবাবিলিটি নিয়ে তথ্যবহুল ভিডিও।',
    bonusPerkBn: 'হাই এনগেজমেন্ট বোনাস ও নিয়মিত ভিউ রিওয়ার্ড!',
    gradient: 'from-teal-600 via-emerald-600 to-green-500',
  },
  creative_good_content: {
    type: 'creative_good_content',
    titleBn: 'ভালো ও সৃজনশীল কনটেন্ট',
    badge: '🌟 স্টার ক্রিয়েটর ফান্ড',
    icon: '✨',
    rpmRateBDT: 90.0,
    viewBonusRateBDT: 0.09,
    programNameBn: 'সৃজনশীল ও সুস্থ বিনোদন ফান্ড (Creative Excellence)',
    descriptionBn: 'ইতিবাচক গল্প, সৃজনশীল উপস্থাপনা, অনুপ্রেরণামূলক গেমিং ও মানসম্মত যেকোনো ভালো ভিডিও।',
    bonusPerkBn: 'কোয়ালিটি স্কোর অনুযায়ী অতিরিক্ত ৩০% রেভিনিউ শেয়ার ও স্পন্সরশিপ পার্টনারশিপ!',
    gradient: 'from-purple-600 via-pink-600 to-rose-500',
  },
  epic_win: {
    type: 'epic_win',
    titleBn: 'এপিক গেমপ্লে ও চ্যাম্পিয়ন উইন',
    badge: '🏆 চ্যাম্পিয়ন গিল্ড',
    icon: '🔥',
    rpmRateBDT: 85.0,
    viewBonusRateBDT: 0.085,
    programNameBn: 'হাই-স্কিল গেমপ্লে রিওয়ার্ড',
    descriptionBn: 'অবিশ্বাস্য কামব্যাক, লাস্ট মোমেন্ট ছক্কা ও টুর্নামেন্ট জেতার হাইলাইটস।',
    bonusPerkBn: 'টুর্নামেন্ট ট্রফি বোনাস ও গেমার ফ্যান টিপিং!',
    gradient: 'from-rose-600 via-amber-600 to-yellow-500',
  },
  gameplay_highlight: {
    type: 'gameplay_highlight',
    titleBn: 'হাইলাইটস ও টিম ২v২ ম্যাচ',
    badge: '🤝 টিমওয়ার্ক হাইলাইটস',
    icon: '🎮',
    rpmRateBDT: 80.0,
    viewBonusRateBDT: 0.08,
    programNameBn: 'পার্টনার ও টিমওয়ার্ক শেয়ার',
    descriptionBn: '২ বনাম ২ পার্টনার ম্যাচ এবং রোমাঞ্চকর টিম সমন্বয়ের ক্লিপ।',
    bonusPerkBn: 'টিম বোনাস ও শেয়ার রিওয়ার্ড!',
    gradient: 'from-indigo-600 to-blue-500',
  },
  voice_adda_clip: {
    type: 'voice_adda_clip',
    titleBn: 'লাইভ আড্ডা ও গানের মোমেন্টস',
    badge: '🎤 আড্ডা মিউজিক ফান্ড',
    icon: '🎙️',
    rpmRateBDT: 95.0,
    viewBonusRateBDT: 0.095,
    programNameBn: 'ভয়েস রুম ও সাংস্কৃতিক আড্ডা ফান্ড',
    descriptionBn: '১০ জনের লাইভ আড্ডার গান, কবিতা, সুর ও মিষ্টি আড্ডার সেরা ক্লিপ।',
    bonusPerkBn: 'শ্রোতাদের সরাসরি ডায়মন্ড উপহার টিপস ও সুপার থ্যাঙ্কস!',
    gradient: 'from-amber-600 via-pink-600 to-purple-600',
  },
};

// Monthly Creator Leaderboard with Cash Prizes (৳৫০,০০০ প্রাইজ পুল)
export interface CreatorLeaderboardEntry {
  rank: number;
  creatorName: string;
  categoryBn: string;
  categoryType: VideoContent['videoType'];
  totalViews: number;
  totalLikes: number;
  earningsBDT: number;
  prizeBDT: number;
  avatarIcon: string;
  badge: string;
}

export const MONTHLY_CREATOR_LEADERBOARD: CreatorLeaderboardEntry[] = [
  {
    rank: 1,
    creatorName: 'তানভীর আহমেদ (Funny Ludo BD)',
    categoryBn: '😂 ফানি ভিডিও',
    categoryType: 'funny_moment',
    totalViews: 145000,
    totalLikes: 28400,
    earningsBDT: 14500,
    prizeBDT: 15000,
    avatarIcon: '🤣',
    badge: '🥇 ১ম স্থান (৳১৫,০০০ প্রাইজ)',
  },
  {
    rank: 2,
    creatorName: 'শুভ্র রয় (Ludo Strategy Guru)',
    categoryBn: '📚 শিক্ষামূলক ভিডিও',
    categoryType: 'educational_guide',
    totalViews: 118000,
    totalLikes: 21900,
    earningsBDT: 14160,
    prizeBDT: 10000,
    avatarIcon: '🧠',
    badge: '🥈 ২য় স্থান (৳১০,০০০ প্রাইজ)',
  },
  {
    rank: 3,
    creatorName: 'নুসরাত জাহান (Adda Singer)',
    categoryBn: '🎙️ আড্ডা ও সৃজনশীল',
    categoryType: 'voice_adda_clip',
    totalViews: 89000,
    totalLikes: 18400,
    earningsBDT: 8455,
    prizeBDT: 7500,
    avatarIcon: '🎤',
    badge: '🥉 ৩য় স্থান (৳৭,৫০০ প্রাইজ)',
  },
  {
    rank: 4,
    creatorName: 'রাকিব হাসান (Epic Comeback)',
    categoryBn: '🔥 এপিক গেমপ্লে',
    categoryType: 'epic_win',
    totalViews: 74000,
    totalLikes: 14200,
    earningsBDT: 6290,
    prizeBDT: 5000,
    avatarIcon: '🏆',
    badge: '🏅 ৪র্থ স্থান (৳৫,০০০ প্রাইজ)',
  },
  {
    rank: 5,
    creatorName: 'ফারজানা আক্তার (Ludo Academy)',
    categoryBn: '📚 শিক্ষামূলক টিউটোরিয়াল',
    categoryType: 'tutorial',
    totalViews: 62000,
    totalLikes: 11500,
    earningsBDT: 6820,
    prizeBDT: 3500,
    avatarIcon: '💡',
    badge: '🏅 ৫ম স্থান (৳৩,৫০০ প্রাইজ)',
  },
  {
    rank: 6,
    creatorName: 'আরিফ চৌধুরী (Memes Master)',
    categoryBn: '😂 ফানি মোমেন্টস',
    categoryType: 'funny_moment',
    totalViews: 51000,
    totalLikes: 9800,
    earningsBDT: 5100,
    prizeBDT: 2500,
    avatarIcon: '🤪',
    badge: '🏅 ৬ষ্ঠ স্থান (৳২,৫০০ প্রাইজ)',
  },
  {
    rank: 7,
    creatorName: 'মাহমুদুল হক (Creative Stories)',
    categoryBn: '✨ ভালো ও সৃজনশীল',
    categoryType: 'creative_good_content',
    totalViews: 43000,
    totalLikes: 8200,
    earningsBDT: 3870,
    prizeBDT: 2000,
    avatarIcon: '🌟',
    badge: '🏅 ৭ম স্থান (৳২,০০০ প্রাইজ)',
  },
];

// Initial Seed Videos (Enriched with Funny, Educational, Good Creative & Adda moments)
export const INITIAL_SEED_VIDEOS: VideoContent[] = [
  {
    id: 'vid-joy-funny-01',
    title: '😂 চাল দিতে গিয়ে নিজেই নিজের গুটি কেটে ফেললাম! হাসতে হাসতে শেষ!',
    description: 'লাল গুটি সেফ জোনে নিয়ে যাওয়ার বদলে প্রতিপক্ষের ফাঁদে পড়ে নিজের গুটিই খেয়ে ফেললাম! বন্ধুদের হাসির রিঅ্যাকশন দেখুন! 🤣 #JoyLudo #FunnyMoments #LudoComedy',
    creatorId: 'creator-tanvir-01',
    creatorName: 'তানভীর আহমেদ (Funny Ludo BD)',
    creatorCountry: 'BD',
    videoType: 'funny_moment',
    categoryLabelBn: '😂 ফানি ভিডিও',
    durationSeconds: 34,
    viewsCount: 38500,
    likesCount: 5420,
    commentsCount: 840,
    sharesCount: 520,
    earningsBDT: 3850.0,
    rpmRateBDT: 100.0,
    qualityBonusBDT: 250.0,
    diamondsReceived: 420,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 8,
    tags: ['ফানি', 'কমেডি', 'হাসিরভিডিও', 'লুডুফানি', 'মেমে', 'FunnyLudo'],
    creatorAvatar: {
      skinColor: '#fcd34d',
      hairStyle: 'short',
      hairColor: '#1e293b',
      eyes: 'happy',
      mouth: 'laugh',
      clothing: 'hoodie',
      clothingColor: '#f97316',
      accessory: 'sunglasses',
      bgGradient: 'from-amber-500 to-orange-600',
    },
    gameSnippet: {
      playerColor: 'red',
      diceRoll: 6,
      tokensCaptured: 0,
      coinsWon: 5000,
    },
  },
  {
    id: 'vid-joy-edu-02',
    title: '🧠 লুডুতে প্রতি চালে জেতার ৫টি বৈজ্ঞানিক নিয়ম ও সেফ জোন সিক্রেট!',
    description: 'স্টার পয়েন্ট কীভাবে লক করবেন এবং প্রতিপক্ষের গুটি ট্র্যাপে ফেলার সঠিক প্রবাবিলিটি ক্যালকুলেশন! পুরো মাস্টারক্লাস টিউটোরিয়াল। 📚 #LudoStrategy #Education #Masterclass',
    creatorId: 'creator-shuvo-03',
    creatorName: 'শুভ্র রয় (Ludo Strategy Guru)',
    creatorCountry: 'BD',
    videoType: 'educational_guide',
    categoryLabelBn: '📚 শিক্ষামূলক ভিডিও',
    durationSeconds: 58,
    viewsCount: 42900,
    likesCount: 6800,
    commentsCount: 910,
    sharesCount: 680,
    earningsBDT: 5148.0,
    rpmRateBDT: 120.0,
    qualityBonusBDT: 400.0,
    diamondsReceived: 560,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 18,
    tags: ['শিক্ষামূলক', 'স্ট্র্যাটেজি', 'লুডুশিক্ষা', 'টিউটোরিয়াল', 'প্রোগেমার', 'Masterclass'],
    creatorAvatar: {
      skinColor: '#fcd34d',
      hairStyle: 'curly',
      hairColor: '#334155',
      eyes: 'cool',
      mouth: 'smile',
      clothing: 'jersey',
      clothingColor: '#2563eb',
      accessory: 'glasses',
      bgGradient: 'from-blue-600 to-indigo-600',
    },
    gameSnippet: {
      playerColor: 'yellow',
      diceRoll: 6,
      tokensCaptured: 3,
      coinsWon: 35000,
    },
  },
  {
    id: 'vid-joy-creative-03',
    title: '✨ সুস্থ পারিবারিক বিনোদন ও বন্ধুদের মিষ্টি গল্পের সৃজনশীল মুহূর্ত',
    description: 'দৈনন্দিন স্ট্রেস ভুলে বন্ধুদের নিয়ে মন ভালো করা আড্ডা, গঠনমূলক আলোচনা ও আনন্দঘন মুহূর্ত। ভালো কনটেন্ট ছড়িয়ে দিন সবার মাঝে। 🌟 #GoodContent #PositiveVibes #JoyLudo',
    creatorId: 'creator-mahmud-07',
    creatorName: 'মাহমুদুল হক (Creative Life BD)',
    creatorCountry: 'BD',
    videoType: 'creative_good_content',
    categoryLabelBn: '🌟 ভালো ও সৃজনশীল কনটেন্ট',
    durationSeconds: 46,
    viewsCount: 26400,
    likesCount: 4120,
    commentsCount: 480,
    sharesCount: 390,
    earningsBDT: 2376.0,
    rpmRateBDT: 90.0,
    qualityBonusBDT: 200.0,
    diamondsReceived: 290,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 24,
    tags: ['ভালোভিডিও', 'সৃজনশীল', 'পজিটিভ', 'আনন্দ', 'বন্ধুত্ব'],
    creatorAvatar: {
      skinColor: '#fed7aa',
      hairStyle: 'short',
      hairColor: '#0f172a',
      eyes: 'sparkle',
      mouth: 'smile',
      clothing: 'suit',
      clothingColor: '#9333ea',
      accessory: 'glasses',
      bgGradient: 'from-purple-600 to-pink-600',
    },
    gameSnippet: {
      playerColor: 'green',
      diceRoll: 5,
      tokensCaptured: 1,
      coinsWon: 18000,
    },
  },
  {
    id: 'vid-joy-funny-04',
    title: '🤣 টুর্নামেন্ট ফাইনালে ডাইস ঘুরিয়ে ছক্কার বদলে ১! বসের রিয়্যাকশন!',
    description: 'আর ১ পেলেই ট্রফি জিতে যেতাম, কিন্তু পর পর ৩ বার ১ পড়ার পর রুমে সবার হাসির রোল! 🤪🔥 #FunnyLudo #EpicFail #ComedyReels',
    creatorId: 'creator-arif-04',
    creatorName: 'আরিফ চৌধুরী (Memes Master)',
    creatorCountry: 'BD',
    videoType: 'funny_moment',
    categoryLabelBn: '😂 ফানি ভিডিও',
    durationSeconds: 39,
    viewsCount: 31200,
    likesCount: 4900,
    commentsCount: 620,
    sharesCount: 430,
    earningsBDT: 3120.0,
    rpmRateBDT: 100.0,
    qualityBonusBDT: 200.0,
    diamondsReceived: 310,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 32,
    tags: ['হাসি', 'কমেডি', 'ফানিম্যাচ', 'টুর্নামেন্টহাসি', 'LudoMeme'],
    creatorAvatar: {
      skinColor: '#fed7aa',
      hairStyle: 'cap',
      hairColor: '#0f172a',
      eyes: 'wink',
      mouth: 'laugh',
      clothing: 'hoodie',
      clothingColor: '#ef4444',
      accessory: 'headphone',
      bgGradient: 'from-rose-600 to-amber-600',
    },
    gameSnippet: {
      playerColor: 'blue',
      diceRoll: 1,
      tokensCaptured: 0,
      coinsWon: 8000,
    },
  },
  {
    id: 'vid-joy-edu-05',
    title: '📚 টুর্নামেন্টে হোম করিডোরে প্রবেশের নিখুঁত টেকনিক ও ডাইস ক্যালকুলেশন',
    description: 'কখন কোন গুটি চালাবেন? প্রতিপক্ষ যখন পেছনে তাড়া করছে তখন বাঁচার সহজ ৩টি কৌশল শিখুন। 🏆 #LudoTips #Tutorial #GamingEducation',
    creatorId: 'creator-farzana-05',
    creatorName: 'ফারজানা আক্তার (Ludo Academy)',
    creatorCountry: 'BD',
    videoType: 'tutorial',
    categoryLabelBn: '📚 শিক্ষামূলক টিউটোরিয়াল',
    durationSeconds: 52,
    viewsCount: 22800,
    likesCount: 3400,
    commentsCount: 380,
    sharesCount: 310,
    earningsBDT: 2508.0,
    rpmRateBDT: 110.0,
    qualityBonusBDT: 180.0,
    diamondsReceived: 240,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 40,
    tags: ['টিউটোরিয়াল', 'টিপস', 'হোমকরিডোর', 'শিক্ষা', 'লুডুএকাডেমি'],
    creatorAvatar: {
      skinColor: '#fcd34d',
      hairStyle: 'hijab',
      hairColor: '#0f172a',
      eyes: 'sparkle',
      mouth: 'smile',
      clothing: 'punjabi',
      clothingColor: '#0d9488',
      accessory: 'glasses',
      bgGradient: 'from-teal-600 to-emerald-600',
    },
    gameSnippet: {
      playerColor: 'green',
      diceRoll: 6,
      tokensCaptured: 2,
      coinsWon: 22000,
    },
  },
  {
    id: 'vid-joy-adda-06',
    title: '🎤 ১০ জনের লাইভ আড্ডায় সুরে সুরে লালনগীতি ও মিষ্টি লুডু খেলা!',
    description: 'লাইভ আড্ডা রুমে সবাই মিলে বাউল গান গাইতে গাইতে একসাথে লুডুর চাল! প্রাণ জুড়ানো পরিবেশ। ☕🎶 #LiveAdda #BaulSong #JoyLudoFamily',
    creatorId: 'creator-nusrat-02',
    creatorName: 'নুসরাত জাহান (Voice Queen)',
    creatorCountry: 'BD',
    videoType: 'voice_adda_clip',
    categoryLabelBn: '🎙️ আড্ডা ও গান',
    durationSeconds: 54,
    viewsCount: 48900,
    likesCount: 7800,
    commentsCount: 1120,
    sharesCount: 790,
    earningsBDT: 4645.5,
    rpmRateBDT: 95.0,
    qualityBonusBDT: 350.0,
    diamondsReceived: 620,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 52,
    tags: ['আড্ডা', 'গান', 'লালনগীতি', 'ভয়েসরুম', 'বন্ধুত্ব', 'লাইভগান'],
    creatorAvatar: {
      skinColor: '#fed7aa',
      hairStyle: 'hijab',
      hairColor: '#0f172a',
      eyes: 'sparkle',
      mouth: 'laugh',
      clothing: 'punjabi',
      clothingColor: '#059669',
      accessory: 'headphone',
      bgGradient: 'from-teal-600 to-emerald-600',
    },
    gameSnippet: {
      playerColor: 'green',
      diceRoll: 5,
      tokensCaptured: 1,
      coinsWon: 15000,
    },
  },
  {
    id: 'vid-joy-epic-07',
    title: '🔥 অবিশ্বাস্য কামব্যাক! ১ গুটি বাকি রেখে ৪ প্রতিপক্ষকে উড়িয়ে ফাইনাল জয়!',
    description: 'যখন পরাজয় নিশ্চিত মনে হচ্ছিল, ঠিক তখনই ম্যাজিক ছক্কা মেরে ম্যাচ জয়! ৳১,০০০ ডাইমন্ড প্রাইজপুল চ্যাম্পিয়ন! 🏆 #EpicWin #LudoChampionship',
    creatorId: 'creator-rakib-04',
    creatorName: 'রাকিব হাসান (Epic Comeback)',
    creatorCountry: 'BD',
    videoType: 'epic_win',
    categoryLabelBn: '🏆 এপিক গেমপ্লে',
    durationSeconds: 41,
    viewsCount: 36700,
    likesCount: 5900,
    commentsCount: 670,
    sharesCount: 460,
    earningsBDT: 3119.5,
    rpmRateBDT: 85.0,
    qualityBonusBDT: 220.0,
    diamondsReceived: 380,
    isMonetized: true,
    isKidsSafe: true,
    status: 'published',
    createdAt: Date.now() - 3600000 * 64,
    tags: ['এপিকউইন', 'কামব্যাক', 'লুডুচ্যাম্পিয়ন', 'EpicWin', 'Championship'],
    creatorAvatar: {
      skinColor: '#fcd34d',
      hairStyle: 'short',
      hairColor: '#1e293b',
      eyes: 'cool',
      mouth: 'smile',
      clothing: 'jersey',
      clothingColor: '#dc2626',
      accessory: 'golden_chain',
      bgGradient: 'from-red-600 to-amber-600',
    },
    gameSnippet: {
      playerColor: 'red',
      diceRoll: 6,
      tokensCaptured: 4,
      coinsWon: 40000,
    },
  },
];

// Load video feed
export const loadVideoFeed = (): VideoContent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_VIDEOS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading video feed:', err);
  }
  saveVideoFeed(INITIAL_SEED_VIDEOS);
  return INITIAL_SEED_VIDEOS;
};

// Save video feed
export const saveVideoFeed = (videos: VideoContent[]): void => {
  try {
    localStorage.setItem(STORAGE_VIDEOS_KEY, JSON.stringify(videos));
  } catch (err) {
    console.error('Error saving video feed:', err);
  }
};

// Load Creator Monetization Profile
export const loadCreatorMonetizationProfile = (
  user: UserProfile,
  countryCode: string = 'BD'
): CreatorMonetizationProfile => {
  try {
    const key = STORAGE_MONETIZATION_PREFIX + (user?.id || 'guest');
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.balanceBDT === 'number') {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading creator profile:', err);
  }

  const isBD = (countryCode || 'BD').toUpperCase() === 'BD';

  const defaultProfile: CreatorMonetizationProfile = {
    userId: user?.id || 'guest',
    isEligible: user?.age ? user.age >= 18 : true,
    isMonetized: true, // Default active for verified adults in BD
    approvedAt: Date.now() - 86400000 * 5,
    countryCode: countryCode || 'BD',
    isCountrySupported: isBD,
    balanceBDT: 350.0, // Welcome creator bonus in Taka
    totalEarnedBDT: 850.0,
    pendingWithdrawalBDT: 0,
    totalViews: 4200,
    totalLikes: 680,
    totalDiamondsGifted: 75,
    totalVideosCount: 2,
    payoutMethod: 'bkash',
    payoutAccountNumber: user?.phone || '01700000000',
    payoutAccountName: user?.name || 'লুডু ক্রিয়েটর',
  };

  saveCreatorMonetizationProfile(user?.id || 'guest', defaultProfile);
  return defaultProfile;
};

// Save Creator Monetization Profile
export const saveCreatorMonetizationProfile = (
  userId: string,
  profile: CreatorMonetizationProfile
): void => {
  try {
    const key = STORAGE_MONETIZATION_PREFIX + (userId || 'guest');
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving creator profile:', err);
  }
};

// Load Withdrawal Transactions
export const loadWithdrawalTransactions = (): WithdrawalTransaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_WITHDRAWALS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading withdrawals:', err);
  }
  return [
    {
      id: 'tx-bd-501',
      userId: 'guest',
      amountBDT: 500,
      method: 'bkash',
      accountNumber: '01711223344',
      accountName: 'ক্রিয়েটর পেআউট',
      status: 'completed',
      requestedAt: Date.now() - 86400000 * 3,
      completedAt: Date.now() - 86400000 * 3 + 3600000 * 2,
      txId: 'BK79948291X',
    },
  ];
};

// Save Withdrawal Transactions
export const saveWithdrawalTransactions = (txs: WithdrawalTransaction[]): void => {
  try {
    localStorage.setItem(STORAGE_WITHDRAWALS_KEY, JSON.stringify(txs));
  } catch (err) {
    console.error('Error saving withdrawals:', err);
  }
};

// Request Payout / Withdrawal
export const requestCreatorWithdrawal = (
  userId: string,
  amountBDT: number,
  method: 'bkash' | 'nagad' | 'rocket' | 'bank',
  accountNumber: string,
  accountName?: string,
  bankDetails?: { bankName?: string; branchName?: string }
): { success: boolean; messageBn: string; tx?: WithdrawalTransaction } => {
  if (amountBDT < 100) {
    return {
      success: false,
      messageBn: 'সর্বনিম্ন উত্তোলনের পরিমাণ ৳১০০ (একশত টাকা)।',
    };
  }

  const profileKey = STORAGE_MONETIZATION_PREFIX + userId;
  const rawProfile = localStorage.getItem(profileKey);
  if (!rawProfile) {
    return { success: false, messageBn: 'ক্রিয়েটর প্রোফাইল পাওয়া যায়নি।' };
  }

  let profile: CreatorMonetizationProfile;
  try {
    profile = JSON.parse(rawProfile);
  } catch {
    return { success: false, messageBn: 'প্রোফাইল তথ্য পড়তে সমস্যা হয়েছে।' };
  }
  if (profile.balanceBDT < amountBDT) {
    return {
      success: false,
      messageBn: `অপর্যাপ্ত ব্যালেন্স! আপনার বর্তমান ব্যালেন্স ৳${profile.balanceBDT.toFixed(2)}`,
    };
  }

  // Country restriction check
  if (!isCountryMonetizationEligible(profile.countryCode)) {
    return {
      success: false,
      messageBn: 'দুঃখিত! এই মুহূর্তে শুধুমাত্র বাংলাদেশে বিকাশ, নগদ ও রকেটের মাধ্যমে টাকা উত্তোলন করা যাবে। অন্যান্য দেশে অনুমোদন পাওয়ার পর চালু হবে।',
    };
  }

  // Deduct balance and add to pending
  profile.balanceBDT -= amountBDT;
  profile.pendingWithdrawalBDT += amountBDT;
  saveCreatorMonetizationProfile(userId, profile);

  const tx: WithdrawalTransaction = {
    id: 'tx-bd-' + Math.floor(100000 + Math.random() * 900000),
    userId,
    amountBDT,
    method,
    accountNumber,
    accountName: accountName || profile.payoutAccountName || 'ক্রিয়েটর',
    status: 'completed', // Instant simulation payout in Joy Ludo sandbox
    requestedAt: Date.now(),
    completedAt: Date.now(),
    txId: `${method.toUpperCase()}${Math.floor(10000000 + Math.random() * 90000000)}`,
  };

  const existingTxs = loadWithdrawalTransactions();
  const updatedTxs = [tx, ...existingTxs];
  saveWithdrawalTransactions(updatedTxs);

  return {
    success: true,
    messageBn: `অভিনন্দন! আপনার ৳${amountBDT} টাকা উত্তোলন সফল হয়েছে এবং ${method.toUpperCase()} অ্যাকাউন্টে পাঠানো হয়েছে। (TxID: ${tx.txId})`,
    tx,
  };
};

// Send Diamond Tip / Gift to Video Creator
export const sendDiamondGiftToVideo = (
  videoId: string,
  diamondsCount: number,
  giverUser: UserProfile
): { success: boolean; earnedBDT: number; updatedVideo?: VideoContent } => {
  const feed = loadVideoFeed();
  const index = feed.findIndex((v) => v.id === videoId);
  if (index === -1) {
    return { success: false, earnedBDT: 0 };
  }

  const targetVideo = { ...feed[index] };
  const earnedBDT = diamondsCount * 1.0; // 1 Diamond = ৳1 BDT to creator

  targetVideo.diamondsReceived = (targetVideo.diamondsReceived || 0) + diamondsCount;
  targetVideo.earningsBDT = (targetVideo.earningsBDT || 0) + earnedBDT;
  feed[index] = targetVideo;
  saveVideoFeed(feed);

  // If creator has a profile, add to their balance
  try {
    const key = STORAGE_MONETIZATION_PREFIX + targetVideo.creatorId;
    const raw = localStorage.getItem(key);
    if (raw) {
      const creatorProf: CreatorMonetizationProfile = JSON.parse(raw);
      creatorProf.balanceBDT = (creatorProf.balanceBDT || 0) + earnedBDT;
      creatorProf.totalEarnedBDT = (creatorProf.totalEarnedBDT || 0) + earnedBDT;
      creatorProf.totalDiamondsGifted = (creatorProf.totalDiamondsGifted || 0) + diamondsCount;
      saveCreatorMonetizationProfile(targetVideo.creatorId, creatorProf);
    }
  } catch (err) {
    console.error('Error updating creator gift balance:', err);
  }

  return { success: true, earnedBDT, updatedVideo: targetVideo };
};

// Add Video View and Calculate Ad/Monetization Revenue based on category rates
export const registerVideoViewAndEarning = (
  videoId: string
): { updatedViews: number; addedBDT: number; video?: VideoContent } => {
  const feed = loadVideoFeed();
  const index = feed.findIndex((v) => v.id === videoId);
  if (index === -1) return { updatedViews: 0, addedBDT: 0 };

  const target = { ...feed[index] };
  target.viewsCount = (target.viewsCount || 0) + 1;

  // Category specific bonus rate (Educational = ৳0.12, Funny = ৳0.10, Creative = ৳0.09, etc.)
  const categoryMeta = CREATOR_MONETIZATION_CATEGORIES[target.videoType];
  const ratePerView = categoryMeta ? categoryMeta.viewBonusRateBDT : 0.08;
  const addedBDT = Number(ratePerView.toFixed(3));

  target.earningsBDT = Number(((target.earningsBDT || 0) + addedBDT).toFixed(2));
  target.rpmRateBDT = categoryMeta?.rpmRateBDT || 80.0;
  feed[index] = target;
  saveVideoFeed(feed);

  // If creator profile exists, credit the earnings
  try {
    const key = STORAGE_MONETIZATION_PREFIX + target.creatorId;
    const raw = localStorage.getItem(key);
    if (raw) {
      const profile: CreatorMonetizationProfile = JSON.parse(raw);
      profile.balanceBDT = Number(((profile.balanceBDT || 0) + addedBDT).toFixed(2));
      profile.totalEarnedBDT = Number(((profile.totalEarnedBDT || 0) + addedBDT).toFixed(2));
      profile.totalViews = (profile.totalViews || 0) + 1;

      if (target.videoType === 'funny_moment') {
        profile.funnyVideosEarnedBDT = Number(((profile.funnyVideosEarnedBDT || 0) + addedBDT).toFixed(2));
      } else if (target.videoType === 'educational_guide' || target.videoType === 'tutorial') {
        profile.educationalVideosEarnedBDT = Number(((profile.educationalVideosEarnedBDT || 0) + addedBDT).toFixed(2));
      } else if (target.videoType === 'creative_good_content') {
        profile.creativeVideosEarnedBDT = Number(((profile.creativeVideosEarnedBDT || 0) + addedBDT).toFixed(2));
      }

      saveCreatorMonetizationProfile(target.creatorId, profile);
    }
  } catch (err) {
    console.error('Error updating creator profile view earnings:', err);
  }

  return { updatedViews: target.viewsCount, addedBDT, video: target };
};

// Calculate Estimated Earnings for Creators
export const calculateEstimatedEarnings = (
  categoryType: VideoContent['videoType'],
  views: number,
  likes: number,
  diamondTips: number
): {
  viewEarningsBDT: number;
  qualityBonusBDT: number;
  tipsEarningsBDT: number;
  totalEstimatedBDT: number;
  rpmRate: number;
} => {
  const meta = CREATOR_MONETIZATION_CATEGORIES[categoryType] || CREATOR_MONETIZATION_CATEGORIES.funny_moment;
  const rpmRate = meta.rpmRateBDT;
  const viewEarningsBDT = Number(((views / 1000) * rpmRate).toFixed(2));

  // Quality engagement milestone cash bonus
  let qualityBonusBDT = 0;
  if (likes >= 1000) qualityBonusBDT += 250;
  else if (likes >= 500) qualityBonusBDT += 100;
  else if (likes >= 100) qualityBonusBDT += 25;

  // Diamond tips (1 Diamond = 1 BDT)
  const tipsEarningsBDT = diamondTips * 1.0;

  const totalEstimatedBDT = Number((viewEarningsBDT + qualityBonusBDT + tipsEarningsBDT).toFixed(2));

  return {
    viewEarningsBDT,
    qualityBonusBDT,
    tipsEarningsBDT,
    totalEstimatedBDT,
    rpmRate,
  };
};

// Claim special quality bonus for high engagement
export const claimCreatorQualityBonus = (
  userId: string,
  bonusAmountBDT: number,
  bonusReasonBn: string
): { success: boolean; newBalanceBDT: number; messageBn: string } => {
  const profileKey = STORAGE_MONETIZATION_PREFIX + userId;
  const raw = localStorage.getItem(profileKey);
  if (!raw) return { success: false, newBalanceBDT: 0, messageBn: 'প্রোফাইল পাওয়া যায়নি।' };

  try {
    const profile: CreatorMonetizationProfile = JSON.parse(raw);
    profile.balanceBDT = Number(((profile.balanceBDT || 0) + bonusAmountBDT).toFixed(2));
    profile.totalEarnedBDT = Number(((profile.totalEarnedBDT || 0) + bonusAmountBDT).toFixed(2));
    saveCreatorMonetizationProfile(userId, profile);

    return {
      success: true,
      newBalanceBDT: profile.balanceBDT,
      messageBn: `অভিনন্দন! "${bonusReasonBn}" হিসেবে ৳${bonusAmountBDT} বোনাস আপনার অ্যাকাউন্টে যোগ হয়েছে।`,
    };
  } catch (err) {
    return { success: false, newBalanceBDT: 0, messageBn: 'বোনাস ক্লেইম করতে সমস্যা হয়েছে।' };
  }
};
