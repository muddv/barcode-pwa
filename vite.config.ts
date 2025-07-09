import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [VitePWA({
    registerType: 'prompt',
    injectRegister: 'inline',

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'barcode-pwa',
      short_name: 'barcode-pwa',
      description: 'barcode-pwa',
      theme_color: '#ffffff',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico,tsx,ts}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})
