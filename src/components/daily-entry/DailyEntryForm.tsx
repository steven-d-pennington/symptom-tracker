"use client";

import { useMemo, useState, useEffect } from "react";
import { DailyEntry, DailyEntryTemplate } from "@/lib/types/daily-entry";
import { MedicationOption, SymptomOption, TriggerOption } from "@/lib/data/daily-entry-presets";
import { HealthSection } from "./EntrySections/HealthSection";
import { SymptomSection } from "./EntrySections/SymptomSection";
import { MedicationSection } from "./EntrySections/MedicationSection";
import { TriggerSection } from "./EntrySections/TriggerSection";
import { NotesSection } from "./EntrySections/NotesSection";
import { QuickEntry } from "./QuickEntry";
import { SmartSuggestions } from "../daily-entry/SmartSuggestions";
import { Suggestion } from "./hooks/useSmartSuggestions";
import { DailyMedication, DailySymptom, DailyTrigger } from "@/lib/types/daily-entry";
import { symptomRepository } from "@/lib/repositories/symptomRepository";
import { triggerRepository } from "@/lib/repositories/triggerRepository";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface DailyEntryFormProps {
  entry: DailyEntry;
  template: DailyEntryTemplate;
  updateEntry: (changes: Partial<DailyEntry>) => void;
  upsertSymptom: (symptomId: string, changes?: Partial<DailySymptom>) => void;
  removeSymptom: (symptomId: string) => void;
  updateMedication: (medicationId: string, changes: Partial<DailyMedication>) => void;
  toggleMedicationTaken: (medicationId: string) => void;
  upsertTrigger: (triggerId: string, changes?: Partial<DailyTrigger>) => void;
  removeTrigger: (triggerId: string) => void;
  saveEntry: () => Promise<void>;
  isSaving: boolean;
  completion: number;
  lastSavedAt: Date | null;
  suggestions: Suggestion[];
  queueLength: number;
  onSyncQueue: () => Promise<void> | void;
  recentSymptomIds: string[];
  medicationSchedule: MedicationOption[];
  entryHistory: DailyEntry[];
}

