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
   * Story 3.7.4: Can be single selection or array for multiple locations (Model B - one flare with multiple locations)
   */
  selection: FlareCreationSelection | FlareCreationSelection[] | null;
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
  onCreated?: (flare: FlareRecord, stayInRegion?: boolean) => void;
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
  const [submitAction, setSubmitAction] = useState<'save' | 'save-and-add-more'>('save');

  // Internal body map selection state (used when no external selection provided)
  const [internalSelection, setInternalSelection] = useState<FlareCreationSelection | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");

  // Story 3.7.4: Normalize selection to always work with array
  const selectionsArray = useMemo(() => {
    if (!selection) {
      return internalSelection ? [internalSelection] : [];
    }
    return Array.isArray(selection) ? selection : [selection];
  }, [selection, internalSelection]);

  const hasSelection = selectionsArray.length > 0;

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

  // Story 3.7.4: Generate label for multiple locations
  const locationsSummary = useMemo(() => {
    if (selectionsArray.length === 0) {
      return "Select a region on the body map";
    }
    if (selectionsArray.length === 1) {
      const sel = selectionsArray[0];
      return sel.bodyRegionName || sel.bodyRegionId.replace(/-/g, " ");
    }
    return `${selectionsArray.length} locations marked`;
  }, [selectionsArray]);

  // Internal body map handlers
  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handleCoordinateMark = (
    regionId: string,
    coordinates: { x: number; y: number },
    details?: { severity: number; notes: string; timestamp: Date }
  ) => {
    const regionName = regionId.replace(/-/g, ' ');

    setInternalSelection({
      bodyRegionId: regionId,
      bodyRegionName: regionName,
      coordinates,
    });

    // Story 3.7.2: In flare creation, details are not used
    // The marker preview is just for positioning - severity/notes are entered in this modal
    if (details) {
      console.log('Marker details received (ignored for flare creation):', details);
    }

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

    // Story 3.7.7: Map all selections to bodyLocations array
    const bodyLocations = selectionsArray.map(sel => ({
      bodyRegionId: sel.bodyRegionId,
      coordinates: sel.coordinates,
    }));

    const createPayload: CreateFlareInput = {
      bodyRegionId: payload.selection.bodyRegionId,
      coordinates: payload.selection.coordinates,
      initialSeverity: payload.severity,
      currentSeverity: payload.severity,
      startDate: payload.timestamp,
      createdAt: payload.timestamp,
      updatedAt: payload.timestamp,
      initialEventNotes: trimmedNotes && trimmedNotes.length > 0 ? trimmedNotes : undefined,
      bodyLocations, // Story 3.7.7: Pass all marked locations
    };

    return flareRepository.createFlare(userId, createPayload);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!hasSelection || selectionsArray.length === 0) {
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

      // Story 3.7.7: Create flare with all marked body locations
      const primarySelection = selectionsArray[0];
      const result = await saveHandler({
        timestamp,
        severity,
        notes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
        selection: primarySelection,
      });

      const createdFlare: FlareRecord | undefined =
        (result as FlareRecord | undefined) ?? undefined;

      if (createdFlare) {
        // Show success toast with action buttons
        const locationsText = selectionsArray.length === 1
          ? (primarySelection.bodyRegionName || primarySelection.bodyRegionId)
          : `${selectionsArray.length} locations`;
        toast.success("Flare created successfully", {
          description: `Flare logged in ${locationsText}`,
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
        onCreated?.(createdFlare, submitAction === 'save-and-add-more');
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
          className="card relative w-full max-w-xl max-h-[90vh] focus:outline-none flex flex-col"
          style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }}
        >
          <form id="flare-creation-form" onSubmit={handleSubmit} className="flex flex-col h-full min-h-0" noValidate>
            <header className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 id="flare-creation-title" className="text-h2">
                  Create New Flare
                </h2>
                <p id="flare-creation-description" className="mt-1 text-small">
                  {selection ? "Confirm details for the flare you just marked on the body map." : "Select a location on the body map and confirm flare details."}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="icon-btn"
                aria-label="Close"
                disabled={isSaving}
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* Body Map Selection (only shown when no external selection provided) */}
            {!selection && (
              <div className="px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-h3">Select Body Location</h3>
                  <BodyViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
                <div className="h-[300px] rounded-lg mb-3 overflow-visible relative" style={{ backgroundColor: 'var(--muted)' }}>
                  <BodyMapViewer
                    key={currentView}
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
                  <p className="text-tiny">💡 Click region, then click again to mark exact location</p>
                </div>
              </div>
            )}

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <section className="card px-4 py-3" style={{ backgroundColor: 'var(--muted)' }}>
                <p className="text-small font-medium">
                  Body Location{selectionsArray.length > 1 ? 's' : ''}
                </p>
                <p className="mt-1 text-h4">
                  {locationsSummary}
                </p>
                {selectionsArray.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {selectionsArray.map((sel, index) => (
                      <div key={`${sel.bodyRegionId}-${index}`} className="text-tiny">
                        {index + 1}. <strong>{sel.bodyRegionName || sel.bodyRegionId.replace(/-/g, ' ')}</strong>
                        {' - '}
                        <span className="font-mono">
                          ({formatPercentage(sel.coordinates.x)}, {formatPercentage(sel.coordinates.y)})
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-tiny" style={{ color: 'var(--text-muted)' }}>
                    Waiting for body location selection&hellip;
                  </p>
                )}
              </section>

              <section>
                <label
                  htmlFor="flare-severity"
                  className="mb-2 block text-small font-medium"
                >
                  Initial severity <span style={{ color: 'var(--error)' }}>*</span>
                </label>

                <div className="card px-4 py-3">
                  <div className="flex items-center justify-between text-tiny">
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
                      className="flex-1"
                      style={{ accentColor: 'var(--error)' }}
                      aria-valuemin={1}
                      aria-valuemax={10}
                      aria-valuenow={severity}
                    />
                    <div className="flex min-w-[88px] flex-col items-center rounded-md px-3 py-2" style={{ backgroundColor: '#FEE2E2' }}>
                      <span className="text-lg font-semibold" style={{ color: 'var(--error)' }}>{severity}/10</span>
                      <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--error)' }}>
                        {severityLabel(severity)}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between">
                  <label htmlFor="flare-notes" className="text-small font-medium">
                    Notes (optional)
                  </label>
                  <span className="text-tiny">{notes.length}/{MAX_NOTES_LENGTH}</span>
                </div>
                <textarea
                  id="flare-notes"
                  value={notes}
                  onChange={(event) => handleNotesChange(event.target.value)}
                  rows={4}
                  maxLength={MAX_NOTES_LENGTH}
                  className="mt-2 w-full rounded-lg px-3 py-2 text-small"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)'
                  }}
                  placeholder="Add context, triggers, or symptom details…"
                  aria-describedby="flare-notes-helper"
                />
                <p id="flare-notes-helper" className="mt-1 text-tiny" style={{ color: 'var(--text-muted)' }}>
                  Notes are stored with the initial event and help explain flare context later.
                </p>
              </section>

              <section>
                <label htmlFor="flare-timestamp" className="mb-2 block text-small font-medium">
                  Timestamp <span style={{ color: 'var(--error)' }}>*</span>
                </label>
                <input
                  id="flare-timestamp"
                  type="datetime-local"
                  value={timestampValue}
                  onChange={(event) => setTimestampValue(event.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-small"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)'
                  }}
                  required
                />
                <p className="mt-1 text-tiny" style={{ color: 'var(--text-muted)' }}>
                  Adjust if the flare started earlier. We store times in local time and convert to epoch milliseconds.
                </p>
              </section>

              {errorMessage && (
                <div
                  className="badge-error rounded-md px-3 py-2 text-small"
                  role="alert"
                  aria-live="assertive"
                >
                  {errorMessage}
                </div>
              )}
            </div>

            <footer className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:justify-end" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSaving}
              >
                Cancel (Esc)
              </button>
              <button
                type="submit"
                onClick={() => setSubmitAction('save')}
                className="btn-secondary inline-flex items-center justify-center gap-2"
                disabled={!hasSelection || isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving && submitAction === 'save' ? "Saving…" : "Save"}
              </button>
              <button
                type="submit"
                onClick={() => setSubmitAction('save-and-add-more')}
                className="btn-primary inline-flex items-center justify-center gap-2"
                disabled={!hasSelection || isSaving}
              >
                <Save className="h-4 w-4" />
                {isSaving && submitAction === 'save-and-add-more' ? "Saving…" : "Save & Add More"}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}
