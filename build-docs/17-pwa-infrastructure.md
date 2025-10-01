# PWA Infrastructure - Implementation Plan

## Overview

The Progressive Web App (PWA) infrastructure enables the Autoimmune Symptom Tracker to work offline, install on devices, and provide a native app-like experience. This implementation focuses on service workers, caching strategies, and offline functionality while maintaining privacy and performance.

## Core Requirements

### PWA Standards Compliance
- **Web App Manifest**: Proper installation and branding
- **Service Worker**: Offline functionality and caching
- **HTTPS**: Secure communication (required for service workers)
- **Responsive Design**: Works across all device sizes
- **Offline Capability**: Full functionality without network

### Performance Targets
- **First Load**: <3 seconds on 3G connection
- **Subsequent Loads**: <1 second from cache
- **Offline Functionality**: 100% feature availability offline
- **Storage Efficiency**: <50MB for 1 year of typical usage

## Web App Manifest

### Manifest Configuration
```json
{
  "name": "Autoimmune Symptom Tracker",
  "short_name": "SymptomTracker",
  "description": "Privacy-first symptom tracking for autoimmune conditions",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb",
  "orientation": "portrait-primary",
  "categories": ["health", "medical", "productivity"],
  "lang": "en-US",
  "dir": "ltr",

  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],

  "screenshots": [
    {
      "src": "/screenshots/dashboard-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/dashboard-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],

  "shortcuts": [
    {
      "name": "Quick Entry",
      "short_name": "Quick Log",
      "description": "Quick symptom entry",
      "url": "/entry/quick",
      "icons": [{ "src": "/icons/quick-entry.png", "sizes": "96x96" }]
    },
    {
      "name": "Active Flares",
      "short_name": "Flares",
      "description": "View active symptoms",
      "url": "/flares",
      "icons": [{ "src": "/icons/flares.png", "sizes": "96x96" }]
    },
    {
      "name": "Calendar",
      "short_name": "Calendar",
      "description": "View historical entries",
      "url": "/calendar",
      "icons": [{ "src": "/icons/calendar.png", "sizes": "96x96" }]
    }
  ]
}
```

### Icon Generation Strategy
```typescript
// Automated icon generation from single source
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateIcons(sourceIcon: ImageBitmap): Promise<IconSet> {
  return Promise.all(
    iconSizes.map(size =>
      resizeAndOptimizeIcon(sourceIcon, size)
    )
  );
}
```

## Service Worker Implementation

### Service Worker Architecture
```typescript
// service-worker.js
const CACHE_NAME = 'symptom-tracker-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/static/css/main.css',
        '/static/js/main.js',
        '/icons/icon-192x192.png',
        '/offline.html'
      ]);
    })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests - network first, cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Static assets - cache first, network fallback
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // HTML pages - network first for freshness
  event.respondWith(networkFirstStrategy(request));
});
```

### Caching Strategies

#### Cache-First Strategy (Static Assets)
```typescript
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    return caches.match('/offline.html');
  }
}
```

#### Network-First Strategy (Dynamic Content)
```typescript
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }

    throw error;
  }
}
```

#### Stale-While-Revalidate (API Data)
```typescript
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  // Return cached version immediately if available
  if (cachedResponse) {
    // Update cache in background
    fetchPromise.catch(() => {}); // Ignore network errors
    return cachedResponse;
  }

  // No cache, wait for network
  return fetchPromise;
}
```

## Offline Detection and Handling

### Network Status Monitoring
```typescript
class NetworkMonitor {
  constructor() {
    this.online = navigator.onLine;
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.online = true;
      this.updateUI();
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.online = false;
      this.updateUI();
    });
  }

  updateUI() {
    const indicator = document.getElementById('network-status');
    if (indicator) {
      indicator.className = this.online ? 'online' : 'offline';
      indicator.textContent = this.online ? 'Online' : 'Offline';
    }
  }

  async syncPendingData() {
    // Sync any pending offline actions
    const pendingActions = await this.getPendingActions();
    for (const action of pendingActions) {
      try {
        await this.syncAction(action);
        await this.markActionComplete(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  }
}
```

### Offline Queue Management
```typescript
class OfflineQueue {
  constructor() {
    this.queue = this.loadQueueFromStorage();
    this.isProcessing = false;
  }

  async addToQueue(action) {
    this.queue.push({
      id: generateId(),
      action,
      timestamp: Date.now(),
      retryCount: 0
    });

    await this.saveQueueToStorage();

    if (navigator.onLine && !this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0 && navigator.onLine) {
      const item = this.queue[0];

      try {
        await this.executeAction(item.action);
        this.queue.shift(); // Remove successful item
      } catch (error) {
        item.retryCount++;

        if (item.retryCount >= 3) {
          this.queue.shift(); // Give up after 3 retries
          this.logFailedAction(item);
        } else {
          break; // Stop processing, will retry later
        }
      }
    }

    await this.saveQueueToStorage();
    this.isProcessing = false;
  }
}
```

## Background Sync

### Service Worker Background Sync
```typescript
// Register background sync
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
  navigator.serviceWorker.ready.then(registration => {
    // Register sync when offline
    if (!navigator.onLine) {
      registration.sync.register('background-sync');
    }
  });
}

// Handle background sync in service worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const pendingData = await getPendingDataFromIndexedDB();

  for (const item of pendingData) {
    try {
      await syncItemToServer(item);
      await markItemSynced(item.id);
    } catch (error) {
      console.error('Background sync failed:', error);
      // Will retry on next sync event
    }
  }
}
```

