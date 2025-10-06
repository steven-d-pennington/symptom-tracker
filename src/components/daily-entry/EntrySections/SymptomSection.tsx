"use client";

import { useMemo, useState } from "react";
import { DailySymptom } from "@/lib/types/daily-entry";
import { SymptomOption } from "@/lib/data/daily-entry-presets";

interface SymptomSectionProps {
  symptoms: DailySymptom[];
  availableSymptoms: SymptomOption[];
  recentSymptomIds: string[];
  onAddSymptom: (symptomId: string) => void;
  onUpdateSymptom: (
    symptomId: string,
    changes: Partial<DailySymptom>,
  ) => void;
  onRemoveSymptom: (symptomId: string) => void;
}

const severityLabel = (value: number) => {
  if (value <= 2) return "Mild";
  if (value <= 6) return "Moderate";
  return "Severe";
};

export const SymptomSection = ({
  symptoms,
  availableSymptoms,
  recentSymptomIds,
  onAddSymptom,
  onUpdateSymptom,
  onRemoveSymptom,
}: SymptomSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSymptom, setSelectedSymptom] = useState<string>("");

  const filteredOptions = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return availableSymptoms.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    );
  }, [availableSymptoms, searchTerm]);

  const quickSymptomOptions = useMemo(
    () =>
      recentSymptomIds
        .map((symptomId) =>
          availableSymptoms.find((option) => option.id === symptomId),
        )
        .filter((option): option is SymptomOption => Boolean(option)),
    [availableSymptoms, recentSymptomIds],
  );

  const handleAddSymptom = (symptomId: string) => {
    onAddSymptom(symptomId);
    setSelectedSymptom("");
    setSearchTerm("");
  };

  return (
    <section className="space-y-4" aria-label="Symptom tracking">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Symptoms</h3>
        <p className="text-sm text-muted-foreground">
          Track what you felt today so we can surface correlations in your timeline.
        </p>
      </header>

      {quickSymptomOptions.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Recent symptoms">
          {quickSymptomOptions.map((option) => {
            const isActive = symptoms.some(
              (symptom) => symptom.symptomId === option.id,
            );
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleAddSymptom(option.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground hover:border-primary/60"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Add symptom</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search symptoms"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="w-full sm:w-48">
          <label className="flex flex-col gap-2 text-sm">
            <span className="font-medium text-foreground">Choose</span>
            <select
              value={selectedSymptom}
              onChange={(event) => setSelectedSymptom(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select</option>
              {filteredOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          onClick={() => selectedSymptom && handleAddSymptom(selectedSymptom)}
          className="self-end rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          disabled={!selectedSymptom}
        >
          Add
        </button>
      </div>

      <div className="space-y-4">
        {symptoms.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            No symptoms logged yet. Use the search or quick picks above to begin tracking.
          </p>
        )}

        {symptoms.map((symptom) => {
          const option = availableSymptoms.find(
            (item) => item.id === symptom.symptomId,
          );
          return (
            <div
              key={symptom.symptomId}
              className="space-y-3 rounded-xl border border-border bg-background/60 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {option?.label ?? symptom.symptomId}
                  </p>
                  {option?.category && (
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {option.category}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveSymptom(symptom.symptomId)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  Remove
                </button>
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Severity</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={symptom.severity}
                  onChange={(event) =>
                    onUpdateSymptom(symptom.symptomId, {
                      severity: Number(event.target.value),
                    })
                  }
                  className="h-2 w-full cursor-pointer rounded-full bg-muted"
                />
                <span className="text-xs text-muted-foreground">
                  {symptom.severity} / 10 ({severityLabel(symptom.severity)})
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Notes</span>
                <textarea
                  value={symptom.notes ?? ""}
                  onChange={(event) =>
                    onUpdateSymptom(symptom.symptomId, {
                      notes: event.target.value,
                    })
                  }
                  placeholder="Add context, duration, or what helped."
                  className="min-h-20 rounded-lg border border-border bg-background px-3 py-2"
                />
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
};
