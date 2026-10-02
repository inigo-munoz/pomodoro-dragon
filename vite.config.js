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
        // mp3 deliberately does NOT: the eight tracks are 14 MB, and precaching them would make
        // every install carry every song the child may never choose. They are cached on first
        // play instead, by the rule below.
        globPatterns: ['**/*.{js,css,html,webp,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Keep a track the first time it is heard, and play it from the cache ever after.
            urlPattern: ({ request, url }) =>
              request.destination === 'audio' || url.pathname.endsWith('.mp3'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'pomodoro-music',
              // THE ONE THAT MATTERS: an <audio> element asks for byte RANGES, and a 206 is not
              // cacheable. Without this, a cached 200 gets handed back to a range request and
              // playback breaks on exactly the tablet this exists for — and never on a desktop,
              // so it would not be noticed until she was offline and silent.
              rangeRequests: true,
              // 0 covers an opaque response; 200 the ordinary one.
              cacheableResponse: { statuses: [0, 200] },
              // Bounded by the catalogue, and with NO maxAgeSeconds on purpose: an age limit
              // would quietly evict a track weeks later and take offline music away again,
              // which is the bug this rule exists to fix.
              expiration: { maxEntries: 12 },
            },
          },
        ],
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
