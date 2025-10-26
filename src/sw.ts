/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core";
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute, setCatchHandler, NavigationRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
  NetworkOnly,
} from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope & typeof globalThis & {
  __WB_MANIFEST?: Array<{ url: string; revision: string }>;
};

const APP_SHELL_FALLBACKS = [
  { url: "/offline.html", revision: "1" },
  { url: "/offline-image.svg", revision: "1" },
];

self.skipWaiting();
clientsClaim();

const precacheManifest = (self.__WB_MANIFEST ?? []) as Array<{
  url: string;
  revision: string;
}>;
precacheAndRoute([...precacheManifest, ...APP_SHELL_FALLBACKS]);
cleanupOutdatedCaches();

registerRoute(
  ({ request }) => ["script", "style", "worker"].includes(request.destination),
  new StaleWhileRevalidate({ cacheName: "assets-sw" })
);

registerRoute(
  ({ request }) => ["image", "font"].includes(request.destination),
  new CacheFirst({
    cacheName: "static-imm",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 300,
        maxAgeSeconds: 60 * 24 * 3600,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    url.pathname.startsWith("/api/") &&
    request.method === "GET",
  new NetworkFirst({ cacheName: "api-nf", networkTimeoutSeconds: 3 })
);

const mutationQueue = new BackgroundSyncPlugin("symptomUpdatesQueue", {
  maxRetentionTime: 24 * 60,
});

(["POST", "PUT", "DELETE"] as const).forEach((method) => {
  registerRoute(
    ({ url, request }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith("/api/") &&
      request.method === method,
    new NetworkOnly({ plugins: [mutationQueue] }),
    method
  );
});

const photoQueue = new BackgroundSyncPlugin("photoUploadsQueue", {
  maxRetentionTime: 24 * 60,
});

(["POST", "PUT"] as const).forEach((method) => {
  registerRoute(
    ({ url, request }) =>
      url.origin === self.location.origin &&
      url.pathname.startsWith("/api/photos") &&
      request.method === method,
    new NetworkOnly({ plugins: [photoQueue] }),
    method
  );
});

setCatchHandler(async ({ event }) => {
  if (event.request.destination === "document") {
    const cached = await caches.match("/offline.html");
    if (cached) {
      return cached;
    }
  }
  if (event.request.destination === "image") {
    const cached = await caches.match("/offline-image.svg");
    if (cached) {
      return cached;
    }
  }
  return Response.error();
});

const nav = new NavigationRoute(async (context) => {
  const cached = await caches.match("/index.html");
  if (cached) {
    return cached;
  }
  return fetch(context.request);
});

registerRoute(nav);

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
  const options: NotificationOptions = {
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

export {};