const formatLastSaved = (date: Date | null) => {
  if (!date) return "Not saved yet";
  return `Last saved ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};

export const DailyEntryForm = ({
  entry,
  template,
  updateEntry,
  upsertSymptom,
  removeSymptom,
  updateMedication,
  toggleMedicationTaken,
  upsertTrigger,
  removeTrigger,
  saveEntry,
  isSaving,
  completion,
  lastSavedAt,
  suggestions,
  queueLength,
  onSyncQueue,
  recentSymptomIds,
  medicationSchedule,
  entryHistory,
}: DailyEntryFormProps) => {
  const { userId } = useCurrentUser();
  const [mode, setMode] = useState<"full" | "quick">("full");
  const [symptomOptions, setSymptomOptions] = useState<SymptomOption[]>([]);
  const [triggerOptions, setTriggerOptions] = useState<TriggerOption[]>([]);

  // Load symptoms and triggers from database
  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      try {
        // Load symptoms (only enabled ones)
        const symptoms = await symptomRepository.getAll(userId);
        const enabledSymptoms = symptoms.filter(s => s.isActive && s.isEnabled);
        setSymptomOptions(
          enabledSymptoms.map(s => ({
            id: s.id,
            label: s.name,
            category: s.category,
          }))
        );

        // Load triggers (only enabled ones)
        const triggers = await triggerRepository.getAll(userId);
        const enabledTriggers = triggers.filter(t => t.isActive && t.isEnabled);
        setTriggerOptions(
          enabledTriggers.map(t => ({
            id: t.id,
            label: t.name,
            description: t.description || "",
          }))
        );
      } catch (error) {
        console.error("Failed to load symptoms/triggers:", error);
      }
    };

    loadData();
  }, [userId]);

  const orderedSections = useMemo(
    () =>
      [...template.sections].sort((a, b) => a.order - b.order).map((section) => section.type),
    [template.sections],
  );

  return (
    <section className="space-y-8" aria-label="Daily entry form">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}, Steven.
          </h2>
          <p className="text-lg text-muted-foreground">
            How are you feeling today?
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={async () => {
              // Find the most recent entry from history
              const lastEntry = entryHistory.length > 0 ? entryHistory[0] : null;

              if (lastEntry) {
                // Copy symptoms, medications, and triggers
                updateEntry({
                  overallHealth: lastEntry.overallHealth,
                  energyLevel: lastEntry.energyLevel,
                  sleepQuality: lastEntry.sleepQuality,
                  stressLevel: lastEntry.stressLevel,
                  symptoms: lastEntry.symptoms.map(s => ({ ...s, notes: '' })), // Clear notes
                  medications: lastEntry.medications.map(m => ({ ...m, taken: false })), // Reset taken status
                  triggers: lastEntry.triggers.map(t => ({ ...t, notes: '' })), // Clear notes
                });

                // Haptic feedback
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([10, 50, 10]);
                }
              }
            }}
            className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            title="Copy data from last entry"
          >
            <span>↺ Same as yesterday</span>
          </button>

          <div className="h-4 w-px bg-border mx-1" />

          <span className="text-muted-foreground hidden sm:inline">Mode:</span>
          <button
            type="button"
            onClick={() => setMode("full")}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${mode === "full"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-foreground hover:border-primary"
              }`}
          >
            Guided
          </button>
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${mode === "quick"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-foreground hover:border-primary"
              }`}
          >
            Quick
          </button>
        </div>
      </header>

      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${completion}%` }}
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-xs text-muted-foreground">{completion}% complete · {formatLastSaved(lastSavedAt)}</p>
      </div>

      {mode === "quick" ? (
        <QuickEntry
          entry={entry}
          suggestions={suggestions}
          onUpdate={updateEntry}
          onSubmit={saveEntry}
          isSaving={isSaving}
          completion={completion}
        />
      ) : (
        <form
          className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void saveEntry();
          }}
        >
          {orderedSections.map((section) => {
            if (section === "health") {
              return (
                <HealthSection
                  key="health"
                  overallHealth={entry.overallHealth}
                  energyLevel={entry.energyLevel}
                  sleepQuality={entry.sleepQuality}
                  stressLevel={entry.stressLevel}
                  onChange={updateEntry}
                />
              );
            }

            if (section === "symptoms") {
              return (
                <SymptomSection
                  key="symptoms"
                  symptoms={entry.symptoms}
                  availableSymptoms={symptomOptions}
                  recentSymptomIds={recentSymptomIds}
                  onAddSymptom={(symptomId) => upsertSymptom(symptomId)}
                  onUpdateSymptom={(symptomId, changes) => upsertSymptom(symptomId, changes)}
                  onRemoveSymptom={removeSymptom}
                />
              );
            }

            if (section === "medications") {
              return (
                <MedicationSection
                  key="medications"
                  medications={entry.medications}
                  schedule={medicationSchedule}
                  onToggleTaken={toggleMedicationTaken}
                  onUpdateMedication={updateMedication}
                />
              );
            }

            if (section === "triggers") {
              return (
                <TriggerSection
                  key="triggers"
                  triggers={entry.triggers}
                  availableTriggers={triggerOptions}
                  onAddTrigger={(triggerId) => upsertTrigger(triggerId)}
                  onUpdateTrigger={(triggerId, changes) => upsertTrigger(triggerId, changes)}
                  onRemoveTrigger={removeTrigger}
                />
              );
            }

            if (section === "notes") {
              return (
                <NotesSection
                  key="notes"
                  notes={entry.notes ?? ""}
                  mood={entry.mood}
                  weather={entry.weather}
                  location={entry.location}
                  onChange={updateEntry}
                  onAutoSave={() => {
                    // Auto-save hook for future persistence integration.
                  }}
                />
              );
            }

            return null;
          })}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {queueLength > 0
                ? `${queueLength} entry${queueLength > 1 ? "ies" : ""} will sync when you’re back online.`
                : "Entries save instantly once submitted."}
            </div>
            <div className="flex gap-2">
              {queueLength > 0 && (
                <button
                  type="button"
                  onClick={() => onSyncQueue()}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary"
                >
                  Sync queued entries
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save entry"}
              </button>
            </div>
          </div>
        </form>
      )}

      <SmartSuggestions
        suggestions={suggestions}
        offlineCount={queueLength}
        onSync={queueLength > 0 ? onSyncQueue : undefined}
      />
    </section>
  );
};
