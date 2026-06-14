import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  base: '/pikmin-bloom-tracker/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'guide.html'],
      manifest: {
        name: 'PikLog — Pikmin Bloom 互動紀錄器',
        short_name: 'PikLog',
        description: '長輩友善的明信片收發與打蘑菇互動紀錄工具',
        lang: 'zh-Hant',
        theme_color: '#65a30d',
        background_color: '#fafaf9',
        display: 'standalone',
        // start_url / scope 由外掛依 base 自動帶入 /pikmin-bloom-tracker/
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
