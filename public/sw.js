// Bump this when you want to force everyone's cached shell to be dropped
// on their next visit (e.g. after a breaking change to how assets load).
// v2: earlier versions also cached cross-origin requests (Google Sign-In's
// own script included) as opaque responses -- this drops any of those a
// returning visitor's browser is still holding onto.
const CACHE_NAME = 'berean-shell-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first, falling back to cache -- so an online visit always gets
// the latest build, and an offline visit gets whatever was last cached.
// /api/* is never cached: auth, sync, AI, and Discord calls must always be
// live, never a stale response replayed while offline.
//
// Same-origin only: this used to also intercept cross-origin requests --
// Google's own Sign-In script, Google Fonts, etc. Those come back as
// "opaque" responses (status 0, unreadable) when fetched from a service
// worker, and caching-then-replaying one of those can hand back a stale or
// broken copy of a third party's own script on a later visit even while
// their live version has moved on -- which is exactly the kind of thing
// that made Google Sign-In fail intermittently. Third-party requests now
// pass through untouched, same as if this service worker didn't exist.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/')))
  );
});

// Daily streak-reminder push (sent by /api/push/daily-reminder via the
// server's VAPID keys) -- shows a notification with the app's own icon.
self.addEventListener('push', (event) => {
  let data = { title: 'Berean', body: 'Come back and keep your streak going.', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // best-effort -- fall back to the default text above
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url },
    })
  );
});

// Focus an already-open tab if there is one, otherwise open a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
