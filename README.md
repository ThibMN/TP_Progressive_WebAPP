# Météo PWA

Application météo Progressive Web App construite avec Vite, React, TypeScript, Tailwind CSS et shadcn/ui.

## 🚀 Technologies

- **Vite** - Build tool et dev server
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **shadcn/ui** - Composants UI
- **vite-plugin-pwa** - Support PWA

## 📦 Installation

```bash
npm install
```

## 🛠️ Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 📱 Structure du projet

```
progressive_web_app/
├── src/
│   ├── components/
│   │   └── ui/          # Composants shadcn/ui
│   ├── lib/
│   │   ├── api.ts       # Fonctions API météo
│   │   ├── config.ts    # Configuration
│   │   ├── types.ts     # Types TypeScript
│   │   └── utils.ts     # Utilitaires (cn, etc.)
│   ├── App.tsx          # Composant principal
│   ├── main.tsx         # Point d'entrée
│   └── index.css        # Styles globaux Tailwind
├── public/
│   └── icons/           # Icônes PWA
├── components.json      # Configuration shadcn/ui
├── tailwind.config.js   # Configuration Tailwind
└── vite.config.ts       # Configuration Vite + PWA
```

## 🎨 Ajouter des composants shadcn/ui

Pour ajouter des composants shadcn/ui, utilisez la CLI :

```bash
npx shadcn@latest add [component-name]
```

Exemple :
```bash
npx shadcn@latest add input
npx shadcn@latest add card
```

## 📝 API Météo

L'application utilise l'API Open-Meteo pour :
- **Géocodage** : Recherche de villes
- **Météo** : Données météorologiques actuelles et prévisions

Les fonctions API sont disponibles dans `src/lib/api.ts` :
- `searchCity(query: string)` - Recherche une ville
- `fetchWeather(lat: number, lon: number)` - Récupère les données météo
- `getWeatherEmoji(code: number)` - Retourne l'emoji météo

## 🔧 Configuration

La configuration est centralisée dans `src/lib/config.ts` :
- URLs des APIs
- Clés de stockage local
- Codes météo pour la pluie
- Seuil de température pour les notifications

## 📱 PWA

L'application est configurée comme PWA avec :
- Service Worker automatique (via vite-plugin-pwa)
- Manifest.json généré automatiquement
- Cache des assets statiques
- Cache stratégique des APIs (NetworkFirst)

Les icônes PWA sont dans `public/icons/`.
