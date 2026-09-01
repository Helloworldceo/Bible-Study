import { BookmarkItem, DiscordConfig, HighlightItem, NoteItem, PrayerItem, StudyPlan, SyncPayload, UserPlanProgress, UserStats } from '../types';

const STORAGE_KEYS = {
  HIGHLIGHTS: 'berean_highlights_v1',
  BOOKMARKS: 'berean_bookmarks_v1',
  NOTES: 'berean_notes_v1',
  PRAYERS: 'berean_prayers_v1',
  PLANS_PROGRESS: 'berean_plans_progress_v1',
  CUSTOM_PLANS: 'berean_custom_plans_v1',
  STATS: 'berean_stats_v1',
  DISCORD_CONFIG: 'berean_discord_config_v1',
  AUTH_USER: 'berean_auth_user_v1',
  AUTH_TOKEN: 'berean_auth_token_v1',
  CACHED_CHAPTERS: 'berean_cached_chapters_v1',
  APP_LANG: 'berean_app_lang_v1',
};

const DEFAULT_DISCORD_CONFIG: DiscordConfig = {
  webhookUrl: '',
  channelName: 'daily-scripture',
  serverName: 'My Faith Community',
  scheduledTime: '08:00',
  isEnabled: false,
  language: 'both',
  verseCategory: 'daily',
  includeDevotionalSnippet: true,
};

const DEFAULT_STATS: UserStats = {
  streakDays: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  totalChaptersRead: 14,
  totalNotesCount: 4,
  totalPrayersCount: 6,
  answeredPrayersCount: 2,
  completedPlansCount: 1,
  readingDates: [
    new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    new Date(Date.now() - 86400000).toISOString().split('T')[0],
    new Date().toISOString().split('T')[0]
  ]
};

