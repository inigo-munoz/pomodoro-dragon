import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Served from https://inigo-munoz.github.io/pomodoro-fantasy/, not from a domain root.
  base: '/pomodoro-fantasy/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // woff2 belongs here or the display font is a network request the offline app cannot make.
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
      },
      manifest: {
        name: 'Pomodoro Fantasy',
        short_name: 'Fantasy',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1b1030',
        theme_color: '#1b1030',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: { environment: 'jsdom' },
});
