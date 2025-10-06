"use client";

import { useOnline } from "@/lib/hooks/useOnline";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const isOnline = useOnline();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Hide after a delay when coming back online
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg transition-all ${
        isOnline
          ? "bg-green-500 text-white"
          : "bg-yellow-500 text-gray-900"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="font-medium">Back online</span>
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
              />
            </svg>
            <div>
              <div className="font-medium">You&apos;re offline</div>
              <div className="text-sm opacity-90">
                Changes will sync when reconnected
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
