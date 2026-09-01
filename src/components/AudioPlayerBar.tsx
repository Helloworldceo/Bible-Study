import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, Square, SkipForward, SkipBack, Volume2, VolumeX, 
  Sparkles, Globe, Settings, ChevronUp, ChevronDown, X, Music, 
  Cpu, Radio, Layers
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

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ appLang }) => {
  const t = useTranslation(appLang);
  const [playbackState, setPlaybackState] = useState<AudioPlaybackState>(audioReader.getState());
  const [isExpanded, setIsExpanded] = useState(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1.0);

  useEffect(() => {
    const unsubscribe = audioReader.subscribe((newState) => {
      setPlaybackState(newState);
    });

    // Populate browser voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        setBrowserVoices(audioReader.getBrowserVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      unsubscribe();
    };
  }, []);

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

  const currentVoiceObj = AI_VOICES.find(v => v.id === playbackState.selectedVoiceId) || AI_VOICES[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 md:left-auto md:right-8 md:w-[38rem] z-50 rounded-2xl bg-stone-900/95 text-stone-100 backdrop-blur-xl border border-amber-500/30 shadow-2xl overflow-hidden"
      >
        {/* Subtle Top Glowing Progress / Active Indicator */}
        <div className="h-1 w-full bg-stone-800 relative overflow-hidden">
          {playbackState.isLoading ? (
            <motion.div 
              className="h-full bg-amber-500 w-1/3 rounded-full"
              animate={{ x: ['-100%', '300%'] }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            />
          ) : playbackState.isPlaying ? (
            <div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-300"
              style={{ 
                width: playbackState.totalVerses > 0 
                  ? `${((playbackState.currentVerseIndex + 1) / playbackState.totalVerses) * 100}%`
                  : '100%' 
              }}
            />
          ) : null}
        </div>

        {/* Main Compact Player Bar */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
          
          {/* Left: Animated Soundwave + Verse Title + Subtitle */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
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
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base truncate text-white">
                  {playbackState.title || (appLang === 'am' ? 'የመጽሐፍ ቅዱስ ንባብ' : appLang === 'fr' ? 'Lecture Audio des Écritures' : 'Scripture Narration')}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {playbackState.currentLanguage === 'am' ? '🇪🇹 አማርኛ' : playbackState.currentLanguage === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate mt-0.5 font-ethiopic">
                {playbackState.currentText || (playbackState.isLoading ? (appLang === 'am' ? 'ድምጽ በመዘጋጀት ላይ...' : 'Loading audio stream...') : '')}
              </p>
            </div>
          </div>

          {/* Center / Right: Primary Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Previous Verse Button */}
            <button
              onClick={() => audioReader.previousVerse()}
              disabled={playbackState.totalVerses <= 1}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Previous Verse"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              disabled={playbackState.isLoading}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/20 transition-transform active:scale-95 disabled:opacity-50"
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

            {/* Next Verse Button */}
            <button
              onClick={() => audioReader.nextVerse()}
              disabled={playbackState.totalVerses <= 1}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
              title="Next Verse"
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

            {/* Expand / Settings Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-xl border transition-colors ${
                isExpanded 
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                  : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
              }`}
              title="Audio Reader Settings"
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
              className="px-4 pb-4 pt-2 border-t border-stone-800/80 bg-stone-950/60 space-y-3.5 text-xs"
            >
              {/* Language Mode Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-stone-400 flex items-center gap-1.5 font-medium">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  {appLang === 'am' ? 'የንባብ ቋንቋ ሞድ' : 'Playback Language Mode'}:
                </span>
                <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 flex-wrap">
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
                    onClick={() => handleLangModeChange('parallel')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      playbackState.langMode === 'parallel' 
                        ? 'bg-amber-600 text-white font-semibold shadow-sm' 
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    ⚡ Parallel
                  </button>
                </div>
              </div>

              {/* Voice & Engine Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-stone-400 flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {appLang === 'am' ? 'የአንባቢ ድምጽ' : 'Narrator Voice'}:
                </span>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={playbackState.selectedVoiceId}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="bg-stone-900 border border-stone-700 text-stone-200 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <optgroup label="✨ AI Studio HD Scripture Voices">
                      {AI_VOICES.map((voice) => (
                        <option key={voice.id} value={voice.id}>
                          {appLang === 'am' ? voice.nameAm : voice.name} ({voice.gender})
                        </option>
                      ))}
                    </optgroup>
                  </select>

                  {/* Engine Toggle (AI Studio vs Web Speech) */}
                  <div className="flex items-center bg-stone-900 p-0.5 rounded-xl border border-stone-800">
                    <button
                      onClick={() => handleEngineChange('ai')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 ${
                        playbackState.engine === 'ai' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                      title="AI Studio Gemini TTS"
                    >
                      <Sparkles className="w-3 h-3" />
                      Studio AI
                    </button>
                    <button
                      onClick={() => handleEngineChange('browser')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 ${
                        playbackState.engine === 'browser' 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                      title="Native Device Speech Engine"
                    >
                      <Radio className="w-3 h-3" />
                      Browser Native
                    </button>
                  </div>
                </div>
              </div>

              {/* Speed & Volume Controls */}
              <div className="flex items-center justify-between gap-4 pt-1">
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

              {/* Helpful Voice Description */}
              <div className="text-[11px] text-stone-500 italic bg-stone-900/60 p-2 rounded-xl border border-stone-800/60">
                <span className="font-semibold text-stone-400">
                  {currentVoiceObj.name}:
                </span>{' '}
                {currentVoiceObj.description}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};
