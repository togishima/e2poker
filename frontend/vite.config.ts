import funstackStatic from '@funstack/static'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    funstackStatic({
      root: 'src/Root.tsx',
      app: 'src/App.tsx',
    }),
    react(),
  ],
})
