import React, { useState } from 'react';
import { 
  BookHeart, FileText, Heart, Plus, Search, Trash2, Edit3, 
  CheckCircle2, Sparkles, Tag, Calendar, Download, Upload, 
  ShieldCheck, RefreshCw, Check, Clock, UserCheck
} from 'lucide-react';
import { Language, NoteItem, PrayerItem, UserProfile } from '../types';
import { useTranslation } from '../utils/translations';
import { StorageManager } from '../utils/offlineStorage';

interface ReflectionsPrayerJournalProps {
  lang: Language;
  notes: NoteItem[];
  prayers: PrayerItem[];
  onSaveNote: (note: NoteItem) => void;
  onDeleteNote: (id: string) => void;
  onSavePrayer: (prayer: PrayerItem) => void;
  onDeletePrayer: (id: string) => void;
  onOpenPassageInBible: (bookId: string, chapter: number) => void;
  isSyncing: boolean;
  onManualSync: () => void;
  lastSyncedAt: string | null;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const ReflectionsPrayerJournal: React.FC<ReflectionsPrayerJournalProps> = ({
  lang,
  notes,
  prayers,
  onSaveNote,
  onDeleteNote,
  onSavePrayer,
  onDeletePrayer,
  onOpenPassageInBible,
  isSyncing,
  onManualSync,
  lastSyncedAt,
  user,
  onOpenAuth,
}) => {
  const t = useTranslation(lang);

  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'prayers' | 'sync'>('notes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // New Note Modal State
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteCategory, setNoteCategory] = useState<'Reflection' | 'Study Note' | 'Sermon' | 'Prayer'>('Reflection');
  const [noteTags, setNoteTags] = useState('Faith, Growth');

  // New Prayer Modal State
  const [isAddingPrayer, setIsAddingPrayer] = useState(false);
  const [prayerTitle, setPrayerTitle] = useState('');
  const [prayerDesc, setPrayerDesc] = useState('');
  const [prayerCategory, setPrayerCategory] = useState<'Personal' | 'Family' | 'Church' | 'Guidance' | 'Healing' | 'Thanksgiving'>('Personal');

  // Answered Prayer Testimonial Modal State
  const [answeringPrayer, setAnsweringPrayer] = useState<PrayerItem | null>(null);
  const [testimonyText, setTestimonyText] = useState('');

  // Handle Note Submission
  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const tags = noteTags.split(',').map(t => t.trim()).filter(Boolean);
    const newNote: NoteItem = {
      id: editingNoteId || `note-${Date.now()}`,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
      tags: tags,
      createdAt: editingNoteId ? (notes.find(n => n.id === editingNoteId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveNote(newNote);
    setIsAddingNote(false);
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
  };

  const handleEditNote = (note: NoteItem) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setNoteTags(note.tags.join(', '));
    setIsAddingNote(true);
  };

  // Handle Prayer Submission
  const handleSubmitPrayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerTitle.trim()) return;

    const newPrayer: PrayerItem = {
      id: `prayer-${Date.now()}`,
      title: prayerTitle.trim(),
      description: prayerDesc.trim(),
      category: prayerCategory,
      isAnswered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSavePrayer(newPrayer);
    setIsAddingPrayer(false);
    setPrayerTitle('');
    setPrayerDesc('');
    StorageManager.incrementStat('totalPrayersCount', 1);
  };

  // Handle Marking Prayer as Answered with Testimony
  const handleConfirmAnswered = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answeringPrayer) return;

    const updated: PrayerItem = {
      ...answeringPrayer,
      isAnswered: true,
      answeredDate: new Date().toISOString().split('T')[0],
      testimony: testimonyText.trim() || 'Praise God for answering this prayer in His perfect timing!',
      updatedAt: new Date().toISOString(),
    };

