import React, { useState } from 'react';
import { X, Highlighter, Bookmark, FileText, Sparkles, Send, Copy, Volume2, Check, ExternalLink, BookOpen, Play, Pause, Globe, Music } from 'lucide-react';
import { BibleVerse, HighlightItem, Language, UserProfile } from '../types';
import { useTranslation } from '../utils/translations';
import { StorageManager } from '../utils/offlineStorage';
import { audioReader, AudioLangMode } from '../utils/audioReaderService';

interface VerseActionModalProps {
  verse: BibleVerse | null;
  onClose: () => void;
  lang: Language;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onSaveNote: (verse: BibleVerse, title: string, content: string, category: any, tags: string[]) => void;
  onToggleBookmark: (verse: BibleVerse) => void;
  isBookmarked: boolean;
  currentHighlight?: HighlightItem;
  onSetHighlight: (verse: BibleVerse, color: 'amber' | 'emerald' | 'sky' | 'rose' | 'purple') => void;
  onRemoveHighlight: (verseId: string) => void;
  onSendDiscord: (verse: BibleVerse) => Promise<{ success: boolean; message: string }>;
}

export const VerseActionModal: React.FC<VerseActionModalProps> = ({
  verse,
  onClose,
  lang,
  user,
  onOpenAuth,
  onSaveNote,
  onToggleBookmark,
  isBookmarked,
  currentHighlight,
  onSetHighlight,
  onRemoveHighlight,
  onSendDiscord,
}) => {
  if (!verse) return null;

  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState<'actions' | 'ai' | 'note' | 'discord'>('actions');
  const [copied, setCopied] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [discordSending, setDiscordSending] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<string | null>(null);

  // Note form state
  const [noteTitle, setNoteTitle] = useState(`Reflection on ${verse.bookNameEn} ${verse.chapter}:${verse.verse}`);
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'Reflection' | 'Study Note' | 'Sermon' | 'Prayer'>('Reflection');
  const [noteTags, setNoteTags] = useState('Scripture, Meditation');

  const highlightColors: Array<{ name: string; color: 'amber' | 'emerald' | 'sky' | 'rose' | 'purple'; bg: string; border: string }> = [
    { name: 'Gold', color: 'amber', bg: 'bg-amber-300', border: 'border-amber-500' },
    { name: 'Emerald', color: 'emerald', bg: 'bg-emerald-300', border: 'border-emerald-500' },
    { name: 'Sky', color: 'sky', bg: 'bg-sky-300', border: 'border-sky-500' },
    { name: 'Rose', color: 'rose', bg: 'bg-rose-300', border: 'border-rose-500' },
    { name: 'Purple', color: 'purple', bg: 'bg-purple-300', border: 'border-purple-500' },
  ];

  const handleCopy = (format: 'both' | 'en' | 'am') => {
    let text = '';
    if (format === 'en') {
      text = `"${verse.textEn}" - ${verse.bookNameEn} ${verse.chapter}:${verse.verse}`;
    } else if (format === 'am') {
      text = `"${verse.textAm}" - ${verse.bookNameAm} ${verse.chapter}:${verse.verse}`;
    } else {
      text = `"${verse.textEn}"\n"${verse.textAm}"\n- ${verse.bookNameEn} / ${verse.bookNameAm} ${verse.chapter}:${verse.verse}`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayAudio = (mode: AudioLangMode) => {
    audioReader.playVerse(verse, mode);
  };

  const handlePlayChapterFromHere = () => {
    onClose();
    if (verse.bookId && verse.chapter) {
      const bookNum = verse.chapter;
      // Seek or play chapter
      audioReader.seekToVerse(verse.id);
    }
  };

  const fetchAIExplanation = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setIsExplaining(true);
    try {
      const token = localStorage.getItem('berean_auth_token_v1');
      const res = await fetch('/api/gemini/explain-verse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          verseRef: `${verse.bookNameEn} ${verse.chapter}:${verse.verse} (${verse.bookNameAm})`,
          verseEn: verse.textEn,
          verseAm: verse.textAm,
          lang: lang
        })
      });
      if (res.status === 401) {
        onOpenAuth();
        return;
      }
      const data = await res.json();
      if (data.result) {
        setAiResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSendToDiscord = async () => {
    setDiscordSending(true);
    setDiscordStatus(null);
    try {
      const res = await onSendDiscord(verse);
      setDiscordStatus(res.message);
    } catch (err: any) {
      setDiscordStatus(err.message || 'Failed to dispatch to Discord.');
    } finally {
      setDiscordSending(false);
    }
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    const tags = noteTags.split(',').map(t => t.trim()).filter(Boolean);
    onSaveNote(verse, noteTitle, noteContent, noteCategory, tags);
    setActiveTab('actions');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold">
                {verse.bookNameEn} {verse.chapter}:{verse.verse}
              </span>
              <span className="text-xs font-ethiopic text-stone-600 dark:text-stone-300">
                {verse.bookNameAm} {verse.chapter}:{verse.verse}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verse Scripture Card */}
        <div className="p-5 bg-amber-50/40 dark:bg-amber-950/20 border-b border-stone-200 dark:border-stone-800">
          <p className="font-serif-bible text-base sm:text-lg text-stone-800 dark:text-stone-100 italic leading-relaxed mb-2">
            "{verse.textEn}"
          </p>
          <p className="font-ethiopic text-base sm:text-lg text-stone-900 dark:text-stone-200 leading-relaxed">
            "{verse.textAm}"
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-stone-200 dark:border-stone-800 px-5 gap-4 text-xs sm:text-sm font-medium bg-stone-100/50 dark:bg-stone-800/40">
          <button
            onClick={() => setActiveTab('actions')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Actions & Highlight</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('ai');
              if (!aiResult && !isExplaining) fetchAIExplanation();
            }}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'ai'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Theological Study</span>
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'note'
                ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Add Reflection</span>
          </button>
          {user?.isAdmin && (
            <button
              onClick={() => setActiveTab('discord')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'discord'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Send className="w-4 h-4 text-indigo-500" />
              <span>Discord</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1">
          
          {/* TAB 1: Actions & Highlight */}
          {activeTab === 'actions' && (
            <div className="space-y-5">
              
              {/* Highlight Palette */}
              <div>
                <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
                  Highlight Color
                </label>
                <div className="flex items-center gap-3">
                  {highlightColors.map((hc) => (
                    <button
                      key={hc.color}
                      onClick={() => onSetHighlight(verse, hc.color)}
                      className={`w-9 h-9 rounded-full ${hc.bg} border-2 ${
                        currentHighlight?.color === hc.color ? 'ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      } transition-all flex items-center justify-center`}
                      title={hc.name}
                    >
                      {currentHighlight?.color === hc.color && <Check className="w-4 h-4 text-stone-800" />}
                    </button>
                  ))}
                  {currentHighlight && (
                    <button
                      onClick={() => onRemoveHighlight(verse.id)}
                      className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 underline ml-2"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => onToggleBookmark(verse)}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                    isBookmarked 
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 text-amber-800 dark:text-amber-300 shadow-sm'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-stone-400'}`} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Add Bookmark'}</span>
                </button>

                <button
                  onClick={() => handleCopy('both')}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center gap-2 text-xs font-medium transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-400" />}
                  <span>{copied ? 'Copied Both!' : 'Copy Bilingual'}</span>
                </button>
              </div>

              {/* Audio Narrator Options */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-900 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    <span>Audio Narrator • የድምጽ ንባብ</span>
                  </span>
                  <span className="text-[10px] font-mono opacity-80">AI HD / Native</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePlayAudio('fr')}
                    className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 hover:border-amber-500 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-amber-50 dark:hover:bg-stone-800"
                  >
                    <span>🇫🇷</span>
                    <span className="font-semibold">Français</span>
                  </button>

                  <button
                    onClick={() => handlePlayAudio('en')}
                    className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 hover:border-amber-500 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-amber-50 dark:hover:bg-stone-800"
                  >
                    <span>🇬🇧</span>
                    <span className="font-semibold">English</span>
                  </button>

                  <button
                    onClick={() => handlePlayAudio('am')}
                    className="p-2 rounded-xl bg-white dark:bg-stone-900 border border-amber-300 dark:border-stone-700 hover:border-amber-500 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all hover:bg-amber-50 dark:hover:bg-stone-800"
                  >
                    <span>🇪🇹</span>
                    <span className="font-ethiopic font-semibold">አማርኛ</span>
                  </button>

                  <button
                    onClick={() => handlePlayAudio('parallel')}
                    className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-all"
                  >
                    <span>⚡</span>
                    <span>Parallel</span>
                  </button>
                </div>

                <button
                  onClick={handlePlayChapterFromHere}
                  className="w-full py-2 px-3 rounded-xl bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-amber-300 dark:border-amber-800"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{lang === 'am' ? `ከቁጥር ${verse.verse} ጀምሮ ሙሉ ምዕራፉን አድምጥ (Continuous Audio)` : `Play chapter starting from verse ${verse.verse}`}</span>
                </button>
              </div>

              {/* Copy Format Options */}
              <div className="flex items-center gap-2 pt-2 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                <span>Copy Only:</span>
                <button
                  onClick={() => handleCopy('en')}
                  className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium"
                >
                  English
                </button>
                <button
                  onClick={() => handleCopy('am')}
                  className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium font-ethiopic"
                >
                  አማርኛ
                </button>
                {verse.textFr && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${verse.bookNameFr || verse.bookNameEn} ${verse.chapter}:${verse.verse}\n"${verse.textFr}"`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium"
                  >
                    Français
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI Theological Study */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {isExplaining ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-10 h-10 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-medium text-stone-600 dark:text-stone-300">
                    Consulting Berean Theological Guide with Gemini 3.7...
                  </p>
                  <p className="text-xs text-stone-400">
                    Analyzing Hebrew/Greek roots, Ge’ez context, and practical application.
                  </p>
                </div>
              ) : aiResult ? (
                <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                  
                  {/* Summary */}
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Theological Summary
                    </h4>
                    <p>{aiResult.summary}</p>
                  </div>

                  {/* Historical & Linguistic Roots */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                      <h5 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        🏛️ Historical Setting
                      </h5>
                      <p className="text-stone-600 dark:text-stone-400 text-xs">
                        {aiResult.historicalContext}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60">
                      <h5 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">
                        📜 Greek / Hebrew & Ge'ez Roots
                      </h5>
                      <p className="text-stone-600 dark:text-stone-400 text-xs">
                        {aiResult.linguisticInsights}
                      </p>
                    </div>
                  </div>

                  {/* Life Application */}
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200">
                    <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                      🌱 Personal Life Application
                    </h4>
                    <p className="text-xs sm:text-sm">{aiResult.lifeApplication}</p>
                  </div>

                  {/* Guided Prayer */}
                  {aiResult.prayer && (
                    <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 italic text-stone-700 dark:text-stone-300 text-xs sm:text-sm">
                      <span className="font-semibold not-italic text-amber-700 dark:text-amber-400 block mb-1">
                        🙏 Scripture Prayer:
                      </span>
                      "{aiResult.prayer}"
                    </div>
                  )}

                  {/* Cross References */}
                  {aiResult.crossReferences && aiResult.crossReferences.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                        Cross References:
                      </span>
                      {aiResult.crossReferences.map((ref: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono">
                          {ref}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={fetchAIExplanation}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors"
                  >
                    {user ? 'Generate AI Theological Analysis' : 'Sign In to Generate AI Theological Analysis'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Add Note / Reflection */}
          {activeTab === 'note' && (
            <form onSubmit={handleSaveNoteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                  Reflection Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e: any) => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    <option value="Reflection">Reflection (ማሰላሰያ)</option>
                    <option value="Study Note">Study Note (የጥናት ማስታወሻ)</option>
                    <option value="Sermon">Sermon (ስብከት)</option>
                    <option value="Prayer">Prayer (ጸሎት)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="Peace, Faith, Grace"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-600 dark:text-stone-300 block mb-1">
                  Your Reflection & Insights
                </label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="What is God speaking to you through this scripture? How will you apply this today?"
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('actions')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow transition-colors"
                >
                  Save Reflection to Journal
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Discord Dispatch -- admin-only, see requireAdmin in server.ts */}
          {activeTab === 'discord' && user?.isAdmin && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600 dark:text-stone-400">
                Instantly dispatch this verse card as a rich embed to your configured Discord channel.
              </p>

              <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-indigo-400">
                  <Send className="w-4 h-4" />
                  <span>Discord Embed Preview:</span>
                </div>
                <div className="p-3 bg-stone-900 rounded-lg border-l-4 border-amber-500 text-stone-200 font-mono text-[11px] leading-relaxed">
                  <div className="text-amber-400 font-bold mb-1">
                    📖 {verse.bookNameEn} {verse.chapter}:{verse.verse} | {verse.bookNameAm} {verse.chapter}:{verse.verse}
                  </div>
                  <div>"{verse.textEn}"</div>
                  <div className="mt-1 font-ethiopic text-stone-300">"{verse.textAm}"</div>
                </div>
              </div>

              {discordStatus && (
                <div className={`p-3 rounded-xl text-xs font-medium ${
                  discordStatus.includes('success') 
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                }`}>
                  {discordStatus}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSendToDiscord}
                  disabled={discordSending}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{discordSending ? 'Dispatching to Discord...' : 'Send This Verse to Discord'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
