import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Language } from '../types';

const DISMISS_KEY = 'berean_install_prompt_dismissed_v1';
const DISMISS_DAYS = 14;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function wasRecentlyDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  return !Number.isNaN(dismissedAt) && Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

export const InstallPrompt: React.FC<{ lang: Language }> = ({ lang }) => {
  const isAm = lang === 'am';
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasRecentlyDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS never fires beforeinstallprompt -- Safari only supports adding to
    // the home screen through its own Share sheet, so there's nothing to
    // trigger programmatically; just point people at it.
    if (isIos()) {
      const t = setTimeout(() => setShowIosTip(true), 3000);
      return () => { clearTimeout(t); window.removeEventListener('beforeinstallprompt', handler); };
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setDismissed(true);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  if (dismissed || (!deferredPrompt && !showIosTip)) return null;

  return (
    <div className="px-4 sm:px-6 pt-3 max-w-3xl mx-auto animate-in fade-in">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-stone-900 text-stone-100 border border-stone-700 shadow-lg">
        <div className="w-9 h-9 rounded-xl shrink-0 overflow-hidden">
          <img src="/favicon.svg" alt="" className="w-full h-full" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {isAm ? 'ቤሪያን እንደ መተግበሪያ ጫን' : 'Install Berean'}
          </p>
          {deferredPrompt ? (
            <p className="text-xs text-stone-400 mt-0.5">
              {isAm ? 'በስልክህ ወይም በኮምፒውተርህ ላይ እንደ መተግበሪያ ጨምረው፤ ከመሳሪያው ማያ ገጽ በቀጥታ ክፈት።' : 'Add it to your phone or laptop and open it straight from your screen, no browser needed.'}
            </p>
          ) : (
            <p className="text-xs text-stone-400 mt-0.5 flex items-center gap-1 flex-wrap">
              {isAm ? (
                <>ከታች ያለውን <Share className="w-3.5 h-3.5 inline text-amber-400" /> ተጫን፥ ከዚያም "ወደ መነሻ ገጽ አክል" የሚለውን ምረጥ።</>
              ) : (
                <>Tap <Share className="w-3.5 h-3.5 inline text-amber-400" /> below, then "Add to Home Screen".</>
              )}
            </p>
          )}
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="mt-2.5 px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              {isAm ? 'ጫን' : 'Install'}
            </button>
          )}
        </div>
        <button onClick={dismiss} className="text-stone-500 hover:text-stone-300 shrink-0 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
