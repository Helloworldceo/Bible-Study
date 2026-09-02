import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Language, UserProfile } from '../types';

const DISMISS_KEY = 'berean_notif_prompt_dismissed_v1';
const DISMISS_DAYS = 14;

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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function isPushSupported(): boolean {
  // iOS only supports Web Push for a PWA already added to the home screen,
  // never in a regular Safari tab -- offering it there would just fail.
  if (isIos() && !isStandalone()) return false;
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

interface NotificationPromptProps {
  lang: Language;
  user: UserProfile | null;
}

export const NotificationPrompt: React.FC<NotificationPromptProps> = ({ lang, user }) => {
  const isAm = lang === 'am';
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isPushSupported() || wasRecentlyDismissed()) return;
    if (Notification.permission === 'denied') return;

    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (!existing) setVisible(true);
    }).catch(() => {});
  }, [user]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  const handleEnable = async () => {
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;
    setSubscribing(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setError(isAm ? 'ፈቃድ አልተሰጠም።' : 'Permission was not granted.');
        setSubscribing(false);
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const token = localStorage.getItem('berean_auth_token_v1');
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ subscription }),
      });
      setVisible(false);
    } catch (err: any) {
      setError(err.message || (isAm ? 'ማንቃት አልተቻለም።' : 'Could not enable reminders.'));
    } finally {
      setSubscribing(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="px-4 sm:px-6 pt-3 max-w-3xl mx-auto animate-in fade-in">
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-600 text-white shadow-lg">
        <div className="w-9 h-9 rounded-xl shrink-0 bg-white/20 flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">
            {isAm ? 'ተከታታይ ቀናትህን አትርሳ' : "Don't lose your streak"}
          </p>
          <p className="text-xs text-amber-50 mt-0.5">
            {isAm
              ? 'ዛሬ ገና ካላነበብክ በቀን አንድ ጊዜ ብቻ አስታዋሽ እንልክልሃለን።'
              : "We'll send one reminder a day, only if you haven't read yet."}
          </p>
          {error && <p className="text-xs text-amber-100 font-medium mt-1">{error}</p>}
          <button
            onClick={handleEnable}
            disabled={subscribing}
            className="mt-2.5 px-4 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
          >
            <Bell className="w-3.5 h-3.5" />
            {subscribing ? (isAm ? 'በማንቃት ላይ...' : 'Enabling...') : (isAm ? 'አንቃ' : 'Enable Reminders')}
          </button>
        </div>
        <button onClick={dismiss} className="text-amber-100 hover:text-white shrink-0 p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
