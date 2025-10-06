"use client";

import { useServiceWorker } from "@/lib/hooks/useServiceWorker";

export function UpdateNotification() {
  const { isUpdateAvailable, update } = useServiceWorker();

  if (!isUpdateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-purple-600 p-4 shadow-xl sm:left-auto">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">Update Available</h3>
          <p className="mt-1 text-sm text-purple-100">
            A new version of the app is ready. Refresh to update.
          </p>
          <button
            onClick={update}
            className="mt-3 rounded-md bg-white px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
          >
            Update Now
          </button>
        </div>
      </div>
    </div>
  );
}
