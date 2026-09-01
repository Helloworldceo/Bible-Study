import React, { useState } from 'react';
import { 
  Calendar, CheckCircle2, Circle, BookOpen, Plus, Sparkles, 
  Flame, Award, ArrowRight, ShieldCheck, HeartHandshake, Compass, 
  Trash2, Clock, Check
} from 'lucide-react';
import { Language, StudyPlan, UserPlanProgress } from '../types';
import { PREBUILT_STUDY_PLANS, createCustomStudyPlan } from '../data/plansData';
import { BIBLE_BOOKS } from '../data/bibleData';
import { useTranslation } from '../utils/translations';
import { StorageManager } from '../utils/offlineStorage';

interface StudyPlansViewProps {
  lang: Language;
  onOpenPassageInBible: (bookId: string, chapter: number) => void;
  plansProgress: Record<string, UserPlanProgress>;
  onUpdatePlanProgress: (progress: UserPlanProgress) => void;
  customPlans: StudyPlan[];
  onSaveCustomPlan: (plan: StudyPlan) => void;
}

export const StudyPlansView: React.FC<StudyPlansViewProps> = ({
  lang,
  onOpenPassageInBible,
  plansProgress,
  onUpdatePlanProgress,
  customPlans,
  onSaveCustomPlan,
}) => {
  const t = useTranslation(lang);

  const allPlans: StudyPlan[] = [...PREBUILT_STUDY_PLANS, ...customPlans];
  const [selectedPlanId, setSelectedPlanId] = useState<string>(allPlans[0]?.id || 'plan-bible-year');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Custom Plan Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customDuration, setCustomDuration] = useState(14);
  const [selectedBooks, setSelectedBooks] = useState<string[]>(['MAT', 'ROM', 'PSA']);

  const activePlan = allPlans.find(p => p.id === selectedPlanId) || allPlans[0];
  const currentProgress: UserPlanProgress = plansProgress[activePlan.id] || {
    planId: activePlan.id,
    startDate: new Date().toISOString(),
    completedDays: [],
    completedChapters: [],
    lastReadDay: 1,
    isCompleted: false
  };

  const completedCount = currentProgress.completedDays.length;
  const progressPercent = Math.min(100, Math.round((completedCount / (activePlan.durationDays || 1)) * 100));

  const toggleDayCompletion = (dayNum: number) => {
    const updatedDays = currentProgress.completedDays.includes(dayNum)
      ? currentProgress.completedDays.filter(d => d !== dayNum)
      : [...currentProgress.completedDays, dayNum];

    const isCompleted = updatedDays.length >= activePlan.durationDays;

    const newProgress: UserPlanProgress = {
      ...currentProgress,
      completedDays: updatedDays,
      lastReadDay: dayNum,
      isCompleted,
    };

    onUpdatePlanProgress(newProgress);
    if (!currentProgress.completedDays.includes(dayNum)) {
      StorageManager.incrementStat('totalChaptersRead', 1);
    }
  };

  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || selectedBooks.length === 0) return;

    const newPlan = createCustomStudyPlan({
      title: customTitle.trim(),
      durationDays: customDuration,
      selectedBookIds: selectedBooks,
      lang: lang
    });

    onSaveCustomPlan(newPlan);
    setSelectedPlanId(newPlan.id);
    setIsCreatingCustom(false);
    setCustomTitle('');
  };

  const toggleBookSelect = (bookId: string) => {
    if (selectedBooks.includes(bookId)) {
      if (selectedBooks.length > 1) {
        setSelectedBooks(selectedBooks.filter(id => id !== bookId));
      }
    } else {
      setSelectedBooks([...selectedBooks, bookId]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-amber-200" />
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-200">
              {lang === 'am' ? 'የመንፈሳዊ ዕድገት እቅድ' : 'Spiritual Growth Journeys'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bible">
            {t.readingPlans}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
            {lang === 'am' 
              ? 'በየቀኑ መጽሐፍ ቅዱስን በማንበብ፣ በመጸለይ እና በማሰላሰል መንፈሳዊ ጉዞዎን ይከታተሉ።'
              : 'Structured daily reading plans with prayer focuses, reflection logs, and personalized progress tracking.'}
          </p>
        </div>

        <button
          id="create-custom-plan-btn"
          onClick={() => setIsCreatingCustom(true)}
          className="px-4 py-2.5 rounded-xl bg-white text-amber-800 hover:bg-amber-50 text-xs sm:text-sm font-bold shadow transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.createCustomPlan}</span>
        </button>
      </div>

      {/* Plan Selector Carousel / Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {allPlans.map((plan) => {
          const isSelected = plan.id === activePlan.id;
          const prog = plansProgress[plan.id]?.completedDays.length || 0;
          const pct = Math.round((prog / plan.durationDays) * 100);

          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`px-4 py-3 rounded-2xl border text-left whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-400/40 shadow-sm'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                  {lang === 'am' ? plan.titleAm : plan.titleEn}
                </span>
                {plan.isCustom && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-semibold">
                    Custom
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500 mt-1">
                <span>{plan.durationDays} Days</span>
                <span className="font-semibold text-amber-600">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Plan Dashboard */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8">
        
        {/* Plan Info & Progress Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-bible text-stone-900 dark:text-stone-100">
                {lang === 'am' ? activePlan.titleAm : activePlan.titleEn}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1">
                {lang === 'am' ? activePlan.descriptionAm : activePlan.descriptionEn}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-bold text-amber-600 font-serif-bible">{progressPercent}%</span>
                <span className="text-xs text-stone-400 block">{completedCount} of {activePlan.durationDays} Days</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden border border-stone-200 dark:border-stone-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Days List & Reading Schedule */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            Daily Reading Schedule & Prayer Focus
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {activePlan.days.map((dayItem) => {
              const isCompleted = currentProgress.completedDays.includes(dayItem.day);

              return (
                <div
                  key={dayItem.day}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/60 dark:border-emerald-900/40'
                      : 'bg-stone-50/60 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleDayCompletion(dayItem.day)}
                      className="mt-0.5 text-stone-400 hover:text-amber-600 transition-colors shrink-0"
                      title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 dark:fill-emerald-900" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>

                    {/* Day Content */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className={`text-base font-bold ${isCompleted ? 'line-through text-stone-400' : 'text-stone-900 dark:text-stone-100'}`}>
                            {lang === 'am' ? dayItem.titleAm : dayItem.titleEn}
                          </h4>
                          {isCompleted && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-semibold">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                          {lang === 'am' ? dayItem.devotionalSummaryAm : dayItem.devotionalSummaryEn}
                        </p>
                      </div>

                      {/* Passage Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500">Readings:</span>
                        {dayItem.passages.map((p, idx) => (
                          <button
                            key={idx}
                            onClick={() => onOpenPassageInBible(p.bookId, p.chapter)}
                            className="px-2.5 py-1 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300/60 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{p.bookNameEn} {p.chapter}</span>
                            <span className="font-ethiopic text-[11px] opacity-80">({p.bookNameAm})</span>
                          </button>
                        ))}
                      </div>

                      {/* Prayer Focus if present */}
                      {dayItem.prayerFocusEn && (
                        <div className="p-2.5 rounded-xl bg-stone-100/70 dark:bg-stone-800/60 text-xs text-stone-700 dark:text-stone-300 italic border-l-2 border-amber-500">
                          <span className="font-semibold not-italic text-amber-700 dark:text-amber-400">🙏 Prayer Focus: </span>
                          {lang === 'am' ? dayItem.prayerFocusAm : dayItem.prayerFocusEn}
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Create Custom Plan Modal */}
      {isCreatingCustom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
                  {t.createCustomPlan}
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingCustom(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePlanSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
              
              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Plan Name (e.g. My 30-Day Gospel Walk)
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. 21 Days of Grace & Prayer"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Duration (Days)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[7, 14, 21, 30, 60, 90].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setCustomDuration(d)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        customDuration === d
                          ? 'bg-amber-600 text-white border-amber-600 shadow'
                          : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                  Select Target Bible Books
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Choose which books you'd like your daily reading schedule to focus on:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 dark:border-stone-800 rounded-xl">
                  {BIBLE_BOOKS.map((b) => {
                    const isSelected = selectedBooks.includes(b.id);
                    return (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => toggleBookSelect(b.id)}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400'
                        }`}
                      >
                        <div>{b.nameEn}</div>
                        <div className="font-ethiopic text-[10px] opacity-75">{b.nameAm}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customTitle.trim() || selectedBooks.length === 0}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow transition-colors disabled:opacity-50"
                >
                  Generate Plan
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
