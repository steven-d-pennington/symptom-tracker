/* eslint-disable no-undef */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.6.0/workbox-sw.js");

const APP_SHELL_FALLBACKS = [
  { url: "/offline.html", revision: "1" },
  { url: "/offline-image.svg", revision: "1" },
];

self.skipWaiting();
workbox.core.clientsClaim();

const precacheManifest = self.__WB_MANIFEST || [];
workbox.precaching.precacheAndRoute([...precacheManifest, ...APP_SHELL_FALLBACKS]);
workbox.precaching.cleanupOutdatedCaches();

workbox.routing.registerRoute(
  ({ request }) => ["script", "style", "worker"].includes(request.destination),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: "assets-sw" })
);

workbox.routing.registerRoute(
  ({ request }) => ["image", "font"].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: "static-imm",
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 60 * 24 * 3600,
      }),
    ],
  })
);

workbox.routing.registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith("/api/") &&
    request.method === "GET",
  new workbox.strategies.NetworkFirst({
    cacheName: "api-nf",
    networkTimeoutSeconds: 3,
  })
);

const mutationQueue = new workbox.backgroundSync.BackgroundSyncPlugin(
  "symptomUpdatesQueue",
  { maxRetentionTime: 24 * 60 }
);

(["POST", "PUT", "DELETE"]).forEach((method) => {
  workbox.routing.registerRoute(
    ({ url, request }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith("/api/") &&
      request.method === method,
    new workbox.strategies.NetworkOnly({ plugins: [mutationQueue] }),
    method
  );
});

const photoQueue = new workbox.backgroundSync.BackgroundSyncPlugin(
  "photoUploadsQueue",
  { maxRetentionTime: 24 * 60 }
);

(["POST", "PUT"]).forEach((method) => {
  workbox.routing.registerRoute(
    ({ url, request }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith("/api/photos") &&
      request.method === method,
    new workbox.strategies.NetworkOnly({ plugins: [photoQueue] }),
    method
  );
});

workbox.routing.setCatchHandler(async ({ request }) => {
  if (!request) {
    return Response.error();
  }

  if (request.destination === "document") {
    const cached = await caches.match("/offline.html");
    if (cached) return cached;
  }

  if (request.destination === "image") {
    const cached = await caches.match("/offline-image.svg");
    if (cached) return cached;
  }

  return Response.error();
});

const nav = new workbox.routing.NavigationRoute(async (context) => {
  const cached = await caches.match("/index.html");
  if (cached) {
    return cached;
  }
  return fetch(context.request);
});

workbox.routing.registerRoute(nav);

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        success: true,
      });
    });
  } catch (error) {
    console.error("[SW] Sync failed:", error);
    throw error;
  }
}

self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "New health reminder",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [200, 100, 200],
    tag: "symptom-tracker-notification",
    requireInteraction: false,
    actions: [
      { action: "view", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification("Pocket Symptom Tracker", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(self.clients.openWindow("/"));
  }
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data?.type === "CACHE_URLS" && Array.isArray(event.data.urls)) {
    event.waitUntil(
      caches.open("assets-sw").then((cache) => cache.addAll(event.data.urls))
    );
  }
});

console.log("[SW] Workbox service worker loaded");
