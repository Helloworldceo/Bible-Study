import { BookmarkItem, HighlightItem, NoteItem, PrayerItem, QuizSetProgress, StudyPlan, SyncPayload, UserPlanProgress, UserStats } from '../types';

const STORAGE_KEYS = {
  HIGHLIGHTS: 'berean_highlights_v1',
  BOOKMARKS: 'berean_bookmarks_v1',
  NOTES: 'berean_notes_v1',
  PRAYERS: 'berean_prayers_v1',
  PLANS_PROGRESS: 'berean_plans_progress_v1',
  CUSTOM_PLANS: 'berean_custom_plans_v1',
  STATS: 'berean_stats_v1',
  LAST_READ_POSITION: 'berean_last_read_position_v1',
  QUIZ_PROGRESS: 'berean_quiz_progress_v1',
  AUTH_USER: 'berean_auth_user_v1',
  AUTH_TOKEN: 'berean_auth_token_v1',
  APP_LANG: 'berean_app_lang_v1',
};

const BIBLE_DB_NAME = 'berean_bible_cache_v1';
const BIBLE_STORE_NAME = 'books';

function openBibleDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(BIBLE_DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(BIBLE_STORE_NAME)) {
        request.result.createObjectStore(BIBLE_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Genuine empty state for a new user -- this used to ship fabricated
// numbers (a 3-day streak, 14 chapters read, etc.) that had nothing to do
// with anything the person had actually done, the same class of bug as the
// fake bookmark/notes/prayers/plan-progress defaults below.
const DEFAULT_STATS: UserStats = {
  streakDays: 0,
  lastActiveDate: '',
  totalChaptersRead: 0,
  totalNotesCount: 0,
  totalPrayersCount: 0,
  answeredPrayersCount: 0,
  completedPlansCount: 0,
  readingDates: [],
  quizXP: 0,
};

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
      return data ? JSON.parse(data) : [];
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
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
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
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
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
      return data ? JSON.parse(data) : {};
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

  // Shared streak logic -- bumps the daily streak once per calendar day
  // regardless of *which* activity triggered it (reading a chapter or
  // completing a quiz), without touching chapter-specific counters.
  static recordDailyActivity(): void {
    const stats = this.getStats();
    const today = new Date().toISOString().split('T')[0];

    if (!stats.readingDates.includes(today)) {
      stats.readingDates.push(today);
      stats.streakDays += 1;
    }
    stats.lastActiveDate = today;
    this.saveStats(stats);
  }

  static recordReadingActivity(chapterKey: string): void {
    this.recordDailyActivity();
    const stats = this.getStats();
    stats.totalChaptersRead += 1;
    this.saveStats(stats);
  }

  static getQuizProgress(): Record<string, QuizSetProgress> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  // Also counts as the day's activity for the reading streak -- a quiz
  // session is a real study session, not just passive page-viewing.
  static recordQuizResult(setId: string, correctCount: number, totalQuestions: number): void {
    const progress = this.getQuizProgress();
    const existing = progress[setId];
    progress[setId] = {
      setId,
      bestScore: Math.max(existing?.bestScore ?? 0, correctCount),
      timesCompleted: (existing?.timesCompleted ?? 0) + 1,
      lastCompletedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));

    this.recordDailyActivity();
    this.incrementStat('quizXP', correctCount * 10);
  }

  static incrementStat(key: keyof UserStats, amount = 1): void {
    const stats = this.getStats();
    if (typeof stats[key] === 'number') {
      (stats[key] as number) += amount;
      this.saveStats(stats);
    }
  }

  // "Continue reading where you left off" -- without this, the reader
  // always opens back at Genesis 1 on every reload, and (via
  // export/importAllData below) on every other device too.
  static getLastReadPosition(): { bookId: string; chapter: number } | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READ_POSITION);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static saveLastReadPosition(bookId: string, chapter: number): void {
    localStorage.setItem(STORAGE_KEYS.LAST_READ_POSITION, JSON.stringify({ bookId, chapter }));
  }


  // --- Offline Bible text cache (IndexedDB) ---
  // Real scripture is fetched from /bible/<BookId>.json and runs up to
  // ~800KB for a single book -- too large to track in localStorage's
  // ~5-10MB origin quota once more than a couple of books are read.
  // IndexedDB has a much higher ceiling and is the right tool for this.
  // fetchChapterContent() (bibleData.ts) writes here automatically as
  // chapters are read; the reader's "Save Offline" button just confirms it.
  static async getOfflineBook(bookId: string): Promise<unknown | null> {
    try {
      const db = await openBibleDb();
      return await new Promise((resolve, reject) => {
        const tx = db.transaction(BIBLE_STORE_NAME, 'readonly');
        const req = tx.objectStore(BIBLE_STORE_NAME).get(bookId);
        req.onsuccess = () => resolve(req.result ?? null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null; // IndexedDB unavailable (private browsing, old browser, etc.)
    }
  }

  static async saveOfflineBook(bookId: string, data: unknown): Promise<void> {
    try {
      const db = await openBibleDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(BIBLE_STORE_NAME, 'readwrite');
        tx.objectStore(BIBLE_STORE_NAME).put(data, bookId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // best-effort; a failed offline save shouldn't break reading
    }
  }

  static async isBookOfflineSaved(bookId: string): Promise<boolean> {
    return (await this.getOfflineBook(bookId)) !== null;
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
      lastReadPosition: this.getLastReadPosition() ?? undefined,
      quizProgress: this.getQuizProgress(),
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
    if (payload.lastReadPosition) localStorage.setItem(STORAGE_KEYS.LAST_READ_POSITION, JSON.stringify(payload.lastReadPosition));
    if (payload.quizProgress) localStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(payload.quizProgress));
  }
}
