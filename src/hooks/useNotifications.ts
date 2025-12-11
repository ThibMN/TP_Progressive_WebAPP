import { useEffect, useState } from 'react'
import type { WeatherData } from '@/lib/types'
import { CONFIG } from '@/lib/config'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )

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

    for (let i = 0; i < next4HoursData.time.length; i++) {
      const weatherCode = next4HoursData.weatherCode[i]
      const temperature = next4HoursData.temperature[i]
      const precipitation = next4HoursData.precipitation[i]

      // Vérifier si il y a de la pluie (codes météo de pluie ou probabilité significative)
      if ((CONFIG.RAIN_CODES as readonly number[]).includes(weatherCode) || precipitation > 30) {
        hasRain = true
      }

      // Vérifier si la température dépasse 10° et garder la température max
      if (temperature > CONFIG.TEMP_THRESHOLD) {
        hasHighTemp = true
        maxTemp = Math.max(maxTemp, temperature)
      }
    }

    // Envoyer les notifications si nécessaire
    if (hasRain) {
      sendNotification(
        `🌧️ Pluie prévue à ${cityName}`,
        'De la pluie est attendue dans les 4 prochaines heures.'
      )
    }

    if (hasHighTemp && maxTemp > -Infinity) {
      sendNotification(
        `🌡️ Température élevée à ${cityName}`,
        `La température va dépasser les 10°C (jusqu'à ${Math.round(maxTemp)}°C) dans les 4 prochaines heures.`
      )
    }
  }

  const sendNotification = (title: string, body: string): void => {
    if (typeof Notification === 'undefined') {
      return
    }

    if (Notification.permission !== 'granted') {
      return
    }

    try {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        tag: 'weather-alert',
        requireInteraction: false,
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error)
    }
  }

  return {
    permission,
    requestPermission,
    checkWeatherConditions,
  }
}
