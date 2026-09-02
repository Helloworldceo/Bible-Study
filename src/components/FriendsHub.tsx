import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserCheck, Search, Flame, Users, Trash2, Clock, Check, X } from 'lucide-react';
import { Language, UserProfile } from '../types';

interface FriendsHubProps {
  lang: Language;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onUsernameSet: (username: string) => void;
}

type Relationship = 'self' | 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends';

interface SearchResult {
  user: { userId: string; username: string; name: string };
  relationship: Relationship;
}

interface FriendRequestItem {
  requestId: number;
  userId: string;
  username: string;
  name: string;
  createdAt: string;
}

interface FriendItem {
  userId: string;
  username: string;
  name: string;
  streakDays: number;
  friendStreak: number;
  since: string;
}

const authHeaders = (): HeadersInit => {
  const token = localStorage.getItem('berean_auth_token_v1');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const FriendsHub: React.FC<FriendsHubProps> = ({ lang, user, onOpenAuth, onUsernameSet }) => {
  const isAm = lang === 'am';

  const [usernameInput, setUsernameInput] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [incoming, setIncoming] = useState<FriendRequestItem[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequestItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    try {
      const [reqRes, friendsRes] = await Promise.all([
        fetch('/api/friends/requests', { headers: authHeaders() }).then((r) => r.json()),
        fetch('/api/friends', { headers: authHeaders() }).then((r) => r.json()),
      ]);
      setIncoming(reqRes.incoming || []);
      setOutgoing(reqRes.outgoing || []);
      setFriends(friendsRes.friends || []);
    } catch {
      // best-effort -- an empty list is a safe fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.username) loadAll();
    else setLoading(false);
  }, [user?.username, loadAll]);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUsername(true);
    setUsernameError(null);
    try {
      const res = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ username: usernameInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onUsernameSet(data.username);
    } catch (err: any) {
      setUsernameError(err.message || 'Failed to save username.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await fetch(`/api/friends/search?username=${encodeURIComponent(searchQuery.trim().toLowerCase())}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err.message || 'Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (username: string) => {
    setSendingRequest(true);
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSearchResult((prev) => (prev ? { ...prev, relationship: 'pending_outgoing' } : prev));
      loadAll();
    } catch (err: any) {
      setSearchError(err.message || 'Failed to send request.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleRespond = async (requestId: number, accept: boolean) => {
    await fetch('/api/friends/respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ requestId, accept }),
    });
    loadAll();
  };

  const handleRemoveFriend = async (friendId: string) => {
    await fetch(`/api/friends/${friendId}`, { method: 'DELETE', headers: authHeaders() });
    loadAll();
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 animate-in fade-in">
        <Users className="w-12 h-12 text-stone-400 mx-auto" />
        <h2 className="text-lg font-bold text-stone-800 dark:text-stone-200">
          {isAm ? 'ጓደኞችን ለማከል መጀመሪያ ይግቡ' : 'Sign in to add friends'}
        </h2>
        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow"
        >
          {isAm ? 'ግባ' : 'Sign In'}
        </button>
      </div>
    );
  }

  if (!user.username) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-5 animate-in fade-in">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center mx-auto">
            <Users className="w-7 h-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-bible">
            {isAm ? 'የተጠቃሚ ስም ምረጥ' : 'Choose your username'}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {isAm ? 'ጓደኞችህ በዚህ ስም ሊፈልጉህና ሊጨምሩህ ይችላሉ።' : 'This is how friends will find and add you.'}
          </p>
        </div>
        <form onSubmit={handleSaveUsername} className="space-y-3">
          <input
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="e.g. dawit_b"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-center font-mono text-lg focus:ring-2 focus:ring-amber-500 outline-none"
          />
          <p className="text-[11px] text-stone-400 text-center">
            {isAm ? '3-20 ፊደላት፣ በትንሽ ፊደል፣ ቁጥር ወይም _ ብቻ' : '3-20 characters, lowercase letters, numbers, or underscore'}
          </p>
          {usernameError && <p className="text-xs text-rose-600 dark:text-rose-400 text-center font-medium">{usernameError}</p>}
          <button
            type="submit"
            disabled={savingUsername || usernameInput.length < 3}
            className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow disabled:opacity-50 transition-colors"
          >
            {savingUsername ? '...' : (isAm ? 'አስቀምጥ' : 'Save Username')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-600 to-stone-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="w-5 h-5 text-amber-200" />
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-200">
              {isAm ? 'ጓደኞች' : 'Friends'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif-bible">
            {isAm ? 'ጓደኞችህን ተከታተል' : 'Study Together'}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1">
            {isAm ? 'የተጠቃሚ ስምህ' : 'Your username'}: <span className="font-mono font-bold">@{user.username}</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3.5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAm ? 'የጓደኛህን የተጠቃሚ ስም ፈልግ...' : 'Find a friend by username...'}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-5 py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-semibold shadow disabled:opacity-50"
          >
            {isAm ? 'ፈልግ' : 'Search'}
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{searchError}</p>
        )}

        {searchResult && (
          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{searchResult.user.name}</p>
              <p className="text-xs text-stone-500 font-mono">@{searchResult.user.username}</p>
            </div>
            {searchResult.relationship === 'self' && (
              <span className="text-xs text-stone-400 shrink-0">{isAm ? 'ያ አንተው ነህ!' : "That's you!"}</span>
            )}
            {searchResult.relationship === 'none' && (
              <button
                onClick={() => handleSendRequest(searchResult.user.username)}
                disabled={sendingRequest}
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {isAm ? 'ጨምር' : 'Add Friend'}
              </button>
            )}
            {searchResult.relationship === 'pending_outgoing' && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-500 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {isAm ? 'ተልኳል' : 'Request Sent'}
              </span>
            )}
            {searchResult.relationship === 'pending_incoming' && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 shrink-0">
                {isAm ? 'ጥያቄ ልኮልሃል ⬇' : 'They already sent you a request ⬇'}
              </span>
            )}
            {searchResult.relationship === 'friends' && (
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
                {isAm ? 'ጓደኞች ናችሁ' : 'Already Friends'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Incoming Requests */}
      {incoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {isAm ? 'የመጡ ጥያቄዎች' : 'Friend Requests'} ({incoming.length})
          </h3>
          {incoming.map((r) => (
            <div key={r.requestId} className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">{r.name}</p>
                <p className="text-xs text-stone-500 font-mono">@{r.username}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleRespond(r.requestId, true)} className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => handleRespond(r.requestId, false)} className="p-2 rounded-lg bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Outgoing Requests */}
      {outgoing.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {isAm ? 'የተላኩ ጥያቄዎች' : 'Sent Requests'} ({outgoing.length})
          </h3>
          {outgoing.map((r) => (
            <div key={r.requestId} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 flex items-center justify-between gap-3 text-sm">
              <span className="text-stone-600 dark:text-stone-400 truncate">@{r.username}</span>
              <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" /> {isAm ? 'በመጠባበቅ ላይ' : 'Pending'}</span>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          {isAm ? 'ጓደኞችህ' : 'Your Friends'} ({friends.length})
        </h3>
        {loading ? (
          <p className="text-sm text-stone-400 py-6 text-center">{isAm ? 'በመጫን ላይ...' : 'Loading...'}</p>
        ) : friends.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800">
            <Users className="w-10 h-10 text-stone-300 dark:text-stone-700 mx-auto mb-2" />
            <p className="text-sm text-stone-500">
              {isAm ? 'እስካሁን ምንም ጓደኛ የለህም። ከላይ ባለው ፍለጋ ጀምር።' : 'No friends yet -- search for someone above to get started.'}
            </p>
          </div>
        ) : (
          friends.map((f) => (
            <div key={f.userId} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-stone-900 dark:text-stone-100 truncate">{f.name}</p>
                <p className="text-xs text-stone-500 font-mono">@{f.username}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {f.friendStreak > 0 && (
                  <div title={isAm ? 'የጋራ ተከታታይ ቀናት' : 'Friend streak'} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/90 border border-amber-700/50 text-amber-300 text-xs font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{f.friendStreak}</span>
                  </div>
                )}
                <div title={isAm ? 'የግል ተከታታይ ቀናት' : 'Their personal streak'} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{f.streakDays}</span>
                </div>
                <button
                  onClick={() => handleRemoveFriend(f.userId)}
                  title={isAm ? 'አስወግድ' : 'Remove friend'}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
