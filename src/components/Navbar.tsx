import React from 'react';
import { BookOpen, Sparkles, Calendar, BookHeart, MessageSquare, Bot, Globe, Shield, RefreshCw, Wifi, WifiOff, Flame, User } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { useTranslation } from '../utils/translations';

interface NavbarProps {
  currentTab: 'bible' | 'devotionals' | 'plans' | 'journal' | 'discord' | 'ai';
  setCurrentTab: (tab: 'bible' | 'devotionals' | 'plans' | 'journal' | 'discord' | 'ai') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  isOnline: boolean;
  isSyncing: boolean;
  onSync: () => void;
  streakDays: number;
  user: UserProfile | null;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  isOnline,
  isSyncing,
  onSync,
  streakDays,
  user,
  onOpenAuth,
}) => {
  const t = useTranslation(lang);

  // Discord Bot Hub controls the site's one shared webhook -- it's admin
  // configuration, not a per-user feature, so regular visitors never see it
  // as a tab at all (the API rejects them too, but hiding it here means
  // they're not even invited to try).
  const navItems = [
    { id: 'bible', label: t.tabBible, icon: BookOpen },
    { id: 'devotionals', label: t.tabDevotionals, icon: Sparkles },
    { id: 'plans', label: t.tabPlans, icon: Calendar },
    { id: 'journal', label: t.tabJournal, icon: BookHeart },
    ...(user?.isAdmin ? [{ id: 'discord', label: t.tabDiscord, icon: MessageSquare }] as const : []),
    { id: 'ai', label: t.tabAICompanion, icon: Bot },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 text-stone-100 backdrop-blur-md border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setCurrentTab('bible')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 shadow-lg shadow-amber-900/30 ring-1 ring-amber-400/30 rounded-xl group-hover:scale-105 transition-transform">
              <img src="/favicon.svg" alt="Berean" className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-lg sm:text-xl font-bold tracking-wide text-amber-200">
                  BEREAN
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium font-ethiopic border border-amber-500/30">
                  መጽሐፍ ቅዱስ
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 hidden md:block">
                {lang === 'am' ? 'የእንግሊዝኛ እና የአማርኛ የጥናት መጽሐፍ ቅዱስ' : 'Bilingual Study Bible & Discord Guide'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-800/80 p-1.5 rounded-xl border border-stone-700/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm font-semibold'
                      : 'text-stone-300 hover:text-stone-100 hover:bg-stone-700/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-100' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions (Language, Online/Sync, Streak, Account) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Streak Counter */}
            <div 
              title={`${streakDays} ${t.streak}`}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-semibold"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{streakDays}</span>
            </div>

            {/* Sync Button */}
            <button
              id="sync-status-btn"
              onClick={onSync}
              title={isSyncing ? t.syncing : t.syncNow}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-stone-300 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden xl:inline">{isSyncing ? t.syncing : t.synced}</span>
            </button>

            {/* Online/Offline Status Indicator */}
            <div 
              title={isOnline ? t.onlineMode : t.offlineMode}
              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center ${
                isOnline 
                  ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' 
                  : 'bg-amber-950/50 border-amber-700/60 text-amber-300'
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            </div>

            {/* Language Switcher Dropdown / Cycling */}
            <div className="flex items-center rounded-lg bg-stone-800 border border-stone-700 p-0.5 text-xs">
              <button
                id="lang-btn-en"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  lang === 'en' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                id="lang-btn-fr"
                onClick={() => setLang('fr')}
                className={`px-2 py-1 rounded font-medium transition-colors ${
                  lang === 'fr' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
                title="Français"
              >
                FR
              </button>
              <button
                id="lang-btn-am"
                onClick={() => setLang('am')}
                className={`px-2 py-1 rounded font-medium font-ethiopic transition-colors ${
                  lang === 'am' ? 'bg-amber-600 text-white font-semibold shadow-xs' : 'text-stone-300 hover:text-white'
                }`}
                title="አማርኛ"
              >
                አማ
              </button>
            </div>

            {/* User Account / Sign In */}
            <button
              id="user-auth-btn"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-600/90 hover:bg-amber-600 border border-amber-500 text-xs font-medium text-white transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {user ? user.name.split(' ')[0] : t.signIn}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 gap-2 border-t border-stone-800/80 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200 bg-stone-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
