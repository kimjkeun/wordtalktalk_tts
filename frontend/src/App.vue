<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div v-if="store.isLoading" class="loading loading-spinner loading-lg"></div>
    <div v-else-if="store.error" class="alert alert-error">
      <span>{{ store.error }}</span>
    </div>
    <div v-else class="card w-96 bg-white shadow-xl">
      <!-- Progress -->
      <div class="px-4 py-2 text-sm text-gray-500 border-b">
        {{ store.progress.current }}/{{ store.progress.total }}
      </div>

      <div class="card-body">
        <!-- Word Display -->
        <div class="text-center space-y-2">
          <h2 class="text-3xl font-bold text-gray-800">
            {{ store.currentWordData?.word }}
          </h2>
          <p class="text-xl text-gray-600">
            {{ store.currentWordData?.translation }}
          </p>
        </div>

        <!-- Voice Selection -->
        <div class="divider">영어 발음</div>
        <div class="flex flex-wrap gap-2 justify-center">
          <button 
            v-for="voice in ['matt', 'danna', 'clara']" 
            :key="voice"
            class="btn btn-sm"
            :class="{
              'btn-primary': store.playbackSettings.selectedVoices.includes(voice),
              'btn-ghost': !store.playbackSettings.selectedVoices.includes(voice)
            }"
            @click="store.toggleVoice(voice)"
          >
            {{ voice }}
          </button>
        </div>

        <!-- Korean Toggle -->
        <div class="divider">한글 발음</div>
        <div class="flex justify-center">
          <button 
            class="btn btn-sm"
            :class="{
              'btn-primary': store.playbackSettings.includeKorean,
              'btn-ghost': !store.playbackSettings.includeKorean
            }"
            @click="store.toggleKorean"
          >
            한글 발음 {{ store.playbackSettings.includeKorean ? '켜짐' : '꺼짐' }}
          </button>
        </div>

        <!-- Playback Controls -->
        <div class="divider">재생 설정</div>
        <div class="flex flex-col gap-4">
          <!-- Play Controls -->
          <div class="flex justify-center items-center gap-4">
            <button 
              class="btn btn-circle btn-sm btn-ghost"
              @click="store.previousWord"
            >
              <i class="fas fa-step-backward"></i>
            </button>
            
            <button 
              class="btn btn-circle btn-lg btn-primary"
              @click="store.togglePlayback"
            >
              <i 
                class="fas text-xl"
                :class="store.isPlaying ? 'fa-pause' : 'fa-play'"
              ></i>
            </button>
            
            <button 
              class="btn btn-circle btn-sm btn-ghost"
              @click="store.nextWord"
            >
              <i class="fas fa-step-forward"></i>
            </button>
          </div>

          <!-- Auto Play -->
          <div class="flex justify-center">
            <button 
              class="btn btn-sm"
              :class="{
                'btn-primary': store.playbackSettings.autoPlay,
                'btn-ghost': !store.playbackSettings.autoPlay
              }"
              @click="store.toggleAutoPlay"
            >
              자동 재생 {{ store.playbackSettings.autoPlay ? '켜짐' : '꺼짐' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useVocabularyStore } from './stores/vocabulary'

const store = useVocabularyStore()

onMounted(() => {
  store.loadVocabulary()
})
</script>

<style>
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
</style>