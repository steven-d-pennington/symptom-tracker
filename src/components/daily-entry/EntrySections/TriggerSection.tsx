"use client";

import { useMemo, useState } from "react";
import { DailyTrigger } from "@/lib/types/daily-entry";
import { TriggerOption } from "@/lib/data/daily-entry-presets";

interface TriggerSectionProps {
  triggers: DailyTrigger[];
  availableTriggers: TriggerOption[];
  onAddTrigger: (triggerId: string) => void;
  onUpdateTrigger: (
    triggerId: string,
    changes: Partial<DailyTrigger>,
  ) => void;
  onRemoveTrigger: (triggerId: string) => void;
}

const intensityLabel = (value: number) => {
  if (value <= 3) return "Low";
  if (value <= 6) return "Moderate";
  return "High";
};

export const TriggerSection = ({
  triggers,
  availableTriggers,
  onAddTrigger,
  onUpdateTrigger,
  onRemoveTrigger,
}: TriggerSectionProps) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");

  const unusedTriggers = useMemo(
    () =>
      availableTriggers.filter(
        (trigger) => !triggers.some((item) => item.triggerId === trigger.id),
      ),
    [availableTriggers, triggers],
  );

  const correlationHints = useMemo(() => {
    return triggers.map((trigger) => {
      if (trigger.intensity >= 7) {
        return {
          triggerId: trigger.triggerId,
          message: "High intensity today. Check your notes for potential mitigation steps.",
        };
      }

      if (trigger.intensity <= 3) {
        return {
          triggerId: trigger.triggerId,
          message: "Lower than usual. Celebrate what helped keep this trigger in check!",
        };
      }

      return {
        triggerId: trigger.triggerId,
        message: "Steady intensity. Keep logging to surface weekly trends.",
      };
    });
  }, [triggers]);

  return (
    <section className="space-y-4" aria-label="Trigger logging">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">Triggers</h3>
        <p className="text-sm text-muted-foreground">
          Spot what may be contributing to good or tough days with quick trigger tracking.
        </p>
      </header>

      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Need ideas?</p>
        <p>Look for:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Weather shifts or seasonal changes</li>
          <li>Stressful conversations or deadlines</li>
          <li>Diet changes, hydration, or caffeine</li>
          <li>Sleep disruptions or late nights</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-2 text-sm">
          <span className="font-medium text-foreground">Add trigger</span>
          <select
            value={selectedTrigger}
            onChange={(event) => setSelectedTrigger(event.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="">Select trigger</option>
            {unusedTriggers.map((trigger) => (
              <option key={trigger.id} value={trigger.id}>
                {trigger.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => selectedTrigger && onAddTrigger(selectedTrigger)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          disabled={!selectedTrigger}
        >
          Add
        </button>
      </div>

      <div className="space-y-4">
        {triggers.length === 0 && (
          <p className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-foreground">
            Log a trigger whenever you notice something that may influence how you feel.
          </p>
        )}

        {triggers.map((trigger) => {
          const option = availableTriggers.find(
            (item) => item.id === trigger.triggerId,
          );
          const hint = correlationHints.find(
            (item) => item.triggerId === trigger.triggerId,
          );

          return (
            <div
              key={trigger.triggerId}
              className="space-y-3 rounded-xl border border-border bg-background/60 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {option?.label ?? trigger.triggerId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {option?.description ?? "Custom trigger"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveTrigger(trigger.triggerId)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
                >
                  Remove
                </button>
              </div>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Intensity</span>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={trigger.intensity}
                  onChange={(event) =>
                    onUpdateTrigger(trigger.triggerId, {
                      intensity: Number(event.target.value),
                    })
                  }
                  className="h-2 w-full cursor-pointer rounded-full bg-muted"
                />
                <span className="text-xs text-muted-foreground">
                  {trigger.intensity} / 10 ({intensityLabel(trigger.intensity)})
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-foreground">Notes</span>
                <textarea
                  value={trigger.notes ?? ""}
                  onChange={(event) =>
                    onUpdateTrigger(trigger.triggerId, {
                      notes: event.target.value,
                    })
                  }
                  placeholder="What happened, how long it lasted, or what helped"
                  className="min-h-20 rounded-lg border border-border bg-background px-3 py-2"
                />
              </label>

              {hint && (
                <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 text-xs text-primary">
                  {hint.message}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
