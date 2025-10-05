"use client";

import { DailyEntry } from "@/lib/types/daily-entry";

interface HealthSectionProps {
  overallHealth: number;
  energyLevel: number;
  sleepQuality: number;
  stressLevel: number;
  onChange: (changes: Partial<DailyEntry>) => void;
}

export const HealthSection = ({
  overallHealth,
  energyLevel,
  sleepQuality,
  stressLevel,
  onChange,
}: HealthSectionProps) => {
  const renderSlider = (
    label: string,
    value: number,
    key: keyof Pick<DailyEntry, "overallHealth" | "energyLevel" | "sleepQuality" | "stressLevel">,
  ) => (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={(event) =>
          onChange({ [key]: Number(event.target.value) } as Partial<DailyEntry>)
        }
        className="h-2 w-full cursor-pointer rounded-full bg-muted"
      />
      <span className="text-xs text-muted-foreground">{value} / 10</span>
    </label>
  );

  return (
    <fieldset className="grid gap-4 md:grid-cols-2" aria-label="Daily health inputs">
      {renderSlider("Overall health", overallHealth, "overallHealth")}
      {renderSlider("Energy", energyLevel, "energyLevel")}
      {renderSlider("Sleep quality", sleepQuality, "sleepQuality")}
      {renderSlider("Stress", stressLevel, "stressLevel")}
    </fieldset>
  );
};
