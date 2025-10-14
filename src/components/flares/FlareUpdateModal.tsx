"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Snowflake, Pill, BedDouble, MoreHorizontal } from "lucide-react";
import { ActiveFlare } from "@/lib/types/flare";

export interface FlareUpdate {
  severity: number;
  status: "active" | "improving" | "worsening";
  intervention?: "ice" | "medication" | "rest" | "other";
  notes?: string;
}

interface FlareUpdateModalProps {
  flare: ActiveFlare;
  isOpen: boolean;
  onClose: () => void;
  onSave: (update: FlareUpdate) => Promise<void>;
}

export function FlareUpdateModal({
  flare,
  isOpen,
  onClose,
  onSave,
}: FlareUpdateModalProps) {
  const [severity, setSeverity] = useState<number>(flare.severity);
  const [selectedStatus, setSelectedStatus] = useState<"active" | "improving" | "worsening" | null>(null);
  const [selectedIntervention, setSelectedIntervention] = useState<"ice" | "medication" | "rest" | "other" | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Calculate flare day count
  const getFlareDay = (): number => {
    const start = new Date(flare.startDate).getTime();
    const now = Date.now();
    const daysDiff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return daysDiff + 1; // Day 1 is the first day
  };

  // Auto-detect status based on severity change
  const autoDetectStatus = (newSeverity: number): "active" | "improving" | "worsening" => {
    const severityDelta = newSeverity - flare.severity;
    if (severityDelta >= 2) return "worsening";
    if (severityDelta <= -2) return "improving";
    return "active";
  };

  // Get suggested status
  const suggestedStatus = autoDetectStatus(severity);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSeverity(flare.severity);
      setSelectedStatus(null);
      setSelectedIntervention(null);
      setNotes("");
    }
  }, [isOpen, flare.severity]);

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

  const getStatusDisplay = (status: "active" | "improving" | "worsening"): { label: string; color: string } => {
    switch (status) {
      case "worsening":
        return { label: "Getting Worse", color: "red" };
      case "improving":
        return { label: "Improving", color: "green" };
      default:
        return { label: "Same", color: "gray" };
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const update: FlareUpdate = {
        severity,
        status: selectedStatus || suggestedStatus,
        intervention: selectedIntervention || undefined,
        notes: notes.trim() || undefined,
      };

      await onSave(update);
      onClose();
    } catch (error) {
      console.error("Failed to update flare:", error);
      alert("Failed to update flare. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const flareLocation = flare.bodyRegions?.[0] || flare.bodyRegionId || "Unknown";
  const flareDay = getFlareDay();
  const statusDisplay = getStatusDisplay(selectedStatus || suggestedStatus);

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
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl md:rounded-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="flare-update-title"
          aria-describedby="flare-update-description"
          style={{
            maxWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : '32rem',
            maxHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : '90vh',
            height: typeof window !== 'undefined' && window.innerWidth < 768 ? '100vh' : 'auto',
            borderRadius: typeof window !== 'undefined' && window.innerWidth < 768 ? '0' : undefined,
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 id="flare-update-title" className="text-xl font-semibold text-gray-900">
                  🔥 Update Flare
                </h2>
                <p id="flare-update-description" className="mt-1 text-sm text-gray-600">
                  {flareLocation} - Day {flareDay}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-700">
                  Severity was: {flare.severity}/10
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
          </div>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-6">
            {/* Severity Slider */}
            <div>
              <label htmlFor="severity-slider" className="block text-sm font-medium text-gray-900 mb-2">
                Current Severity
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
                  aria-label="Current flare severity"
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

            {/* Status Buttons (Optional with Auto-Detection) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Status (optional - auto-detected)
              </label>
              <div className="flex gap-2">
                {(["worsening", "active", "improving"] as const).map((status) => {
                  const display = getStatusDisplay(status);
                  const isSelected = selectedStatus === status;
                  const isSuggested = !selectedStatus && suggestedStatus === status;

                  return (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border-2 transition-all ${
                        isSelected
                          ? `bg-${display.color}-50 border-${display.color}-500 text-${display.color}-700`
                          : isSuggested
                          ? `bg-${display.color}-50 border-${display.color}-300 text-${display.color}-600`
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                      aria-label={`Mark as ${display.label}`}
                      aria-pressed={isSelected}
                    >
                      {display.label}
                      {isSuggested && !isSelected && (
                        <span className="ml-1 text-xs">(suggested)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Intervention Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Quick Intervention (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { type: "ice" as const, icon: Snowflake, label: "Ice" },
                  { type: "medication" as const, icon: Pill, label: "Meds" },
                  { type: "rest" as const, icon: BedDouble, label: "Rest" },
                  { type: "other" as const, icon: MoreHorizontal, label: "Other" },
                ].map(({ type, icon: Icon, label }) => (
                  <button
                    key={type}
                    onClick={() => setSelectedIntervention(selectedIntervention === type ? null : type)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all ${
                      selectedIntervention === type
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={`Select ${label} intervention`}
                    aria-pressed={selectedIntervention === type}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label htmlFor="notes-field" className="block text-sm font-medium text-gray-900 mb-2">
                Notes (optional)
              </label>
              <textarea
                id="notes-field"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                aria-label="Optional notes"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 md:p-6">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update
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
