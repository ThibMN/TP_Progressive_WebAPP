import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { fetchWeather, getWeatherEmoji, searchCity } from './lib/api'
import type { Location, WeatherData } from './lib/types'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<Location | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const weatherDescription = useMemo(() => createWeatherDescriptionMap(), [])

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) {
      setError('Entre le nom d’une ville.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const foundCity = await searchCity(trimmed)
      const data = await fetchWeather(foundCity.latitude, foundCity.longitude)
      setLocation(foundCity)
      setWeather(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inattendue.'
      setError(message)
      setWeather(null)
      setLocation(null)
    } finally {
      setLoading(false)
    }
  }

  const currentWeather = weather?.current

  const hourlyForecast = useMemo(() => {
    if (!weather?.hourly) return []
    return weather.hourly.time.slice(0, 12).map((time, index) => ({
      time,
      temp: Math.round(weather.hourly.temperature_2m[index]),
      code: weather.hourly.weather_code[index],
      precipitation: weather.hourly.precipitation_probability[index],
    }))
  }, [weather])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 max-w-7xl">
        <header className="text-center mb-6 sm:mb-8 md:mb-10">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-slate-800/80 border border-slate-700 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-slate-300 mb-3 sm:mb-4">
            <span className="hidden xs:inline">PWA • </span>
            <span>Données Open‑Meteo</span>
            <span className="hidden sm:inline"> • Temps réel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 tracking-tight px-2">
            Météo instantanée
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Cherche une ville, enregistre la météo du moment et garde un œil sur les prochaines heures dans une interface simple et élégante.
          </p>
        </header>

        <main className="max-w-5xl mx-auto">
          <section className="space-y-4 sm:space-y-5 md:space-y-6">
            <div className="rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl p-4 sm:p-5 md:p-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs sm:text-sm text-slate-300 mb-1.5 sm:mb-2 block">Ville</label>
                  <div className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2.5 sm:py-2 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      aria-hidden
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.64 5.64a7.5 7.5 0 0 0 10.61 10.61Z" />
                    </svg>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Paris, Montréal, Tokyo..."
                      className="w-full bg-transparent outline-none placeholder:text-slate-500 text-white text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto sm:min-w-[140px] md:w-40 h-10 sm:h-11 text-sm sm:text-base font-semibold"
                  >
                    {loading ? 'Recherche...' : 'Rechercher'}
                  </Button>
                </div>
              </form>
              {error && (
                <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-red-500/50 bg-red-500/10 text-red-100 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm">
                  {error}
                </div>
              )}
              {!weather && !error && (
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-300">
                  Conseils : saisis une ville puis valide pour voir la météo actuelle et les prévisions de la prochaine demi‑journée.
                </div>
              )}
            </div>

            {weather && location && currentWeather && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400 mb-0.5 sm:mb-1">Localisation</p>
                      <p className="text-base sm:text-lg md:text-xl font-semibold text-white truncate">
                        {location.name}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400 truncate">
                        {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                      </p>
                    </div>
                    <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0" aria-hidden>
                      {getWeatherEmoji(currentWeather.weather_code)}
                    </div>
                  </div>

                  <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                    <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-none">
                      {Math.round(currentWeather.temperature_2m)}°
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">
                      Ressentie {Math.round(currentWeather.apparent_temperature)}°
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300">
                    {weatherDescription[currentWeather.weather_code] ?? 'Conditions actuelles'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-3">
                    <InfoBadge label="Humidité" value={`${currentWeather.relative_humidity_2m}%`} />
                    <InfoBadge label="Vent" value={`${Math.round(currentWeather.wind_speed_10m)} km/h`} />
                    <InfoBadge label="Code" value={`#${currentWeather.weather_code}`} />
                  </div>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur shadow-xl p-4 sm:p-5 md:p-6">
                  <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-400 mb-0.5 sm:mb-1">Prochaines heures</p>
                      <p className="text-base sm:text-lg md:text-xl font-semibold text-white">Prévision courte</p>
                    </div>
                    <span className="text-[10px] sm:text-xs md:text-sm text-slate-400 whitespace-nowrap flex-shrink-0">Intervalle 1h</span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible -mx-1 sm:mx-0 pb-2 sm:pb-0 scrollbar-hide">
                    {hourlyForecast.map((hour) => (
                      <div
                        key={hour.time}
                        className="rounded-lg sm:rounded-xl border border-slate-800 bg-slate-950/70 px-2 sm:px-3 py-2 sm:py-3 text-center space-y-1 sm:space-y-2 min-w-[70px] sm:min-w-0"
                      >
                        <p className="text-[10px] sm:text-xs text-slate-400">{formatHour(hour.time)}</p>
                        <div className="text-xl sm:text-2xl" aria-hidden>
                          {getWeatherEmoji(hour.code)}
                        </div>
                        <p className="text-base sm:text-lg font-semibold text-white">{hour.temp}°</p>
                        <p className="text-[10px] sm:text-xs text-slate-400">{hour.precipitation}% pluie</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  )
}

function createWeatherDescriptionMap() {
  return {
    0: 'Ciel dégagé',
    1: 'Ciel principalement dégagé',
    2: 'Partiellement nuageux',
    3: 'Très nuageux',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine légère',
    53: 'Bruine',
    55: 'Bruine dense',
    56: 'Bruine verglaçante',
    57: 'Bruine verglaçante dense',
    61: 'Pluie faible',
    63: 'Pluie',
    65: 'Pluie forte',
    66: 'Pluie verglaçante',
    67: 'Pluie verglaçante forte',
    71: 'Neige faible',
    73: 'Neige',
    75: 'Neige forte',
    77: 'Grains de neige',
    80: 'Averses faibles',
    81: 'Averses',
    82: 'Averses violentes',
    85: 'Averses de neige',
    86: 'Averses de neige fortes',
    95: 'Orages',
    96: 'Orages avec grêle',
    99: 'Orages violents',
  } as Record<number, string>
}

function formatHour(isoDate: string) {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface InfoBadgeProps {
  label: string
  value: string
}

function InfoBadge({ label, value }: InfoBadgeProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-2 sm:px-3 py-1.5 sm:py-2">
      <p className="text-[10px] sm:text-xs text-slate-400">{label}</p>
      <p className="text-xs sm:text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

export default App
