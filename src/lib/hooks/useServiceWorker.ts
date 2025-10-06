"use client";

import { useState, useEffect } from "react";

export interface ServiceWorkerState {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  error: Error | null;
}

/**
 * Hook to manage service worker registration and updates
 */
export function useServiceWorker() {
  const [state, setState] = useState<ServiceWorkerState>({
    registration: null,
    isSupported: typeof window !== "undefined" && "serviceWorker" in navigator,
    isRegistered: false,
    isUpdateAvailable: false,
    error: null,
  });

  useEffect(() => {
    if (!state.isSupported) {
      return;
    }

    // Register service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        console.log("[PWA] Service worker registered:", registration);

        setState((prev) => ({
          ...prev,
          registration,
          isRegistered: true,
        }));

        // Check for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                console.log("[PWA] Update available");
                setState((prev) => ({
                  ...prev,
                  isUpdateAvailable: true,
                }));
              }
            });
          }
        });

        // Handle controller change (new SW activated)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("[PWA] New service worker activated");
          window.location.reload();
        });
      } catch (error) {
        console.error("[PWA] Service worker registration failed:", error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }));
      }
    };

    registerSW();
  }, [state.isSupported]);

  // Function to update to new service worker
  const update = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  // Function to unregister service worker
  const unregister = async () => {
    if (state.registration) {
      const success = await state.registration.unregister();
      if (success) {
        setState((prev) => ({
          ...prev,
          registration: null,
          isRegistered: false,
        }));
      }
      return success;
    }
    return false;
  };

  return {
    ...state,
    update,
    unregister,
  };
}
