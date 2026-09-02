import React, { useState, useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft, RotateCcw, BookOpen, User, Quote } from 'lucide-react';
import { Language } from '../types';
import { BOOK_WORDS, NAME_WORDS, VERSE_PUZZLES, VersePuzzle } from '../data/wordlePuzzles';

type Category = 'books' | 'names' | 'verses';
type LetterStatus = 'correct' | 'present' | 'absent';
type GameState = 'playing' | 'won' | 'lost';

interface BibleWordleProps {
  lang: Language;
  onWin: (xpEarned: number) => void;
}

const MAX_ATTEMPTS = 6;
const XP_BY_ATTEMPT = [60, 50, 40, 30, 20, 10];

function pickWord(category: Category): { answer: string; versePuzzle: VersePuzzle | null } {
  if (category === 'books') {
    return { answer: BOOK_WORDS[Math.floor(Math.random() * BOOK_WORDS.length)], versePuzzle: null };
  }
  if (category === 'names') {
    return { answer: NAME_WORDS[Math.floor(Math.random() * NAME_WORDS.length)], versePuzzle: null };
  }
  const vp = VERSE_PUZZLES[Math.floor(Math.random() * VERSE_PUZZLES.length)];
  return { answer: vp.answer, versePuzzle: vp };
}

// Standard two-pass Wordle evaluation -- handles repeated letters correctly
// (a repeated guessed letter is only marked "present" as many times as it
// actually still appears, unmatched, in the answer).
function evaluateGuess(guess: string, answer: string): LetterStatus[] {
  const result: LetterStatus[] = new Array(guess.length).fill('absent');
  const answerLetters = answer.split('');
  const used = new Array(answer.length).fill(false);

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      used[i] = true;
    }
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    const idx = answerLetters.findIndex((ch, j) => ch === guess[i] && !used[j]);
    if (idx !== -1) {
      result[i] = 'present';
      used[idx] = true;
    }
  }
  return result;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const BibleWordle: React.FC<BibleWordleProps> = ({ lang, onWin }) => {
  const isAm = lang === 'am';
  const [category, setCategory] = useState<Category>('books');
  const [answer, setAnswer] = useState('');
  const [versePuzzle, setVersePuzzle] = useState<VersePuzzle | null>(null);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<GameState>('playing');
  const [shakeRow, setShakeRow] = useState(false);

  const startNewRound = useCallback((cat: Category) => {
    const { answer: newAnswer, versePuzzle: newVerse } = pickWord(cat);
    setAnswer(newAnswer);
    setVersePuzzle(newVerse);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
  }, []);

  useEffect(() => {
    startNewRound(category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const submitGuess = useCallback(() => {
    if (gameState !== 'playing') return;
    if (currentGuess.length !== answer.length) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 400);
      return;
    }
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === answer) {
      setGameState('won');
      onWin(XP_BY_ATTEMPT[newGuesses.length - 1] ?? 10);
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameState('lost');
    }
  }, [currentGuess, answer, guesses, gameState, onWin]);

  const handleKey = useCallback((key: string) => {
    if (gameState !== 'playing') return;
    if (key === 'ENTER') {
      submitGuess();
    } else if (key === 'BACKSPACE') {
      setCurrentGuess((g) => g.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < answer.length) {
      setCurrentGuess((g) => g + key);
    }
  }, [gameState, currentGuess, answer, submitGuess]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') handleKey('ENTER');
      else if (e.key === 'Backspace') handleKey('BACKSPACE');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKey]);

  // Best-known status per letter, for coloring the on-screen keyboard.
  const letterStatuses: Record<string, LetterStatus> = {};
  const rank: Record<LetterStatus, number> = { absent: 0, present: 1, correct: 2 };
  guesses.forEach((g) => {
    evaluateGuess(g, answer).forEach((status, i) => {
      const letter = g[i];
      if (!letterStatuses[letter] || rank[status] > rank[letterStatuses[letter]]) {
        letterStatuses[letter] = status;
      }
    });
  });

  const cellTextSize = answer.length > 10 ? 'text-sm sm:text-lg' : answer.length > 7 ? 'text-base sm:text-2xl' : 'text-xl sm:text-3xl';
  const gridMaxWidth = Math.min(answer.length * 54, 480);

  const verseTemplate = versePuzzle ? (isAm ? versePuzzle.templateAm : versePuzzle.templateEn) : '';
  const verseTemplateWithBlank = verseTemplate.replace('_____', '_'.repeat(Math.max(answer.length, 5)));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in">
      {/* Category Switcher */}
      <div className="flex flex-wrap gap-2 justify-center">
        {([
          { id: 'books' as Category, icon: BookOpen, labelEn: 'Bible Books', labelAm: 'የመጽሐፍ ቅዱስ መጻሕፍት' },
          { id: 'names' as Category, icon: User, labelEn: 'Famous Names', labelAm: 'ታዋቂ ስሞች' },
          { id: 'verses' as Category, icon: Quote, labelEn: 'Complete the Verse', labelAm: 'ጥቅሱን አጠናቅቅ' },
        ]).map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
              category === c.id
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <c.icon className="w-4 h-4" />
            <span>{isAm ? c.labelAm : c.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Clue Area */}
      {category === 'verses' && versePuzzle ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-center">
          <p className={`text-sm sm:text-base text-stone-700 dark:text-stone-300 leading-relaxed ${isAm ? 'font-ethiopic' : 'font-serif-bible italic'}`}>
            {verseTemplate.replace('_____', '_____')}
          </p>
        </div>
      ) : (
        <p className="text-center text-xs sm:text-sm text-stone-500 dark:text-stone-400">
          {category === 'books'
            ? (isAm ? `${answer.length} ፊደላት ያሉት የመጽሐፍ ቅዱስ መጽሐፍ ስም ገምት` : `Guess the ${answer.length}-letter Bible book`)
            : (isAm ? `${answer.length} ፊደላት ያለው በመጽሐፍ ቅዱስ ውስጥ ያለ ስም ገምት` : `Guess the ${answer.length}-letter Bible name`)}
        </p>
      )}

      {/* Grid */}
      <div className="mx-auto" style={{ maxWidth: gridMaxWidth }}>
        <div className="space-y-1.5">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const isCurrentRow = rowIdx === guesses.length && gameState === 'playing';
            const guess = guesses[rowIdx] ?? (isCurrentRow ? currentGuess : '');
            const statuses = rowIdx < guesses.length ? evaluateGuess(guesses[rowIdx], answer) : [];
            return (
              <div
                key={rowIdx}
                className={`grid gap-1.5 ${isCurrentRow && shakeRow ? 'animate-shake' : ''}`}
                style={{ gridTemplateColumns: `repeat(${answer.length}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: answer.length }).map((_, colIdx) => {
                  const letter = guess[colIdx] || '';
                  const status = statuses[colIdx];
                  let cellClasses = 'border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100';
                  if (status === 'correct') cellClasses = 'bg-emerald-500 border-emerald-500 text-white';
                  else if (status === 'present') cellClasses = 'bg-amber-500 border-amber-500 text-white';
                  else if (status === 'absent') cellClasses = 'bg-stone-300 dark:bg-stone-700 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300';
                  else if (letter) cellClasses = 'border-stone-400 dark:border-stone-500 text-stone-900 dark:text-stone-100';
                  return (
                    <div
                      key={colIdx}
                      className={`aspect-square flex items-center justify-center border-2 rounded-lg font-bold uppercase ${cellTextSize} ${cellClasses} transition-colors`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* End-state banner */}
      {gameState !== 'playing' && (
        <div className={`p-5 rounded-2xl text-center space-y-2 animate-in fade-in ${
          gameState === 'won'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800'
        }`}>
          <p className={`font-bold text-base ${gameState === 'won' ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'}`}>
            {gameState === 'won'
              ? (isAm ? `በ${guesses.length}/${MAX_ATTEMPTS} ሙከራ አገኘኸው! +${XP_BY_ATTEMPT[guesses.length - 1] ?? 10} XP` : `Solved in ${guesses.length}/${MAX_ATTEMPTS}! +${XP_BY_ATTEMPT[guesses.length - 1] ?? 10} XP`)
              : (isAm ? `ሙከራዎቹ አልቀዋል` : 'Out of tries')}
          </p>
          {gameState === 'lost' && (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {isAm ? 'ትክክለኛው መልስ' : 'The word was'}: <span className="font-bold">{answer}</span>
            </p>
          )}
          {versePuzzle && (
            <p className="text-xs text-stone-500 dark:text-stone-400 font-semibold">{versePuzzle.reference}</p>
          )}
          <button
            onClick={() => startNewRound(category)}
            className="mt-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow flex items-center gap-2 mx-auto transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {isAm ? 'ሌላ ቃል ገምት' : 'Play Again'}
          </button>
        </div>
      )}

      {/* On-screen Keyboard */}
      {gameState === 'playing' && (
        <div className="space-y-1.5 max-w-xl mx-auto">
          {KEYBOARD_ROWS.map((row, i) => (
            <div key={i} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((key) => {
                const status = letterStatuses[key];
                let keyClasses = 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600';
                if (status === 'correct') keyClasses = 'bg-emerald-500 text-white';
                else if (status === 'present') keyClasses = 'bg-amber-500 text-white';
                else if (status === 'absent') keyClasses = 'bg-stone-400 dark:bg-stone-800 text-white';
                const isWide = key === 'ENTER' || key === 'BACKSPACE';
                return (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={`h-11 sm:h-12 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-colors ${keyClasses} ${isWide ? 'px-2 sm:px-3 flex-[1.6]' : 'flex-1'}`}
                  >
                    {key === 'BACKSPACE' ? <Delete className="w-4 h-4" /> : key === 'ENTER' ? <CornerDownLeft className="w-4 h-4" /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
