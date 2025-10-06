"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect online/offline status
 */
export function useOnline() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      console.log("[PWA] Connection restored");
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log("[PWA] Connection lost");
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook to get the opposite - returns true when offline
 */
export function useOffline() {
  return !useOnline();
}
