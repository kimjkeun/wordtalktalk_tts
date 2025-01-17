import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { VocabularyData, PlaybackSettings, Part, Word } from '../types/vocabulary'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const currentPart = ref(0)
  const currentWord = ref(0)
  const parts = ref<Part[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isPlaying = ref(false)
  const playbackSettings = ref<PlaybackSettings>({
    selectedVoices: ['danna'],  // 기본값으로 'danna' 선택
    includeKorean: true,
    autoPlay: false
  })

  const currentPartData = computed(() => parts.value[currentPart.value])
  const currentWordData = computed(() => currentPartData.value?.words[currentWord.value])
  
  const progress = computed(() => {
    if (!currentPartData.value) return { current: 0, total: 0 }
    return {
      current: currentWord.value + 1,
      total: currentPartData.value.words.length
    }
  })

  const loadVocabulary = async () => {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch('/data/vocabulary.json')
      if (!response.ok) throw new Error('Failed to load vocabulary')
      const data: VocabularyData = await response.json()
      parts.value = data.parts
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load vocabulary'
    } finally {
      isLoading.value = false
    }
  }

  const getBasePath = () => {
    return process.env.NODE_ENV === 'production' 
      ? '/wordtalktalk_tts'
      : ''
  }

  const playAudio = async (url: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(`${getBasePath()}${url}`)
      audio.onended = () => resolve()
      audio.onerror = () => reject(new Error('Failed to play audio'))
      audio.play().catch(reject)
    })
  }

  // 현재 단어 재생
  const playCurrentWord = async () => {
    if (!currentWordData.value) return

    const { audioFiles } = currentWordData.value
    const { selectedVoices, includeKorean } = playbackSettings.value

    try {
      // 선택된 모든 영어 음성 순차적 재생
      for (const voice of selectedVoices) {
        if (!isPlaying.value) return // 재생 중지 체크
        if (audioFiles.en[voice as keyof typeof audioFiles.en]) {
          await playAudio(audioFiles.en[voice as keyof typeof audioFiles.en])
        }
      }

      // 한글 발음 재생
      if (isPlaying.value && includeKorean && audioFiles.kr) {
        await playAudio(audioFiles.kr)
      }

      // 자동 재생이 켜져 있고 재생 중이면 다음 단어로
      if (playbackSettings.value.autoPlay && isPlaying.value) {
        setTimeout(nextWord, 1000)
      }
    } catch (err) {
      error.value = '오디오 재생에 실패했습니다'
      stopPlayback()
    }
  }

  // 재생 시작
  const startPlayback = () => {
    isPlaying.value = true
    playCurrentWord()
  }

  // 재생 중지
  const stopPlayback = () => {
    isPlaying.value = false
  }

  // 재생/중지 토글
  const togglePlayback = () => {
    if (isPlaying.value) {
      stopPlayback()
    } else {
      startPlayback()
    }
  }

  // 다음 단어로
  const nextWord = () => {
    if (currentWord.value < currentPartData.value.words.length - 1) {
      currentWord.value++
    } else if (currentPart.value < parts.value.length - 1) {
      currentPart.value++
      currentWord.value = 0
    } else {
      stopPlayback()
      return
    }

    if (isPlaying.value) {
      playCurrentWord()
    }
  }

  const previousWord = () => {
    if (currentWord.value > 0) {
      currentWord.value--
    } else if (currentPart.value > 0) {
      currentPart.value--
      currentWord.value = parts.value[currentPart.value].words.length - 1
    }

    if (playbackSettings.value.autoPlay) {
      isPlaying.value = true
      playCurrentWord()
    }
  }

  const toggleVoice = (voice: string) => {
    const voices = playbackSettings.value.selectedVoices
    const index = voices.indexOf(voice)
    
    if (index === -1) {
      // 선택되지 않은 음성이면 추가
      voices.push(voice)
    } else {
      // 이미 선택된 음성이면 제거 (최소 1개는 유지)
      if (voices.length > 1) {
        voices.splice(index, 1)
      }
    }
  }

  const toggleKorean = () => {
    playbackSettings.value.includeKorean = !playbackSettings.value.includeKorean
  }

  const toggleAutoPlay = () => {
    playbackSettings.value.autoPlay = !playbackSettings.value.autoPlay
    if (playbackSettings.value.autoPlay) {
      isPlaying.value = true
      playCurrentWord()
    }
  }

  return {
    currentPart,
    currentWord,
    parts,
    isLoading,
    error,
    isPlaying,
    playbackSettings,
    currentPartData,
    currentWordData,
    progress,
    loadVocabulary,
    playCurrentWord,
    nextWord,
    previousWord,
    toggleVoice,
    toggleKorean,
    toggleAutoPlay,
    togglePlayback
  }
})
