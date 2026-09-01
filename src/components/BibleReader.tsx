import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Search, ChevronLeft, ChevronRight, Bookmark, 
  Volume2, VolumeX, Download, Check, Settings, Sparkles, 
  Columns2, Rows, Maximize2, Minimize2, BookmarkCheck, FileText, ArrowRight,
  Pause, Globe, Music, Eye
} from 'lucide-react';
import { BibleBook, BibleVerse, ChapterContent, HighlightItem, Language } from '../types';
import { BIBLE_BOOKS, fetchChapterContent, ensureBookOffline } from '../data/bibleData';
import { useTranslation } from '../utils/translations';
import { StorageManager } from '../utils/offlineStorage';
import { audioReader, AudioPlaybackState, AudioLangMode } from '../utils/audioReaderService';

interface BibleReaderProps {
  lang: Language;
  selectedBookId: string;
  setSelectedBookId: (id: string) => void;
  selectedChapter: number;
  setSelectedChapter: (chapter: number) => void;
  onSelectVerse: (verse: BibleVerse) => void;
  highlights: HighlightItem[];
  bookmarkedVerseIds: string[];
  notesVerseIds: string[];
}

export const BibleReader: React.FC<BibleReaderProps> = ({
  lang,
  selectedBookId,
  setSelectedBookId,
  selectedChapter,
  setSelectedChapter,
  onSelectVerse,
  highlights,
  bookmarkedVerseIds,
  notesVerseIds,
}) => {
  const t = useTranslation(lang);

  // Reader Settings
  const [viewMode, setViewMode] = useState<'parallel' | 'en' | 'fr' | 'am'>('parallel');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [readingTheme, setReadingTheme] = useState<'parchment' | 'sepia' | 'dark'>('parchment');
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Book picker wizard: books -> chapters (for pickerBookId) -> verses (for
  // pickerChapter, optional). Null pickerBookId means "showing the books list".
  const [pickerBookId, setPickerBookId] = useState<string | null>(null);
  const [pickerChapter, setPickerChapter] = useState<number | null>(null);
  const [pickerVerseCount, setPickerVerseCount] = useState<number | null>(null);
  const [pickerVerseLoading, setPickerVerseLoading] = useState(false);
  const [pendingScrollVerseId, setPendingScrollVerseId] = useState<string | null>(null);
  const [isOfflineSaved, setIsOfflineSaved] = useState(false);
  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>(audioReader.getState());
  const [autoScrollWithAudio, setAutoScrollWithAudio] = useState(true);

  const activeBook = BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[0];

  // Chapter text loads asynchronously now (real scripture is fetched from
  // /bible/<BookId>.json rather than bundled) -- start with an empty shell
  // so every existing `chapterData.verses` usage below stays valid during
  // the brief loading window instead of needing null-guards everywhere.
  const [chapterData, setChapterData] = useState<ChapterContent>({
    bookId: activeBook.id,
    bookNameEn: activeBook.nameEn,
    bookNameAm: activeBook.nameAm,
    bookNameFr: activeBook.nameFr,
    chapter: selectedChapter,
    totalChapters: activeBook.chaptersCount,
    verses: [],
  });
  const [isChapterLoading, setIsChapterLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsChapterLoading(true);
    fetchChapterContent(activeBook.id, selectedChapter).then((data) => {
      if (!cancelled) {
        setChapterData(data);
        setIsChapterLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeBook.id, selectedChapter]);

  // Book picker, verse step: fetch the real verse count for the chapter
  // being previewed (this also warms fetchChapterContent's cache, so the
  // chapter loads instantly once the user actually commits to it below).
  useEffect(() => {
    if (!pickerBookId || pickerChapter === null) {
      setPickerVerseCount(null);
      return;
    }
    let cancelled = false;
    setPickerVerseLoading(true);
    setPickerVerseCount(null);
    fetchChapterContent(pickerBookId, pickerChapter).then((data) => {
      if (!cancelled) {
        setPickerVerseCount(data.verses.length);
        setPickerVerseLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pickerBookId, pickerChapter]);

  // Once the picker jumps to a specific verse, scroll it into view as soon
  // as that verse actually shows up in the loaded chapter.
  useEffect(() => {
    if (!pendingScrollVerseId) return;
    const found = chapterData.verses.some(v => v.id === pendingScrollVerseId);
    if (!found) return;
    const el = document.getElementById(`verse-${pendingScrollVerseId}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setPendingScrollVerseId(null);
  }, [chapterData, pendingScrollVerseId]);

  // Subscribe to central audio reader state
  useEffect(() => {
    const unsubscribe = audioReader.subscribe((state) => {
      setPlaybackState(state);
      
      // Auto-scroll active verse into view if auto-scroll is enabled
      if (autoScrollWithAudio && (state.isPlaying || state.isPaused) && state.currentVerseId && state.currentVerseId !== 'custom') {
        const verseEl = document.getElementById(`verse-${state.currentVerseId}`);
        if (verseEl) {
          verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [autoScrollWithAudio]);

  useEffect(() => {
    let cancelled = false;
    StorageManager.isBookOfflineSaved(activeBook.id).then((saved) => {
      if (!cancelled) setIsOfflineSaved(saved);
    });
    return () => {
      cancelled = true;
    };
  }, [activeBook.id, chapterData]);

  // Handle saving for offline reading -- the whole book is already cached
  // automatically as soon as a chapter loads (see fetchChapterContent), so
  // this just makes sure that write has landed and reflects it in the UI.
  const handleSaveOffline = () => {
    ensureBookOffline(activeBook.id).then(() => {
      StorageManager.isBookOfflineSaved(activeBook.id).then(setIsOfflineSaved);
    });
  };

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm sm:text-base leading-relaxed';
      case 'lg': return 'text-lg sm:text-xl leading-relaxed';
      case 'xl': return 'text-xl sm:text-2xl leading-loose';
      default: return 'text-base sm:text-lg leading-relaxed';
    }
  };

  // Reading Theme styles
  const getThemeClass = () => {
    switch (readingTheme) {
      case 'sepia':
        return 'bg-amber-50 text-amber-950 border-amber-200 selection:bg-amber-200';
      case 'dark':
        return 'bg-stone-900 text-stone-100 border-stone-800 selection:bg-amber-800';
      default:
        return 'bg-stone-50/70 text-stone-900 border-stone-200 selection:bg-amber-200';
    }
  };

  const getContainerBg = () => {
    switch (readingTheme) {
      case 'sepia': return 'bg-[#FAF5EB]';
      case 'dark': return 'bg-[#181614]';
      default: return 'bg-[#FDFBF7]';
    }
  };

  // Chapter navigation
  const handlePrevChapter = () => {
    if (selectedChapter > 1) {
      setSelectedChapter(selectedChapter - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === activeBook.id);
      if (currentIndex > 0) {
        const prevBook = BIBLE_BOOKS[currentIndex - 1];
        setSelectedBookId(prevBook.id);
        setSelectedChapter(prevBook.chaptersCount);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleNextChapter = () => {
    if (selectedChapter < activeBook.chaptersCount) {
      setSelectedChapter(selectedChapter + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const currentIndex = BIBLE_BOOKS.findIndex(b => b.id === activeBook.id);
      if (currentIndex < BIBLE_BOOKS.length - 1) {
        const nextBook = BIBLE_BOOKS[currentIndex + 1];
        setSelectedBookId(nextBook.id);
        setSelectedChapter(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // Commits the book picker's choice and closes it -- verse is optional
  // (picking a chapter alone just opens it at verse 1; picking a verse too
  // scrolls to it once that chapter's loaded, see the effect above).
  const jumpToReading = (bookId: string, chapter: number, verse?: number) => {
    setSelectedBookId(bookId);
    setSelectedChapter(chapter);
    setIsBookSelectorOpen(false);
    setPickerBookId(null);
    setPickerChapter(null);
    setPendingScrollVerseId(verse ? `${bookId}.${chapter}.${verse}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Audio Playback Triggers
  const handlePlayChapter = (mode: AudioLangMode, engine: 'wordproject' | 'ai' = 'wordproject') => {
    setIsAudioMenuOpen(false);
    audioReader.setEngine(engine);
    if (engine === 'wordproject') {
      const targetLang = (mode === 'am' || mode === 'fr' || mode === 'en') ? mode : 'am';
      const bookName = targetLang === 'am' ? activeBook.nameAm : (targetLang === 'fr' ? (activeBook.nameFr || activeBook.nameEn) : activeBook.nameEn);
      audioReader.playWordProjectChapter(activeBook.id, selectedChapter, targetLang, bookName, chapterData.verses);
    } else {
      audioReader.playChapter(
        chapterData.verses,
        0,
        mode,
        `${activeBook.nameEn} ${selectedChapter} • ${activeBook.nameAm} ${selectedChapter}`
      );
    }
  };

  const handleTogglePlayState = () => {
    if (playbackState.isPlaying) {
      audioReader.pause();
    } else if (playbackState.isPaused) {
      audioReader.resume();
    } else {
      const defaultMode: AudioLangMode = viewMode === 'am' ? 'am' : viewMode === 'en' ? 'en' : 'am';
      handlePlayChapter(defaultMode, playbackState.engine || 'wordproject');
    }
  };

  // Filter books for selector
  const filteredBooks = BIBLE_BOOKS.filter(b => 
    b.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.nameAm.includes(searchQuery) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCurrentChapterPlaying = playbackState.isPlaying && (
    (playbackState.isWordProjectAudio && playbackState.currentBookId === activeBook.id && playbackState.currentChapter === selectedChapter) ||
    chapterData.verses.some(v => v.id === playbackState.currentVerseId)
  );

  return (
    <div className={`min-h-[calc(100vh-5rem)] ${getContainerBg()} transition-colors pb-16`}>
      
      {/* Top Reading Toolbar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Book & Chapter Navigation Trigger */}
          <div className="flex items-center gap-2">
            <button
              id="book-selector-trigger"
              onClick={() => setIsBookSelectorOpen(!isBookSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 border border-amber-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-medium text-xs sm:text-sm shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">{activeBook.nameEn}</span>
              <span className="font-ethiopic text-stone-500 dark:text-stone-400">({activeBook.nameAm})</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 font-bold text-xs">
                Ch. {selectedChapter}
              </span>
            </button>

            {/* Quick Chapter Step Buttons */}
            <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-700 overflow-hidden">
              <button
                onClick={handlePrevChapter}
                title={t.previousChapter}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                {selectedChapter}/{activeBook.chaptersCount}
              </span>
              <button
                onClick={handleNextChapter}
                title={t.nextChapter}
                className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reader Preferences (Language View, Font Size, Theme, Audio, Offline) */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* View Mode Toggle (Parallel / EN / AM) */}
            <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => setViewMode('parallel')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  viewMode === 'parallel'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
                title="Parallel View (EN + AM)"
              >
                <Columns2 className="w-3.5 h-3.5 inline mr-1" />
                Parallel
              </button>
              <button
                onClick={() => setViewMode('en')}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  viewMode === 'en'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setViewMode('fr')}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  viewMode === 'fr'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setViewMode('am')}
                className={`px-2 py-1 rounded-lg font-medium font-ethiopic transition-all ${
                  viewMode === 'am'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                አማ
              </button>
            </div>

            {/* Font Size Selector */}
            <div className="hidden sm:flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 text-xs">
              {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-2 py-0.5 rounded-lg uppercase font-bold transition-all ${
                    fontSize === s ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'text-stone-500'
                  }`}
                >
                  {s === 'sm' ? 'A-' : s === 'xl' ? 'A+' : s.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Theme Selector */}
            <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 text-xs">
              <button
                onClick={() => setReadingTheme('parchment')}
                className={`w-6 h-6 rounded-lg bg-[#FAF8F2] border ${readingTheme === 'parchment' ? 'ring-2 ring-amber-500' : ''}`}
                title="Parchment Theme"
              />
              <button
                onClick={() => setReadingTheme('sepia')}
                className={`w-6 h-6 rounded-lg bg-[#F5EBD7] border ml-1 ${readingTheme === 'sepia' ? 'ring-2 ring-amber-500' : ''}`}
                title="Warm Gold Sepia Theme"
              />
              <button
                onClick={() => setReadingTheme('dark')}
                className={`w-6 h-6 rounded-lg bg-stone-900 border ml-1 ${readingTheme === 'dark' ? 'ring-2 ring-amber-500' : ''}`}
                title="Midnight Sanctuary Theme"
              />
            </div>

            {/* Audio Recitation Toolbar Controller & Menu */}
            <div className="relative">
              <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden text-xs">
                <button
                  onClick={handleTogglePlayState}
                  className={`px-2.5 py-1.5 flex items-center gap-1.5 font-medium transition-all ${
                    isCurrentChapterPlaying
                      ? 'bg-amber-600 text-white font-semibold shadow-sm'
                      : 'hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                  }`}
                  title={isCurrentChapterPlaying ? 'Pause Audio' : 'Play Chapter Audio'}
                >
                  {isCurrentChapterPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span className="hidden md:inline">Playing</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden md:inline">{t.listenChapter}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                  className="p-1.5 border-l border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                  title="Choose Audio Language"
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Audio Dropdown Menu */}
              {isAudioMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 p-2.5 z-50 text-xs space-y-2 animate-in fade-in">
                  
                  {/* WordProject Human Audio Section */}
                  <div>
                    <div className="px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'am' ? '🎙️ WordProject እውነተኛ የሰው ድምጽ' : '🎙️ WordProject Human Audio'}</span>
                      <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-600 dark:text-emerald-400 font-semibold">Official</span>
                    </div>
                    
                    <button
                      onClick={() => handlePlayChapter('am', 'wordproject')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-stone-800/80 flex items-center justify-between text-stone-800 dark:text-stone-200 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇪🇹</span>
                        <div>
                          <p className="font-semibold font-ethiopic">አማርኛ (WordProject Audio)</p>
                          <p className="text-[10px] text-stone-500">Authentic Ethiopian narration</p>
                        </div>
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </button>

                    <button
                      onClick={() => handlePlayChapter('en', 'wordproject')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-stone-800/80 flex items-center justify-between text-stone-800 dark:text-stone-200 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇬🇧</span>
                        <div>
                          <p className="font-semibold">English KJV (WordProject Audio)</p>
                          <p className="text-[10px] text-stone-500">Classic Holy Scripture reading</p>
                        </div>
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </button>

                    <button
                      onClick={() => handlePlayChapter('fr', 'wordproject')}
                      className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-stone-800/80 flex items-center justify-between text-stone-800 dark:text-stone-200 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇫🇷</span>
                        <div>
                          <p className="font-semibold">Français (Louis Segond Audio)</p>
                          <p className="text-[10px] text-stone-500">WordProject narration française</p>
                        </div>
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </button>
                  </div>

                  {/* Studio AI HD TTS Section */}
                  <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                    <div className="px-2 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
                      <span>{lang === 'am' ? '✨ ስቱዲዮ AI ድምጽ (ቁጥር በቁጥር)' : '✨ Studio AI HD (Verse-by-Verse)'}</span>
                      <Sparkles className="w-3 h-3 text-amber-500" />
                    </div>

                    <button
                      onClick={() => handlePlayChapter('am', 'ai')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800/80 flex items-center justify-between text-stone-800 dark:text-stone-200 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇪🇹</span>
                        <span className="font-ethiopic">አማርኛ AI (Kore Voice)</span>
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    </button>

                    <button
                      onClick={() => handlePlayChapter('en', 'ai')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800/80 flex items-center justify-between text-stone-800 dark:text-stone-200 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇬🇧</span>
                        <span>English AI (Fenrir Voice)</span>
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    </button>

                    <button
                      onClick={() => handlePlayChapter('parallel', 'ai')}
                      className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800/80 flex items-center justify-between text-stone-800 dark:text-stone-200 font-medium transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>⚡</span>
                        <span>Parallel (EN + አማርኛ)</span>
                      </span>
                      <Volume2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Text Auto-Tracking & Auto-Scroll with Audio Toggle */}
            <button
              onClick={() => setAutoScrollWithAudio(!autoScrollWithAudio)}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 font-medium transition-all ${
                autoScrollWithAudio
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-300 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-500'
              }`}
              title={autoScrollWithAudio ? 'Text Auto-Tracking Active (Auto-scrolls as audio plays)' : 'Enable Text Auto-Tracking with Audio'}
            >
              <Eye className={`w-4 h-4 ${autoScrollWithAudio ? 'text-amber-600 dark:text-amber-400 animate-pulse' : 'text-stone-400'}`} />
              <span className="hidden xl:inline">{autoScrollWithAudio ? 'Track Text: ON' : 'Track Text: OFF'}</span>
            </button>

            {/* Offline Cache Button */}
            <button
              onClick={handleSaveOffline}
              disabled={isOfflineSaved}
              className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 font-medium transition-all ${
                isOfflineSaved
                  ? 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-400 text-emerald-800 dark:text-emerald-300'
                  : 'bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
              }`}
              title={isOfflineSaved ? t.chapterSavedOffline : t.downloadChapter}
            >
              {isOfflineSaved ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-stone-500" />}
              <span className="hidden xl:inline">{isOfflineSaved ? 'Offline Ready' : 'Save Offline'}</span>
            </button>

          </div>

        </div>
      </div>

      {/* Book & Chapter Selector Modal / Drawer */}
      {isBookSelectorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Selector Header & Search (books step only) */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4 bg-stone-50 dark:bg-stone-800/80">
              {!pickerBookId ? (
                <div className="flex-1 max-w-md relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchScripture}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              ) : (
                <button
                  onClick={() => (pickerChapter !== null ? setPickerChapter(null) : setPickerBookId(null))}
                  className="flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {pickerChapter !== null
                    ? (lang === 'am' ? 'ወደ ምዕራፎች ተመለስ' : lang === 'fr' ? 'Retour aux chapitres' : 'Back to chapters')
                    : (lang === 'am' ? 'ወደ መጻሕፍት ተመለስ' : lang === 'fr' ? 'Retour aux livres' : 'Back to books')}
                </button>
              )}
              <button
                onClick={() => {
                  setIsBookSelectorOpen(false);
                  setPickerBookId(null);
                  setPickerChapter(null);
                }}
                className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold hover:bg-stone-300 transition-colors"
              >
                Close
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">

              {/* Step 1: Books */}
              {!pickerBookId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b border-amber-500/30">
                      <span className="font-cinzel font-bold text-amber-800 dark:text-amber-400 text-sm">
                        OLD TESTAMENT
                      </span>
                      <span className="font-ethiopic text-xs text-stone-500">
                        (ብሉይ ኪዳን - 39 Books)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredBooks.filter(b => b.testament === 'OT').map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setPickerBookId(b.id)}
                          className={`p-2 rounded-xl border text-left text-xs transition-all ${
                            selectedBookId === b.id
                              ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow'
                              : 'border-stone-200 dark:border-stone-800 hover:bg-amber-50/60 dark:hover:bg-stone-800/80 text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          <div className="font-medium">{b.nameEn}</div>
                          <div className="font-ethiopic text-[11px] opacity-80">{b.nameAm}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 pb-2 mb-3 border-b border-amber-500/30">
                      <span className="font-cinzel font-bold text-amber-800 dark:text-amber-400 text-sm">
                        NEW TESTAMENT
                      </span>
                      <span className="font-ethiopic text-xs text-stone-500">
                        (ሐዲስ ኪዳን - 27 Books)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {filteredBooks.filter(b => b.testament === 'NT').map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setPickerBookId(b.id)}
                          className={`p-2 rounded-xl border text-left text-xs transition-all ${
                            selectedBookId === b.id
                              ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow'
                              : 'border-stone-200 dark:border-stone-800 hover:bg-amber-50/60 dark:hover:bg-stone-800/80 text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          <div className="font-medium">{b.nameEn}</div>
                          <div className="font-ethiopic text-[11px] opacity-80">{b.nameAm}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Chapters (for pickerBookId) */}
              {pickerBookId && pickerChapter === null && (() => {
                const pickerBook = BIBLE_BOOKS.find(b => b.id === pickerBookId) || BIBLE_BOOKS[0];
                return (
                  <div>
                    <div className="mb-4">
                      <div className="font-cinzel font-bold text-lg text-stone-900 dark:text-stone-100">{pickerBook.nameEn}</div>
                      <div className="font-ethiopic text-sm text-stone-500">{pickerBook.nameAm}</div>
                    </div>
                    <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                      {lang === 'am' ? 'ምዕራፍ ይምረጡ' : lang === 'fr' ? 'Choisissez un chapitre' : 'Choose a chapter'} ({pickerBook.chaptersCount})
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-96 overflow-y-auto p-1">
                      {Array.from({ length: pickerBook.chaptersCount }, (_, i) => i + 1).map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setPickerChapter(ch)}
                          className={`w-10 h-10 rounded-lg font-semibold text-xs transition-all ${
                            selectedBookId === pickerBookId && selectedChapter === ch
                              ? 'bg-amber-600 text-white shadow'
                              : 'bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Step 3: Verses (optional, for pickerChapter) */}
              {pickerBookId && pickerChapter !== null && (() => {
                const pickerBook = BIBLE_BOOKS.find(b => b.id === pickerBookId) || BIBLE_BOOKS[0];
                return (
                  <div>
                    <div className="mb-4">
                      <div className="font-cinzel font-bold text-lg text-stone-900 dark:text-stone-100">
                        {pickerBook.nameEn} {pickerChapter}
                      </div>
                      <div className="font-ethiopic text-sm text-stone-500">{pickerBook.nameAm} {pickerChapter}</div>
                    </div>
                    <button
                      onClick={() => jumpToReading(pickerBookId, pickerChapter)}
                      className="w-full mb-5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow transition-colors"
                    >
                      {lang === 'am'
                        ? `ምዕራፍ ${pickerChapter}ን ጀምር`
                        : lang === 'fr'
                          ? `Commencer au chapitre ${pickerChapter}`
                          : `Start reading at chapter ${pickerChapter}`}
                    </button>
                    <div className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                      {lang === 'am' ? 'ወይም ወደ ተወሰነ ቁጥር ይዝለሉ (አማራጭ)' : lang === 'fr' ? 'Ou allez à un verset précis (optionnel)' : 'Or jump to a specific verse (optional)'}
                    </div>
                    {pickerVerseLoading ? (
                      <div className="text-xs text-stone-400 py-6 text-center animate-pulse">
                        {lang === 'am' ? 'ቁጥሮች እየጫኑ ነው...' : lang === 'fr' ? 'Chargement des versets…' : 'Loading verses…'}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 max-h-72 overflow-y-auto p-1">
                        {Array.from({ length: pickerVerseCount || 0 }, (_, i) => i + 1).map((v) => (
                          <button
                            key={v}
                            onClick={() => jumpToReading(pickerBookId, pickerChapter, v)}
                            className="w-9 h-9 rounded-lg font-semibold text-xs bg-stone-100 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all"
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

          </div>
        </div>
      )}

      {/* Main Scripture Reading Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        
        {/* Chapter Header Banner */}
        <div className="text-center mb-8 pb-6 border-b border-stone-300/60 dark:border-stone-800/80">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-widest mb-2">
            {activeBook.testament === 'OT' ? t.oldTestament : t.newTestament} • {activeBook.category.toUpperCase()}
          </div>
          <h1 className="font-serif-bible text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2">
            {activeBook.nameEn} <span className="text-amber-600">Chapter {selectedChapter}</span>
          </h1>
          <h2 className="font-ethiopic text-xl sm:text-2xl text-stone-600 dark:text-stone-400">
            {activeBook.nameAm} ምዕራፍ {selectedChapter}
          </h2>
          <p className="text-xs text-stone-500 max-w-lg mx-auto mt-2 italic">
            {lang === 'am' ? activeBook.descriptionAm : activeBook.descriptionEn}
          </p>
        </div>

        {/* Verses Container */}
        <div className={`rounded-2xl p-4 sm:p-8 shadow-sm border ${getThemeClass()} transition-all space-y-5`}>
          {isChapterLoading && chapterData.verses.length === 0 && (
            <div className="py-10 text-center text-sm text-stone-400 animate-pulse">
              {lang === 'am' ? 'እየጫነ ነው...' : lang === 'fr' ? 'Chargement…' : 'Loading chapter…'}
            </div>
          )}
          {chapterData.verses.map((verse) => {
            const isHighlighted = highlights.find(h => h.verseId === verse.id);
            const isBookmarked = bookmarkedVerseIds.includes(verse.id);
            const hasNote = notesVerseIds.includes(verse.id);
            const isSpeaking = playbackState.currentVerseId === verse.id && (playbackState.isPlaying || playbackState.isPaused);

            // Highlight style mapping
            let highlightClass = '';
            if (isHighlighted) {
              switch (isHighlighted.color) {
                case 'amber': highlightClass = 'bg-amber-200/60 dark:bg-amber-900/40 rounded px-1'; break;
                case 'emerald': highlightClass = 'bg-emerald-200/60 dark:bg-emerald-900/40 rounded px-1'; break;
                case 'sky': highlightClass = 'bg-sky-200/60 dark:bg-sky-900/40 rounded px-1'; break;
                case 'rose': highlightClass = 'bg-rose-200/60 dark:bg-rose-900/40 rounded px-1'; break;
                case 'purple': highlightClass = 'bg-purple-200/60 dark:bg-purple-900/40 rounded px-1'; break;
              }
            }

            return (
              <div
                key={verse.id}
                id={`verse-${verse.id}`}
                onClick={() => onSelectVerse(verse)}
                className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-400/60 shadow-md'
                    : 'border-transparent hover:border-amber-300 dark:hover:border-amber-700/60 hover:bg-amber-50/30 dark:hover:bg-stone-800/40'
                }`}
              >
                {/* Verse Indicators & Quick Actions */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  {/* Live Soundwave when reciting */}
                  {isSpeaking && (
                    <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm animate-pulse mr-1">
                      <span className="w-1 h-2.5 bg-white rounded-full animate-bounce"></span>
                      <span className="w-1 h-3.5 bg-white rounded-full animate-bounce delay-75"></span>
                      <span className="w-1 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                      <span className="ml-1 uppercase tracking-wider">{playbackState.isPlaying ? 'Reading' : 'Paused'}</span>
                    </div>
                  )}

                  {isBookmarked && (
                    <span title="Bookmarked">
                      <Bookmark className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </span>
                  )}
                  {hasNote && (
                    <span title="Contains Reflection Note">
                      <FileText className="w-4 h-4 text-sky-500" />
                    </span>
                  )}
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-200/60 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    Study
                  </span>
                </div>

                {/* Single or Parallel Render */}
                {viewMode === 'parallel' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* English Column */}
                    <div>
                      <div className="flex items-start gap-2.5">
                        <span className="font-serif-bible font-bold text-amber-700 dark:text-amber-400 text-sm select-none shrink-0 pt-0.5">
                          {verse.verse}
                        </span>
                        <p className={`font-serif-bible ${getFontSizeClass()} ${highlightClass}`}>
                          {verse.textEn}
                        </p>
                      </div>
                    </div>

                    {/* Amharic Column */}
                    <div className="md:border-l md:border-stone-200 dark:md:border-stone-800 md:pl-4">
                      <div className="flex items-start gap-2.5">
                        <span className="font-ethiopic font-bold text-amber-700 dark:text-amber-400 text-sm select-none shrink-0 pt-0.5">
                          {verse.verse}
                        </span>
                        <p className={`font-ethiopic ${getFontSizeClass()} ${highlightClass}`}>
                          {verse.textAm}
                        </p>
                      </div>
                    </div>

                  </div>
                ) : viewMode === 'en' ? (
                  <div className="flex items-start gap-3">
                    <span className="font-serif-bible font-bold text-amber-700 dark:text-amber-400 text-sm select-none shrink-0 pt-0.5">
                      {verse.verse}
                    </span>
                    <p className={`font-serif-bible ${getFontSizeClass()} ${highlightClass}`}>
                      {verse.textEn}
                    </p>
                  </div>
                ) : viewMode === 'fr' ? (
                  <div className="flex items-start gap-3">
                    <span className="font-serif-bible font-bold text-amber-700 dark:text-amber-400 text-sm select-none shrink-0 pt-0.5">
                      {verse.verse}
                    </span>
                    <p className={`font-serif-bible ${getFontSizeClass()} ${highlightClass}`}>
                      {verse.textFr || verse.textEn}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="font-ethiopic font-bold text-amber-700 dark:text-amber-400 text-sm select-none shrink-0 pt-0.5">
                      {verse.verse}
                    </span>
                    <p className={`font-ethiopic ${getFontSizeClass()} ${highlightClass}`}>
                      {verse.textAm}
                    </p>
                  </div>
                )}

                {/* Verse Study Note if attached */}
                {verse.notes && (
                  <div className="mt-2 text-xs text-amber-800 dark:text-amber-300/90 italic pl-6 border-l-2 border-amber-400/50">
                    💡 {verse.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chapter Bottom Navigation Footer */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-300/60 dark:border-stone-800">
          <button
            onClick={handlePrevChapter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t.previousChapter}</span>
          </button>

          <div className="text-center text-xs text-stone-500">
            {activeBook.nameEn} {selectedChapter} of {activeBook.chaptersCount}
          </div>

          <button
            onClick={handleNextChapter}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <span>{t.nextChapter}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Active Recitation Pill */}
        {isCurrentChapterPlaying && playbackState.currentVerse && (
          <div className="fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-3 duration-300">
            <button
              onClick={() => {
                if (playbackState.currentVerseId) {
                  const el = document.getElementById(`verse-${playbackState.currentVerseId}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900/90 hover:bg-stone-900 dark:bg-amber-600 dark:hover:bg-amber-500 text-white text-xs font-semibold shadow-2xl border border-amber-500/40 backdrop-blur-md transition-all hover:scale-105"
              title="Jump to reciting verse in text"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <span>{lang === 'am' ? `ንባቡን ተከተል: ቁጥር ${playbackState.currentVerse.verse}` : `Reciting Verse ${playbackState.currentVerse.verse}`}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </button>
          </div>
        )}

      </main>

    </div>
  );
};
