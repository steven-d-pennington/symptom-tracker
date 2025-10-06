"use client";

import { useInstallPrompt } from "@/lib/hooks/useInstallPrompt";
import { useState } from "react";

export function InstallPrompt() {
  const { isInstallable, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (!installed) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg bg-blue-600 p-4 shadow-xl sm:left-auto">
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
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white">Install App</h3>
          <p className="mt-1 text-sm text-blue-100">
            Install Pocket Symptom Tracker for quick access and offline use
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleInstall}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-white hover:text-blue-100"
          aria-label="Close"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
