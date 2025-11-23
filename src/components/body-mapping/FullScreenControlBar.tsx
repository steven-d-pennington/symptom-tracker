"use client";

import React from "react";
import { Minimize2, ArrowLeft, Eye, EyeOff, CheckCircle } from "lucide-react";

export interface FullScreenControlBarProps {
  /** Callback when exiting fullscreen */
  onExit: () => void;

  /** Callback when clicking back to body map (only in region view) */
  onBack?: () => void;

  /** Whether to show the back button (visible only in region view) */
  showBackButton: boolean;

  /** Whether to show the history toggle (visible only in region view) */
  showHistoryToggle?: boolean;

  /** Current state of history visibility (for toggle button) */
  historyVisible?: boolean;

  /** Callback when toggling history visibility */
  onHistoryToggle?: () => void;

  /** Story 3.7.4: Callback when done marking locations (opens flare creation form) */
  onDoneMarking?: () => void;

  /** Story 3.7.4: Number of markers placed (shows count badge on Done button) */
  markerCount?: number;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Thin control bar that remains visible in fullscreen mode
 * Contains essential navigation and control buttons
 * Fixed at top of screen with high contrast background
 * All buttons meet WCAG 2.1 Level AA touch target minimum (44x44px)
 *
 * Story 3.7.4 - AC 3.7.4.3, 3.7.4.4: Thin control bar with essential controls
 */
export function FullScreenControlBar({
  onExit,
  onBack,
  showBackButton,
  showHistoryToggle = false,
  historyVisible = false,
  onHistoryToggle,
  onDoneMarking,
  markerCount = 0,
  className = "",
}: FullScreenControlBarProps) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 h-12 bg-gray-900 text-white shadow-lg flex items-center justify-between px-4 ${className}`}
      role="toolbar"
      aria-label="Fullscreen controls"
    >
      {/* Left side: Back button (conditional) */}
      <div className="flex items-center gap-2">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors min-w-[44px] min-h-[44px]"
            aria-label="Back to Body Map"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium hidden sm:inline">Back to Body Map</span>
          </button>
        )}
      </div>

      {/* Center: Title or spacer */}
      <div className="flex-1 text-center">
        <span className="text-sm font-medium">Body Map - Full Screen Mode</span>
      </div>

      {/* Right side: History toggle and Exit button */}
      <div className="flex items-center gap-2">
        {/* History toggle (conditional) */}
        {showHistoryToggle && onHistoryToggle && (
          <button
            onClick={onHistoryToggle}
            className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors min-w-[44px] min-h-[44px]"
            aria-label={historyVisible ? "Hide history" : "Show history"}
            aria-pressed={historyVisible}
          >
            {historyVisible ? (
              <Eye className="w-5 h-5" aria-hidden="true" />
            ) : (
              <EyeOff className="w-5 h-5" aria-hidden="true" />
            )}
            <span className="text-sm font-medium hidden sm:inline">History</span>
          </button>
        )}

        {/* Story 3.7.4: Done Marking button - triggers flare creation form */}
        {onDoneMarking && markerCount > 0 && (
          <button
            onClick={onDoneMarking}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors min-w-[44px] min-h-[44px]"
            aria-label={`Done marking - ${markerCount} location${markerCount !== 1 ? 's' : ''} marked`}
          >
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium hidden sm:inline">
              Done ({markerCount})
            </span>
          </button>
        )}

        {/* Exit fullscreen button (always visible) */}
        <button
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded transition-colors min-w-[44px] min-h-[44px]"
          aria-label="Exit full screen"
        >
          <Minimize2 className="w-5 h-5" aria-hidden="true" />
          <span className="text-sm font-medium hidden sm:inline">Exit Full Screen</span>
        </button>
      </div>
    </div>
  );
}
