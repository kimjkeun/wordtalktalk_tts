import { create } from 'zustand';
import { VocabularyState } from '../types/vocabulary';

const useVocabularyStore = create<VocabularyState>((set, get) => ({
  currentPart: 0,
  currentWord: 0,
  parts: [],
  isLoading: false,
  error: null,
  playbackSettings: {
    selectedVoices: ['matt'],
    includeKorean: false,
  },
  isPlaying: false,

  toggleVoice: (voice: string) => {
    set((state) => {
      const selectedVoices = state.playbackSettings.selectedVoices;
      const newSelectedVoices = selectedVoices.includes(voice)
        ? selectedVoices.filter(v => v !== voice)
        : [...selectedVoices, voice];
      
      // 최소한 하나의 성우는 선택되어 있어야 함
      if (newSelectedVoices.length === 0) {
        return state;
      }

      return {
        ...state,
        playbackSettings: {
          ...state.playbackSettings,
          selectedVoices: newSelectedVoices,
        },
      };
    });
  },

  toggleKorean: () => {
    set((state) => ({
      ...state,
      playbackSettings: {
        ...state.playbackSettings,
        includeKorean: !state.playbackSettings.includeKorean,
      },
    }));
  },

  togglePlayback: () => {
    set((state) => ({ ...state, isPlaying: !state.isPlaying }));
  },

  playCurrentWord: async () => {
    const state = get();
    const currentPart = state.parts[state.currentPart];
    if (!currentPart) return;

    const currentWord = currentPart.words[state.currentWord];
    if (!currentWord) return;

    const playQueue = [];

    // 선택된 영어 음성들 추가
    for (const voice of state.playbackSettings.selectedVoices) {
      const audioUrl = currentWord.audioFiles.en[voice];
      if (audioUrl) {
        playQueue.push(audioUrl);
      }
    }

    // 한국어 음성 추가
    if (state.playbackSettings.includeKorean && currentWord.audioFiles.kr) {
      playQueue.push(currentWord.audioFiles.kr);
    }

    // 순차적으로 재생
    for (const url of playQueue) {
      const audio = new Audio(url);
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.play();
      });
      await new Promise(resolve => setTimeout(resolve, 300)); // 음성 사이 0.3초 간격
    }

    // 다음 단어로 이동하고 재생
    if (state.isPlaying) {
      get().nextWord();
      setTimeout(() => get().playCurrentWord(), 500);
    }
  },

  loadVocabulary: async () => {
    set({ isLoading: true });
    try {
      const basePath = process.env.NODE_ENV === 'production' 
        ? '/wordtalktalk_tts'
        : '';
      const response = await fetch(`${basePath}/data/vocabulary.json`);
      const data = await response.json();
      set({ ...get(), parts: data.parts, isLoading: false });
    } catch (error) {
      set({ ...get(), error: 'Failed to load vocabulary data', isLoading: false });
    }
  },

  nextWord: () => {
    set((state) => {
      const currentPart = state.parts[state.currentPart];
      if (!currentPart) return state;

      let newWord = state.currentWord + 1;
      let newPart = state.currentPart;

      if (newWord >= currentPart.words.length) {
        newWord = 0;
        newPart = (state.currentPart + 1) % state.parts.length;
      }

      return {
        ...state,
        currentWord: newWord,
        currentPart: newPart,
      };
    });
  },

  previousWord: () => {
    set((state) => {
      let newWord = state.currentWord - 1;
      let newPart = state.currentPart;

      if (newWord < 0) {
        newPart = (state.currentPart - 1 + state.parts.length) % state.parts.length;
        newWord = state.parts[newPart]?.words.length - 1 || 0;
      }

      return {
        ...state,
        currentWord: newWord,
        currentPart: newPart,
      };
    });
  },
}));

export default useVocabularyStore;
