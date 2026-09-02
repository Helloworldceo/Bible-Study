import { BibleVerse } from '../types';

export type AudioEngineType = 'wordproject' | 'ai' | 'browser';
export type AudioLangMode = 'am' | 'en' | 'fr' | 'parallel';

export const BIBLE_BOOK_ORDER_MAP: Record<string, number> = {
  GEN: 1, EXO: 2, LEV: 3, NUM: 4, DEU: 5,
  JOS: 6, JDG: 7, RUT: 8, '1SA': 9, '2SA': 10,
  '1KI': 11, '2KI': 12, '1CH': 13, '2CH': 14, EZR: 15,
  NEH: 16, EST: 17, JOB: 18, PSA: 19, PRO: 20,
  ECC: 21, SNG: 22, ISA: 23, JER: 24, LAM: 25,
  EZK: 26, DAN: 27, HOS: 28, JOL: 29, AMO: 30,
  OBA: 31, JON: 32, MIC: 33, NAM: 34, HAB: 35,
  ZEP: 36, HAG: 37, ZEC: 38, MAL: 39, MAT: 40,
  MRK: 41, LUK: 42, JHN: 43, ACT: 44, ROM: 45,
  '1CO': 46, '2CO': 47, GAL: 48, EPH: 49, PHP: 50,
  COL: 51, '1TH': 52, '2TH': 53, '1TI': 54, '2TI': 55,
  TIT: 56, PHM: 57, HEB: 58, JAS: 59, '1PE': 60,
  '2PE': 61, '1JN': 62, '2JN': 63, '3JN': 64, JUD: 65,
  REV: 66
};

export interface AudioVoiceOption {
  id: string;
  name: string;
  nameAm: string;
  nameFr?: string;
  gender: 'female' | 'male';
  type: 'ai' | 'browser' | 'wordproject';
  lang: 'am' | 'en' | 'fr' | 'multi';
  description: string;
}

export const AI_VOICES: AudioVoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore (Warm & Peaceful)',
    nameAm: 'ኮሬ (ሞቅ ያለ እና ሰላማዊ)',
    nameFr: 'Kore (Chaleureuse & Paisible)',
    gender: 'female',
    type: 'ai',
    lang: 'multi',
    description: 'Natural, warm, and reverent tone suited for contemplative Scripture reading.'
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (Deep & Resonant)',
    nameAm: 'ፌንሪር (ጥልቅ እና ግርማዊ)',
    nameFr: 'Fenrir (Profond & Résonant)',
    gender: 'male',
    type: 'ai',
    lang: 'multi',
    description: 'Rich, authoritative, and resonant voice for Old & New Testament reading.'
  },
  {
    id: 'Puck',
    name: 'Puck (Clear & Articulate)',
    nameAm: 'ፑክ (ግልጽ እና የተረጋጋ)',
    nameFr: 'Puck (Clair & Articulé)',
    gender: 'male',
    type: 'ai',
    lang: 'multi',
    description: 'Crisp narration voice with excellent pacing and diction.'
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (Gentle & Meditative)',
    nameAm: 'ዜፊር (ለስላሳ እና መንፈሳዊ)',
    nameFr: 'Zephyr (Doux & Méditatif)',
    gender: 'female',
    type: 'ai',
    lang: 'multi',
    description: 'Soft, soothing tone optimal for prayer, Psalms, and evening devotions.'
  },
  {
    id: 'Charon',
    name: 'Charon (Traditional Narrator)',
    nameAm: 'ካሮን (ባህላዊ አንባቢ)',
    nameFr: 'Charon (Narrateur Classique)',
    gender: 'male',
    type: 'ai',
    lang: 'multi',
    description: 'Classic narrator voice with steady rhythm.'
  }
];

export interface VerseTiming {
  verseId: string;
  verseIndex: number;
  verseNum: number;
  startTime: number;
  endTime: number;
}

