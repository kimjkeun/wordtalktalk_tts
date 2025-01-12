import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/wordtalktalk_tts/',  // 리포지토리 이름을 base로 설정
  plugins: [react()],
})
