import { DisplayOptions } from "@/lib/types/calendar";

interface LegendProps {
  displayOptions: DisplayOptions;
}

export const Legend = ({ displayOptions }: LegendProps) => {
  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <span className="font-semibold text-foreground">Legend</span>
      <span>Mode: {displayOptions.colorScheme}</span>
    </div>
  );
};
