import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialiser le thème avant le rendu pour éviter le flash
function initTheme() {
  const stored = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const theme = stored || (prefersDark ? 'dark' : 'light')
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

initTheme()

// Fonction globale pour tester les notifications depuis la console
declare global {
  interface Window {
    testNotification: (type?: 'rain' | 'temp' | 'custom', options?: { title?: string; body?: string; city?: string }) => Promise<void>
    resetNotifications: () => void
    checkNotificationPermission: () => void
  }
}

async function testNotification(
  type: 'rain' | 'temp' | 'custom' = 'rain',
  options: { title?: string; body?: string; city?: string } = {}
): Promise<void> {
  console.log('🧪 Test de notification:', type, options)
  
  // Vérifier la permission
  if (typeof Notification === 'undefined') {
    console.error('❌ Les notifications ne sont pas supportées dans ce navigateur')
    return
  }

  if (Notification.permission !== 'granted') {
    console.warn('⚠️ Permission non accordée. Demande de permission...')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.error('❌ Permission refusée')
      return
    }
  }

  let title: string
  let body: string
  let tag: string
  const city = options.city || 'Test City'

  switch (type) {
    case 'rain':
      title = `🌧️ Pluie prévue à ${city}`
      body = 'De la pluie est attendue dans 1 heure.'
      tag = 'rain-alert'
      break
    case 'temp':
      title = `🌡️ Température élevée à ${city}`
      body = 'La température va dépasser les 10°C (jusqu\'à 25°C) dans les 4 prochaines heures.'
      tag = 'temp-alert'
      break
    case 'custom':
      title = options.title || '🔔 Notification de test'
      body = options.body || 'Ceci est une notification de test'
      tag = 'test-notification'
      break
  }

  try {
    // Essayer d'utiliser le service worker d'abord
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.ready
        
        if (!navigator.serviceWorker.controller) {
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 2000)
            const handler = () => {
              clearTimeout(timeout)
              navigator.serviceWorker.removeEventListener('controllerchange', handler)
              resolve()
            }
            navigator.serviceWorker.addEventListener('controllerchange', handler)
          })
        }

        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            body,
            tag,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-72.png',
          })
          console.log('✅ Notification envoyée via Service Worker')
          return
        }
      } catch (swError) {
        console.warn('⚠️ Erreur avec le service worker, utilisation du fallback:', swError)
      }
    }
    
    // Fallback : utiliser l'API Notification directement
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag,
      requireInteraction: false,
    })
    console.log('✅ Notification envoyée directement')
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error)
  }
}

function resetNotifications(): void {
  try {
    localStorage.removeItem('meteo-pwa-notifications-sent')
    console.log('🔄 Notifications réinitialisées')
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error)
  }
}

function checkNotificationPermission(): void {
  if (typeof Notification === 'undefined') {
    console.error('❌ Les notifications ne sont pas supportées')
    return
  }
  
  console.log('🔐 Permission actuelle:', Notification.permission)
  console.log('📋 Service Worker:', {
    supported: 'serviceWorker' in navigator,
    controller: navigator.serviceWorker?.controller ? 'actif' : 'inactif',
    ready: navigator.serviceWorker?.controller ? 'oui' : 'non',
  })
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        console.log('✅ Service Worker enregistré:', registration.scope)
      } else {
        console.warn('⚠️ Service Worker non enregistré')
      }
    })
  }
}

// Exposer les fonctions globalement
window.testNotification = testNotification
window.resetNotifications = resetNotifications
window.checkNotificationPermission = checkNotificationPermission

// Afficher l'aide dans la console
console.log('%c🧪 Commandes de test disponibles:', 'color: #3b82f6; font-weight: bold; font-size: 14px;')
console.log('  • testNotification() - Teste une notification de pluie')
console.log('  • testNotification("temp") - Teste une notification de température')
console.log('  • testNotification("custom", { title: "Titre", body: "Message" }) - Notification personnalisée')
console.log('  • resetNotifications() - Réinitialise les notifications stockées')
console.log('  • checkNotificationPermission() - Vérifie l\'état des permissions')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
