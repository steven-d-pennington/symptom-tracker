"use client";

import { useEffect, useRef } from "react";
import { X, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FlaresMapIntroProps {
  isOpen: boolean;
  onDismiss: () => void;
  viewMode: "map" | "both";
}

/**
 * Story 0.3 Task 2: Progressive body map guidance component
 * Reveals tips after the user opts in to map/split view
 */
export function FlaresMapIntro({ isOpen, onDismiss, viewMode }: FlaresMapIntroProps) {
  const introRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Story 0.3 Task 2.2: Focus management when guidance appears
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      // Move focus to the close button for keyboard accessibility
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Story 0.3 Task 2.2: Keyboard shortcut to dismiss (Escape key)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      ref={introRef}
      role="region"
      aria-label="Body map guidance"
      className={cn(
        "rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4",
        "transition-all duration-300 ease-in-out"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-semibold text-blue-900">
              {viewMode === "map" ? "Using the Body Map" : "Using Split View"}
            </h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Click on body regions</strong> to filter flares by location.
              </p>
              {viewMode === "both" && (
                <p>
                  The cards on the left update automatically when you select a region on the map.
                </p>
              )}
              <p>
                <strong>Zoom and pan:</strong> Use mouse wheel or pinch gestures to zoom in for precision, then drag to pan around.
                </p>
              <p>
                Color intensity shows severity — darker regions indicate more severe flares.
              </p>
              {/* Story 0.3 Task 2.2: Skip link for screen reader users */}
              <a
                href="#flare-cards"
                className="inline-flex items-center text-sm font-medium text-blue-700 hover:text-blue-900 underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
              >
                Skip to flare cards
              </a>
            </div>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 rounded-lg p-1.5 text-blue-600 transition-colors",
            "hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          )}
          aria-label="Dismiss body map guidance"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
