"use client";

import React, { useState, useEffect } from "react";
import { NormalizedCoordinates } from "@/lib/utils/coordinates";
import { LayerType } from "@/lib/types/body-mapping";
import { getLayerDefaults, setLayerDefaults } from "@/lib/utils/layer-defaults";
import { X } from "lucide-react";

export interface MarkerDetailsFormProps {
  /** Confirmed marker coordinates */
  coordinates: NormalizedCoordinates;

  /** The region ID where the marker is placed */
  regionId: string;

  /** The tracking layer type for smart defaults (Story 3.7.3) */
  layer: LayerType;

  /** Callback when form is submitted */
  onSubmit: (data: {
    severity: number;
    notes: string;
    timestamp: Date;
  }) => void;

  /** Callback when form is cancelled */
  onCancel: () => void;
}

/**
 * MarkerDetailsForm Component (Story 3.7.2, enhanced in Story 3.7.3)
 *
 * Form for capturing marker details after position is confirmed.
 * Includes severity slider, notes field, and timestamp.
 *
 * AC 3.7.2.6: Form appears for severity/notes entry with 1-10 slider,
 * notes text field, and timestamp (auto-populated, editable)
 *
 * AC 3.7.3.1-3.7.3.8: Smart defaults system with layer-aware persistence
 */
export function MarkerDetailsForm({
  coordinates,
  regionId,
  layer,
  onSubmit,
  onCancel,
}: MarkerDetailsFormProps) {
  // AC 3.7.3.1, 3.7.3.2: Initialize state from layer-specific defaults
  const [severity, setSeverity] = useState(() => {
    const defaults = getLayerDefaults(layer);
    return defaults?.severity ?? 5;
  });

  const [notes, setNotes] = useState("");
  const [timestamp, setTimestamp] = useState(new Date());

  const [defaultNotesPlaceholder, setDefaultNotesPlaceholder] = useState(() => {
    const defaults = getLayerDefaults(layer);
    return defaults?.notes ?? "";
  });

  // Update when layer changes
  useEffect(() => {
    const defaults = getLayerDefaults(layer);
    if (defaults) {
      setSeverity(defaults.severity);
      setDefaultNotesPlaceholder(defaults.notes);
    } else {
      setSeverity(5);
      setDefaultNotesPlaceholder("");
    }
  }, [layer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // AC 3.7.3.6: Only save actual typed notes, not placeholder
    const trimmedNotes = notes.trim();

    // AC 3.7.3.4: Save new values as updated defaults for next entry
    setLayerDefaults(layer, {
      severity,
      notes: trimmedNotes, // Empty string if no notes entered
    });

    onSubmit({
      severity,
      notes: trimmedNotes,
      timestamp,
    });
  };

  // Format timestamp for input
  const formatTimestamp = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleTimestampChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimestamp(new Date(e.target.value));
  };

  console.log('🔴 MarkerDetailsForm RENDERING RETURN STATEMENT');

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      data-testid="marker-details-form-full"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Marker Details
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Severity Slider */}
          <div>
            <label
              htmlFor="severity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Severity: <span className="font-bold text-lg">{severity}</span>/10
            </label>
            <input
              id="severity"
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              aria-label="Severity level from 1 to 10"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={severity}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 - Minimal</span>
              <span>10 - Extreme</span>
            </div>
          </div>

          {/* Notes - AC 3.7.3.2, 3.7.3.5: Last-used notes as gray placeholder */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                defaultNotesPlaceholder || "Add any details about this symptom..."
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none placeholder:text-gray-400 placeholder:italic"
              aria-label="Additional notes about the symptom"
            />
          </div>

          {/* Timestamp */}
          <div>
            <label
              htmlFor="timestamp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Time
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              value={formatTimestamp(timestamp)}
              onChange={handleTimestampChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              aria-label="Date and time of symptom"
            />
          </div>

          {/* Marker Info */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium mb-1">Location Details</div>
            <div>Region: {regionId.replace(/-/g, ' ')}</div>
            <div className="font-mono">
              Position: ({coordinates.x.toFixed(3)}, {coordinates.y.toFixed(3)})
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium min-h-[44px]"
            >
              Save Marker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
