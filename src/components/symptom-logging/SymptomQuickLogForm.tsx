"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { symptomRepository } from "@/lib/repositories/symptomRepository";
import { symptomInstanceRepository } from "@/lib/repositories/symptomInstanceRepository";
import { toast } from "@/components/common/Toast";
import { SymptomRecord } from "@/lib/db/schema";
import { SymptomSelectionList } from "./SymptomSelectionList";

interface SymptomQuickLogFormProps {
  userId: string;
}

/**
 * Quick Log Form for Symptom Logging (Story 3.5.3)
 *
 * Two-stage form:
 * 1. Quick Log: symptom selection, severity, timestamp (required fields)
 * 2. Add Details: body location, notes, tags (optional fields, expandable)
 *
 * AC3.5.3.2: Quick Log mode for essential fields
 * AC3.5.3.3: Add Details expansion for optional fields
 * AC3.5.3.7: Full-page symptom selection
 */
export function SymptomQuickLogForm({ userId }: SymptomQuickLogFormProps) {
  const router = useRouter();

  // Quick Log fields (essential)
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomRecord | null>(null);
  const [severity, setSeverity] = useState<number>(5);
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Add Details fields (optional, progressive disclosure)
  const [showDetails, setShowDetails] = useState(false);
  const [bodyLocation, setBodyLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [recentNotes, setRecentNotes] = useState<string[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);

  // Load symptoms on mount
  useEffect(() => {
    const loadSymptoms = async () => {
      try {
        setIsLoadingSymptoms(true);
        const activeSymptoms = await symptomRepository.getActive(userId);
        // Filter to only enabled symptoms (Story 3.5.1)
        const enabledSymptoms = activeSymptoms.filter(s => s.isEnabled);
        setSymptoms(enabledSymptoms);
      } catch (error) {
        console.error("Failed to load symptoms:", error);
        toast.error("Failed to load symptoms", {
          description: "Please try refreshing the page"
        });
      } finally {
        setIsLoadingSymptoms(false);
      }
    };

    loadSymptoms();
  }, [userId]);

  // Load recent notes when symptom is selected
  useEffect(() => {
    if (!selectedSymptom) {
      setRecentNotes([]);
      return;
    }

    const loadRecentNotes = async () => {
      try {
        const notes = await symptomInstanceRepository.getRecentNotes(
          userId,
          selectedSymptom.name,
          10
        );
        setRecentNotes(notes.filter(n => n.trim().length > 0));
      } catch (error) {
        console.error("Failed to load recent notes:", error);
        // Non-critical, don't show error to user
      }
    };

    loadRecentNotes();
  }, [selectedSymptom, userId]);

  const handleSymptomSelect = (symptom: SymptomRecord) => {
    setSelectedSymptom(symptom);
    // Scroll to form after selection on mobile
    setTimeout(() => {
      document.getElementById("quick-log-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 100);
  };

  const handleNoteChipClick = (note: string) => {
    setNotes(note);
    if (!showDetails) {
      setShowDetails(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedSymptom) {
      toast.error("Please select a symptom");
      return;
    }

    if (severity < 1 || severity > 10) {
      toast.error("Severity must be between 1 and 10");
      return;
    }

    try {
      setIsSaving(true);

      // Create symptom instance
      const symptomId = await symptomInstanceRepository.create({
        userId,
        name: selectedSymptom.name,
        category: selectedSymptom.category,
        severity,
        severityScale: {
          type: "numeric",
          ...selectedSymptom.severityScale,
        },
        timestamp: new Date(timestamp),
        // Optional fields (only if details expanded)
        ...(showDetails && {
          location: bodyLocation || undefined,
          notes: notes || undefined,
        }),
      });

      console.log("✅ Symptom instance created:", {
        symptomId,
        userId,
        name: selectedSymptom.name,
        severity,
        timestamp: new Date(timestamp).toLocaleString(),
        hasDetails: showDetails,
      });

      // CRITICAL: Wait for IndexedDB transaction to fully commit
      // Mobile devices especially need time for disk writes
      await new Promise(resolve => setTimeout(resolve, 200));

      // Success feedback
      toast.success("Symptom logged successfully", {
        description: `${selectedSymptom.name} logged at severity ${severity}/10`,
        duration: 3000,
      });

      // Navigate back to dashboard with refresh flag
      // Additional delay ensures IndexedDB commit completes (Story 3.5.13)
      setTimeout(() => {
        router.push("/dashboard?refresh=symptom");
      }, 500);
    } catch (error) {
      console.error("Failed to log symptom:", error);
      toast.error("Failed to log symptom", {
        description: "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="space-y-6">
      {/* Symptom Selection Section - AC3.5.3.7 */}
      <section className="bg-card rounded-lg shadow-sm">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Select Symptom</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose the symptom you want to log
          </p>
        </div>

        <div className="p-4">
          <SymptomSelectionList
            symptoms={symptoms}
            selectedSymptom={selectedSymptom}
            onSymptomSelect={handleSymptomSelect}
            isLoading={isLoadingSymptoms}
            userId={userId}
          />
        </div>
      </section>

      {/* Quick Log Form - AC3.5.3.2 */}
      {selectedSymptom && (
        <form
          id="quick-log-form"
          onSubmit={handleSubmit}
          className="bg-card rounded-lg shadow-sm p-6 space-y-6"
        >
          {/* Selected Symptom Display */}
          <div className="pb-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Quick Log</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Logging: <span className="font-medium text-foreground">{selectedSymptom.name}</span>
            </p>
          </div>

          {/* Essential Fields */}
          <div className="space-y-4">
            {/* Severity Slider */}
            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-foreground mb-2">
                Severity: {severity}/10 <span className="text-red-500">*</span>
              </label>
              <input
                id="severity"
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Severe)</span>
              </div>
            </div>

            {/* Timestamp */}
            <div>
              <label htmlFor="timestamp" className="block text-sm font-medium text-foreground mb-2">
                When <span className="text-red-500">*</span>
              </label>
              <input
                id="timestamp"
                type="datetime-local"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                max={new Date().toISOString().slice(0, 16)}
                className="w-full border border-border rounded-lg p-3 text-base bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
                style={{ minHeight: "44px" }} // WCAG AAA touch target
              />
            </div>
          </div>

          {/* Expandable Details Section - AC3.5.3.3 */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-border transition-all">
              <h3 className="text-md font-semibold text-foreground">Additional Details</h3>

              {/* Body Location */}
              <div>
                <label htmlFor="bodyLocation" className="block text-sm font-medium text-foreground mb-2">
                  Body Location
                </label>
                <input
                  id="bodyLocation"
                  type="text"
                  value={bodyLocation}
                  onChange={(e) => setBodyLocation(e.target.value)}
                  placeholder="e.g., Left arm, Lower back..."
                  className="w-full border border-border rounded-lg p-3 text-base bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ minHeight: "44px" }}
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes about this symptom..."
                  className="w-full border border-border rounded-lg p-3 text-base bg-background text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {notes.length}/500 characters
                </p>
              </div>

              {/* Recent Notes Suggestions */}
              {recentNotes.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Recent notes for {selectedSymptom.name}:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentNotes.slice(0, 5).map((note, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleNoteChipClick(note)}
                        className="px-3 py-1.5 text-sm bg-muted text-foreground rounded-full hover:bg-primary/10 transition-colors"
                        style={{ minHeight: "32px" }}
                      >
                        {note.length > 40 ? `${note.slice(0, 40)}...` : note}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - AC3.5.3.8 (44x44px touch targets) */}
          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-primary text-primary-foreground py-3 rounded-lg text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ minHeight: "44px" }}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Save Symptom"
              )}
            </button>

            <button
              type="button"
              onClick={toggleDetails}
              className="w-full bg-muted text-foreground py-3 rounded-lg text-base font-medium hover:bg-primary/10 transition-colors"
              style={{ minHeight: "44px" }}
            >
              {showDetails ? "Hide Details" : "Add Details"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="w-full text-muted-foreground py-3 rounded-lg text-base font-medium hover:text-foreground transition-colors"
              style={{ minHeight: "44px" }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Empty state when no symptom selected */}
      {!selectedSymptom && !isLoadingSymptoms && symptoms.length > 0 && (
        <div className="bg-card rounded-lg shadow-sm p-8 text-center">
          <p className="text-muted-foreground">
            Select a symptom above to start logging
          </p>
        </div>
      )}

      {/* Empty state when no symptoms exist */}
      {!isLoadingSymptoms && symptoms.length === 0 && (
        <div className="bg-card rounded-lg shadow-sm p-8 text-center">
          <p className="text-muted-foreground mb-4">
            No symptoms available. Please add symptoms in Settings.
          </p>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Settings
          </button>
        </div>
      )}
    </div>
  );
}