// Initial starter seed notes & prayers for immediate delight
const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    verseId: 'PSA.23.1',
    bookId: 'PSA',
    chapter: 23,
    verse: 1,
    title: 'The Shepherd’s Provision & Rest',
    content: 'David understood that God does not just give things; God Himself is our Shepherd and ultimate satisfaction. In Amharic: "እግዚአብሔር እረኛዬ ነው፥ የሚያሳጣኝም የለም።" Resting in this truth today.',
    category: 'Reflection',
    tags: ['Peace', 'Trust', 'Shepherd', 'Amharic'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'note-2',
    verseId: 'JHN.1.1',
    bookId: 'JHN',
    chapter: 1,
    verse: 1,
    title: 'Christ the Pre-Existent Logos (ቃል)',
    content: 'John connects Genesis 1 with Christ’s eternal divinity. "In the beginning was the Word, and the Word was with God, and the Word was God." In Ge\'ez / Amharic theological tradition, "ቃል" (Qal) reveals God\'s active self-disclosure in flesh.',
    category: 'Study Note',
    tags: ['Theology', 'Divinity of Jesus', 'Gospel of John'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const INITIAL_PRAYERS: PrayerItem[] = [
  {
    id: 'pray-1',
    title: 'Daily Spiritual Wisdom & Guidance in Ministry',
    description: 'Praying for open doors to share the Gospel in love, and for divine wisdom in balancing family, work, and Bible study.',
    category: 'Guidance',
    isAnswered: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'pray-2',
    title: 'Healing for Aunt Martha & Family Peace',
    description: 'Prayed for recovery after health complications and peace in our home.',
    category: 'Healing',
    isAnswered: true,
    answeredDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    testimony: 'Doctor confirmed full recovery! Praise God for His miraculous grace and comforting presence.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

export class StorageManager {
  static getHighlights(): HighlightItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HIGHLIGHTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveHighlight(item: HighlightItem): HighlightItem[] {
    const list = this.getHighlights();
    const filtered = list.filter(h => h.verseId !== item.verseId);
    filtered.push(item);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(filtered));
    return filtered;
  }

  static removeHighlight(verseId: string): HighlightItem[] {
    const list = this.getHighlights().filter(h => h.verseId !== verseId);
    localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(list));
    return list;
  }

  static getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [
        {
          id: 'bm-1',
          verseId: 'ROM.8.28',
          bookId: 'ROM',
          bookNameEn: 'Romans',
          bookNameAm: 'ወደ ሮሜ ሰዎች',
          chapter: 8,
          verse: 28,
          textEn: 'And we know that all things work together for good to those who love God...',
          textAm: 'እግዚአብሔርንም ለሚወዱት እንደ አሳቡም ለተጠሩት ነገር ሁሉ ለበጎ እንዲደረግ እናውቃለን።',
          createdAt: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  }

  static toggleBookmark(item: BookmarkItem): { list: BookmarkItem[]; isBookmarked: boolean } {
    const list = this.getBookmarks();
    const index = list.findIndex(b => b.verseId === item.verseId);
    let isBookmarked = false;
    if (index >= 0) {
      list.splice(index, 1);
      isBookmarked = false;
    } else {
      list.unshift(item);
      isBookmarked = true;
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(list));
    return { list, isBookmarked };
  }

  static getNotes(): NoteItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTES);
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  }

  static saveNote(note: NoteItem): NoteItem[] {
    const list = this.getNotes();
    const index = list.findIndex(n => n.id === note.id);
    if (index >= 0) {
      list[index] = note;
    } else {
      list.unshift(note);
    }
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
    this.incrementStat('totalNotesCount', 1);
    return list;
  }

  static deleteNote(id: string): NoteItem[] {
    const list = this.getNotes().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(list));
    return list;
  }

  static getPrayers(): PrayerItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRAYERS);
      return data ? JSON.parse(data) : INITIAL_PRAYERS;
    } catch {
      return INITIAL_PRAYERS;
    }
  }

  static savePrayer(prayer: PrayerItem): PrayerItem[] {
    const list = this.getPrayers();
    const index = list.findIndex(p => p.id === prayer.id);
    if (index >= 0) {
      list[index] = prayer;
    } else {
      list.unshift(prayer);
    }
    localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(list));
    return list;
  }

  static deletePrayer(id: string): PrayerItem[] {
    const list = this.getPrayers().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(list));
    return list;
  }

  static getPlansProgress(): Record<string, UserPlanProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLANS_PROGRESS);
      return data ? JSON.parse(data) : {
        'plan-bible-year': {
          planId: 'plan-bible-year',
          startDate: new Date().toISOString(),
          completedDays: [1, 2],
          completedChapters: ['GEN.1', 'GEN.2', 'PSA.1', 'MAT.1'],
          lastReadDay: 2,
          isCompleted: false
        }
      };
    } catch {
      return {};
    }
  }

  static savePlanProgress(progress: UserPlanProgress): Record<string, UserPlanProgress> {
    const all = this.getPlansProgress();
    all[progress.planId] = progress;
    localStorage.setItem(STORAGE_KEYS.PLANS_PROGRESS, JSON.stringify(all));
    return all;
  }

  static getCustomPlans(): StudyPlan[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLANS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveCustomPlan(plan: StudyPlan): StudyPlan[] {
    const list = this.getCustomPlans();
    list.unshift(plan);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(list));
    return list;
  }

  static getStats(): UserStats {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data ? JSON.parse(data) : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  }

  static saveStats(stats: UserStats): void {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  static recordReadingActivity(chapterKey: string): void {
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];
    
    if (!stats.readingDates.includes(today)) {
      stats.readingDates.push(today);
      stats.streakDays += 1;
    }
    stats.lastActiveDate = today;
    stats.totalChaptersRead += 1;
    this.saveStats(stats);
  }

  static incrementStat(key: keyof UserStats, amount = 1): void {
    const stats = this.getStats();
    if (typeof stats[key] === 'number') {
      (stats[key] as number) += amount;
      this.saveStats(stats);
    }
  }

  static getDiscordConfig(): DiscordConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISCORD_CONFIG);
      return data ? JSON.parse(data) : DEFAULT_DISCORD_CONFIG;
    } catch {
      return DEFAULT_DISCORD_CONFIG;
    }
  }

  static saveDiscordConfig(config: DiscordConfig): void {
    localStorage.setItem(STORAGE_KEYS.DISCORD_CONFIG, JSON.stringify(config));
  }

  static getCachedChapters(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CACHED_CHAPTERS);
      return data ? JSON.parse(data) : ['GEN.1', 'PSA.23', 'MAT.5', 'JHN.1', 'ROM.8'];
    } catch {
      return [];
    }
  }

  static saveCachedChapter(chapterKey: string): string[] {
    const list = this.getCachedChapters();
    if (!list.includes(chapterKey)) {
      list.push(chapterKey);
      localStorage.setItem(STORAGE_KEYS.CACHED_CHAPTERS, JSON.stringify(list));
    }
    return list;
  }

  static isChapterCached(chapterKey: string): boolean {
    return this.getCachedChapters().includes(chapterKey);
  }

  static exportAllData(): SyncPayload {
    return {
      highlights: this.getHighlights(),
      bookmarks: this.getBookmarks(),
      notes: this.getNotes(),
      prayers: this.getPrayers(),
      plansProgress: this.getPlansProgress(),
      customPlans: this.getCustomPlans(),
      stats: this.getStats(),
      discordConfig: this.getDiscordConfig()
    };
  }

  static importAllData(payload: Partial<SyncPayload>): void {
    if (payload.highlights) localStorage.setItem(STORAGE_KEYS.HIGHLIGHTS, JSON.stringify(payload.highlights));
    if (payload.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(payload.bookmarks));
    if (payload.notes) localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(payload.notes));
    if (payload.prayers) localStorage.setItem(STORAGE_KEYS.PRAYERS, JSON.stringify(payload.prayers));
    if (payload.plansProgress) localStorage.setItem(STORAGE_KEYS.PLANS_PROGRESS, JSON.stringify(payload.plansProgress));
    if (payload.customPlans) localStorage.setItem(STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(payload.customPlans));
    if (payload.stats) localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(payload.stats));
    if (payload.discordConfig) localStorage.setItem(STORAGE_KEYS.DISCORD_CONFIG, JSON.stringify(payload.discordConfig));
  }
}
