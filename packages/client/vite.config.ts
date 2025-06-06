import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        navigateFallbackDenylist: [/^\/images\/.*/],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Culinary Journeys',
        short_name: 'Culinary Journeys',
        description: 'Culinary Journeys',
        theme_color: '#e7e5e4',
        icons: [
          {
            src: 'android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      './runtimeConfig': './runtimeConfig.browser',
    },
  },
  define: {
    ...(process.env.NODE_ENV !== 'production' && {
      global: 'window',
    }),
  },
});
