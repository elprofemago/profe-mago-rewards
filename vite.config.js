// Configuración de Vite, la herramienta que "arma" la app y la muestra en el navegador.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

// "npm run dev"     -> solo en este computador: http://localhost:5173
// "npm run celular" -> en el celular (mismo Wi-Fi): https://<ip-del-computador>:5174, con https
//                      porque el navegador solo presta la cámara a sitios seguros.
// "npm run build"   -> la versión final que se publica en https://elprofemago.github.io/profe-mago-rewards/
export default defineConfig(({ mode, command }) => ({
  base: command === 'build' ? '/profe-mago-rewards/' : '/',
  plugins: [
    react(),
    mode === 'celular' && basicSsl(),
    // Convierte la página en una app instalable (ícono, nombre, funciona sin internet).
    VitePWA({
      registerType: 'autoUpdate', // cuando publicamos una mejora, la app se actualiza sola
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'ProfeMago Rewards',
        short_name: 'ProfeMago Rewards',
        description: 'Puntos para tus estudiantes con tarjetas QR, canjeables por premios.',
        lang: 'es',
        theme_color: '#4B3BC4',
        background_color: '#F6F4FB',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icono-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,wasm}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        // Las fuentes de Google se guardan la primera vez para funcionar sin internet
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: { cacheName: 'fuentes', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
    }),
  ],
  server: mode === 'celular' ? { host: true } : {},
}))
