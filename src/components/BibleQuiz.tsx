import React, { useState } from 'react';
import {
  BookOpen, Crown, Cross, Users, PenLine, Sparkles, Brain, Trophy,
  CheckCircle2, XCircle, ArrowRight, RotateCcw,
} from 'lucide-react';
import { Language, QuizSetProgress, UserStats } from '../types';
import { QUIZ_SETS } from '../data/quizQuestions';

interface BibleQuizProps {
  lang: Language;
  stats: UserStats;
  quizProgress: Record<string, QuizSetProgress>;
  onComplete: (setId: string, correctCount: number, totalQuestions: number) => void;
}

const SET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Crown, Cross, Users, PenLine, Sparkles,
};

export const BibleQuiz: React.FC<BibleQuizProps> = ({ lang, stats, quizProgress, onComplete }) => {
  const isAm = lang === 'am';
  const [activeSetId, setActiveSetId] = useState<string | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const activeSet = QUIZ_SETS.find((s) => s.id === activeSetId);
  const currentQuestion = activeSet?.questions[questionIndex];

  const startSet = (setId: string) => {
    setActiveSetId(setId);
    setQuestionIndex(0);
    setSelectedChoice(null);
    setCorrectCount(0);
    setIsFinished(false);
  };

  const handleChoice = (index: number) => {
    if (selectedChoice !== null || !currentQuestion) return;
    setSelectedChoice(index);
    if (index === currentQuestion.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (!activeSet) return;
    if (questionIndex + 1 >= activeSet.questions.length) {
      setIsFinished(true);
      onComplete(activeSet.id, correctCount, activeSet.questions.length);
    } else {
      setQuestionIndex((i) => i + 1);
      setSelectedChoice(null);
    }
  };

  // --- Set Selection Screen ---
  if (!activeSet) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 to-stone-900 text-white shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="w-5 h-5 text-amber-200" />
              <span className="text-xs uppercase tracking-widest font-semibold text-amber-200">
                {isAm ? 'የመጽሐፍ ቅዱስ ጥያቄዎች' : 'Bite-Sized Bible Quizzes'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif-bible">
              {isAm ? 'ጥያቄ እና ትምህርት' : 'Bible Quiz'}
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
              {isAm
                ? 'አጫጭር ጥያቄዎችን በመመለስ ቅዱስ ቃልን ተማር፤ ነጥብ አግኝ፤ ተከታታይ ቀናትህንም ጠብቅ።'
                : 'Short, focused question sets to sharpen what you know -- earn XP and keep your daily streak alive.'}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/20 border border-amber-300/30 shrink-0">
            <Trophy className="w-5 h-5 text-amber-300" />
            <div>
              <div className="text-lg font-bold leading-none">{stats.quizXP}</div>
              <div className="text-[10px] uppercase tracking-wider text-amber-200">XP</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {QUIZ_SETS.map((set) => {
            const Icon = SET_ICONS[set.iconName] || BookOpen;
            const progress = quizProgress[set.id];
            return (
              <button
                key={set.id}
                onClick={() => startSet(set.id)}
                className="text-left p-6 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md hover:border-amber-400 dark:hover:border-amber-600 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                  </div>
                  {progress && (
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      {isAm ? 'ምርጥ' : 'Best'} {progress.bestScore}/{set.questions.length}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base font-serif-bible">
                  {isAm ? set.titleAm : set.titleEn}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {isAm ? set.descriptionAm : set.descriptionEn}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 text-xs">
                  <span className="text-stone-400">
                    {set.questions.length} {isAm ? 'ጥያቄዎች' : 'questions'}
                  </span>
                  <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                    {progress ? (isAm ? 'ደግመህ ሞክር' : 'Play Again') : (isAm ? 'ጀምር' : 'Start')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // --- Finished Screen ---
  if (isFinished) {
    const pct = Math.round((correctCount / activeSet.questions.length) * 100);
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 animate-in fade-in">
        <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto">
          <Trophy className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-serif-bible">
            {isAm ? 'ጥያቄው ተጠናቋል!' : 'Quiz Complete!'}
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            {isAm ? activeSet.titleAm : activeSet.titleEn}
          </p>
        </div>
        <div className="p-6 rounded-3xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 space-y-2">
          <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">
            {correctCount}/{activeSet.questions.length}
          </div>
          <div className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
            {pct}% {isAm ? 'ትክክል' : 'Correct'} &middot; +{correctCount * 10} XP
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => startSet(activeSet.id)}
            className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {isAm ? 'ደግመህ ሞክር' : 'Try Again'}
          </button>
          <button
            onClick={() => setActiveSetId(null)}
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow transition-colors"
          >
            {isAm ? 'ወደ ጥያቄዎች ተመለስ' : 'Back to Quizzes'}
          </button>
        </div>
      </div>
    );
  }

  // --- Active Question Screen ---
  const q = currentQuestion!;
  const questionText = isAm ? q.questionAm : q.questionEn;
  const choices = isAm ? q.choicesAm : q.choicesEn;
  const explanation = isAm ? q.explanationAm : q.explanationEn;
  const hasAnswered = selectedChoice !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveSetId(null)}
          className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-medium shrink-0"
        >
          {isAm ? 'ውጣ' : 'Exit'}
        </button>
        <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
          <div
            className="h-full bg-amber-600 transition-all duration-300"
            style={{ width: `${((questionIndex + (hasAnswered ? 1 : 0)) / activeSet.questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0">
          {questionIndex + 1}/{activeSet.questions.length}
        </span>
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
        <p className={`text-lg sm:text-xl text-stone-900 dark:text-stone-100 leading-relaxed font-medium ${isAm ? 'font-ethiopic' : 'font-serif-bible'}`}>
          {questionText}
        </p>

        <div className="space-y-3">
          {choices.map((choice, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = i === selectedChoice;
            let stateClasses = 'border-stone-200 dark:border-stone-700 hover:border-amber-400 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-950/20';
            if (hasAnswered) {
              if (isCorrect) {
                stateClasses = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300';
              } else if (isSelected) {
                stateClasses = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
              } else {
                stateClasses = 'border-stone-200 dark:border-stone-800 opacity-50';
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleChoice(i)}
                disabled={hasAnswered}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 text-sm sm:text-base font-medium ${stateClasses} ${isAm ? 'font-ethiopic' : ''}`}
              >
                <span>{choice}</span>
                {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {hasAnswered && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm text-stone-700 dark:text-stone-300 space-y-1 animate-in fade-in">
            {q.reference && (
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {q.reference}
              </div>
            )}
            <p className={isAm ? 'font-ethiopic' : ''}>{explanation}</p>
          </div>
        )}

        {hasAnswered && (
          <button
            onClick={handleNext}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow transition-colors flex items-center justify-center gap-2"
          >
            <span>
              {questionIndex + 1 >= activeSet.questions.length
                ? (isAm ? 'ውጤት ይመልከቱ' : 'See Results')
                : (isAm ? 'ቀጣይ' : 'Next Question')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
