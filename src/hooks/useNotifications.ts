import { useEffect, useState, useRef } from 'react'
import type { WeatherData } from '@/lib/types'
import { CONFIG } from '@/lib/config'

// Stockage des notifications déjà envoyées pour éviter les doublons
const NOTIFICATION_STORAGE_KEY = 'meteo-pwa-notifications-sent'
const NOTIFICATION_COOLDOWN = 30 * 60 * 1000 // 30 minutes en millisecondes

interface NotificationState {
  rain: {
    sent: boolean
    timestamp: number
    city: string
  }
  temperature: {
    sent: boolean
    timestamp: number
    city: string
    maxTemp: number
  }
}

function getStoredNotifications(): NotificationState {
  try {
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Vérifier si les notifications sont encore valides (pas trop anciennes)
      const now = Date.now()
      if (parsed.rain && now - parsed.rain.timestamp < NOTIFICATION_COOLDOWN) {
        // Garder la notification de pluie
      } else {
        parsed.rain = { sent: false, timestamp: 0, city: '' }
      }
      if (parsed.temperature && now - parsed.temperature.timestamp < NOTIFICATION_COOLDOWN) {
        // Garder la notification de température
      } else {
        parsed.temperature = { sent: false, timestamp: 0, city: '', maxTemp: 0 }
      }
      return parsed
    }
  } catch (error) {
    console.error('Erreur lors de la lecture des notifications stockées:', error)
  }
  return {
    rain: { sent: false, timestamp: 0, city: '' },
    temperature: { sent: false, timestamp: 0, city: '', maxTemp: 0 },
  }
}

function storeNotification(type: 'rain' | 'temperature', city: string, maxTemp?: number): void {
  try {
    const stored = getStoredNotifications()
    if (type === 'rain') {
      stored.rain = {
        sent: true,
        timestamp: Date.now(),
        city,
      }
    } else if (type === 'temperature' && maxTemp !== undefined) {
      stored.temperature = {
        sent: true,
        timestamp: Date.now(),
        city,
        maxTemp,
      }
    }
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(stored))
  } catch (error) {
    console.error('Erreur lors du stockage de la notification:', error)
  }
}

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const lastCheckedRef = useRef<string>('') // Pour éviter les vérifications répétées pour les mêmes données

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      console.warn('Les notifications ne sont pas supportées dans ce navigateur')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('Les notifications ont été refusées')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }

  const checkWeatherConditions = (weather: WeatherData, cityName: string): void => {
    if (!weather.hourly || weather.hourly.time.length === 0) return

    // Créer une clé unique pour cette vérification (ville + première heure)
    const checkKey = `${cityName}-${weather.hourly.time[0]}`
    if (checkKey === lastCheckedRef.current) {
      // Déjà vérifié pour ces mêmes données
      return
    }
    lastCheckedRef.current = checkKey

    // Vérifier les 4 prochaines heures
    const next4HoursData = {
      time: weather.hourly.time.slice(0, 4),
      weatherCode: weather.hourly.weather_code.slice(0, 4),
      temperature: weather.hourly.temperature_2m.slice(0, 4),
      precipitation: weather.hourly.precipitation_probability.slice(0, 4),
    }

    let hasRain = false
    let hasHighTemp = false
    let maxTemp = -Infinity
    let rainHourIndex = -1

    for (let i = 0; i < next4HoursData.time.length; i++) {
      const weatherCode = next4HoursData.weatherCode[i]
      const temperature = next4HoursData.temperature[i]
      const precipitation = next4HoursData.precipitation[i]

      // Vérifier si il y a de la pluie (codes météo de pluie ou probabilité significative)
      if ((CONFIG.RAIN_CODES as readonly number[]).includes(weatherCode) || precipitation > 30) {
        hasRain = true
        if (rainHourIndex === -1) {
          rainHourIndex = i
        }
      }

      // Vérifier si la température dépasse 10° et garder la température max
      if (temperature > CONFIG.TEMP_THRESHOLD) {
        hasHighTemp = true
        maxTemp = Math.max(maxTemp, temperature)
      }
    }

    // Récupérer l'état des notifications déjà envoyées
    const stored = getStoredNotifications()

    // Envoyer la notification de pluie si nécessaire
    if (hasRain) {
      const shouldSendRain =
        !stored.rain.sent ||
        stored.rain.city !== cityName ||
        Date.now() - stored.rain.timestamp > NOTIFICATION_COOLDOWN

      if (shouldSendRain) {
        const hoursUntilRain = rainHourIndex + 1
        sendNotification(
          `🌧️ Pluie prévue à ${cityName}`,
          `De la pluie est attendue dans ${hoursUntilRain} heure${hoursUntilRain > 1 ? 's' : ''}.`,
          'rain-alert',
          cityName
        )
        storeNotification('rain', cityName)
      }
    }

    // Envoyer la notification de température si nécessaire
    if (hasHighTemp && maxTemp > -Infinity) {
      const shouldSendTemp =
        !stored.temperature.sent ||
        stored.temperature.city !== cityName ||
        Math.abs(stored.temperature.maxTemp - maxTemp) > 2 || // Température significativement différente
        Date.now() - stored.temperature.timestamp > NOTIFICATION_COOLDOWN

      if (shouldSendTemp) {
        sendNotification(
          `🌡️ Température élevée à ${cityName}`,
          `La température va dépasser les ${CONFIG.TEMP_THRESHOLD}°C (jusqu'à ${Math.round(maxTemp)}°C) dans les 4 prochaines heures.`,
          'temp-alert',
          cityName,
          maxTemp
        )
        storeNotification('temperature', cityName, maxTemp)
      }
    }
  }

  const sendNotification = async (
    title: string,
    body: string,
    tag: string,
    cityName: string,
    maxTemp?: number
  ): Promise<void> => {
    if (typeof Notification === 'undefined') {
      console.warn('Les notifications ne sont pas supportées')
      return
    }

    if (Notification.permission !== 'granted') {
      console.warn('Permission de notification non accordée')
      return
    }

    try {
      // Essayer d'utiliser le service worker d'abord (meilleure pratique pour PWA)
      if ('serviceWorker' in navigator) {
        try {
          // Attendre que le service worker soit prêt
          await navigator.serviceWorker.ready
          
          // Si pas de contrôleur, attendre un peu et réessayer
          if (!navigator.serviceWorker.controller) {
            // Attendre jusqu'à 2 secondes pour que le SW soit prêt
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

          // Essayer d'envoyer via le service worker
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'SHOW_NOTIFICATION',
              title,
              body,
              tag,
              icon: '/icons/icon-192.png',
              badge: '/icons/icon-72.png',
            })
            console.log(`✅ Notification envoyée via SW: ${title} pour ${cityName}`, maxTemp ? `(temp: ${maxTemp}°C)` : '')
            return
          } else {
            console.warn('⚠️ Service Worker enregistré mais pas de contrôleur disponible')
          }
        } catch (swError) {
          console.warn('⚠️ Erreur avec le service worker, utilisation du fallback:', swError)
        }
      }
      
      // Fallback : utiliser l'API Notification directement si le SW n'est pas disponible
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag,
        requireInteraction: false,
      })
      console.log(`✅ Notification envoyée directement: ${title} pour ${cityName}`, maxTemp ? `(temp: ${maxTemp}°C)` : '')
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', error)
    }
  }

  return {
    permission,
    requestPermission,
    checkWeatherConditions,
  }
}
