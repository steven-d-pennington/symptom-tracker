"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Save, X } from "lucide-react";
import { flareRepository } from "@/lib/repositories/flareRepository";
import type { FlareRecord } from "@/lib/db/schema";
import type { CreateFlareInput } from "@/lib/repositories/flareRepository";
import { toast } from "@/components/common/Toast";
import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";

type Coordinates = {
  x: number;
  y: number;
};

export interface FlareCreationSelection {
  bodyRegionId: string;
  bodyRegionName?: string;
  coordinates: Coordinates;
}

interface FlareCreationModalProps {
  /** Controls modal visibility */
  isOpen: boolean;
  /** Close handler (also used for backdrop + Esc) */
  onClose: () => void;
  /** Current user id for repository writes */
  userId: string;
  /**
   * Location data captured from the body map.
   * Save is disabled until a selection is provided.
   */
  selection: FlareCreationSelection | null;
  /**
   * Optional override for persistence logic.
   * Defaults to flareRepository.createFlare when not provided.
   */
  onSave?: (payload: {
    timestamp: number;
    severity: number;
    notes?: string;
    selection: FlareCreationSelection;
  }) => Promise<FlareRecord | void>;
  /** Invoked after a successful save with the created flare record */
  onCreated?: (flare: FlareRecord) => void;
}

const MAX_NOTES_LENGTH = 500;

const severityLabel = (value: number): string => {
  if (value <= 1) return "Minimal";
  if (value <= 3) return "Mild";
  if (value <= 5) return "Moderate";
  if (value <= 7) return "Severe";
  if (value <= 9) return "Very Severe";
  return "Excruciating";
};

const pad = (value: number): string => value.toString().padStart(2, "0");

