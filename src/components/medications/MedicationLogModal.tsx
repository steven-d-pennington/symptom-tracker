"use client";

import { useState, useEffect } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { medicationRepository } from "@/lib/repositories/medicationRepository";
import { medicationEventRepository } from "@/lib/repositories/medicationEventRepository";
import { MedicationRecord } from "@/lib/db/schema";

interface MedicationLogModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onLogged?: () => void;
}

interface MedicationQuickLogItem {
  medicationId: string;
  name: string;
  dosage?: string;
  scheduledTime?: string;
  timingWarning?: 'early' | 'late' | null;
  hoursDifference?: number;
  lastNoteChips: string[];
  taken: boolean;
  isDefault: boolean; // Story 3.5.1: Track if medication is a default
}

export function MedicationLogModal({
  userId,
  isOpen,
  onClose,
  onLogged,
}: MedicationLogModalProps) {
  const [medications, setMedications] = useState<MedicationQuickLogItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load scheduled medications for today
  useEffect(() => {
    if (!isOpen) return;

    const loadMedications = async () => {
      try {
        setLoading(true);
        setError(null);

        const today = new Date();
        const dayOfWeek = today.getDay();

        // Get medications scheduled for today (Story 3.5.1: includes both customs and enabled defaults)
        const allScheduled = await medicationRepository.getScheduledForDay(
          userId,
          dayOfWeek
        );

        // Filter to only show enabled medications (isEnabled: true) - Story 3.5.1
        // This allows users to hide defaults they don't use via Settings
        const scheduled = allScheduled.filter(med => med.isEnabled);

        // Get today's events to check what's already taken
        const todayEvents = await medicationEventRepository.getTodayEvents(userId);
        const takenMedicationIds = new Set(
          todayEvents.filter(e => e.taken).map(e => e.medicationId)
        );

        // Calculate timing warnings and load notes for each medication
        const items: MedicationQuickLogItem[] = await Promise.all(
          scheduled.map(async (med) => {
            // Get recent notes for smart suggestions
            const recentNotes = await medicationEventRepository.getRecentNotes(
              userId,
              med.id,
              10
            );

            // Find scheduled time for today
            const todaySchedule = med.schedule.find(s =>
              s.daysOfWeek.includes(dayOfWeek)
            );

            // Calculate timing warning with severity
            let timingWarning: 'early' | 'late' | null = null;
            let hoursDifference = 0;
            if (todaySchedule) {
              const [schedHours, schedMinutes] = todaySchedule.time.split(':').map(Number);
              const schedTimeInMinutes = schedHours * 60 + schedMinutes;
              const currentHours = today.getHours();
              const currentMinutes = today.getMinutes();
              const currentTimeInMinutes = currentHours * 60 + currentMinutes;
              const diffMinutes = currentTimeInMinutes - schedTimeInMinutes;
              hoursDifference = Math.abs(diffMinutes / 60);

              if (diffMinutes < -120) {
                timingWarning = 'early';
              } else if (diffMinutes > 120) {
                timingWarning = 'late';
              }
            }

            return {
              medicationId: med.id,
              name: med.name,
              dosage: med.dosage,
              scheduledTime: todaySchedule?.time,
              timingWarning,
              hoursDifference,
              lastNoteChips: recentNotes,
              taken: takenMedicationIds.has(med.id),
              isDefault: med.isDefault, // Story 3.5.1: Track default status
            };
          })
        );

        setMedications(items);
      } catch (err) {
        console.error("Failed to load medications:", err);
        setError("Failed to load medications. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadMedications();
  }, [userId, isOpen]);

  // Auto-save on checkbox change
  const handleCheckboxToggle = async (item: MedicationQuickLogItem) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const newTakenState = !item.taken;
      const timestamp = Date.now();

      // Create or update medication event
      await medicationEventRepository.create({
        userId,
        medicationId: item.medicationId,
        timestamp,
        taken: newTakenState,
        dosage: item.dosage,
        notes: notes[item.medicationId],
      });

      // Update local state
      setMedications(prev =>
        prev.map(med =>
          med.medicationId === item.medicationId
            ? { ...med, taken: newTakenState }
            : med
        )
      );

      // Show success message
      setSuccessMessage(
        `${item.name} marked as ${newTakenState ? 'taken' : 'not taken'}`
      );
      setTimeout(() => setSuccessMessage(null), 2000);

      // Notify parent
      onLogged?.();
    } catch (err) {
      console.error("Failed to log medication:", err);
      setError(`Failed to log ${item.name}. Please try again.`);
    }
  };

  // Apply note chip to notes field
  const handleChipClick = (medicationId: string, noteText: string) => {
    setNotes(prev => ({
      ...prev,
      [medicationId]: noteText,
    }));
  };

  // Update notes and re-save event
  const handleNotesChange = async (medicationId: string, noteText: string) => {
    setNotes(prev => ({
      ...prev,
      [medicationId]: noteText,
    }));

    // If medication is already taken, update the event with new notes
    const medication = medications.find(m => m.medicationId === medicationId);
    if (medication?.taken) {
      try {
        // Find today's event for this medication
        const todayEvents = await medicationEventRepository.getTodayEvents(userId);
        const event = todayEvents.find(e =>
          e.medicationId === medicationId && e.taken
        );

        if (event) {
          await medicationEventRepository.update(event.id, {
            notes: noteText,
          });
        }
      } catch (err) {
        console.error("Failed to update notes:", err);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-card p-4 sm:p-6 my-4 sm:my-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Log Medications
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Success/Error messages */}
          {successMessage && (
            <div
              className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-sm"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading medications...
            </div>
          ) : medications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No medications scheduled for today
            </div>
          ) : (
            <div className="space-y-4">
              {medications.map((medication) => {
                // Calculate warning severity for banner
                const warningBannerInfo = medication.timingWarning && medication.hoursDifference ? {
                  severity: medication.hoursDifference > 2 ? 'red' : 'yellow',
                  message: `Usually taken at ${medication.scheduledTime} (${Math.floor(medication.hoursDifference)} hour${Math.floor(medication.hoursDifference) !== 1 ? 's' : ''} ${medication.timingWarning})`
                } : null;

                return (
                <div
                  key={medication.medicationId}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  {/* Timing Warning Banner */}
                  {warningBannerInfo && (
                    <div
                      className={`p-3 rounded-lg flex items-start gap-2 text-sm ${
                        warningBannerInfo.severity === 'red'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                      }`}
                      role="status"
                      aria-live="polite"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{warningBannerInfo.message}</span>
                    </div>
                  )}

                  {/* Checkbox and medication info */}
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`med-${medication.medicationId}`}
                      checked={medication.taken}
                      onChange={() => handleCheckboxToggle(medication)}
                      className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                    />
                    <label
                      htmlFor={`med-${medication.medicationId}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-foreground">
                          {medication.name}
                        </span>
                        {/* Story 3.5.1 AC3.5.1.6: Visual indicator for defaults */}
                        {medication.isDefault && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            default
                          </span>
                        )}
                      </div>
                      {medication.dosage && (
                        <div className="text-sm text-muted-foreground">
                          {medication.dosage}
                        </div>
                      )}
                      {medication.scheduledTime && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>Scheduled: {medication.scheduledTime}</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Recent notes chips */}
                  {medication.lastNoteChips.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">
                        Recent notes:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {medication.lastNoteChips.map((note, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() =>
                              handleChipClick(medication.medicationId, note)
                            }
                            className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs hover:bg-primary/20 transition-colors"
                          >
                            {note.length > 30 ? `${note.slice(0, 30)}...` : note}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes field */}
                  <div>
                    <textarea
                      value={notes[medication.medicationId] || ''}
                      onChange={(e) =>
                        handleNotesChange(medication.medicationId, e.target.value)
                      }
                      placeholder="Any notes? (optional)"
                      rows={2}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              );
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
