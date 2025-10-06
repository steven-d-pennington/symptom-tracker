/**
 * Push Notification Manager
 * Handles push notification subscriptions and sending
 */

export class PushNotificationManager {
  private static instance: PushNotificationManager;

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }

  /**
   * Get current notification permission
   */
  getPermission(): NotificationPermission {
    if (!this.isSupported()) {
      return "denied";
    }
    return Notification.permission;
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported");
    }

    const permission = await Notification.requestPermission();
    console.log("[PWA] Notification permission:", permission);
    return permission;
  }

  /**
   * Subscribe to push notifications
   * Note: This requires a VAPID public key for production use
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported()) {
      console.warn("[PWA] Push notifications not supported");
      return null;
    }

    if (Notification.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return null;
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // For production, replace with your VAPID public key
        // const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // applicationServerKey, // Uncomment when you have VAPID keys
        });

        console.log("[PWA] Push subscription created:", subscription);
      }

      return subscription;
    } catch (error) {
      console.error("[PWA] Push subscription failed:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const success = await subscription.unsubscribe();
        console.log("[PWA] Unsubscribed from push notifications");
        return success;
      }

      return true;
    } catch (error) {
      console.error("[PWA] Unsubscribe failed:", error);
      return false;
    }
  }

  /**
   * Show a local notification (doesn't require push)
   */
  async showNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<void> {
    if (!this.isSupported()) {
      console.warn("[PWA] Notifications not supported");
      return;
    }

    if (Notification.permission !== "granted") {
      const permission = await this.requestPermission();
      if (permission !== "granted") {
        return;
      }
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      ...options,
    });
  }

  /**
   * Convert VAPID key from base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }
}

export const pushNotificationManager = PushNotificationManager.getInstance();