## Installation and Updates

### Install Prompt Management
```typescript
class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.setupInstallPrompt();
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt = event;

      // Show custom install button
      this.showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
      this.hideInstallButton();
      this.trackInstallation();
    });
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    this.deferredPrompt = null;
  }

  showInstallButton() {
    const button = document.createElement('button');
    button.textContent = 'Install App';
    button.onclick = () => this.installApp();
    document.body.appendChild(button);
  }
}
```

### Update Management
```typescript
class PWAUpdater {
  constructor() {
    this.registration = null;
    this.setupUpdateListener();
  }

  setupUpdateListener() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        this.registration = registration;

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showUpdateNotification();
            }
          });
        });
      });
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <p>App update available!</p>
      <button onclick="updater.updateApp()">Update Now</button>
      <button onclick="updater.dismissUpdate()">Later</button>
    `;
    document.body.appendChild(notification);
  }

  async updateApp() {
    if (this.registration && this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  dismissUpdate() {
    // Hide notification, will show again on next visit
  }
}

// Handle update in service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

## Performance Optimization

### Bundle Splitting and Loading
```typescript
// Dynamic imports for code splitting
const EntryForm = lazy(() => import('./components/EntryForm'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const ReportGenerator = lazy(() => import('./components/ReportGenerator'));

// Preload critical components
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    import('./components/PhotoCapture');
    import('./components/DataAnalysis');
  });
}
```

### Resource Hints
```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- DNS prefetch for future connections -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- Preload critical resources -->
<link rel="preload" href="/css/critical.css" as="style">
<link rel="preload" href="/js/main.js" as="script">
<link rel="preload" href="/icons/icon-192x192.png" as="image">
```

### Cache Optimization
```typescript
// Intelligent cache management
class CacheManager {
  async optimizeCache() {
    const cache = await caches.open(STATIC_CACHE);
    const keys = await cache.keys();

    // Remove old cache entries
    const oldEntries = keys.filter(request => {
      const url = new URL(request.url);
      return this.isExpired(url);
    });

    await Promise.all(oldEntries.map(request => cache.delete(request)));

    // Pre-cache critical resources
    await cache.addAll(this.getCriticalResources());
  }

  isExpired(url) {
    // Implement cache expiration logic
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const lastModified = this.getLastModified(url);
    return Date.now() - lastModified > maxAge;
  }
}
```

## Device API Integration

### Camera Access
```typescript
class CameraManager {
  async requestCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      this.stream = stream;
      this.setupVideoElement();
      return true;
    } catch (error) {
      console.error('Camera access denied:', error);
      return false;
    }
  }

  async capturePhoto() {
    const canvas = document.createElement('canvas');
    const video = document.querySelector('video');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.8);
    });
  }
}
```

### Storage Quota Management
```typescript
class StorageManager {
  async checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota) * 100
      };
    }

    // Fallback for browsers without quota API
    return { used: 0, available: Infinity, percentage: 0 };
  }

  async requestStoragePersistence() {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      return await navigator.storage.persist();
    }
    return false;
  }

  async cleanupStorage() {
    // Remove old cached data
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name =>
      name.includes('old') || this.isExpiredCache(name)
    );

    await Promise.all(oldCaches.map(name => caches.delete(name)));
  }
}
```

## Testing Strategy

### PWA Testing Checklist
- [ ] App installs correctly on supported devices
- [ ] Service worker registers and activates
- [ ] Caching works for static assets
- [ ] Offline functionality works completely
- [ ] Network status detection works
- [ ] Background sync functions properly
- [ ] Camera access works on mobile devices
- [ ] Storage quota handling works
- [ ] Update mechanism works

### Performance Testing
- [ ] Lighthouse PWA audit scores >90
- [ ] First load <3 seconds on 3G
- [ ] Subsequent loads <1 second
- [ ] Memory usage stays under 100MB
- [ ] Battery impact minimal

### Cross-Platform Testing
- [ ] Chrome/Edge on desktop
- [ ] Safari on desktop
- [ ] Chrome on Android
- [ ] Safari on iOS
- [ ] Firefox on desktop/mobile

## Implementation Checklist

### Core PWA Features
- [ ] Web App Manifest with all required fields
- [ ] Service Worker with caching strategies
- [ ] Offline fallback pages
- [ ] Install prompt handling
- [ ] Update management system

### Advanced Features
- [ ] Background sync implementation
- [ ] Network status monitoring
- [ ] Camera API integration
- [ ] Storage quota management
- [ ] Performance optimizations

### Quality Assurance
- [ ] PWA validation passed
- [ ] Offline testing completed
- [ ] Cross-browser compatibility verified
- [ ] Performance benchmarks met
- [ ] Accessibility compliance maintained

---

## Related Documents

- [Data Storage Architecture](../16-data-storage.md) - Offline data management
- [Privacy & Security](../18-privacy-security.md) - PWA security considerations
- [Accessibility Features](../15-accessibility-features.md) - Inclusive PWA design
- [Settings & Customization](../14-settings-customization.md) - PWA preferences

---

*Document Version: 1.0 | Last Updated: October 2025*