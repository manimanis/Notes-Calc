'use strict';

// Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v4';

// Add list of files to cache here.
const FILES_TO_CACHE = [
  "./",
  "index.html",
  "manifest.json",
  "style.css",
  "scripts/control.js",
  "scripts/vue.min.js",
  "scripts/install.js",
  "images/install.svg",
  "images/refresh.svg",
  "images/settings-line.svg",
  "images/icon.svg",
  "images/icon-maskable.svg",
  "images/icon-192.png",
  "images/icon-512.png",
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // Precache static resources
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // Remove previous cached data
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  if (evt.request.method !== 'GET') {
    return;
  }
  evt.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(evt.request).then((cached) => {
        const network = fetch(evt.request).then((response) => {
          if (response && response.status === 200) {
            cache.put(evt.request, response.clone());
          }
          return response;
        });
        return cached || network;
      });
    }),
  );
});

