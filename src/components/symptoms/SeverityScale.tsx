"use client";

import { useMemo } from "react";
import { SeverityScale as SeverityScaleType } from "@/lib/types/symptoms";

interface SeverityScaleProps {
  value: number;
  onChange: (value: number) => void;
  scale: SeverityScaleType;
  ariaLabel?: string;
}

const getColorForValue = (scale: SeverityScaleType, value: number) => {
  if (!scale.colors) {
    const ratio = (value - scale.min) / (scale.max - scale.min || 1);
    if (ratio <= 0.33) {
      return "#10b981";
    }

    if (ratio <= 0.66) {
      return "#f59e0b";
    }

    return "#ef4444";
  }

  const availableStops = Object.keys(scale.colors)
    .map((stop) => Number(stop))
    .sort((a, b) => a - b);

  let selected = scale.colors[availableStops[0]];

  for (const stop of availableStops) {
    if (value >= stop) {
      selected = scale.colors[stop];
    }
  }

  return selected;
};

export const SeverityScale = ({ value, onChange, scale, ariaLabel }: SeverityScaleProps) => {
  const steps = useMemo(() => {
    const stepValue = scale.step ?? 1;
    const items: number[] = [];

    for (let current = scale.min; current <= scale.max; current += stepValue) {
      items.push(Number(current.toFixed(2)));
    }

    return items;
  }, [scale.max, scale.min, scale.step]);

  if (scale.type === "numeric") {
    return (
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={scale.min}
          max={scale.max}
          step={scale.step ?? 1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer rounded-full bg-muted"
          aria-label={ariaLabel}
        />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-foreground">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {steps.map((step) => {
        const isActive = Math.round(value) === Math.round(step);
        const color = getColorForValue(scale, step);
        return (
          <button
            key={step}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(step)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2 text-xs transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:border-foreground/40"
            }`}
          >
            <span
              className="h-2 w-full rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <span className="font-semibold">{step}</span>
            <span className="text-[10px] text-muted-foreground">
              {scale.labels?.[Math.round(step)] ?? ""}
            </span>
          </button>
        );
      })}
    </div>
  );
};