export interface AudioPlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentVerseId: string | null;
  currentVerseIndex: number;
  totalVerses: number;
  currentVerse: BibleVerse | null;
  currentLanguage: 'am' | 'en' | 'fr';
  langMode: AudioLangMode;
  speed: number;
  engine: AudioEngineType;
  selectedVoiceId: string;
  currentText: string;
  title: string;
  volume: number;
  currentTime: number;
  duration: number;
  audioSourceUrl: string | null;
  isWordProjectAudio: boolean;
  currentBookId?: string;
  currentChapter?: number;
  error: string | null;
  /** When on, the current chapter/playlist restarts from the beginning
   *  instead of stopping when it finishes -- pairs with the sleep timer
   *  for "loop this chapter until I fall asleep" use. */
  repeatMode: boolean;
  /** Wall-clock timestamp (ms) the sleep timer will fire at, or null if
   *  none is set. Counts down in real time regardless of pause state. */
  sleepTimerEndsAt: number | null;
}

type StateListener = (state: AudioPlaybackState) => void;

class AudioReaderService {
  private audioElement: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCache: Map<string, string> = new Map(); // key -> dataUrl
  private listeners: Set<StateListener> = new Set();

  private playlist: BibleVerse[] = [];
  private currentPlaylistIndex: number = 0;
  private isParallelPhaseTwo: boolean = false; // in parallel mode, phase 1 is EN, phase 2 is AM
  private verseTimings: VerseTiming[] = [];
  private pendingSeekVerseIndex: number | null = null;
  private sleepTimerId: ReturnType<typeof setTimeout> | null = null;

  private state: AudioPlaybackState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentVerseId: null,
    currentVerseIndex: 0,
    totalVerses: 0,
    currentVerse: null,
    currentLanguage: 'am',
    langMode: 'am',
    speed: 1.0,
    engine: 'wordproject', // WordProject Human audio default
    selectedVoiceId: 'Kore',
    currentText: '',
    title: '',
    volume: 1.0,
    currentTime: 0,
    duration: 0,
    audioSourceUrl: null,
    isWordProjectAudio: false,
    error: null,
    repeatMode: false,
    sleepTimerEndsAt: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.preload = 'auto';
      this.audioElement.onended = () => this.handleTrackEnded();
      this.audioElement.onerror = (e) => this.handleAudioElementError(e);
      
      this.audioElement.ontimeupdate = () => {
        if (this.audioElement) {
          const cTime = this.audioElement.currentTime || 0;
          const dur = this.audioElement.duration || 0;
          this.state.currentTime = cTime;
          this.state.duration = dur;

          // If tracking WordProject audio, update active verse in real-time
          if (this.state.isWordProjectAudio && this.verseTimings.length > 0) {
            this.syncWordProjectVerse(cTime);
          }

          this.notifyThrottled();
        }
      };

      this.audioElement.onloadedmetadata = () => {
        if (this.audioElement) {
          const dur = this.audioElement.duration || 0;
          this.state.duration = dur;
          if (this.state.isWordProjectAudio && this.playlist.length > 0) {
            this.recomputeVerseTimings(dur);
            if (this.pendingSeekVerseIndex !== null) {
              const idx = this.pendingSeekVerseIndex;
              this.pendingSeekVerseIndex = null;
              this.seekToVerse(idx);
            }
          }
          this.notify();
        }
      };

      this.audioElement.onwaiting = () => {
        this.state.isLoading = true;
        this.notify();
      };

