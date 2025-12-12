// ===== CONFIGURATION =====
// Service Worker pour l'application React Météo PWA
const CACHE_NAME = 'meteo-pwa-v1';

// Détecter automatiquement le base path depuis l'URL du service worker
// Exemple: si SW est à /progressive_web_app/service-worker.js, basePath = /progressive_web_app/
const getBasePath = () => {
    const swPath = self.location.pathname; // ex: /progressive_web_app/service-worker.js
    const basePath = swPath.substring(0, swPath.lastIndexOf('/') + 1); // ex: /progressive_web_app/
    return basePath;
};

const BASE_PATH = getBasePath();

// Fonction pour préfixer un chemin avec le base path
const withBasePath = (path) => {
    // Si le chemin commence déjà par le base path, le retourner tel quel
    if (path.startsWith(BASE_PATH)) return path;
    // Si c'est un chemin absolu commençant par /, remplacer le / par BASE_PATH
    if (path.startsWith('/')) return BASE_PATH + path.substring(1);
    // Sinon, ajouter BASE_PATH devant
    return BASE_PATH + path;
};

const ASSETS = [
    BASE_PATH, // ex: /progressive_web_app/
    withBasePath('/index.html'),
    withBasePath('/icons/icon-72.png'),
    withBasePath('/icons/icon-96.png'),
    withBasePath('/icons/icon-128.png'),
    withBasePath('/icons/icon-144.png'),
    withBasePath('/icons/icon-152.png'),
    withBasePath('/icons/icon-192.png'),
    withBasePath('/icons/icon-384.png'),
    withBasePath('/icons/icon-512.png')
];

// ===== INSTALL =====
// Mise en cache initiale des fichiers statiques
self.addEventListener('install', (event) => {
    console.log('[SW] Installation...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Mise en cache des assets');
                return cache.addAll(ASSETS);
            })
            .then(() => {
                // Force l'activation immédiate du nouveau SW
                return self.skipWaiting();
            })
    );
});

// ===== ACTIVATE =====
// Nettoyage des anciens caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activation...');
    event.waitUntil(
        caches.keys()
            .then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => {
                            console.log('[SW] Suppression ancien cache:', key);
                            return caches.delete(key);
                        })
                );
            })
            .then(() => {
                // Prend le contrôle de toutes les pages immédiatement
                return self.clients.claim();
            })
    );
});

// ===== FETCH =====
// Stratégie : Network First avec fallback sur le cache
// - Pour les API : tente le réseau, sinon erreur (pas de cache des données API)
// - Pour les assets : tente le réseau, sinon cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignorer les requêtes non-GET
    if (request.method !== 'GET') return;

    // Ignorer les extensions Chrome et autres protocoles
    if (!url.protocol.startsWith('http')) return;

    // Stratégie différente selon le type de ressource
    if (isApiRequest(url)) {
        // API : Network only (pas de cache pour les données météo)
        event.respondWith(networkOnly(request));
    } else {
        // Assets statiques : Cache First, Network Fallback
        event.respondWith(cacheFirst(request));
    }
});

// ===== Détection des requêtes API =====
function isApiRequest(url) {
    return url.hostname.includes('open-meteo.com') ||
           url.hostname.includes('geocoding-api');
}

// ===== Stratégie : Network Only =====
// Pour les API : on veut toujours des données fraîches
async function networkOnly(request) {
    try {
        const response = await fetch(request);
        return response;
    } catch (error) {
        console.log('[SW] Erreur réseau pour API:', error);
        // Retourner une erreur JSON pour que l'app puisse l'afficher
        return new Response(
            JSON.stringify({ error: 'Pas de connexion internet' }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// ===== Stratégie : Cache First =====
// Pour les assets statiques : cache d'abord, réseau en fallback
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Réponse trouvée dans le cache
        return cachedResponse;
    }

    try {
        // Pas dans le cache, on essaie le réseau
        const networkResponse = await fetch(request);
        
        // Si succès, on met en cache pour la prochaine fois
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[SW] Erreur réseau pour asset:', request.url);
        
        // Si c'est une page HTML, retourner la page d'accueil en cache
        if (request.headers.get('accept')?.includes('text/html')) {
            const fallback = await caches.match(withBasePath('/index.html'));
            if (fallback) return fallback;
        }
        
        // Sinon, erreur
        return new Response('Contenu non disponible hors-ligne', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// ===== Messages depuis l'application =====
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Gestion des notifications depuis l'application
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
        console.log('[SW] 📬 Message de notification reçu:', event.data);
        const { title, body, tag, icon, badge } = event.data;
        event.waitUntil(
            self.registration.showNotification(title, {
                body,
                icon: icon || withBasePath('/icons/icon-192.png'),
                badge: badge || withBasePath('/icons/icon-72.png'),
                tag: tag || 'default',
                requireInteraction: false,
                vibrate: [200, 100, 200],
            }).then(() => {
                console.log('[SW] ✅ Notification affichée avec succès:', title);
            }).catch((error) => {
                console.error('[SW] ❌ Erreur lors de l\'affichage de la notification:', error);
            })
        );
    }
});

console.log('[SW] Service Worker chargé, base path:', BASE_PATH);
