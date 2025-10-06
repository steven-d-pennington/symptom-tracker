/**
 * Cache Manager
 * Utilities for manual cache control
 */

export class CacheManager {
  /**
   * Precache specific URLs
   */
  static async precache(urls: string[]): Promise<void> {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const registration = await navigator.serviceWorker.ready;

    if (registration.active) {
      registration.active.postMessage({
        type: "CACHE_URLS",
        urls,
      });
    }
  }

  /**
   * Clear all caches
   */
  static async clearAll(): Promise<void> {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
    console.log("[PWA] All caches cleared");
  }

  /**
   * Clear specific cache
   */
  static async clearCache(cacheName: string): Promise<boolean> {
    const deleted = await caches.delete(cacheName);
    console.log(`[PWA] Cache ${cacheName} ${deleted ? "deleted" : "not found"}`);
    return deleted;
  }

  /**
   * Get all cache names
   */
  static async getCacheNames(): Promise<string[]> {
    return await caches.keys();
  }

  /**
   * Get cache size (approximate)
   */
  static async getCacheSize(): Promise<number> {
    if (!("storage" in navigator && "estimate" in navigator.storage)) {
      return 0;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }

  /**
   * Get storage quota
   */
  static async getStorageQuota(): Promise<{
    usage: number;
    quota: number;
    percentage: number;
  }> {
    if (!("storage" in navigator && "estimate" in navigator.storage)) {
      return { usage: 0, quota: 0, percentage: 0 };
    }

    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentage = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentage };
  }

  /**
   * Format bytes to human readable
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}
