import { DisplayOptions } from "@/lib/types/calendar";

interface LegendProps {
  displayOptions: DisplayOptions;
}

export const Legend = ({ displayOptions }: LegendProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
      <div>
        <span className="font-semibold text-foreground">Legend</span>
        <p>Color mode: {displayOptions.colorScheme}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayOptions.showHealthScore ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
            Health
          </span>
        ) : null}
        {displayOptions.showSymptoms ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-rose-700">
            <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden />
            Symptoms
          </span>
        ) : null}
        {displayOptions.showMedications ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
            Medications
          </span>
        ) : null}
        {displayOptions.showTriggers ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500" aria-hidden />
            Triggers
          </span>
        ) : null}
      </div>
    </div>
  );
};
