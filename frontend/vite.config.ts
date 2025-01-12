import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'frontend'),  // 절대 경로로 변경
  base: '/wordtalktalk_tts/',
  plugins: [react()],
  build: {
    outDir: '../dist'  // 빌드 출력 디렉토리 설정
  }
})