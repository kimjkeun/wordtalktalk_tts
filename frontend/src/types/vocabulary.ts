export interface AudioFiles {
  en: {
    matt: string;
    danna: string;
    clara: string;
  };
  kr: string;
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

export interface VocabularyData {
  parts: Part[];
}

export interface PlaybackSettings {
  selectedVoices: string[];
  includeKorean: boolean;
  autoPlay: boolean;
}

export interface VocabularyState {
  currentPart: number;
  currentWord: number;
  parts: Part[];
  isLoading: boolean;
  error: string | null;
  playbackSettings: PlaybackSettings;
  isPlaying: boolean;
}
