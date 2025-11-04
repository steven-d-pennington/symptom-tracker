"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { NormalizedCoordinates } from "@/lib/utils/coordinates";
import { X, Check } from "lucide-react";

export interface SimplifiedMarkerFormProps {
  /** The normalized coordinates where marker will be placed */
  coordinates: NormalizedCoordinates;

  /** Region ID for display */
  regionId: string;

  /** Callback when form is submitted */
  onSubmit: (data: { severity: number; notes: string; timestamp: Date }) => void;

  /** Callback when form is cancelled */
  onCancel: () => void;

  /** Initial severity value (defaults to 5) */
  initialSeverity?: number;
}

/**
 * Simplified marker form for fullscreen mode
 * Shows only severity slider for quick entry
 * Story 3.7.4 - Full-Screen Mode enhancement
 */
export function SimplifiedMarkerForm({
  coordinates,
  regionId,
  onSubmit,
  onCancel,
  initialSeverity = 5,
}: SimplifiedMarkerFormProps) {
  const [severity, setSeverity] = useState(initialSeverity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      severity,
      notes: '', // No notes in simplified mode
      timestamp: new Date(),
    });
  };

  const formContent = (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 100000 }}
      data-simplified-form="true"
      data-testid="simplified-marker-form"
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Mark Location
          </h3>
          <button
            onClick={onCancel}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Region and coordinates info */}
        <div className="mb-4 text-sm text-gray-600">
          <div className="uppercase tracking-wide font-medium text-gray-700">
            {regionId.replace(/-/g, ' ')}
          </div>
          <div className="font-mono text-xs mt-1">
            x: {coordinates.x.toFixed(2)}, y: {coordinates.y.toFixed(2)}
          </div>
        </div>

        {/* Severity Slider */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="severity" className="text-sm font-medium text-gray-700">
                Severity Level
              </label>
              <span className="text-2xl font-bold text-primary">
                {severity}
              </span>
            </div>

            <input
              type="range"
              id="severity"
              min="1"
              max="10"
              step="1"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              aria-label="Severity level from 1 to 10"
            />

            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 (Mild)</span>
              <span>10 (Severe)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Check className="w-5 h-5" />
              Save
            </button>
          </div>
        </form>

        <p className="mt-3 text-xs text-gray-500 text-center">
          Quick entry mode - exit fullscreen for detailed entry with notes
        </p>
      </div>
    </div>
  );

  // Use portal to render at document.body level to ensure it's on top
  return typeof window !== 'undefined' ? createPortal(formContent, document.body) : formContent;
}
