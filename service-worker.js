const CACHE_NAME = 'badi-calendar-v3';

const PRECACHE_ASSETS = [
    './index.html',
    './css/styles.css',
    './js/app.js',
    './js/badiDate.js',
    './js/suncalc.js',
    './js/plasma-background.js',
    './manifest.json',
    './fonts/montserrat-latin.woff2',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

// Install: pre-cache core app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_ASSETS);
        }).catch((err) => {
            console.error('SW precache failed:', err);
        })
    );
    self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests and cross-origin requests
    if (event.request.method !== 'GET' || url.origin !== location.origin) {
        return;
    }

    // Network-first for HTML (pick up updates)
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Stale-while-revalidate for static assets
    // Serve cached version immediately, then update cache in background
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return response;
            });
            return cached || fetchPromise;
        })
    );
});
