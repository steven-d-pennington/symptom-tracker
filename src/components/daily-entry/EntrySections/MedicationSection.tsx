"use client";

import { DailyMedication } from "@/lib/types/daily-entry";
import { MedicationOption } from "@/lib/data/daily-entry-presets";

interface MedicationSectionProps {
  medications: DailyMedication[];
  schedule: MedicationOption[];
  onToggleTaken: (medicationId: string) => void;
  onUpdateMedication: (
    medicationId: string,
    changes: Partial<DailyMedication>,
  ) => void;
}

export const MedicationSection = ({
  medications,
  schedule,
  onToggleTaken,
  onUpdateMedication,
}: MedicationSectionProps) => {
  return (
    <section className="space-y-4" aria-label="Medication tracking">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Medications</h3>
        <p className="text-sm text-muted-foreground">
          Keep your routine on track by checking off what you took today.
        </p>
      </header>

      <div className="space-y-4">
        {schedule.map((medication) => {
          const entryMedication = medications.find(
            (item) => item.medicationId === medication.id,
          );
          const taken = entryMedication?.taken ?? false;

          return (
            <div
              key={medication.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-foreground">{medication.name}</p>
                <p className="text-xs text-muted-foreground">
                  {medication.dosage} · {medication.schedule}
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={taken}
                    onChange={() => onToggleTaken(medication.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  Taken today
                </label>

                <label className="flex flex-1 flex-col gap-2 text-sm">
                  <span className="font-medium text-foreground">Dosage</span>
                  <input
                    type="text"
                    value={entryMedication?.dosage ?? medication.dosage}
                    onChange={(event) =>
                      onUpdateMedication(medication.id, {
                        dosage: event.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>

                <label className="flex flex-1 flex-col gap-2 text-sm">
                  <span className="font-medium text-foreground">Notes</span>
                  <input
                    type="text"
                    value={entryMedication?.notes ?? ""}
                    onChange={(event) =>
                      onUpdateMedication(medication.id, {
                        notes: event.target.value,
                      })
                    }
                    placeholder="Side effects, reminders, or adjustments"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
