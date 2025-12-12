import { useMemo, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationBanner } from '@/components/NotificationBanner'
import { fetchWeather, getWeatherEmoji, searchCities, searchCity } from './lib/api'
import type { Location, WeatherData } from './lib/types'
import { useFavorites } from './hooks/useFavorites'
import { useNotifications } from './hooks/useNotifications'
import { useServiceWorker } from './hooks/useServiceWorker'
import fogBackground from './assets/Fog-Background-PNG-Image.png'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<Location | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Location[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null)

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites()
  const { permission, requestPermission, checkWeatherConditions } = useNotifications()
  useServiceWorker() // Enregistrer le service worker

  const weatherDescription = useMemo(() => createWeatherDescriptionMap(), [])

  // Vérifier les conditions météo et envoyer des notifications si nécessaire
  useEffect(() => {
    if (weather && location && permission === 'granted') {
      checkWeatherConditions(weather, location.name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather, location, permission])

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 2) {
      setSuggestions([])
      setSuggestionsLoading(false)
      setSuggestionsError(null)
      return
    }

    let cancelled = false
    setSuggestionsError(null)
    setSuggestionsLoading(true)

    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(trimmed, 5)
        if (!cancelled) {
          setSuggestions(results)
          setSuggestionsError(results.length === 0 ? 'Aucune ville trouvée pour cette recherche.' : null)
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Erreur lors de la recherche des villes.'
          setSuggestionsError(message)
          setSuggestions([])
        }
      } finally {
        if (!cancelled) {
          setSuggestionsLoading(false)
        }
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

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
      setSuggestions([])
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
    <div className="min-h-screen text-foreground transition-colors duration-300 bg-white dark:bg-transparent">
      <ThemeToggle />
      <header className="relative text-center mb-6 sm:mb-8 md:mb-10 pt-6 sm:pt-8 md:pt-10 pb-12 sm:pb-16 md:pb-20 overflow-hidden w-full">
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgb(15, 23, 42) 0%, rgb(2, 6, 23) 100%)',
          }}
        />
        <div 
          className="absolute inset-0 dark:hidden z-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgb(255, 255, 255) 0%, rgb(248, 250, 252) 100%)',
          }}
        />
        <img 
          src={fogBackground}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 dark:opacity-40 z-[1] pointer-events-none transition-opacity duration-300"
          style={{
            mixBlendMode: 'normal',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-48 z-[2] pointer-events-none dark:block hidden"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(2, 6, 23, 0.3) 50%, rgb(2, 6, 23) 100%)',
            backdropFilter: 'blur(1px)',
          }}
        />
        <div 
          className="absolute inset-x-0 bottom-0 h-32 sm:h-40 md:h-48 z-[2] pointer-events-none dark:hidden block"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(248, 250, 252, 0.3) 50%, rgb(255, 255, 255) 100%)',
            backdropFilter: 'blur(1px)',
          }}
        />
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl relative z-[3]">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/70 dark:bg-white/10 backdrop-blur-xl border border-slate-300/30 dark:border-white/20 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs text-slate-700 dark:text-slate-200 mb-3 sm:mb-4 shadow-[0_4px_16px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_0_rgba(0,0,0,0.2)]">
            <span className="hidden xs:inline">PWA • </span>
            <span>Données Open‑Meteo</span>
            <span className="hidden sm:inline"> • Temps réel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3 md:mb-4 tracking-tight px-2">
            Météo instantanée
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto px-2">
            Cherche une ville, enregistre la météo du moment et garde un œil sur les prochaines heures dans une interface simple et élégante.
          </p>
        </div>
      </header>
      <div 
        className="relative transition-colors duration-300"
        style={{
          background: 'rgb(255, 255, 255)',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <div 
          className="absolute inset-0 dark:block hidden transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'rgb(2, 6, 23)',
          }}
        />
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 max-w-7xl">

        <main className="max-w-5xl mx-auto">
          <section className="space-y-4 sm:space-y-5 md:space-y-6">
            <NotificationBanner
              permission={permission}
              onRequestPermission={async () => {
                await requestPermission()
              }}
            />
            <div className="glass-card rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-5 md:p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
              <form onSubmit={handleSearch} className="relative z-10 space-y-3 sm:space-y-4">
                <label className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 block font-medium">Ville</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="glass-input flex items-center gap-2 rounded-lg sm:rounded-xl border border-slate-300/50 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl px-3 py-2.5 sm:py-2 focus-within:ring-2 focus-within:ring-slate-400/50 dark:focus-within:ring-white/30 focus-within:border-slate-400/60 dark:focus-within:border-white/20 focus-within:bg-white/10 dark:focus-within:bg-white/10 transition-all duration-300 hover:border-slate-400/60 dark:hover:border-white/15 hover:bg-white/7 dark:hover:bg-white/7">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-300 flex-shrink-0"
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
                        className="w-full bg-transparent outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-800 dark:text-white text-sm sm:text-base"
                      />
                    </div>
                  </div>
                  <div className="flex items-center sm:items-center sm:self-start">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto sm:min-w-[48px] h-11 sm:h-[46px] flex items-center justify-center text-sm sm:text-base font-semibold"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="w-5 h-5 animate-spin text-slate-800 dark:text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                            />
                          </svg>
                          <span className="sr-only">Recherche...</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 text-slate-800 dark:text-white"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.64 5.64a7.5 7.5 0 0 0 10.61 10.61Z" />
                          </svg>
                          <span className="sr-only">Rechercher</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {suggestionsLoading && (
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    Recherche des villes...
                  </div>
                )}
                {!suggestionsLoading && suggestionsError && query.trim().length >= 2 && (
                  <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {suggestionsError}
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="space-y-0.5">
                    {suggestions.map((city) => (
                      <button
                        key={`${city.name}-${city.latitude}-${city.longitude}`}
                        type="button"
                        onClick={async () => {
                          setQuery(city.name)
                          setSuggestions([])
                          setLoading(true)
                          setError(null)
                          try {
                            const data = await fetchWeather(city.latitude, city.longitude)
                            setLocation(city)
                            setWeather(data)
                          } catch (err) {
                            const message = err instanceof Error ? err.message : 'Erreur inattendue.'
                            setError(message)
                            setWeather(null)
                            setLocation(null)
                          } finally {
                            setLoading(false)
                          }
                        }}
                        className="w-full text-left px-1.5 py-1.5 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/10 rounded transition-colors duration-150 text-sm sm:text-base"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-white truncate">{city.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                            {city.admin1 ? `${city.admin1}, ` : ''}{city.country}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </form>
              {error && (
                <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl border border-red-400/30 dark:border-red-400/30 border-red-500/50 dark:border-red-400/30 bg-red-500/20 dark:bg-red-500/20 bg-red-100/80 dark:bg-red-500/20 backdrop-blur-xl text-red-100 dark:text-red-100 text-red-800 dark:text-red-100 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm shadow-[0_4px_16px_0_rgba(239,68,68,0.2)] dark:shadow-[0_4px_16px_0_rgba(239,68,68,0.2)] relative z-10">
                  {error}
                </div>
              )}
              {!weather && !error && (
                <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 relative z-10">
                  Conseils : saisis une ville puis valide pour voir la météo actuelle et les prévisions de la prochaine demi‑journée.
                </div>
              )}
            </div>

            {favorites.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-2.5 justify-center">
                {favorites.map((fav) => (
                  <div
                    key={`${fav.name}-${fav.latitude}-${fav.longitude}`}
                    className="glass-badge rounded-lg sm:rounded-xl border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl px-2.5 sm:px-3 py-1.5 sm:py-2 hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 dark:hover:border-white/20 transition-all duration-300 flex items-center group relative"
                  >
                    <button
                      onClick={async () => {
                        setQuery(fav.name)
                        setLoading(true)
                        setError(null)
                        try {
                          const data = await fetchWeather(fav.latitude, fav.longitude)
                          setLocation(fav)
                          setWeather(data)
                        } catch (err) {
                          const message = err instanceof Error ? err.message : 'Erreur inattendue.'
                          setError(message)
                          setWeather(null)
                          setLocation(null)
                        } finally {
                          setLoading(false)
                        }
                      }}
                      className="text-xs sm:text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap bg-transparent border-none p-0 cursor-pointer"
                    >
                      {fav.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFavorite(fav)
                      }}
                      className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 bg-white/90 dark:bg-slate-800/90 rounded-full p-0.5"
                      aria-label="Retirer des favorites"
                      title="Retirer des favorites"
                    >
                      <svg
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {weather && location && currentWeather && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="glass-card rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-5 md:p-6 space-y-3 sm:space-y-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300 font-medium">Localisation</p>
                          <button
                            onClick={() => {
                              if (isFavorite(location)) {
                                removeFavorite(location)
                              } else {
                                addFavorite(location)
                              }
                            }}
                            className="text-lg sm:text-xl hover:scale-110 transition-transform duration-200"
                            aria-label={isFavorite(location) ? 'Retirer des favorites' : 'Ajouter aux favorites'}
                            title={isFavorite(location) ? 'Retirer des favorites' : 'Ajouter aux favorites'}
                          >
                            {isFavorite(location) ? '❤️' : '🤍'}
                          </button>
                        </div>
                        <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 dark:text-white truncate">
                          {location.name}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 truncate">
                          {location.admin1 ? `${location.admin1}, ` : ''}{location.country}
                        </p>
                      </div>
                      <div className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0" aria-hidden>
                        {getWeatherEmoji(currentWeather.weather_code)}
                      </div>
                    </div>

                    <div className="flex items-end gap-3 sm:gap-4 flex-wrap">
                      <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-slate-800 dark:text-white leading-none">
                        {Math.round(currentWeather.temperature_2m)}°
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-1 sm:mb-2">
                        Ressentie {Math.round(currentWeather.apparent_temperature)}°
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                      {weatherDescription[currentWeather.weather_code] ?? 'Conditions actuelles'}
                    </p>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 sm:pt-3">
                      <InfoBadge label="Humidité" value={`${currentWeather.relative_humidity_2m}%`} />
                      <InfoBadge label="Vent" value={`${Math.round(currentWeather.wind_speed_10m)} km/h`} />
                      <InfoBadge label="Code" value={`#${currentWeather.weather_code}`} />
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] p-4 sm:p-5 md:p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="relative z-10">
                    <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-0.5 sm:mb-1 font-medium">Prochaines heures</p>
                        <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 dark:text-white">Prévision courte</p>
                      </div>
                      <span className="text-[10px] sm:text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap flex-shrink-0">Intervalle 1h</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible -mx-1 sm:mx-0 pb-2 sm:pb-0 scrollbar-hide">
                      {hourlyForecast.map((hour) => (
                        <div
                          key={hour.time}
                          className="glass-badge rounded-lg sm:rounded-xl border border-white/10 dark:border-white/10 border-slate-300/30 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl px-2 sm:px-3 py-2 sm:py-3 text-center space-y-1 sm:space-y-2 min-w-[70px] sm:min-w-0 hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 dark:hover:border-white/20 transition-all duration-300"
                        >
                          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">{formatHour(hour.time)}</p>
                          <div className="text-xl sm:text-2xl" aria-hidden>
                            {getWeatherEmoji(hour.code)}
                          </div>
                          <p className="text-base sm:text-lg font-semibold text-slate-800 dark:text-white">{hour.temp}°</p>
                          <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">{hour.precipitation}% pluie</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

        </main>
        </div>
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
    <div className="glass-badge rounded-lg border border-white/10 dark:border-white/10 border-slate-300/30 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 dark:hover:border-white/20 transition-all duration-300">
      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-300">{label}</p>
      <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">{value}</p>
    </div>
  )
}

export default App
