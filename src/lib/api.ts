import { CONFIG } from './config';
import type { Location, WeatherData, GeocodingResponse, WeatherResponse } from './types';

export async function searchCity(query: string): Promise<Location> {
  const response = await fetch(
    `${CONFIG.GEOCODING_API}?name=${encodeURIComponent(query)}&count=1&language=fr&format=json`
  );
  
  if (!response.ok) {
    throw new Error('Erreur de géocodage');
  }
  
  const data: GeocodingResponse = await response.json();
  
  if (!data.results || data.results.length === 0) {
    throw new Error(`Ville "${query}" non trouvée. Vérifiez l'orthographe.`);
  }
  
  return data.results[0];
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `${CONFIG.WEATHER_API}?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
    `&hourly=temperature_2m,weather_code,precipitation_probability` +
    `&timezone=auto&forecast_days=1`
  );
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des données météo');
  }
  
  const data: WeatherResponse = await response.json();
  return data;
}

export function getWeatherEmoji(code: number): string {
  const weatherEmojis: Record<number, string> = {
    0: '☀️',      // Clear sky
    1: '🌤️',     // Mainly clear
    2: '⛅',      // Partly cloudy
    3: '☁️',      // Overcast
    45: '🌫️',    // Fog
    48: '🌫️',    // Depositing rime fog
    51: '🌦️',    // Light drizzle
    53: '🌦️',    // Moderate drizzle
    55: '🌧️',    // Dense drizzle
    56: '🌨️',    // Light freezing drizzle
    57: '🌨️',    // Dense freezing drizzle
    61: '🌧️',    // Slight rain
    63: '🌧️',    // Moderate rain
    65: '🌧️',    // Heavy rain
    66: '🌨️',    // Light freezing rain
    67: '🌨️',    // Heavy freezing rain
    71: '🌨️',    // Slight snow
    73: '🌨️',    // Moderate snow
    75: '❄️',     // Heavy snow
    77: '🌨️',    // Snow grains
    80: '🌦️',    // Slight rain showers
    81: '🌧️',    // Moderate rain showers
    82: '⛈️',     // Violent rain showers
    85: '🌨️',    // Slight snow showers
    86: '❄️',     // Heavy snow showers
    95: '⛈️',     // Thunderstorm
    96: '⛈️',     // Thunderstorm with slight hail
    99: '⛈️'      // Thunderstorm with heavy hail
  };
  
  return weatherEmojis[code] || '🌤️';
}

