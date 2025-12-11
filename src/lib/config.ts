export const CONFIG = {
  GEOCODING_API: 'https://geocoding-api.open-meteo.com/v1/search',
  WEATHER_API: 'https://api.open-meteo.com/v1/forecast',
  STORAGE_KEY_FAVORITES: 'meteo-pwa-favorites',
  STORAGE_KEY_THEME: 'meteo-pwa-theme',
  RAIN_CODES: [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99],
  TEMP_THRESHOLD: 10 // Température seuil pour notification
} as const;

