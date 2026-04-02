const CACHE_NAME = 'love-diary-v1';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  self.clients.claim();
});

// Simple fetch handler - only handle navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch('/index.html')
        .catch(() => caches.match('/index.html'))
    );
  }
});
