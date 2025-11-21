import { DisplayOptions } from "@/lib/types/calendar";

interface LegendProps {
  displayOptions: DisplayOptions;
}

export const Legend = ({ displayOptions }: LegendProps) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
      <div>
        <span className="font-semibold text-foreground">Legend</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayOptions.showSymptoms ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-blue-700">
            <span className="h-2 w-2 rounded-full bg-blue-500" aria-hidden />
            Symptoms
          </span>
        ) : null}
        {displayOptions.showTriggers ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-yellow-700">
            <span className="h-2 w-2 rounded-full bg-yellow-500" aria-hidden />
            Triggers
          </span>
        ) : null}
        {displayOptions.showMedications ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-1 text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-500" aria-hidden />
            Medications
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500" aria-hidden />
          Flares
        </span>
      </div>
    </div>
  );
};
