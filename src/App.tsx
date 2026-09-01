import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BibleReader } from './components/BibleReader';
import { DevotionalView } from './components/DevotionalView';
import { StudyPlansView } from './components/StudyPlansView';
import { ReflectionsPrayerJournal } from './components/ReflectionsPrayerJournal';
import { DiscordBotHub } from './components/DiscordBotHub';
import { AIStudyCompanion } from './components/AIStudyCompanion';
import { VerseActionModal } from './components/VerseActionModal';
import { AuthModal } from './components/AuthModal';
import { AudioPlayerBar } from './components/AudioPlayerBar';

import { 
  BibleVerse, BookmarkItem, DiscordConfig, HighlightItem, 
  Language, NoteItem, PrayerItem, StudyPlan, UserPlanProgress, 
  UserProfile, UserStats 
} from './types';
import { StorageManager } from './utils/offlineStorage';
import { useTranslation } from './utils/translations';

export const App: React.FC = () => {
  // Navigation & Language
  const [currentTab, setCurrentTab] = useState<'bible' | 'devotionals' | 'plans' | 'journal' | 'discord' | 'ai'>('bible');
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('berean_app_lang_v1');
    return (saved === 'am' ? 'am' : 'en') as Language;
  });

  // Bible Reader Position
  const [selectedBookId, setSelectedBookId] = useState<string>('GEN');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [activeVerseForModal, setActiveVerseForModal] = useState<BibleVerse | null>(null);

  // App Data State (Synced with localStorage and Cloud API)
  const [highlights, setHighlights] = useState<HighlightItem[]>(() => StorageManager.getHighlights());
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => StorageManager.getBookmarks());
  const [notes, setNotes] = useState<NoteItem[]>(() => StorageManager.getNotes());
  const [prayers, setPrayers] = useState<PrayerItem[]>(() => StorageManager.getPrayers());
  const [plansProgress, setPlansProgress] = useState<Record<string, UserPlanProgress>>(() => StorageManager.getPlansProgress());
  const [customPlans, setCustomPlans] = useState<StudyPlan[]>(() => StorageManager.getCustomPlans());
  const [stats, setStats] = useState<UserStats>(() => StorageManager.getStats());

  // Online & Sync State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // User Auth
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Persist language preference
  const handleSetLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('berean_app_lang_v1', newLang);
  };

  // Monitor Network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check stored auth session
  useEffect(() => {
    const token = localStorage.getItem('berean_auth_token_v1');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setLastSyncedAt(data.user.lastSyncedAt || new Date().toISOString());
          }
        })
        .catch(() => {
          // Token expired or server restarted
        });
    }
  }, []);

  // Cloud Synchronization Handler
  const handleCloudSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const payload = StorageManager.exportAllData();
      const token = localStorage.getItem('berean_auth_token_v1');
      
      const res = await fetch('/api/sync/push', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ payload })
      });
      const data = await res.json();
      if (data.syncedAt) {
        setLastSyncedAt(data.syncedAt);
      }
    } catch (err) {
      console.warn('Sync currently working offline. Data safely stored locally.');
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Quick helper to jump from Devotionals or Study Plans to the exact chapter in Bible Reader
  const handleOpenPassageInBible = (bookId: string, chapter: number) => {
    setSelectedBookId(bookId);
    setSelectedChapter(chapter);
    setCurrentTab('bible');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    StorageManager.recordReadingActivity(`${bookId}.${chapter}`);
    setStats(StorageManager.getStats());
  };

  // Highlights handlers
  const handleSetHighlight = (verse: BibleVerse, color: 'amber' | 'emerald' | 'sky' | 'rose' | 'purple') => {
    const item: HighlightItem = {
      id: `hl-${verse.id}`,
      verseId: verse.id,
      bookId: verse.bookId,
      chapter: verse.chapter,
      verse: verse.verse,
      color,
      createdAt: new Date().toISOString()
    };
    const updated = StorageManager.saveHighlight(item);
    setHighlights([...updated]);
  };

  const handleRemoveHighlight = (verseId: string) => {
    const updated = StorageManager.removeHighlight(verseId);
    setHighlights([...updated]);
  };

  // Bookmarks handler
  const handleToggleBookmark = (verse: BibleVerse) => {
    const item: BookmarkItem = {
      id: `bm-${verse.id}`,
      verseId: verse.id,
      bookId: verse.bookId,
      bookNameEn: verse.bookNameEn,
      bookNameAm: verse.bookNameAm,
      chapter: verse.chapter,
      verse: verse.verse,
      textEn: verse.textEn,
      textAm: verse.textAm,
      createdAt: new Date().toISOString()
    };
    const { list } = StorageManager.toggleBookmark(item);
    setBookmarks([...list]);
  };

  // Notes / Reflections handlers
  const handleSaveNote = (note: NoteItem) => {
    const updated = StorageManager.saveNote(note);
    setNotes([...updated]);
    setStats(StorageManager.getStats());
    handleCloudSync();
  };

  const handleDeleteNote = (id: string) => {
    const updated = StorageManager.deleteNote(id);
    setNotes([...updated]);
    handleCloudSync();
  };

  // Quick save from Verse Modal
  const handleSaveVerseNote = (verse: BibleVerse, title: string, content: string, category: any, tags: string[]) => {
    const newNote: NoteItem = {
      id: `note-verse-${verse.id}-${Date.now()}`,
      verseId: verse.id,
      bookId: verse.bookId,
      chapter: verse.chapter,
      verse: verse.verse,
      title,
      content,
      category,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    handleSaveNote(newNote);
  };

  // Prayers handlers
  const handleSavePrayer = (prayer: PrayerItem) => {
    const updated = StorageManager.savePrayer(prayer);
    setPrayers([...updated]);
    setStats(StorageManager.getStats());
    handleCloudSync();
  };

  const handleDeletePrayer = (id: string) => {
    const updated = StorageManager.deletePrayer(id);
    setPrayers([...updated]);
    handleCloudSync();
  };

  // Study Plans progress handler
  const handleUpdatePlanProgress = (progress: UserPlanProgress) => {
    const all = StorageManager.savePlanProgress(progress);
    setPlansProgress({ ...all });
    setStats(StorageManager.getStats());
    handleCloudSync();
  };

  const handleSaveCustomPlan = (plan: StudyPlan) => {
    const updated = StorageManager.saveCustomPlan(plan);
    setCustomPlans([...updated]);
    handleCloudSync();
  };

  // Discord Dispatchers
  const handleSendDiscordWebhook = async (cfg: DiscordConfig): Promise<{ success: boolean; message: string; verse?: any }> => {
    const res = await fetch('/api/discord/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: cfg.webhookUrl,
        language: cfg.language,
        verseCategory: cfg.verseCategory,
        customMessage: cfg.includeDevotionalSnippet ? undefined : 'Sent via Berean Study Bible'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch to Discord');
    }
    return data;
  };

  const handleSendVerseToDiscord = async (verse: BibleVerse): Promise<{ success: boolean; message: string }> => {
    const cfg = StorageManager.getDiscordConfig();
    const webhookUrl = cfg.webhookUrl;
    if (!webhookUrl) {
      throw new Error('Please configure a Discord Webhook URL in the Discord Bot Hub tab first.');
    }

    const res = await fetch('/api/discord/test-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webhookUrl: webhookUrl,
        language: cfg.language || 'both',
        verseRef: `${verse.bookNameEn} ${verse.chapter}:${verse.verse}`,
        customMessage: `Scripture Reflection from ${verse.bookNameEn} (${verse.bookNameAm})`
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send to Discord');
    return data;
  };

  // Auth actions
  const handleLogin = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };

    localStorage.setItem('berean_auth_token_v1', data.token);
    setUser(data.user);
    if (data.cloudData) {
      StorageManager.importAllData(data.cloudData);
      setHighlights(StorageManager.getHighlights());
      setBookmarks(StorageManager.getBookmarks());
      setNotes(StorageManager.getNotes());
      setPrayers(StorageManager.getPrayers());
      setPlansProgress(StorageManager.getPlansProgress());
      setCustomPlans(StorageManager.getCustomPlans());
    }
    return { success: true };
  };

  const handleRegister = async (email: string, pass: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass, name, preferredLanguage: lang })
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error };

    localStorage.setItem('berean_auth_token_v1', data.token);
    setUser(data.user);
    handleCloudSync();
    return { success: true };
  };

  const handleLogout = () => {
    localStorage.removeItem('berean_auth_token_v1');
    setUser(null);
  };

  const bookmarkedIds = bookmarks.map(b => b.verseId);
  const notesIds = notes.map(n => n.verseId || '').filter(Boolean);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={handleSetLang}
        isOnline={isOnline}
        isSyncing={isSyncing}
        onSync={handleCloudSync}
        streakDays={stats.streakDays}
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Router */}
      <div className="flex-1">
        {currentTab === 'bible' && (
          <BibleReader
            lang={lang}
            selectedBookId={selectedBookId}
            setSelectedBookId={setSelectedBookId}
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            onSelectVerse={(v) => setActiveVerseForModal(v)}
            highlights={highlights}
            bookmarkedVerseIds={bookmarkedIds}
            notesVerseIds={notesIds}
          />
        )}

        {currentTab === 'devotionals' && (
          <DevotionalView
            lang={lang}
            onOpenPassageInBible={handleOpenPassageInBible}
            onSendDiscordVerse={async (ref) => {
              const cfg = StorageManager.getDiscordConfig();
              if (!cfg.webhookUrl) {
                throw new Error('Please configure a Discord Webhook URL in the Discord Bot Hub tab first.');
              }
              const res = await fetch('/api/discord/test-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  webhookUrl: cfg.webhookUrl,
                  language: cfg.language || 'both',
                  verseRef: ref
                })
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || 'Failed');
              return data;
            }}
            onSaveReflectionNote={(title, content, tags) => {
              const newNote: NoteItem = {
                id: `note-devotional-${Date.now()}`,
                title,
                content,
                category: 'Reflection',
                tags,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              handleSaveNote(newNote);
            }}
          />
        )}

        {currentTab === 'plans' && (
          <StudyPlansView
            lang={lang}
            onOpenPassageInBible={handleOpenPassageInBible}
            plansProgress={plansProgress}
            onUpdatePlanProgress={handleUpdatePlanProgress}
            customPlans={customPlans}
            onSaveCustomPlan={handleSaveCustomPlan}
          />
        )}

        {currentTab === 'journal' && (
          <ReflectionsPrayerJournal
            lang={lang}
            notes={notes}
            prayers={prayers}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            onSavePrayer={handleSavePrayer}
            onDeletePrayer={handleDeletePrayer}
            onOpenPassageInBible={handleOpenPassageInBible}
            isSyncing={isSyncing}
            onManualSync={handleCloudSync}
            lastSyncedAt={lastSyncedAt}
            user={user}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {currentTab === 'discord' && (
          <DiscordBotHub
            lang={lang}
            onSendWebhookTest={handleSendDiscordWebhook}
          />
        )}

        {currentTab === 'ai' && (
          <AIStudyCompanion
            lang={lang}
            onSaveToJournal={(title, content) => {
              const newNote: NoteItem = {
                id: `note-ai-${Date.now()}`,
                title,
                content,
                category: 'Study Note',
                tags: ['AI Study', 'Theology', 'Gemini'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              handleSaveNote(newNote);
              setCurrentTab('journal');
            }}
            onOpenPassageInBible={handleOpenPassageInBible}
          />
        )}
      </div>

      {/* Verse Action & AI Analysis Modal */}
      <VerseActionModal
        verse={activeVerseForModal}
        onClose={() => setActiveVerseForModal(null)}
        lang={lang}
        onSaveNote={handleSaveVerseNote}
        onToggleBookmark={handleToggleBookmark}
        isBookmarked={activeVerseForModal ? bookmarkedIds.includes(activeVerseForModal.id) : false}
        currentHighlight={activeVerseForModal ? highlights.find(h => h.verseId === activeVerseForModal.id) : undefined}
        onSetHighlight={handleSetHighlight}
        onRemoveHighlight={handleRemoveHighlight}
        onSendDiscord={handleSendVerseToDiscord}
      />

      {/* User Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        lang={lang}
        user={user}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      {/* Floating Audio Player & Narrator Controller */}
      <AudioPlayerBar appLang={lang} />

      {/* Global Minimal Footer */}
      <footer className="py-6 px-4 border-t border-stone-200 dark:border-stone-800 bg-white/60 dark:bg-stone-900/60 backdrop-blur-sm text-center text-xs text-stone-500 space-y-1">
        <p className="font-medium text-stone-700 dark:text-stone-300">
          Berean Bilingual Study Bible & Discord Guide • <span className="font-ethiopic">የቤሪያ መጽሐፍ ቅዱስ</span>
        </p>
        <p className="text-[11px] text-stone-400">
          King James Version / World English Bible (English) & መጽሐፍ ቅዱስ (አማርኛ) • Offline-First & Cloud-Synced
        </p>
      </footer>

    </div>
  );
};
export default App;
