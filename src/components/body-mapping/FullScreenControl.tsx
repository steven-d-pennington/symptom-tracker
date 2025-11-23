"use client";

import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export interface FullScreenControlProps {
  /** Whether fullscreen mode is currently active */
  isFullscreen: boolean;

  /** Callback to toggle fullscreen mode */
  onToggle: () => void;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Toggle button for entering/exiting fullscreen mode
 * Shows maximize icon when not fullscreen, minimize icon when fullscreen
 * Meets WCAG 2.1 Level AA touch target requirements (44x44px minimum)
 *
 * Story 3.7.4 - AC 3.7.4.1: Full-screen toggle button available in normal view
 */
export function FullScreenControl({
  isFullscreen,
  onToggle,
  className = "",
}: FullScreenControlProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-colors min-w-[44px] min-h-[44px] ${className}`}
      aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
      title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
    >
      {isFullscreen ? (
        <Minimize2 className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Maximize2 className="w-5 h-5" aria-hidden="true" />
      )}
      <span className="text-sm font-medium hidden sm:inline">
        {isFullscreen ? "Exit" : "Full Screen"}
      </span>
    </button>
  );
}
