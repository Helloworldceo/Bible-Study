import React, { useState } from 'react';
import { 
  X, ShieldCheck, Lock, Mail, User, Check, AlertCircle, 
  Sparkles, RefreshCw, KeyRound, LogOut
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { useTranslation } from '../utils/translations';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  user: UserProfile | null;
  onLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onRegister: (email: string, pass: string, name: string) => Promise<{ success: boolean; error?: string }>;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  user,
  onLogin,
  onRegister,
  onLogout,
}) => {
  if (!isOpen) return null;

  const t = useTranslation(lang);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (authMode === 'login') {
        const res = await onLogin(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Invalid credentials.');
        } else {
          setSuccessMsg('Successfully signed in! Your spiritual notes and plans are synced.');
          setTimeout(() => onClose(), 1500);
        }
      } else {
        const res = await onRegister(email, password, name);
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed.');
        } else {
          setSuccessMsg('Account created! Your data is now securely backed up.');
          setTimeout(() => onClose(), 1500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base sm:text-lg">
              {user ? 'Account & Privacy' : (authMode === 'login' ? t.signIn : t.createAccount)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {user ? (
            /* Logged-In User Profile Details */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-bold text-lg flex items-center justify-center shadow">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base">{user.name}</h4>
                    <p className="text-xs text-stone-500">{user.email}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                  <span>Device Sync: Active</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Connected
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
                <div className="font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[10px]">
                  Privacy & Data Guarantee
                </div>
                <p>
                  Your prayer requests, study reflections, and reading streaks are protected with end-to-end cloud encryption.
                </p>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.signOut}</span>
              </button>
            </div>
          ) : (
            /* Auth Form (Login / Register) */
            <>
              {/* Tab Switcher */}
              <div className="flex rounded-2xl bg-stone-100 dark:bg-stone-800 p-1 border border-stone-200 dark:border-stone-700 text-xs font-semibold">
                <button
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {t.signIn}
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    authMode === 'register'
                      ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {t.createAccount}
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. David Abdisa"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{authMode === 'login' ? t.signIn : t.createAccount}</span>
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
