"use client";

import { useMemo, useState } from "react";
import { DailyEntry, DailyEntryTemplate } from "@/lib/types/daily-entry";
import { SYMPTOM_OPTIONS, TRIGGER_OPTIONS, MedicationOption } from "@/lib/data/daily-entry-presets";
import { HealthSection } from "./EntrySections/HealthSection";
import { SymptomSection } from "./EntrySections/SymptomSection";
import { MedicationSection } from "./EntrySections/MedicationSection";
import { TriggerSection } from "./EntrySections/TriggerSection";
import { NotesSection } from "./EntrySections/NotesSection";
import { QuickEntry } from "./QuickEntry";
import { SmartSuggestions } from "../daily-entry/SmartSuggestions";
import { Suggestion } from "./hooks/useSmartSuggestions";
import { DailyMedication, DailySymptom, DailyTrigger } from "@/lib/types/daily-entry";

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
}: DailyEntryFormProps) => {
  const [mode, setMode] = useState<"full" | "quick">("full");

  const orderedSections = useMemo(
    () =>
      [...template.sections].sort((a, b) => a.order - b.order).map((section) => section.type),
    [template.sections],
  );

  return (
    <section className="space-y-8" aria-label="Daily entry form">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-foreground">Daily check-in</h2>
          <p className="text-sm text-muted-foreground">
            Capture a quick snapshot of how you’re feeling today. Smart suggestions help you focus where it matters.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Mode:</span>
          <button
            type="button"
            onClick={() => setMode("full")}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
              mode === "full"
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:border-primary"
            }`}
          >
            Guided
          </button>
          <button
            type="button"
            onClick={() => setMode("quick")}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
              mode === "quick"
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
                  availableSymptoms={SYMPTOM_OPTIONS}
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
                  availableTriggers={TRIGGER_OPTIONS}
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