    onSavePrayer(updated);
    StorageManager.incrementStat('answeredPrayersCount', 1);
    setAnsweringPrayer(null);
    setTestimonyText('');
  };

  // Export Data as JSON file
  const handleExportBackup = () => {
    const data = StorageManager.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `berean-bible-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered Notes
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategoryFilter === 'all' || n.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const activePrayers = prayers.filter(p => !p.isAnswered);
  const answeredPrayers = prayers.filter(p => p.isAnswered);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-stone-900 text-stone-100 border border-stone-800 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookHeart className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-400">
              {lang === 'am' ? 'የግል ማሰላሰያ እና የጸሎት መዝገብ' : 'Spiritual Growth & Reflection'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bible">
            {t.reflectionsAndNotes}
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            {lang === 'am'
              ? 'የመጽሐፍ ቅዱስ ጥናት ማስታወሻዎችህን፣ የዕለት ጸሎቶችህን እና ምስክርነቶችህን በአንድ ላይ ጠብቅ።'
              : 'Capture biblical insights, track daily prayers, celebrate answered testimonies, and sync across all your devices.'}
          </p>
        </div>

        {/* Sync & Privacy status */}
        <div className="flex items-center gap-2">
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? t.syncing : t.syncNow}</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: (1) Notes & Reflections, (2) Prayer Journal, (3) Sync &
          Privacy -- these labels are long (counts, "Active / Answered"),
          so on a phone this scrolls horizontally as one line instead of
          each button shrinking and wrapping its text across several lines. */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-stone-200 dark:border-stone-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveSubTab('notes')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'notes'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t.notes} ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('prayers')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'prayers'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{t.dailyPrayers} ({activePrayers.length} Active / {answeredPrayers.length} Answered)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sync')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 shrink-0 whitespace-nowrap ${
            activeSubTab === 'sync'
              ? 'border-amber-600 text-amber-700 dark:text-amber-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.cloudSync} & Privacy</span>
        </button>
      </div>

      {/* SUB-TAB 1: NOTES & REFLECTIONS */}
      {activeSubTab === 'notes' && (
        <div className="space-y-6">
          
          {/* Action Bar (Search, Category Filter, Add Note Button) */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 max-w-sm relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reflections, tags, or scripture..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-700 dark:text-stone-300 outline-none"
              >
                <option value="all">All Categories</option>
                <option value="Reflection">Reflection</option>
                <option value="Study Note">Study Note</option>
                <option value="Sermon">Sermon</option>
                <option value="Prayer">Prayer</option>
              </select>

              <button
                id="add-reflection-note-btn"
                onClick={() => {
                  setEditingNoteId(null);
                  setNoteTitle('');
                  setNoteContent('');
                  setIsAddingNote(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Reflection</span>
              </button>
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16 p-8 rounded-3xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-3">
              <BookHeart className="w-12 h-12 text-stone-400 mx-auto" />
              <h3 className="font-bold text-stone-700 dark:text-stone-300 text-base">
                No Reflections or Notes Found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Begin documenting your biblical reflections or click on any verse in the reader to attach study notes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold uppercase tracking-wider">
                        {note.category}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {note.title}
                    </h3>

                    {/* Linked verse link if available */}
                    {note.bookId && note.chapter && (
                      <button
                        onClick={() => onOpenPassageInBible(note.bookId!, note.chapter!)}
                        className="text-xs text-amber-700 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        <span>📖 Passage: {note.bookId} {note.chapter}:{note.verse || 1}</span>
                      </button>
                    )}

                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>

                  {/* Tags and Action buttons */}
                  <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                        title="Edit Note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 2: PRAYER JOURNAL */}
      {activeSubTab === 'prayers' && (
        <div className="space-y-8">
          
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
              Active Prayers ({activePrayers.length})
            </h3>
            <button
              onClick={() => setIsAddingPrayer(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prayer Request</span>
            </button>
          </div>

          {/* Active Prayers List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePrayers.map((prayer) => (
              <div
                key={prayer.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold uppercase tracking-wider">
                    {prayer.category}
                  </span>
                  <button
                    onClick={() => onDeletePrayer(prayer.id)}
                    className="text-stone-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                  {prayer.title}
                </h4>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                  {prayer.description}
                </p>

                <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    Logged {new Date(prayer.createdAt).toLocaleDateString()}
                  </span>

                  <button
                    onClick={() => {
                      setAnsweringPrayer(prayer);
                      setTestimonyText('');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mark as Answered!</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Wall of Answered Prayers (Testimonies) */}
          {answeredPrayers.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                  Wall of Answered Prayers & Testimonies ({answeredPrayers.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {answeredPrayers.map((ap) => (
                  <div
                    key={ap.id}
                    className="p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold uppercase">
                        Answered on {ap.answeredDate}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>

                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                      {ap.title}
                    </h4>

                    <p className="text-xs text-stone-600 dark:text-stone-400 italic">
                      Original Prayer: "{ap.description}"
                    </p>

                    <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-900/60 text-xs text-stone-800 dark:text-stone-200">
                      <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                        🕊️ Testimony:
                      </span>
                      {ap.testimony}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUB-TAB 3: CLOUD SYNC & PRIVACY */}
      {activeSubTab === 'sync' && (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-lg">
                  Multi-Device Synchronization
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Keep your bookmarks, reflections, reading plan progress, and prayers in continuous sync.
                </p>
              </div>

              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Sync Now with Cloud'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span className="text-stone-600 dark:text-stone-400">
                  Last Synced: <strong className="text-stone-900 dark:text-stone-100">{lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Just now'}</strong>
                </span>
              </div>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Synchronized
              </span>
            </div>

            {/* Account Profile Status */}
            <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs text-stone-400 block uppercase font-bold tracking-wider">Account Status</span>
                <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm mt-0.5">
                  {user ? `${user.name} (${user.email})` : 'Connected as Active Device User'}
                </div>
              </div>

              {!user && (
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-800 dark:text-stone-200 text-xs font-semibold transition-colors"
                >
                  Sign In / Create Account
                </button>
              )}
            </div>

            {/* Offline Data Export & Import */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
              <h4 className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                Data Portability & Offline Backup
              </h4>
              <p className="text-xs text-stone-500">
                You own 100% of your spiritual reflections and study notes. Export a full offline JSON backup anytime.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleExportBackup}
                  className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup File (JSON)</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* New / Edit Note Modal */}
      {isAddingNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                {editingNoteId ? 'Edit Reflection Note' : 'New Spiritual Reflection'}
              </h3>
              <button
                onClick={() => setIsAddingNote(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitNote} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g., God's Faithfulness in Psalm 23"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={noteCategory}
                    onChange={(e: any) => setNoteCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none"
                  >
                    <option value="Reflection">Reflection (ማሰላሰያ)</option>
                    <option value="Study Note">Study Note (የጥናት ማስታወሻ)</option>
                    <option value="Sermon">Sermon (ስብከት)</option>
                    <option value="Prayer">Prayer (ጸሎት)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={noteTags}
                    onChange={(e) => setNoteTags(e.target.value)}
                    placeholder="Peace, Grace, Romans"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Content & Biblical Takeaways
                </label>
                <textarea
                  rows={5}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record your thoughts, theological notes, or prayers here..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors"
                >
                  Save Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Prayer Modal */}
      {isAddingPrayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Add Prayer Request
              </h3>
              <button
                onClick={() => setIsAddingPrayer(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPrayer} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Prayer Focus / Title
                </label>
                <input
                  type="text"
                  value={prayerTitle}
                  onChange={(e) => setPrayerTitle(e.target.value)}
                  placeholder="e.g., Spiritual Breakthrough & Wisdom in Work"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Category
                </label>
                <select
                  value={prayerCategory}
                  onChange={(e: any) => setPrayerCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100 outline-none"
                >
                  <option value="Personal">Personal (የግል)</option>
                  <option value="Family">Family (ቤተሰብ)</option>
                  <option value="Church">Church (ቤተክርስቲያን)</option>
                  <option value="Guidance">Guidance (መመሪያ)</option>
                  <option value="Healing">Healing (ፈውስ)</option>
                  <option value="Thanksgiving">Thanksgiving (ምስጋና)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Details & Specific Requests
                </label>
                <textarea
                  rows={4}
                  value={prayerDesc}
                  onChange={(e) => setPrayerDesc(e.target.value)}
                  placeholder="Share details of what you are lifting up before the Lord..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingPrayer(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors"
                >
                  Log Prayer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Answered Prayer Celebration Modal */}
      {answeringPrayer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-amber-50 dark:bg-amber-950/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-900 dark:text-amber-200 text-base">
                  Celebrate Answered Prayer!
                </h3>
              </div>
              <button
                onClick={() => setAnsweringPrayer(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAnswered} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300">
                <span className="font-bold block text-stone-900 dark:text-stone-100 mb-1">
                  {answeringPrayer.title}
                </span>
                "{answeringPrayer.description}"
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Testimony / How God Answered
                </label>
                <textarea
                  rows={4}
                  value={testimonyText}
                  onChange={(e) => setTestimonyText(e.target.value)}
                  placeholder="Describe how the Lord provided, healed, or answered this prayer request..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAnsweringPrayer(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-semibold shadow transition-colors"
                >
                  Save to Answered Wall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