      this.audioElement.oncanplay = () => {
        this.state.isLoading = false;
        this.notify();
      };
    }
  }

  private lastNotifyTime = 0;
  private notifyThrottled() {
    const now = Date.now();
    if (now - this.lastNotifyTime > 150) {
      this.lastNotifyTime = now;
      this.notify();
    }
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const cloned = { ...this.state };
    this.listeners.forEach((listener) => listener(cloned));
  }

  public getState(): AudioPlaybackState {
    return { ...this.state };
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.audioElement) {
      this.audioElement.playbackRate = speed;
    }
    this.notify();
  }

  public setVolume(volume: number) {
    this.state.volume = Math.max(0, Math.min(1, volume));
    if (this.audioElement) {
      this.audioElement.volume = this.state.volume;
    }
    this.notify();
  }

  public setVoice(voiceId: string) {
    this.state.selectedVoiceId = voiceId;
    this.notify();
  }

  public setLangMode(mode: AudioLangMode) {
    this.state.langMode = mode;
    this.notify();
  }

  public setRepeatMode(on: boolean) {
    this.state.repeatMode = on;
    this.notify();
  }

  public toggleRepeat() {
    this.setRepeatMode(!this.state.repeatMode);
  }

  /** Set (or clear, with null/0) a sleep timer: playback pauses -- not
   *  resets -- after `minutes` of real time, regardless of pause/resume
   *  in between. Setting a new value replaces any timer already running. */
  public setSleepTimer(minutes: number | null) {
    if (this.sleepTimerId) {
      clearTimeout(this.sleepTimerId);
      this.sleepTimerId = null;
    }
    if (!minutes || minutes <= 0) {
      this.state.sleepTimerEndsAt = null;
      this.notify();
      return;
    }
    const ms = minutes * 60_000;
    this.state.sleepTimerEndsAt = Date.now() + ms;
    this.notify();
    this.sleepTimerId = setTimeout(() => {
      this.sleepTimerId = null;
      this.state.sleepTimerEndsAt = null;
      this.pause();
      this.notify();
    }, ms);
  }

  public clearSleepTimer() {
    this.setSleepTimer(null);
  }

  /** Add more time to whatever sleep timer (if any) is already running. */
  public extendSleepTimer(additionalMinutes: number) {
    const remainingMs = this.state.sleepTimerEndsAt ? Math.max(0, this.state.sleepTimerEndsAt - Date.now()) : 0;
    this.setSleepTimer(remainingMs / 60_000 + additionalMinutes);
  }

  public setEngine(engine: AudioEngineType) {
    this.state.engine = engine;
    this.notify();
  }

  public seekTo(seconds: number) {
    if (this.audioElement && this.audioElement.duration) {
      const target = Math.max(0, Math.min(seconds, this.audioElement.duration));
      this.audioElement.currentTime = target;
      this.state.currentTime = target;
      if (this.state.isWordProjectAudio && this.verseTimings.length > 0) {
        this.syncWordProjectVerse(target);
      }
      this.notify();
    }
  }

  public skipSeconds(delta: number) {
    if (this.audioElement) {
      const target = Math.max(0, Math.min((this.audioElement.currentTime || 0) + delta, this.audioElement.duration || 9999));
      this.audioElement.currentTime = target;
      this.state.currentTime = target;
      if (this.state.isWordProjectAudio && this.verseTimings.length > 0) {
        this.syncWordProjectVerse(target);
      }
      this.notify();
    }
  }

  // Calculate verse timestamps based on text weight distribution
  private recomputeVerseTimings(totalDuration: number) {
    if (!this.playlist || this.playlist.length === 0) return;
    const dur = totalDuration > 10 ? totalDuration : this.playlist.length * 5; // fallback estimate
    const introOffset = 3.2; // approx 3.2s spoken intro (e.g. "መጽሐፈ ዘፍጥረት ምዕራፍ አንድ")
    const availableDuration = Math.max(5, dur - introOffset);

    // Calculate weight per verse in the active language
    const weights = this.playlist.map((verse) => {
      let text = verse.textAm;
      if (this.state.currentLanguage === 'en') text = verse.textEn;
      if (this.state.currentLanguage === 'fr') text = verse.textFr || verse.textEn;
      // Weight by length + small constant base per verse for pauses
      return Math.max(15, (text || '').length) + 10;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const timings: VerseTiming[] = [];
    let accTime = introOffset;

    for (let i = 0; i < this.playlist.length; i++) {
      const v = this.playlist[i];
      const verseDuration = (weights[i] / totalWeight) * availableDuration;
      const startTime = i === 0 ? 0 : accTime;
      const endTime = i === this.playlist.length - 1 ? dur : accTime + verseDuration;

      timings.push({
        verseId: v.id,
        verseIndex: i,
        verseNum: v.verse,
        startTime: startTime,
        endTime: endTime
      });

      accTime += verseDuration;
    }

    this.verseTimings = timings;
  }

  // Real-time synchronization of active verse during WordProject audio playback
  private syncWordProjectVerse(currentTime: number) {
    if (!this.verseTimings || this.verseTimings.length === 0) return;

    let matchedTiming = this.verseTimings.find(t => currentTime >= t.startTime && currentTime < t.endTime);
    if (!matchedTiming) {
      if (currentTime >= (this.verseTimings[this.verseTimings.length - 1]?.endTime || 0)) {
        matchedTiming = this.verseTimings[this.verseTimings.length - 1];
      } else {
        matchedTiming = this.verseTimings[0];
      }
    }

    if (matchedTiming && matchedTiming.verseId !== this.state.currentVerseId) {
      const verse = this.playlist[matchedTiming.verseIndex];
      this.currentPlaylistIndex = matchedTiming.verseIndex;
      this.state.currentVerseId = matchedTiming.verseId;
      this.state.currentVerseIndex = matchedTiming.verseIndex;
      this.state.currentVerse = verse || null;

      if (verse) {
        let text = verse.textAm;
        if (this.state.currentLanguage === 'en') text = verse.textEn;
        if (this.state.currentLanguage === 'fr') text = verse.textFr || verse.textEn;
        this.state.currentText = text;
      }
    }
  }

  // Seek immediately to a specific verse (works for WordProject, AI, and Browser)
  public seekToVerse(verseIndexOrId: number | string) {
    let targetIndex = 0;
    if (typeof verseIndexOrId === 'number') {
      targetIndex = Math.max(0, Math.min(verseIndexOrId, this.playlist.length - 1));
    } else {
      const foundIdx = this.playlist.findIndex(v => v.id === verseIndexOrId);
      if (foundIdx >= 0) targetIndex = foundIdx;
    }

    if (this.state.isWordProjectAudio && this.audioElement) {
      if (this.verseTimings.length > 0 && this.verseTimings[targetIndex]) {
        const targetTime = Math.max(0, this.verseTimings[targetIndex].startTime);
        this.audioElement.currentTime = targetTime;
        this.state.currentTime = targetTime;
        this.syncWordProjectVerse(targetTime);
        this.notify();
      } else {
        this.pendingSeekVerseIndex = targetIndex;
      }
    } else if (this.state.engine === 'ai' || this.state.engine === 'browser') {
      this.currentPlaylistIndex = targetIndex;
      this.isParallelPhaseTwo = false;
      this.playCurrentQueueItem();
    }
  }

  // Get WordProject audio URL for book and chapter
  public getWordProjectAudioUrl(bookId: string, chapter: number, lang: 'am' | 'en' | 'fr' = 'am'): string {
    const bookNum = BIBLE_BOOK_ORDER_MAP[bookId.toUpperCase()] || 1;
    return `/api/audio/wordproject/${lang}/${bookNum}/${chapter}`;
  }

  // Play a full chapter directly using WordProject Human Narration with Verse Tracking
  public async playWordProjectChapter(
    bookId: string,
    chapter: number,
    lang: 'am' | 'en' | 'fr' = 'am',
    bookName?: string,
    verses: BibleVerse[] = [],
    startVerseIndex: number = 0
  ) {
    this.stop();
    const bookNum = BIBLE_BOOK_ORDER_MAP[bookId.toUpperCase()] || 1;
    const streamUrl = `/api/audio/wordproject/${lang}/${bookNum}/${chapter}`;
    
    let langLabel = 'Amharic (አማርኛ)';
    if (lang === 'en') langLabel = 'English';
    if (lang === 'fr') langLabel = 'Français (Louis Segond)';

    const displayTitle = `${bookName || bookId} ${chapter} • ${langLabel} (WordProject Human Audio)`;

    this.playlist = verses;
    this.currentPlaylistIndex = startVerseIndex;
    this.state.engine = 'wordproject';
    this.state.isWordProjectAudio = true;
    this.state.audioSourceUrl = streamUrl;
    this.state.currentBookId = bookId;
    this.state.currentChapter = chapter;
    this.state.currentLanguage = lang;
    this.state.langMode = lang;
    this.state.title = displayTitle;
    this.state.totalVerses = verses.length;
    this.state.currentVerse = verses[startVerseIndex] || null;
    this.state.currentVerseId = verses[startVerseIndex]?.id || null;
    this.state.currentVerseIndex = startVerseIndex;
    this.state.currentText = verses.length > 0 ? (lang === 'am' ? verses[startVerseIndex].textAm : (lang === 'fr' ? (verses[startVerseIndex].textFr || verses[startVerseIndex].textEn) : verses[startVerseIndex].textEn)) : '';
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.isLoading = true;
    this.state.currentTime = 0;
    this.state.duration = 0;
    this.state.error = null;

    // Pre-calculate estimated timings
    this.recomputeVerseTimings(verses.length * 6);
    this.notify();

    if (this.audioElement) {
      this.audioElement.src = streamUrl;
      this.audioElement.playbackRate = this.state.speed;
      this.audioElement.volume = this.state.volume;

      try {
        await this.audioElement.play();
        this.state.isLoading = false;
        this.state.isPlaying = true;
        
        if (startVerseIndex > 0) {
          this.seekToVerse(startVerseIndex);
        }
        this.notify();
      } catch (err: any) {
        console.warn('WordProject audio playback failed, trying direct WordProject CDN:', err);
        const wpLangId = lang === 'am' ? 17 : (lang === 'fr' ? 7 : 1);
        const directUrl = `https://www.wordproaudio.net/bibles/app/audio/${wpLangId}/${bookNum}/${chapter}.mp3`;
        if (this.audioElement) {
          this.audioElement.src = directUrl;
          try {
            await this.audioElement.play();
            this.state.isLoading = false;
            this.state.isPlaying = true;
            if (startVerseIndex > 0) {
              this.seekToVerse(startVerseIndex);
            }
            this.notify();
          } catch (directErr) {
            console.error('Direct WordProject playback failed, falling back to AI:', directErr);
            this.state.engine = 'ai';
            this.state.isWordProjectAudio = false;
            if (verses.length > 0) {
              this.playChapter(verses, startVerseIndex, lang, displayTitle);
            }
          }
        }
      }
    }
  }

  // Play a single verse
  public async playVerse(verse: BibleVerse, langMode?: AudioLangMode) {
    this.stop();
    this.playlist = [verse];
    this.currentPlaylistIndex = 0;
    this.isParallelPhaseTwo = false;
    this.state.isWordProjectAudio = false;
    if (langMode) {
      this.state.langMode = langMode;
    }
    this.state.totalVerses = 1;
    this.playCurrentQueueItem();
  }

  // Play an entire chapter starting from a given index
  public async playChapter(
    verses: BibleVerse[],
    startIndex: number = 0,
    langMode?: AudioLangMode,
    title?: string
  ) {
    if (!verses || verses.length === 0) return;

    const activeMode = langMode || this.state.langMode;
    const targetLang: 'am' | 'en' | 'fr' = (activeMode === 'am' || activeMode === 'fr' || activeMode === 'en') 
      ? activeMode 
      : 'am';

    // If WordProject engine is selected and we have chapter info, play authentic WordProject human audio!
    if (this.state.engine === 'wordproject' && verses[0]?.bookId && verses[0]?.chapter) {
      const bookId = verses[0].bookId;
      const chapter = verses[0].chapter;
      const bookName = targetLang === 'am' ? verses[0].bookNameAm : (targetLang === 'fr' ? (verses[0].bookNameFr || verses[0].bookNameEn) : verses[0].bookNameEn);
      await this.playWordProjectChapter(bookId, chapter, targetLang, bookName, verses, startIndex);
      return;
    }

    this.stop();
    this.state.isWordProjectAudio = false;
    this.playlist = [...verses];
    this.currentPlaylistIndex = Math.max(0, Math.min(startIndex, verses.length - 1));
    this.isParallelPhaseTwo = false;
    if (langMode) {
      this.state.langMode = langMode;
    }
    this.state.totalVerses = verses.length;
    if (title) {
      this.state.title = title;
    }
    this.playCurrentQueueItem();
  }

  // Play custom text (e.g. daily devotional, prayer, or theological answer)
  public async playCustomText(
    text: string,
    lang: 'am' | 'en' | 'fr',
    title: string
  ) {
    this.stop();
    this.playlist = [];
    this.state.isWordProjectAudio = false;
    this.state.totalVerses = 1;
    this.state.currentVerseIndex = 0;
    this.state.currentVerse = null;
    this.state.currentVerseId = 'custom';
    this.state.currentLanguage = lang;
    this.state.currentText = text;
    this.state.title = title;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.isLoading = true;
    this.state.error = null;
    this.notify();

    await this.speakText(text, lang, title);
  }

  private async playCurrentQueueItem() {
    if (this.currentPlaylistIndex >= this.playlist.length || this.currentPlaylistIndex < 0) {
      this.stop();
      return;
    }

    const verse = this.playlist[this.currentPlaylistIndex];
    this.state.currentVerse = verse;
    this.state.currentVerseId = verse.id;
    this.state.currentVerseIndex = this.currentPlaylistIndex;
    this.state.totalVerses = this.playlist.length;
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.isLoading = true;
    this.state.error = null;

    let textToSpeak = '';
    let languageToSpeak: 'am' | 'en' | 'fr' = 'en';

    if (this.state.langMode === 'am') {
      textToSpeak = verse.textAm;
      languageToSpeak = 'am';
      this.state.title = `${verse.bookNameAm} ${verse.chapter}:${verse.verse}`;
    } else if (this.state.langMode === 'fr') {
      textToSpeak = verse.textFr || verse.textEn;
      languageToSpeak = 'fr';
      this.state.title = `${verse.bookNameFr || verse.bookNameEn} ${verse.chapter}:${verse.verse}`;
    } else if (this.state.langMode === 'en') {
      textToSpeak = verse.textEn;
      languageToSpeak = 'en';
      this.state.title = `${verse.bookNameEn} ${verse.chapter}:${verse.verse}`;
    } else {
      // Parallel mode: Phase 1 is English, Phase 2 is Amharic
      if (!this.isParallelPhaseTwo) {
        textToSpeak = verse.textEn;
        languageToSpeak = 'en';
        this.state.title = `${verse.bookNameEn} ${verse.chapter}:${verse.verse} (English)`;
      } else {
        textToSpeak = verse.textAm;
        languageToSpeak = 'am';
        this.state.title = `${verse.bookNameAm} ${verse.chapter}:${verse.verse} (አማርኛ)`;
      }
    }

    this.state.currentLanguage = languageToSpeak;
    this.state.currentText = textToSpeak;
    this.notify();

    await this.speakText(textToSpeak, languageToSpeak, this.state.title);
  }

  private async speakText(text: string, lang: 'am' | 'en' | 'fr', title: string) {
    // If AI Engine or default, attempt AI TTS endpoint
    if (this.state.engine === 'ai' || this.state.engine === 'wordproject') {
      const cacheKey = `${lang}_${this.state.selectedVoiceId}_${text.trim()}`;
      if (this.audioCache.has(cacheKey)) {
        this.playAudioUrl(this.audioCache.get(cacheKey)!);
        return;
      }

      try {
        const token = localStorage.getItem('berean_auth_token_v1');
        const res = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            text: text,
            lang: lang,
            voice: this.state.selectedVoiceId,
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            const dataUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
            this.audioCache.set(cacheKey, dataUrl);
            this.playAudioUrl(dataUrl);
            // Preload next verse in background for smooth playback
            this.prefetchNextInQueue();
            return;
          }
        }
      } catch (err) {
        console.warn('AI TTS fetch failed, falling back to Web Speech API:', err);
      }
    }

    // Fallback or explicit Browser Web Speech API
    this.speakWithBrowserWebSpeech(text, lang);
  }

  private async prefetchNextInQueue() {
    if (this.state.engine !== 'ai') return;
    
    // Determine next text and language to prefetch
    let nextText = '';
    let nextLang: 'am' | 'en' | 'fr' = 'en';

    if (this.state.langMode === 'parallel') {
      if (!this.isParallelPhaseTwo && this.playlist[this.currentPlaylistIndex]) {
        nextText = this.playlist[this.currentPlaylistIndex].textAm;
        nextLang = 'am';
      } else if (this.currentPlaylistIndex < this.playlist.length - 1) {
        nextText = this.playlist[this.currentPlaylistIndex + 1].textEn;
        nextLang = 'en';
      }
    } else if (this.currentPlaylistIndex < this.playlist.length - 1) {
      const nextVerse = this.playlist[this.currentPlaylistIndex + 1];
      if (this.state.langMode === 'am') {
        nextText = nextVerse.textAm;
        nextLang = 'am';
      } else if (this.state.langMode === 'fr') {
        nextText = nextVerse.textFr || nextVerse.textEn;
        nextLang = 'fr';
      } else {
        nextText = nextVerse.textEn;
        nextLang = 'en';
      }
    }

    if (!nextText) return;
    const cacheKey = `${nextLang}_${this.state.selectedVoiceId}_${nextText.trim()}`;
    if (this.audioCache.has(cacheKey)) return;

    try {
      const token = localStorage.getItem('berean_auth_token_v1');
      const res = await fetch('/api/audio/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: nextText,
          lang: nextLang,
          voice: this.state.selectedVoiceId,
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          this.audioCache.set(cacheKey, `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        }
      }
    } catch {
      // Background prefetch error is non-blocking
    }
  }

  private playAudioUrl(dataUrl: string) {
    if (!this.audioElement) return;

    this.audioElement.src = dataUrl;
    this.audioElement.playbackRate = this.state.speed;
    this.audioElement.volume = this.state.volume;
    
    this.audioElement.play().then(() => {
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    }).catch((err) => {
      console.warn('Audio element play error, falling back to speech synthesis:', err);
      this.speakWithBrowserWebSpeech(this.state.currentText, this.state.currentLanguage);
    });
  }

  private speakWithBrowserWebSpeech(text: string, lang: 'am' | 'en' | 'fr') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.state.error = 'Speech synthesis not supported on this device.';
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.notify();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.state.speed;
    utterance.volume = this.state.volume;

    // Pick best available voice for language
    const voices = window.speechSynthesis.getVoices();
    if (lang === 'am') {
      const amVoice = voices.find(v => v.lang.toLowerCase().startsWith('am') || v.name.toLowerCase().includes('amharic') || v.name.toLowerCase().includes('ethiopia'));
      if (amVoice) {
        utterance.voice = amVoice;
        utterance.lang = amVoice.lang;
      } else {
        utterance.lang = 'am-ET';
      }
    } else if (lang === 'fr') {
      const frVoice = voices.find(v => v.lang.toLowerCase().startsWith('fr') || v.name.toLowerCase().includes('french') || v.name.toLowerCase().includes('français'));
      if (frVoice) {
        utterance.voice = frVoice;
        utterance.lang = frVoice.lang;
      } else {
        utterance.lang = 'fr-FR';
      }
    } else {
      const enVoice = voices.find(v => v.lang === 'en-US' || v.lang.startsWith('en')) || voices[0];
      if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang;
      } else {
        utterance.lang = 'en-US';
      }
    }

    utterance.onstart = () => {
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.handleTrackEnded();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      this.handleTrackEnded();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private handleTrackEnded() {
    if (this.state.isWordProjectAudio) {
      // WordProject chapter audio ended
      if (this.state.repeatMode && this.audioElement) {
        this.audioElement.currentTime = 0;
        this.audioElement.play().catch(() => {});
        this.state.isPlaying = true;
        this.state.isPaused = false;
        this.state.currentTime = 0;
        this.currentPlaylistIndex = 0;
        this.state.currentVerseIndex = 0;
        this.state.currentVerse = this.playlist[0] || null;
        this.state.currentVerseId = this.playlist[0]?.id || null;
        this.notify();
        return;
      }
      this.state.isPlaying = false;
      this.state.isPaused = false;
      this.state.currentTime = this.state.duration;
      this.notify();
      return;
    }

    if (this.state.langMode === 'parallel' && !this.isParallelPhaseTwo && this.playlist.length > 0) {
      // Move to Amharic phase for the same verse
      this.isParallelPhaseTwo = true;
      this.playCurrentQueueItem();
      return;
    }

    // Reset parallel phase
    this.isParallelPhaseTwo = false;

    // Advance to next verse in playlist
    if (this.currentPlaylistIndex < this.playlist.length - 1) {
      this.currentPlaylistIndex++;
      this.playCurrentQueueItem();
    } else if (this.state.repeatMode && this.playlist.length > 0) {
      // End of playlist, but repeat is on -- start over
      this.currentPlaylistIndex = 0;
      this.playCurrentQueueItem();
    } else {
      // End of playlist
      this.stop();
    }
  }

  private handleAudioElementError(e: any) {
    console.warn('Audio playback error:', e);
    if (!this.state.isWordProjectAudio && this.state.currentText) {
      this.speakWithBrowserWebSpeech(this.state.currentText, this.state.currentLanguage);
    } else {
      this.state.isLoading = false;
      this.state.isPlaying = false;
      this.state.error = 'Audio source could not be loaded. Please check your connection or switch audio engine.';
      this.notify();
    }
  }

  public pause() {
    if (this.audioElement && !this.audioElement.paused) {
      this.audioElement.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.notify();
  }

  public resume() {
    if (this.audioElement && this.audioElement.src && this.audioElement.paused) {
      this.audioElement.play();
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
      return;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.notify();
      return;
    }
    if (this.playlist.length > 0) {
      this.playCurrentQueueItem();
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.isLoading = false;
    this.state.currentVerseId = null;
    this.state.currentTime = 0;
    this.notify();
  }

  public nextVerse() {
    if (this.state.isWordProjectAudio) {
      if (this.currentPlaylistIndex < this.playlist.length - 1) {
        this.seekToVerse(this.currentPlaylistIndex + 1);
      } else {
        this.skipSeconds(15);
      }
      return;
    }
    if (this.playlist.length === 0) return;
    this.isParallelPhaseTwo = false;
    if (this.currentPlaylistIndex < this.playlist.length - 1) {
      this.currentPlaylistIndex++;
      this.playCurrentQueueItem();
    } else {
      this.stop();
    }
  }

  public previousVerse() {
    if (this.state.isWordProjectAudio) {
      if (this.currentPlaylistIndex > 0) {
        this.seekToVerse(this.currentPlaylistIndex - 1);
      } else {
        this.seekTo(0);
      }
      return;
    }
    if (this.playlist.length === 0) return;
    this.isParallelPhaseTwo = false;
    if (this.currentPlaylistIndex > 0) {
      this.currentPlaylistIndex--;
      this.playCurrentQueueItem();
    } else {
      this.playCurrentQueueItem();
    }
  }

  // Retrieve browser voices for voice list selector
  public getBrowserVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  }
}

export const audioReader = new AudioReaderService();