const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const parseDateTimeLocal = (value: string): number | null => {
  if (!value) {
    return null;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
};

const formatPercentage = (value: number): string =>
  `${Math.round(value * 1000) / 10}%`;

export function FlareCreationModal({
  isOpen,
  onClose,
  userId,
  selection,
  onSave,
  onCreated,
}: FlareCreationModalProps) {
  const [severity, setSeverity] = useState<number>(5);
  const [notes, setNotes] = useState<string>("");
  const [timestampValue, setTimestampValue] = useState<string>(formatDateTimeLocal(new Date()));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Internal body map selection state (used when no external selection provided)
  const [internalSelection, setInternalSelection] = useState<FlareCreationSelection | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");

  // Use external selection if provided, otherwise use internal selection
  const effectiveSelection = selection || internalSelection;
  const hasSelection = Boolean(effectiveSelection?.bodyRegionId && effectiveSelection?.coordinates);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Reset form state on open
    setSeverity(5);
    setNotes("");
    setTimestampValue(formatDateTimeLocal(new Date()));
    setErrorMessage(null);
    setInternalSelection(null);
    setSelectedRegion(null);
    setCurrentView("front");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Enter" && (event.target as HTMLElement)?.tagName !== "TEXTAREA") {
        // Allow Enter to submit from header/inputs (textarea already supports Enter for newlines)
        event.preventDefault();
        const form = document.getElementById("flare-creation-form") as HTMLFormElement | null;
        form?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const regionLabel = useMemo(() => {
    if (!effectiveSelection?.bodyRegionId) {
      return "Select a region on the body map";
    }
    if (effectiveSelection.bodyRegionName) {
      return effectiveSelection.bodyRegionName;
    }
    return effectiveSelection.bodyRegionId.replace(/-/g, " ");
  }, [effectiveSelection]);

  // Internal body map handlers
  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handleCoordinateMark = (regionId: string, coordinates: { x: number; y: number }) => {
    const regionName = regionId.replace(/-/g, ' ');
    
    setInternalSelection({
      bodyRegionId: regionId,
      bodyRegionName: regionName,
      coordinates,
    });
    
    // Also select the region for consistency
    setSelectedRegion(regionId);
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleNotesChange = (value: string) => {
    if (value.length > MAX_NOTES_LENGTH) {
      setNotes(value.slice(0, MAX_NOTES_LENGTH));
      return;
    }
    setNotes(value);
  };

  const defaultSave = async (payload: {
    timestamp: number;
    severity: number;
    notes?: string;
    selection: FlareCreationSelection;
  }): Promise<FlareRecord> => {
    const trimmedNotes = payload.notes?.trim();
    const createPayload: CreateFlareInput = {
      bodyRegionId: payload.selection.bodyRegionId,
      coordinates: payload.selection.coordinates,
      initialSeverity: payload.severity,
      currentSeverity: payload.severity,
      startDate: payload.timestamp,
      createdAt: payload.timestamp,
      updatedAt: payload.timestamp,
      initialEventNotes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : undefined,
    };

    return flareRepository.createFlare(userId, createPayload);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!hasSelection || !effectiveSelection) {
      setErrorMessage("Body location not provided. Please tap a region on the body map first.");
      return;
    }

    const timestamp = parseDateTimeLocal(timestampValue);
    if (timestamp === null) {
      setErrorMessage("Please provide a valid date and time.");
      return;
    }

    setIsSaving(true);
    try {
      const trimmedNotes = notes.trim();
      const saveHandler = onSave ?? defaultSave;
      const result = await saveHandler({
        timestamp,
        severity,
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
        selection: effectiveSelection!,
      });

      const createdFlare: FlareRecord | undefined =
        (result as FlareRecord | undefined) ?? undefined;

      if (createdFlare) {
        // Show success toast with action buttons
        toast.success("Flare created successfully", {
          description: `Flare logged in ${effectiveSelection?.bodyRegionName || effectiveSelection?.bodyRegionId || 'selected area'}`,
          actions: [
            {
              label: "View Details",
              onClick: () => {
                // TODO: Navigate to flare details page when implemented
                console.log("Navigate to flare details:", createdFlare.id);
              },
            },
            {
              label: "Log Another",
              onClick: () => {
                // Reset form for another flare
                setSeverity(5);
                setNotes("");
                setTimestampValue(formatDateTimeLocal(new Date()));
                setErrorMessage(null);
                // Keep modal open for another entry
                return;
              },
            },
          ],
          duration: 5000,
        });

        // Dispatch custom event for any other listeners
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("flare:created", {
              detail: {
                flare: createdFlare,
                selection,
                severity,
                timestamp,
              },
            })
          );
        }
        onCreated?.(createdFlare);
      }

      onClose();
    } catch (error) {
      console.error("Failed to create flare", error);
      
      // Handle specific error types for offline-first experience
      let errorMessage = "Saving flare failed. Please try again.";
      
      if (error instanceof Error) {
        const errorString = error.message.toLowerCase();
        
        if (errorString.includes('quota') || errorString.includes('storage')) {
          errorMessage = "Storage full. Please free up space and try again.";
        } else if (errorString.includes('constraint') || errorString.includes('unique')) {
          // Handle duplicate ID - retry with new UUID
          errorMessage = "Creating flare failed. Retrying...";
          // Could implement automatic retry logic here
        } else if (errorString.includes('network') || errorString.includes('offline')) {
          errorMessage = "You're offline. Flare will be saved when connection returns.";
        } else if (errorString.includes('permission') || errorString.includes('denied')) {
          errorMessage = "Permission denied. Please check your browser settings.";
        }
      }
      
      setErrorMessage(errorMessage);
      // Keep modal open on error so user can retry
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center px-3 py-6 sm:px-6"
        onClick={handleBackdropClick}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="flare-creation-title"
          aria-describedby="flare-creation-description"
          className="relative w-full max-w-xl max-h-[90vh] rounded-2xl bg-white shadow-xl focus:outline-none flex flex-col"
        >
          <form id="flare-creation-form" onSubmit={handleSubmit} className="flex flex-col h-full min-h-0" noValidate>
            <header className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5">
              <div>
                <h2 id="flare-creation-title" className="text-xl font-semibold text-gray-900">
                  Create New Flare
                </h2>
                <p id="flare-creation-description" className="mt-1 text-sm text-gray-600">
                  {selection ? "Confirm details for the flare you just marked on the body map." : "Select a location on the body map and confirm flare details."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-transparent p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Close"
                disabled={isSaving}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Body Map Selection (only shown when no external selection provided) */}
            {!selection && (
              <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Select Body Location</h3>
                  <BodyViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
                <div className="h-[300px] bg-gray-50 rounded-lg mb-3 overflow-visible relative">
                  <BodyMapViewer
                    key={`${currentView}-${isOpen}`}
                    view={currentView}
                    userId={userId}
                    selectedRegion={selectedRegion || undefined}
                    onRegionSelect={handleRegionSelect}
                    readOnly={false}
                    onCoordinateMark={handleCoordinateMark}
                    showFlareMarkers={false}
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <BodyMapLegend />
                  <p className="text-xs text-gray-500">💡 Click region, then click again to mark exact location</p>
                </div>
              </div>
            )}

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-medium text-gray-700">Body Location</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {regionLabel}
                </p>
                {effectiveSelection?.coordinates ? (
                  <p className="mt-1 text-xs text-gray-600">
                    Coordinates:{" "}
                    <strong>
                      {formatPercentage(effectiveSelection.coordinates.x)}, {formatPercentage(effectiveSelection.coordinates.y)}
                    </strong>{" "}
                    (normalized within the selected region)
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-gray-500">
                    Waiting for precise coordinates&hellip;
                  </p>
                )}
              </section>

              <section>
                <label
                  htmlFor="flare-severity"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Initial severity <span className="text-red-500">*</span>
                </label>

                <div className="rounded-lg border border-gray-200 px-4 py-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
                    <span>1 · Minimal</span>
                    <span>10 · Excruciating</span>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <input
                      id="flare-severity"
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={severity}
                      onChange={(event) => setSeverity(Number(event.target.value))}
                      className="flex-1 accent-red-500"
                      aria-valuemin={1}
                      aria-valuemax={10}
                      aria-valuenow={severity}
                    />
                    <div className="flex min-w-[88px] flex-col items-center rounded-md bg-red-50 px-3 py-2">
                      <span className="text-lg font-semibold text-red-600">{severity}/10</span>
                      <span className="text-[11px] font-medium uppercase tracking-wide text-red-500">
                        {severityLabel(severity)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between">
                  <label htmlFor="flare-notes" className="text-sm font-medium text-gray-700">
                    Notes (optional)
                  </label>
                  <span className="text-xs text-gray-500">{notes.length}/{MAX_NOTES_LENGTH}</span>
                </div>
                <textarea
                  id="flare-notes"
                  value={notes}
                  onChange={(event) => handleNotesChange(event.target.value)}
                  rows={4}
                  maxLength={MAX_NOTES_LENGTH}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Add context, triggers, or symptom details…"
                  aria-describedby="flare-notes-helper"
                />
                <p id="flare-notes-helper" className="mt-1 text-xs text-gray-500">
                  Notes are stored with the initial event and help explain flare context later.
                </p>
              </section>

              <section>
                <label htmlFor="flare-timestamp" className="mb-2 block text-sm font-medium text-gray-700">
                  Timestamp <span className="text-red-500">*</span>
                </label>
                <input
                  id="flare-timestamp"
                  type="datetime-local"
                  value={timestampValue}
                  onChange={(event) => setTimestampValue(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Adjust if the flare started earlier. We store times in local time and convert to epoch milliseconds.
                </p>
              </section>

              {errorMessage && (
                <div
                  className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  role="alert"
                  aria-live="assertive"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            <footer className="flex flex-col gap-3 border-t border-gray-200 px-6 py-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                Cancel (Esc)
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!hasSelection || isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving…" : "Save Flare (Enter)"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}
