import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  const englishFile = ref<File | null>(null)
  const koreanFile = ref<File | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const setEnglishFile = (file: File) => {
    englishFile.value = file
  }

  const setKoreanFile = (file: File) => {
    koreanFile.value = file
  }

  const combineAudio = async () => {
    if (!englishFile.value || !koreanFile.value) return

    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('en_audio', englishFile.value)
      formData.append('kr_audio', koreanFile.value)

      const response = await fetch('https://wordtalktalk-tts.onrender.com/combine-audio', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to combine audio')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'combined_audio.mp3'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred'
    } finally {
      isLoading.value = false
    }
  }

  return {
    englishFile,
    koreanFile,
    isLoading,
    error,
    setEnglishFile,
    setKoreanFile,
    combineAudio
  }
})
