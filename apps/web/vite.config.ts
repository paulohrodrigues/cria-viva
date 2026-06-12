import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'CriaViva',
        short_name: 'CriaViva',
        description: 'Gestão reprodutiva bovina — nunca perca um parto',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@cria-viva/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
    },
  },
  server: {
    fs: {
      allow: ['../..'],
    },
    proxy: {
      '/api': {
        // Em Docker: VITE_API_TARGET=http://api:3001 (rede interna)
        // Local:     não definido → usa localhost:3002
        target: process.env.VITE_API_TARGET ?? 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
