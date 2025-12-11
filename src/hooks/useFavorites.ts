import { useState, useEffect, useRef } from 'react'
import type { Location } from '@/lib/types'
import { CONFIG } from '@/lib/config'

// Fonction pour charger les favorites depuis localStorage
function loadFavoritesFromStorage(): Location[] {
  try {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY_FAVORITES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des favorites:', error)
  }
  return []
}

export function useFavorites() {
  // Initialiser directement depuis localStorage
  const [favorites, setFavorites] = useState<Location[]>(loadFavoritesFromStorage)
  const isInitialMount = useRef(true)

  // Sauvegarder dans localStorage à chaque changement (mais pas au montage initial)
  useEffect(() => {
    // Ne pas sauvegarder au montage initial
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    try {
      localStorage.setItem(CONFIG.STORAGE_KEY_FAVORITES, JSON.stringify(favorites))
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favorites:', error)
    }
  }, [favorites])

  const addFavorite = (location: Location) => {
    setFavorites((prev) => {
      // Vérifier si la ville n'est pas déjà dans les favorites
      const exists = prev.some(
        (fav) =>
          fav.name === location.name &&
          fav.latitude === location.latitude &&
          fav.longitude === location.longitude
      )
      if (exists) return prev
      return [...prev, location]
    })
  }

  const removeFavorite = (location: Location) => {
    setFavorites((prev) =>
      prev.filter(
        (fav) =>
          !(
            fav.name === location.name &&
            fav.latitude === location.latitude &&
            fav.longitude === location.longitude
          )
      )
    )
  }

  const isFavorite = (location: Location | null): boolean => {
    if (!location) return false
    return favorites.some(
      (fav) =>
        fav.name === location.name &&
        fav.latitude === location.latitude &&
        fav.longitude === location.longitude
    )
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
  }
}
