import { useEffect } from 'react'

export function useServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const swUrl = `${import.meta.env.BASE_URL}service-worker.js`
          const scope = import.meta.env.BASE_URL || '/'
          const registration = await navigator.serviceWorker.register(swUrl, {
            scope
          })
          console.log('✅ Service Worker enregistré:', registration.scope)

          // Vérifier les mises à jour
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🔄 Nouveau service worker disponible')
                  // Optionnel : demander à l'utilisateur de recharger
                }
              })
            }
          })
        } catch (error) {
          console.error('❌ Erreur Service Worker:', error)
        }
      }

      registerServiceWorker()
    }
  }, [])
}
