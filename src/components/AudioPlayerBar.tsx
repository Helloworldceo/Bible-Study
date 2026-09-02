import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX,
  Sparkles, Globe, Settings, ChevronDown, Music,
  Radio, RotateCcw, RotateCw, Mic, Repeat, Moon, X as XIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  audioReader, AudioPlaybackState, AI_VOICES, AudioLangMode, AudioEngineType 
} from '../utils/audioReaderService';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';

interface AudioPlayerBarProps {
  appLang: Language;
}

function formatAudioTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ appLang }) => {
  const t = useTranslation(appLang);
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>(audioReader.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1.0);

  useEffect(() => {
    const unsubscribe = audioReader.subscribe((newState) => {
      setPlaybackState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sleep timer countdown display -- ticks once a second only while a timer
  // is actually running, independent of playback's own (pause-sensitive)
  // update cycle, since the timer itself counts down in real wall-clock
  // time regardless of pause state.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!playbackState.sleepTimerEndsAt) return;
    setNow(Date.now()); // avoid showing a stale reading from before the timer started
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [playbackState.sleepTimerEndsAt]);

  if (!playbackState.isPlaying && !playbackState.isPaused && !playbackState.isLoading) {
    return null;
  }

  const handleTogglePlay = () => {
    if (playbackState.isPlaying) {
      audioReader.pause();
    } else {
      audioReader.resume();
    }
  };

  const handleStop = () => {
    audioReader.stop();
  };

  const handleLangModeChange = (mode: AudioLangMode) => {
    audioReader.setLangMode(mode);
  };

  const handleSpeedChange = (speed: number) => {
    audioReader.setSpeed(speed);
  };

  const handleVoiceChange = (voiceId: string) => {
    audioReader.setVoice(voiceId);
  };

  const handleEngineChange = (engine: AudioEngineType) => {
    audioReader.setEngine(engine);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    audioReader.seekTo(target);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      audioReader.setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(playbackState.volume);
      audioReader.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleToggleRepeat = () => {
    audioReader.toggleRepeat();
  };

  const handleSetSleepTimer = (minutes: number) => {
    audioReader.setSleepTimer(minutes);
  };

  const handleCancelSleepTimer = () => {
    audioReader.clearSleepTimer();
  };

  const sleepSecondsLeft = playbackState.sleepTimerEndsAt
    ? Math.max(0, Math.floor((playbackState.sleepTimerEndsAt - now) / 1000))
    : null;
  const sleepTimeLabel = sleepSecondsLeft !== null
    ? `${Math.floor(sleepSecondsLeft / 60)}:${(sleepSecondsLeft % 60).toString().padStart(2, '0')}`
    : null;

  const currentVoiceObj = AI_VOICES.find(v => v.id === playbackState.selectedVoiceId) || AI_VOICES[0];
  const progressPercent = playbackState.duration > 0 
    ? (playbackState.currentTime / playbackState.duration) * 100 
    : (playbackState.totalVerses > 0 
        ? ((playbackState.currentVerseIndex + 1) / playbackState.totalVerses) * 100 
        : 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 md:left-auto md:right-8 md:w-[40rem] z-50 rounded-2xl bg-stone-900/95 text-stone-100 backdrop-blur-xl border border-amber-500/30 shadow-2xl overflow-hidden"
      >
        {/* Interactive Scrubbing Progress Bar / Timeline */}
        <div className="relative group bg-stone-800 h-1.5 hover:h-2.5 transition-all cursor-pointer">
          <input
            type="range"
            min="0"
            max={playbackState.duration || 100}
            step="0.1"
            value={playbackState.currentTime || 0}
            onChange={handleSeek}
            disabled={!playbackState.duration || playbackState.duration === 0}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Seek Audio Position"
          />
          <div 
            className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 transition-all duration-150"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
          {playbackState.isLoading && (
            <motion.div 
              className="absolute top-0 bottom-0 bg-white/40 w-1/3 rounded-full"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          )}
        </div>

        {/* Main Compact Player Bar */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          
          {/* Left: Animated Soundwave + Track Title + Time Status */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 shadow-inner">
              {playbackState.isPlaying ? (
                <div className="flex items-end justify-center gap-0.5 h-5 w-5">
                  <motion.span 
                    animate={{ height: ['20%', '90%', '30%'] }} 
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                    className="w-1 bg-amber-400 rounded-full" 
                  />
                  <motion.span 
                    animate={{ height: ['60%', '20%', '100%'] }} 
                    transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut', delay: 0.1 }}
                    className="w-1 bg-amber-400 rounded-full" 
                  />
                  <motion.span 
                    animate={{ height: ['40%', '100%', '40%'] }} 
                    transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
                    className="w-1 bg-amber-400 rounded-full" 
                  />
                  <motion.span 
                    animate={{ height: ['80%', '30%', '70%'] }} 
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.15 }}
                    className="w-1 bg-amber-400 rounded-full" 
                  />
                </div>
              ) : (
                <Music className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-sm sm:text-base truncate text-white">
                  {playbackState.title || (appLang === 'am' ? 'የመጽሐፍ ቅዱስ ንባብ' : appLang === 'fr' ? 'Lecture Audio des Écritures' : 'Scripture Narration')}
                </span>
                
                {/* Engine Badge */}
                {playbackState.engine === 'wordproject' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Mic className="w-2.5 h-2.5" />
                    WordProject
                  </span>
                ) : playbackState.engine === 'ai' ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Studio AI
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">
                    Device TTS
                  </span>
                )}

                {/* Language Tag */}
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {playbackState.currentLanguage === 'am' ? '🇪🇹 አማርኛ' : playbackState.currentLanguage === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                </span>
              </div>

              {/* Time Counter & Verse Subtitle */}
              <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                {playbackState.duration > 0 && (
                  <span className="font-mono text-amber-400 font-semibold shrink-0">
                    {formatAudioTime(playbackState.currentTime)} / {formatAudioTime(playbackState.duration)}
                  </span>
                )}
                {playbackState.currentVerse && (
                  <button
                    onClick={() => {
                      if (playbackState.currentVerseId) {
                        const el = document.getElementById(`verse-${playbackState.currentVerseId}`);
                        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] hover:bg-amber-500/40 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Click to jump to this verse in the text"
                  >
                    <span>{appLang === 'am' ? `ቁጥር ${playbackState.currentVerse.verse}` : `v.${playbackState.currentVerse.verse}`}</span>
                    {playbackState.totalVerses > 0 && (
                      <span className="opacity-70 font-normal">/{playbackState.totalVerses}</span>
                    )}
                  </button>
                )}
                <p 
                  onClick={() => {
                    if (playbackState.currentVerseId) {
                      const el = document.getElementById(`verse-${playbackState.currentVerseId}`);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="truncate font-ethiopic cursor-pointer hover:text-amber-300 transition-colors"
                  title="Click to locate this verse"
                >
                  {playbackState.currentText || (playbackState.isLoading ? (appLang === 'am' ? 'ኦዲዮ በመጫን ላይ...' : 'Loading audio track...') : '')}
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right: Primary Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* Previous Verse */}
            <button
              onClick={() => audioReader.previousVerse()}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 transition-colors"
              title="Previous Verse (ወደ ቀዳሚው ቁጥር)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => audioReader.skipSeconds(-10)}
              className="hidden sm:inline-flex p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-300 transition-colors"
              title="Rewind 10 Seconds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              disabled={playbackState.isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 transition-transform active:scale-95 disabled:opacity-50"
              title={playbackState.isPlaying ? 'Pause' : 'Play'}
            >
              {playbackState.isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full"
                />
              ) : playbackState.isPlaying ? (
                <Pause className="w-5 h-5 fill-stone-950" />
              ) : (
                <Play className="w-5 h-5 fill-stone-950 ml-0.5" />
              )}
            </button>

            {/* Fast Forward 10s */}
            <button
              onClick={() => audioReader.skipSeconds(10)}
              className="hidden sm:inline-flex p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-300 transition-colors"
              title="Fast-Forward 10 Seconds"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Next Verse */}
            <button
              onClick={() => audioReader.nextVerse()}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 transition-colors"
              title="Next Verse (ወደ ቀጣዩ ቁጥር)"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStop}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
              title="Stop & Close"
            >
              <Square className="w-4 h-4" />
            </button>

            {/* Repeat Toggle */}
            <button
              onClick={handleToggleRepeat}
              className={`p-2 rounded-xl border transition-colors ${
                playbackState.repeatMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-transparent border-transparent hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
              title={playbackState.repeatMode ? 'Repeat: On (loops this chapter)' : 'Repeat: Off'}
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Sleep Timer badge (only when active) -- opens settings to manage it */}
            {sleepTimeLabel && (
              <button
                onClick={() => setIsExpanded(true)}
                className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 text-[11px] font-mono font-semibold transition-colors hover:bg-indigo-500/25"
                title="Sleep timer active -- click to manage"
              >
                <Moon className="w-3.5 h-3.5" />
                {sleepTimeLabel}
              </button>
            )}

            {/* Expand / Settings Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl border transition-colors ${
                isExpanded 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
              }`}
              title="Audio Engine & Voice Options"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Audio Settings Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 pt-2 border-t border-stone-800/80 bg-stone-950/75 space-y-3 text-xs"
            >
              {/* Audio Source Engine Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-stone-300 flex items-center gap-1.5 font-semibold">
                    <Mic className="w-3.5 h-3.5 text-amber-400" />
                    {appLang === 'am' ? 'የድምጽ ምንጭ ሞተር' : 'Audio Engine & Source'}:
                  </span>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {playbackState.engine === 'wordproject' 
                      ? (appLang === 'am' ? '🎙️ WordProject እውነተኛ የሰው ድምጽ ንባብ (አማርኛ፣ እንግሊዝኛ፣ ፈረንሳይኛ)' : '🎙️ WordProject Authentic Human Narration (Amharic, English, French)')
                      : playbackState.engine === 'ai'
                      ? (appLang === 'am' ? '✨ Gemini Studio AI የቁጥር በቁጥር ንባብ' : '✨ Gemini Studio AI HD Verse-by-Verse Speech')
                      : (appLang === 'am' ? '📻 የብሮውዘር ድምጽ (መሣሪያ)' : '📻 Local Device Fallback TTS')}
                  </p>
                </div>

                <div className="flex items-center bg-stone-900 p-0.5 rounded-xl border border-stone-800 flex-wrap">
                  <button
                    onClick={() => handleEngineChange('wordproject')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                      playbackState.engine === 'wordproject' 
                        ? 'bg-emerald-500 text-stone-950 font-bold shadow-md shadow-emerald-500/20' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="WordProject Official Bible MP3 Recordings (Amharic, English, French)"
                  >
                    <Mic className="w-3 h-3" />
                    WordProject (Human)
                  </button>
                  <button
                    onClick={() => handleEngineChange('ai')}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all ${
                      playbackState.engine === 'ai' 
                        ? 'bg-amber-500 text-stone-950 font-bold shadow-md shadow-amber-500/20' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="AI Studio Gemini TTS Engine"
                  >
                    <Sparkles className="w-3 h-3" />
                    Studio AI (HD)
                  </button>
                  <button
                    onClick={() => handleEngineChange('browser')}
                    className={`px-2 py-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${
                      playbackState.engine === 'browser' 
                        ? 'bg-stone-800 text-stone-200 font-bold' 
                        : 'text-stone-500 hover:text-stone-300'
                    }`}
                    title="Native Device Speech Engine"
                  >
                    <Radio className="w-3 h-3" />
                    Browser Native
                  </button>
                </div>
              </div>

              {/* Language Mode Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-800/60">
                <span className="text-stone-400 flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  {appLang === 'am' ? 'የንባብ ቋንቋ' : 'Audio Language'}:
                </span>
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 flex-wrap">
                  <button
                    onClick={() => handleLangModeChange('am')}
                    className={`px-2.5 py-1 rounded-lg font-medium font-ethiopic transition-all ${
                      playbackState.langMode === 'am' 
                        ? 'bg-amber-600 text-white font-semibold shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🇪🇹 አማርኛ
                  </button>
                  <button
                    onClick={() => handleLangModeChange('en')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      playbackState.langMode === 'en' 
                        ? 'bg-amber-600 text-white font-semibold shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => handleLangModeChange('fr')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      playbackState.langMode === 'fr' 
                        ? 'bg-amber-600 text-white font-semibold shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    🇫🇷 Français
                  </button>
                  {playbackState.engine !== 'wordproject' && (
                    <button
                      onClick={() => handleLangModeChange('parallel')}
                      className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                        playbackState.langMode === 'parallel' 
                          ? 'bg-amber-600 text-white font-semibold shadow-sm' 
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      ⚡ Parallel
                    </button>
                  )}
                </div>
              </div>

              {/* AI Voice Selector (If AI Engine Active) */}
              {playbackState.engine === 'ai' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-stone-800/60">
                  <span className="text-stone-400 flex items-center gap-1.5 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {appLang === 'am' ? 'የአንባቢ ድምጽ' : 'AI Voice Persona'}:
                  </span>
                  <select
                    value={playbackState.selectedVoiceId}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="bg-stone-900 border border-amber-500/40 text-amber-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                  >
                    {AI_VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {appLang === 'am' ? voice.nameAm : voice.name} ({voice.gender})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Speed & Volume Controls */}
              <div className="flex items-center justify-between gap-4 pt-2 border-t border-stone-800/60">
                {/* Speed selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-stone-400">{appLang === 'am' ? 'ፍጥነት' : 'Speed'}:</span>
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        playbackState.speed === speed 
                          ? 'bg-amber-500 text-stone-950' 
                          : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToggleMute}
                    className="text-stone-400 hover:text-stone-200"
                  >
                    {isMuted || playbackState.volume === 0 ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : playbackState.volume}
                    onChange={(e) => {
                      setIsMuted(false);
                      audioReader.setVolume(parseFloat(e.target.value));
                    }}
                    className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
                  />
                </div>
              </div>

              {/* Sleep Timer -- stop playback automatically after N minutes,
                  regardless of pause/resume in between. Pairs with Repeat
                  above for "loop this chapter until I fall asleep." */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-stone-800/60">
                <span className="text-stone-400 flex items-center gap-1.5 font-medium shrink-0">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  {appLang === 'am' ? 'የመተኛ ሰዓት ቆጣሪ' : appLang === 'fr' ? 'Minuterie de sommeil' : 'Sleep Timer'}:
                </span>

                {sleepTimeLabel ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-400/40 text-indigo-300 font-mono font-semibold text-xs">
                      {appLang === 'am' ? `${sleepTimeLabel} ቀርቷል` : appLang === 'fr' ? `${sleepTimeLabel} restant` : `${sleepTimeLabel} left`}
                    </span>
                    <button
                      onClick={() => audioReader.extendSleepTimer(10)}
                      className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-stone-900 text-stone-300 hover:text-stone-100 border border-stone-800 transition-colors"
                      title={appLang === 'am' ? '10 ደቂቃ ጨምር' : 'Add 10 more minutes'}
                    >
                      +10 {appLang === 'am' ? 'ደቂ' : 'min'}
                    </button>
                    <button
                      onClick={handleCancelSleepTimer}
                      className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-rose-300 border border-stone-800 transition-colors"
                      title={appLang === 'am' ? 'ሰርዝ' : 'Cancel timer'}
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 flex-wrap">
                    {[5, 15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => handleSetSleepTimer(mins)}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-all"
                        title={`${appLang === 'am' ? 'ካሁን ጀምሮ' : 'Stop playback after'} ${mins} ${appLang === 'am' ? 'ደቂቃ' : 'min'}`}
                      >
                        {mins}{appLang === 'am' ? 'ደ' : 'm'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* WordProject attribution banner */}
              {playbackState.engine === 'wordproject' && (
                <div className="text-[11px] text-stone-400 bg-emerald-950/30 border border-emerald-500/20 p-2 rounded-xl flex items-center justify-between">
                  <span>🎙️ Audio recordings provided by <strong>WordProject.org</strong> (Talking Bibles & English audio archives).</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
