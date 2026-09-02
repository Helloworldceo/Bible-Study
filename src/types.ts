export type Language = 'en' | 'am' | 'fr';

export interface BibleVerse {
  id: string; // e.g. "GEN.1.1"
  bookId: string; // "GEN"
  bookNameEn: string;
  bookNameAm: string;
  bookNameFr?: string;
  chapter: number;
  verse: number;
  textEn: string;
  textAm: string;
  textFr?: string;
  notes?: string;
  crossReferences?: string[];
}

export interface BibleBook {
  id: string; // e.g. "GEN", "PSA", "MAT"
  nameEn: string;
  nameAm: string;
  nameFr?: string;
  testament: 'OT' | 'NT';
  category: 'law' | 'history' | 'poetry' | 'major_prophets' | 'minor_prophets' | 'gospels' | 'acts' | 'epistles' | 'revelation';
  chaptersCount: number;
  descriptionEn: string;
  descriptionAm: string;
  descriptionFr?: string;
}

export interface ChapterContent {
  bookId: string;
  bookNameEn: string;
  bookNameAm: string;
  bookNameFr?: string;
  chapter: number;
  totalChapters: number;
  verses: BibleVerse[];
}

export interface HighlightItem {
  id: string;
  verseId: string;
  bookId: string;
  chapter: number;
  verse: number;
  color: 'amber' | 'emerald' | 'sky' | 'rose' | 'purple';
  createdAt: string;
  updatedAt?: string;
}

export interface BookmarkItem {
  id: string;
  verseId: string;
  bookId: string;
  bookNameEn: string;
  bookNameAm: string;
  chapter: number;
  verse: number;
  textEn: string;
  textAm: string;
  label?: string;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  verseId?: string; // Optional if attached to verse
  bookId?: string;
  chapter?: number;
  verse?: number;
  title: string;
  content: string;
  category: 'Reflection' | 'Study Note' | 'Sermon' | 'Prayer' | 'Question';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrayerItem {
  id: string;
  title: string;
  description: string;
  category: 'Personal' | 'Family' | 'Church' | 'Guidance' | 'Healing' | 'Thanksgiving';
  isAnswered: boolean;
  answeredDate?: string;
  testimony?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyDevotional {
  id: string;
  dayOfYear: number;
  dateString: string;
  titleEn: string;
  titleAm: string;
  themeEn: string;
  themeAm: string;
  scriptureRefEn: string;
  scriptureRefAm: string;
  scriptureBookId: string;
  scriptureChapter: number;
  scriptureEn: string;
  scriptureAm: string;
  contentEn: string;
  contentAm: string;
  reflectionPromptEn: string;
  reflectionPromptAm: string;
  prayerEn: string;
  prayerAm: string;
}

export type DevotionalItem = DailyDevotional;

export interface PlanDay {
  day: number;
  titleEn: string;
  titleAm: string;
  passages: {
    bookId: string;
    bookNameEn: string;
    bookNameAm: string;
    chapter: number;
    startVerse?: number;
    endVerse?: number;
  }[];
  devotionalSummaryEn?: string;
  devotionalSummaryAm?: string;
  prayerFocusEn?: string;
  prayerFocusAm?: string;
}

export interface StudyPlan {
  id: string;
  slug: string;
  titleEn: string;
  titleAm: string;
  descriptionEn: string;
  descriptionAm: string;
  durationDays: number;
  category: 'comprehensive' | 'devotional' | 'topical' | 'gospels' | 'wisdom';
  iconName: string;
  days: PlanDay[];
  isCustom?: boolean;
}

export interface UserPlanProgress {
  planId: string;
  startDate: string;
  completedDays: number[]; // e.g. [1, 2, 3]
  completedChapters: string[]; // e.g. ["GEN.1", "GEN.2"]
  lastReadDay: number;
  isCompleted: boolean;
  notes?: Record<number, string>;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  totalChaptersRead: number;
  totalNotesCount: number;
  totalPrayersCount: number;
  answeredPrayersCount: number;
  completedPlansCount: number;
  readingDates: string[]; // ISO dates for heatmap
}

export interface DiscordConfig {
  webhookUrl: string;
  channelName: string;
  serverName: string;
  isEnabled: boolean;
  language: 'en' | 'am' | 'both';
  includeDevotionalSnippet: boolean;
}

export interface DiscordDeliveryLogEntry {
  sentAt: string;
  verseRef: string;
  triggerSource: 'cron' | 'manual';
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface DiscordLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed';
  verseRef: string;
  message: string;
  channel?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  preferredLanguage: Language;
  createdAt: string;
  lastSyncedAt?: string;
  isGuest?: boolean;
  isAdmin?: boolean;
}

export interface SyncPayload {
  highlights: HighlightItem[];
  bookmarks: BookmarkItem[];
  notes: NoteItem[];
  prayers: PrayerItem[];
  plansProgress: Record<string, UserPlanProgress>;
  customPlans: StudyPlan[];
  stats: UserStats;
  lastReadPosition?: { bookId: string; chapter: number };
}
