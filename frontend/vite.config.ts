import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: './frontend',  // frontend 폴더를 루트로 지정
  base: '/wordtalktalk_tts/',  // 리포지토리 이름을 base로 설정
  plugins: [react()],
})