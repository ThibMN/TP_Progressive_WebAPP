import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import { writeFileSync } from 'fs'

// Plugin pour créer le fichier .nojekyll (nécessaire pour GitHub Pages)
const noJekyllPlugin = () => {
  return {
    name: 'no-jekyll',
    writeBundle() {
      writeFileSync(path.resolve(__dirname, 'dist/.nojekyll'), '')
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  // Base path pour GitHub Pages (remplacez 'TP_PWA' par le nom de votre repo)
  // Si votre repo est à la racine de votre compte GitHub, utilisez '/nom-du-repo/'
  // Si c'est dans un sous-dossier, adaptez le chemin en conséquence
  base: process.env.GITHUB_REPOSITORY 
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` 
    : '/progressive_web_app/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  plugins: [
    react(),
    noJekyllPlugin(),
    VitePWA({
      injectRegister: false, // Désactiver l'enregistrement automatique, on le fait manuellement
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Météo PWA',
        short_name: 'Météo',
        description: 'Application météo Progressive Web App',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'fr',
        screenshots: [
          {
            src: '/screenshot_mobile.png',
            sizes: '616x1344',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Capture d\'écran mobile de l\'application Météo'
          },
          {
            src: '/screenshot_mobile.png',
            sizes: '616x1344',
            type: 'image/png',
            label: 'Capture d\'écran mobile de l\'application Météo'
          },
          {
            src: '/screenshot_desktop.png',
            sizes: '2936x1510',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Capture d\'écran desktop de l\'application Météo'
          }
        ],
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
})
