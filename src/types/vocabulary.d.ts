export interface AudioFiles {
  en: {
    [key: string]: string;
  };
  kr: string | null;
}

export interface Word {
  word: string;
  translation: string;
  audioFiles: AudioFiles;
}

export interface Part {
  id: number;
  name: string;
  words: Word[];
}

export interface PlaybackSettings {
  selectedVoices: string[];
  includeKorean: boolean;
}

export interface VocabularyState {
  currentPart: number;
  currentWord: number;
  parts: Part[];
  isLoading: boolean;
  error: string | null;
  playbackSettings: PlaybackSettings;
  isPlaying: boolean;
  loadVocabulary: () => Promise<void>;
  nextWord: () => void;
  previousWord: () => void;
  toggleVoice: (voice: string) => void;
  toggleKorean: () => void;
  togglePlayback: () => void;
  playCurrentWord: () => Promise<void>;
}
