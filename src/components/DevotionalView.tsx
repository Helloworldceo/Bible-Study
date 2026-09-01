import React, { useState } from 'react';
import { 
  Sparkles, Calendar, BookOpen, Heart, Volume2, Share2, 
  Send, Check, ArrowRight, BookMarked, MessageSquare, Flame, 
  ChevronLeft, ChevronRight, PenTool, Globe
} from 'lucide-react';
import { DailyDevotional, Language } from '../types';
import { DEVOTIONALS_LIBRARY } from '../data/devotionalsData';
import { useTranslation } from '../utils/translations';
import { StorageManager } from '../utils/offlineStorage';
import { audioReader, AudioLangMode } from '../utils/audioReaderService';

interface DevotionalViewProps {
  lang: Language;
  onOpenPassageInBible: (bookId: string, chapter: number) => void;
  onSendDiscordVerse: (ref: string) => Promise<{ success: boolean; message: string }>;
  onSaveReflectionNote: (title: string, content: string, tags: string[]) => void;
}

export const DevotionalView: React.FC<DevotionalViewProps> = ({
  lang,
  onOpenPassageInBible,
  onSendDiscordVerse,
  onSaveReflectionNote,
}) => {
  const t = useTranslation(lang);

  const [activeDevotionalIndex, setActiveDevotionalIndex] = useState(0);
  const [reflectionText, setReflectionText] = useState('');
  const [savedReflection, setSavedReflection] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<string | null>(null);

  // Custom AI Devotional Generator State
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [customAiDevotional, setCustomAiDevotional] = useState<DailyDevotional | null>(null);

  const activeDevotional: DailyDevotional = customAiDevotional || DEVOTIONALS_LIBRARY[activeDevotionalIndex] || DEVOTIONALS_LIBRARY[0];

  const handlePrev = () => {
    setCustomAiDevotional(null);
    setActiveDevotionalIndex((prev) => (prev > 0 ? prev - 1 : DEVOTIONALS_LIBRARY.length - 1));
  };

  const handleNext = () => {
    setCustomAiDevotional(null);
    setActiveDevotionalIndex((prev) => (prev < DEVOTIONALS_LIBRARY.length - 1 ? prev + 1 : 0));
  };

  const handleSaveReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionText.trim()) return;

    onSaveReflectionNote(
      `Daily Reflection: ${activeDevotional.titleEn}`,
      reflectionText,
      ['Devotional', activeDevotional.themeEn, 'Daily Growth']
    );

    setSavedReflection(true);
    setTimeout(() => {
      setSavedReflection(false);
      setReflectionText('');
    }, 3000);
  };

  const [isAudioMenuOpen, setIsAudioMenuOpen] = useState(false);

  const handleAudioSpeech = (mode: AudioLangMode) => {
    setIsAudioMenuOpen(false);
    
    // Construct verse representation for the devotional scripture & text
    const devotionalVerse = {
      id: activeDevotional.id,
      bookId: activeDevotional.scriptureBookId,
      bookNameEn: activeDevotional.scriptureRefEn,
      bookNameAm: activeDevotional.scriptureRefAm,
      chapter: activeDevotional.scriptureChapter,
      verse: 1,
      textEn: `${activeDevotional.titleEn}. Scripture: "${activeDevotional.scriptureEn}" — ${activeDevotional.contentEn} Prayer: ${activeDevotional.prayerEn}`,
      textAm: `${activeDevotional.titleAm}። የቅዱስ ቃል ንባብ፡ "${activeDevotional.scriptureAm}" — ${activeDevotional.contentAm} ጸሎት፡ ${activeDevotional.prayerAm}`
    };

    audioReader.playVerse(devotionalVerse, mode);
  };

  const handleSendToDiscord = async () => {
    setDiscordStatus('Dispatching devotional verse to Discord...');
    try {
      const res = await onSendDiscordVerse(activeDevotional.scriptureRefEn);
      setDiscordStatus(res.message);
    } catch (e: any) {
      setDiscordStatus(e.message || 'Failed to dispatch to Discord.');
    }
  };

  const handleGenerateAiDevotional = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;

    setIsGeneratingAi(true);
    try {
      const res = await fetch('/api/gemini/study-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Create a deep, structured Christian daily devotional about: "${customPrompt}". Include Title (EN & Amharic), Scripture Reference, English Scripture, Amharic Scripture, 3 paragraphs of deep biblical reflection (EN & Amharic), reflection question, and a powerful guided prayer (EN & Amharic).`,
          lang: lang
        })
      });
      const data = await res.json();

      const newDevotional: DailyDevotional = {
        id: `ai-devotional-${Date.now()}`,
        dayOfYear: 999,
        dateString: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }),
        titleEn: `Daily Grace: ${customPrompt}`,
        titleAm: `የዕለት ጸጋ፡ ${customPrompt}`,
        themeEn: customPrompt,
        themeAm: customPrompt,
        scriptureRefEn: 'Hebrews 4:16',
        scriptureRefAm: 'ወደ ዕብራውያን 4:16',
        scriptureBookId: 'HEB',
        scriptureChapter: 4,
        scriptureEn: 'Let us therefore come boldly to the throne of grace, that we may obtain mercy and find grace to help in time of need.',
        scriptureAm: 'እንግዲህ ምሕረትን እንድንቀበል በሚያስፈልገንም ጊዜ የሚረዳንን ጸጋ እንድናገኝ ወደ ጸጋው ዙፋን በእምነት እንቅረብ።',
        contentEn: data.answer || 'Draw near to God with full assurance of faith...',
        contentAm: 'በእምነት ወደ እግዚአብሔር ቅረብ እርሱም ይቀርብሃል...',
        reflectionPromptEn: 'How can you step forward into God\'s presence with boldness today?',
        reflectionPromptAm: 'ዛሬ በእግዚአብሔር ፊት በእምነት ለመቅረብ ምን እርምጃ ትወስዳለህ?',
        prayerEn: 'Lord Jesus, thank You for opening the way into Your holy presence. Amen.',
        prayerAm: 'ጌታ ኢየሱስ ሆይ፥ ወደ ቅዱስ ዙፋንህ የሚያደርሰውን መንገድ ስለከፈትክልን አመሰግንሃለሁ። አሜን።'
      };

      setCustomAiDevotional(newDevotional);
      setCustomPrompt('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      
      {/* Devotional Top Selector & Date Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            title="Previous Devotional"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider">
                {activeDevotional.themeEn} • {activeDevotional.themeAm}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-stone-700 dark:text-stone-300 mt-0.5">
              {activeDevotional.dateString} (Day {activeDevotional.dayOfYear})
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio speech button & dropdown */}
          <div className="relative">
            <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 overflow-hidden text-xs">
              <button
                onClick={() => handleAudioSpeech(lang === 'am' ? 'am' : 'en')}
                className="px-2.5 py-1.5 flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
                title="Listen to Devotional"
              >
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Listen</span>
              </button>
              <button
                onClick={() => setIsAudioMenuOpen(!isAudioMenuOpen)}
                className="p-1.5 border-l border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                title="Audio language options"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
            </div>

            {isAudioMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 p-1.5 z-50 text-xs space-y-1 animate-in fade-in">
                <button
                  onClick={() => handleAudioSpeech('fr')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between text-stone-800 dark:text-stone-200"
                >
                  <span>🇫🇷 Écouter en Français</span>
                </button>
                <button
                  onClick={() => handleAudioSpeech('en')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between text-stone-800 dark:text-stone-200"
                >
                  <span>🇬🇧 Listen in English</span>
                </button>
                <button
                  onClick={() => handleAudioSpeech('am')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between text-stone-800 dark:text-stone-200"
                >
                  <span className="font-ethiopic">🇪🇹 በአማርኛ አድምጥ</span>
                </button>
                <button
                  onClick={() => handleAudioSpeech('parallel')}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-stone-800 flex items-center justify-between text-stone-800 dark:text-stone-200"
                >
                  <span>⚡ Parallel Mode</span>
                </button>
              </div>
            )}
          </div>

          {/* Send to Discord */}
          <button
            onClick={handleSendToDiscord}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Discord</span>
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors"
            title="Next Devotional"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {discordStatus && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-medium flex items-center justify-between">
          <span>{discordStatus}</span>
          <button onClick={() => setDiscordStatus(null)} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {/* Main Devotional Card */}
      <article className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-10 border border-stone-200 dark:border-stone-800 shadow-md space-y-8">
        
        {/* Title */}
        <div className="space-y-2 border-b border-stone-200 dark:border-stone-800 pb-6">
          <h1 className="font-serif-bible text-2xl sm:text-4xl font-bold text-stone-900 dark:text-stone-100 leading-tight">
            {activeDevotional.titleEn}
          </h1>
          <h2 className="font-ethiopic text-xl sm:text-2xl text-amber-700 dark:text-amber-400 font-semibold">
            {activeDevotional.titleAm}
          </h2>
        </div>

        {/* Key Scripture Anchor Card */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/50 dark:border-amber-800/40 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="font-serif-bible font-bold text-amber-900 dark:text-amber-300 text-sm sm:text-base">
                {activeDevotional.scriptureRefEn}
              </span>
              <span className="font-ethiopic text-stone-600 dark:text-stone-400 text-sm">
                ({activeDevotional.scriptureRefAm})
              </span>
            </div>

            <button
              onClick={() => onOpenPassageInBible(activeDevotional.scriptureBookId, activeDevotional.scriptureChapter)}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
            >
              <span>{t.openInBible}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="font-serif-bible text-base sm:text-lg italic text-stone-800 dark:text-stone-200 leading-relaxed">
            "{activeDevotional.scriptureEn}"
          </p>
          <p className="font-ethiopic text-base sm:text-lg text-stone-900 dark:text-stone-300 leading-relaxed">
            "{activeDevotional.scriptureAm}"
          </p>
        </div>

        {/* Devotional Body Exposition */}
        <div className="space-y-6 text-stone-800 dark:text-stone-200 leading-relaxed font-serif-bible text-base sm:text-lg">
          {lang === 'am' ? (
            <div className="font-ethiopic space-y-4">
              <p className="whitespace-pre-line">{activeDevotional.contentAm}</p>
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 text-sm text-stone-500 font-sans">
                <span className="font-semibold block mb-1">English Summary:</span>
                {activeDevotional.contentEn}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="whitespace-pre-line">{activeDevotional.contentEn}</p>
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 font-ethiopic text-sm text-stone-600 dark:text-stone-400">
                <span className="font-semibold block mb-1 text-stone-500">የአማርኛ ትርጉም (Amharic Translation):</span>
                {activeDevotional.contentAm}
              </div>
            </div>
          )}
        </div>

        {/* Reflection Challenge Card */}
        <div className="p-5 rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-2">
          <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-amber-600" />
            {t.reflectionPrompt}
          </h4>
          <p className="font-medium text-stone-800 dark:text-stone-200 text-sm sm:text-base">
            {lang === 'am' ? activeDevotional.reflectionPromptAm : activeDevotional.reflectionPromptEn}
          </p>
        </div>

        {/* Daily Guided Prayer */}
        <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
          <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-2">
            🙏 {t.dailyPrayer}
          </h4>
          <p className="font-serif-bible italic text-stone-800 dark:text-stone-200 text-base leading-relaxed">
            "{lang === 'am' ? activeDevotional.prayerAm : activeDevotional.prayerEn}"
          </p>
        </div>

        {/* Inline Journal Reflection Form */}
        <form onSubmit={handleSaveReflection} className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-amber-600" />
              <span>{t.logReflection}</span>
            </label>
            {savedReflection && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved to Journal!
              </span>
            )}
          </div>

          <textarea
            rows={3}
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Record your thoughts, prayers, or personal takeaways from today's devotional..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!reflectionText.trim()}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors disabled:opacity-50"
            >
              {t.save}
            </button>
          </div>
        </form>

      </article>

      {/* AI Personalized Devotional Generator */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-stone-100 dark:from-stone-900 dark:to-stone-800 border border-amber-200 dark:border-stone-700 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
              Generate AI Devotional for Your Current Season
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Enter a spiritual theme or life circumstance (e.g. Overcoming Anxiety, New Career Decision, Grief, Joyful Praise).
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerateAiDevotional} className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Enter season or topic (e.g., God's Peace in Times of Uncertainty)..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
          <button
            type="submit"
            disabled={isGeneratingAi || !customPrompt.trim()}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGeneratingAi ? 'Generating...' : 'Generate'}</span>
          </button>
        </form>
      </div>

    </div>
  );
};
