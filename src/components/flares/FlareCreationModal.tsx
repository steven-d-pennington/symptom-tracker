"use client";

import React, { useState, useEffect } from "react";
import { X, Save, FileText } from "lucide-react";
import { BodyMapViewer } from "../body-mapping/BodyMapViewer";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { NormalizedCoordinates } from "@/lib/utils/coordinates";

export interface NewFlareData {
  bodyRegionId: string;
  severity: number;
  notes?: string;
  coordinates?: { regionId: string; x: number; y: number };
}

interface FlareCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewFlareData) => Promise<void>;
  userId: string;
}

export function FlareCreationModal({
  isOpen,
  onClose,
  onSave,
  userId,
}: FlareCreationModalProps) {
  const [view, setView] = useState<"front" | "back" | "left" | "right">("front");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [severity, setSeverity] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [markedCoordinate, setMarkedCoordinate] = useState<NormalizedCoordinates | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRegion("");
      setSeverity(5);
      setNotes("");
      setValidationError("");
      setMarkedCoordinate(null);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const getSeverityLabel = (value: number): string => {
    if (value === 1) return "Minimal";
    if (value <= 3) return "Mild";
    if (value <= 5) return "Moderate";
    if (value <= 7) return "Severe";
    if (value <= 9) return "Very Severe";
    return "Excruciating";
  };

  const validateForm = (): boolean => {
    if (!selectedRegion) {
      setValidationError("Please select a body location");
      return false;
    }
    setValidationError("");
    return true;
  };

  const handleCoordinateMark = (regionId: string, coordinates: NormalizedCoordinates) => {
    setSelectedRegion(regionId);
    setMarkedCoordinate(coordinates);
  };

  const handleSave = async (addDetails: boolean = false) => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const flareData: NewFlareData = {
        bodyRegionId: selectedRegion,
        severity,
        notes: notes.trim() || undefined,
        coordinates: markedCoordinate
          ? {
              regionId: selectedRegion,
              x: markedCoordinate.x,
              y: markedCoordinate.y,
            }
          : undefined,
      };

      await onSave(flareData);

      // TODO: If addDetails is true, open EventDetailModal (Story 2.6 not yet implemented)
      if (addDetails) {
        console.log("Add Details - EventDetailModal not yet implemented (Story 2.6)");
      }

      onClose();
    } catch (error) {
      console.error("Failed to save flare:", error);
      setValidationError("Failed to save flare. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl md:max-w-2xl md:rounded-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="flare-creation-title"
          aria-describedby="flare-creation-description"
          style={{
            maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '42rem',
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : '90vh',
            height: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : 'auto',
            borderRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : undefined,
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 md:p-6">
            <div>
              <h2 id="flare-creation-title" className="text-xl font-semibold text-gray-900">
                🔥 Log New Flare
              </h2>
              <p id="flare-creation-description" className="mt-1 text-sm text-gray-600">
                Quick flare logging (10-15 seconds)
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-6">
            {/* Step 1: Body Location */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Step 1: Where is the flare? <span className="text-red-500">*</span>
              </label>

              {/* View Picker */}
              <div className="flex gap-2 mb-4">
                {(["front", "back", "left", "right"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      view === v
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Compact Body Map */}
              <div className="h-96 border-2 border-gray-200 rounded-lg overflow-hidden">
                <BodyMapViewer
                  view={view}
                  userId={userId}
                  selectedRegion={selectedRegion}
                  onRegionSelect={setSelectedRegion}
                  multiSelect={false}
                  readOnly={false}
                  onCoordinateMark={handleCoordinateMark}
                />
              </div>

              {selectedRegion && (
                <p className="mt-2 text-sm text-green-600 font-medium">
                  ✓ Selected: {selectedRegion}
                  {markedCoordinate && (
                    <span className="ml-2 text-xs text-gray-600">
                      (Precise location marked: x={markedCoordinate.x.toFixed(2)}, y={markedCoordinate.y.toFixed(2)})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Step 2: Severity */}
            <div>
              <label htmlFor="severity-slider" className="block text-sm font-medium text-gray-900 mb-2">
                Step 2: Severity <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">1 = Minimal</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {severity}/10
                  </span>
                  <span className="text-sm text-gray-600">10 = Excruciating</span>
                </div>

                <input
                  id="severity-slider"
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={severity}
                  onChange={(e) => setSeverity(parseInt(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-yellow-200 via-orange-400 to-red-600 rounded-lg appearance-none cursor-pointer slider-thumb"
                  aria-label="Flare severity"
                  aria-valuemin={1}
                  aria-valuemax={10}
                  aria-valuenow={severity}
                  aria-valuetext={getSeverityLabel(severity)}
                />

                <div className="text-center">
                  <span className="inline-block px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-full">
                    {getSeverityLabel(severity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3: Optional Notes */}
            <div>
              <label htmlFor="notes-field" className="block text-sm font-medium text-gray-900 mb-2">
                Step 3: Any details? (optional)
              </label>
              <textarea
                id="notes-field"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details? (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                aria-label="Optional notes"
              />
            </div>

            {/* Validation Error */}
            {validationError && (
              <div
                className="p-3 bg-red-50 border border-red-200 rounded-md"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm text-red-600">{validationError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 md:p-6">
            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Save and add more details"
              >
                <FileText className="h-4 w-4" />
                Add Details
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Save flare"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
