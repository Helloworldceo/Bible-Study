import React, { useRef, useState } from 'react';
import { X, Download, Share2, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { BibleVerse, Language } from '../types';

interface VerseImageCardProps {
  verse: BibleVerse;
  lang: Language;
  onClose: () => void;
}

interface Background {
  id: string;
  name: string;
  swatch: string;
  style: React.CSSProperties;
  textClass: string;
}

const BACKGROUNDS: Background[] = [
  {
    id: 'amber',
    name: 'Amber Dawn',
    swatch: 'linear-gradient(135deg, #f59e0b, #b45309)',
    style: { background: 'linear-gradient(135deg, #fbbf24, #f59e0b 45%, #b45309)' },
    textClass: 'text-amber-50',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    swatch: 'linear-gradient(135deg, #44403c, #0c0a09)',
    style: { background: 'linear-gradient(135deg, #44403c, #1c1917 55%, #0c0a09)' },
    textClass: 'text-amber-100',
  },
  {
    id: 'parchment',
    name: 'Parchment',
    swatch: 'linear-gradient(135deg, #faf6ec, #e7d9b8)',
    style: { background: 'linear-gradient(135deg, #fdfaf3, #f3e8cf 60%, #e7d9b8)' },
    textClass: 'text-stone-900',
  },
  {
    id: 'royal',
    name: 'Royal',
    swatch: 'linear-gradient(135deg, #4c1d95, #1e1b4b)',
    style: { background: 'linear-gradient(135deg, #6d28d9, #4c1d95 55%, #1e1b4b)' },
    textClass: 'text-violet-50',
  },
  {
    id: 'forest',
    name: 'Forest',
    swatch: 'linear-gradient(135deg, #059669, #064e3b)',
    style: { background: 'linear-gradient(135deg, #10b981, #059669 55%, #064e3b)' },
    textClass: 'text-emerald-50',
  },
  {
    id: 'rose',
    name: 'Rose Dawn',
    swatch: 'linear-gradient(135deg, #fb7185, #881337)',
    style: { background: 'linear-gradient(135deg, #fda4af, #fb7185 50%, #881337)' },
    textClass: 'text-rose-50',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    swatch: 'linear-gradient(135deg, #0ea5e9, #0c4a6e)',
    style: { background: 'linear-gradient(135deg, #38bdf8, #0ea5e9 55%, #0c4a6e)' },
    textClass: 'text-sky-50',
  },
];

type TextMode = 'both' | 'en' | 'am';

export const VerseImageCard: React.FC<VerseImageCardProps> = ({ verse, lang, onClose }) => {
  const [backgroundId, setBackgroundId] = useState(lang === 'am' ? 'parchment' : 'amber');
  const [textMode, setTextMode] = useState<TextMode>(lang === 'am' ? 'am' : 'both');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const bg = BACKGROUNDS.find((b) => b.id === backgroundId) || BACKGROUNDS[0];
  const reference = `${verse.bookNameEn} ${verse.chapter}:${verse.verse}`;
  const referenceAm = `${verse.bookNameAm} ${verse.chapter}፥${verse.verse}`;

  const renderPng = async (): Promise<string> => {
    if (!cardRef.current) throw new Error('Card not ready');
    // Rasterize at 3x the on-screen size so the exported image is sharp
    // enough for a phone's own share sheet / social post, not just this
    // small on-screen preview.
    return toPng(cardRef.current, { pixelRatio: 3, cacheBust: true });
  };

  const handleSave = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const dataUrl = await renderPng();

      // On a phone, hand it to the native share sheet (Photos, Messages,
      // Instagram, etc.) when available; otherwise fall back to a plain
      // browser download.
      if (navigator.canShare && navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `${reference.replace(/[:\s]/g, '-')}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: reference, text: reference });
          setIsExporting(false);
          return;
        }
      }

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${reference.replace(/[:\s]/g, '-')}.png`;
      link.click();
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        setError('Could not create the image. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">

        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50/80 dark:bg-stone-800/80 shrink-0">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
            Save Verse as Image
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">

          {/* Live Preview */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className={`w-72 h-72 sm:w-80 sm:h-80 rounded-2xl flex flex-col items-center justify-center text-center p-8 gap-5 ${bg.textClass}`}
              style={bg.style}
            >
              <div className="space-y-3">
                {textMode !== 'am' && (
                  <p className="font-serif-bible italic text-lg sm:text-xl leading-snug" style={{ textWrap: 'balance' as any }}>
                    "{verse.textEn}"
                  </p>
                )}
                {textMode !== 'en' && (
                  <p className="font-ethiopic text-base sm:text-lg leading-snug">
                    "{verse.textAm}"
                  </p>
                )}
              </div>
              <div className="w-10 h-px bg-current opacity-40" />
              <p className="text-xs sm:text-sm font-semibold tracking-wide opacity-90">
                {textMode === 'am' ? referenceAm : reference}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-60 font-cinzel">
                Berean
              </p>
            </div>
          </div>

          {/* Language Mode */}
          <div>
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
              Text
            </label>
            <div className="flex items-center rounded-xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 text-xs w-fit">
              {(['both', 'en', 'am'] as TextMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setTextMode(m)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    textMode === m ? 'bg-amber-600 text-white shadow-sm font-semibold' : 'text-stone-600 dark:text-stone-400'
                  } ${m === 'am' ? 'font-ethiopic' : ''}`}
                >
                  {m === 'both' ? 'Bilingual' : m === 'en' ? 'English' : 'አማርኛ'}
                </button>
              ))}
            </div>
          </div>

          {/* Background Picker */}
          <div>
            <label className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-2">
              Background
            </label>
            <div className="flex flex-wrap gap-3">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBackgroundId(b.id)}
                  title={b.name}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    backgroundId === b.id ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900 scale-105' : 'border-stone-200 dark:border-stone-700'
                  }`}
                  style={{ background: b.swatch }}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>
          )}

          <button
            onClick={handleSave}
            disabled={isExporting}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : navigator.canShare ? (
              <Share2 className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Preparing...' : navigator.canShare ? 'Share Image' : 'Download Image'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
