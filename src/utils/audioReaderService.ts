import { BibleVerse, Language } from '../types';

export type AudioEngineType = 'ai' | 'browser';
export type AudioLangMode = 'am' | 'en' | 'fr' | 'parallel';

export interface AudioVoiceOption {
  id: string;
  name: string;
  nameAm: string;
  nameFr?: string;
  gender: 'female' | 'male';
  type: 'ai' | 'browser';
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
  error: string | null;
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

  private state: AudioPlaybackState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentVerseId: null,
    currentVerseIndex: 0,
    totalVerses: 0,
    currentVerse: null,
    currentLanguage: 'en',
    langMode: 'parallel',
    speed: 1.0,
    engine: 'ai',
    selectedVoiceId: 'Kore',
    currentText: '',
    title: '',
    volume: 1.0,
    error: null,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio();
      this.audioElement.onended = () => this.handleTrackEnded();
      this.audioElement.onerror = (e) => this.handleAudioElementError(e);
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

  public setEngine(engine: AudioEngineType) {
    this.state.engine = engine;
    this.notify();
  }

  // Play a single verse
  public async playVerse(verse: BibleVerse, langMode?: AudioLangMode) {
    this.stop();
    this.playlist = [verse];
    this.currentPlaylistIndex = 0;
    this.isParallelPhaseTwo = false;
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
    this.stop();
    if (!verses || verses.length === 0) return;
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
    // If AI Engine is preferred, attempt AI TTS endpoint first
    if (this.state.engine === 'ai') {
      const cacheKey = `${lang}_${this.state.selectedVoiceId}_${text.trim()}`;
      if (this.audioCache.has(cacheKey)) {
        this.playAudioUrl(this.audioCache.get(cacheKey)!);
        return;
      }

      try {
        const res = await fetch('/api/audio/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
    } else {
      // End of playlist
      this.stop();
    }
  }

  private handleAudioElementError(e: any) {
    console.warn('Audio playback error:', e);
    if (this.state.currentText) {
      this.speakWithBrowserWebSpeech(this.state.currentText, this.state.currentLanguage);
    } else {
      this.stop();
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
    this.notify();
  }

  public nextVerse() {
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
