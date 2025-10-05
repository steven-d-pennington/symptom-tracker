"use client";

import { ChangeEvent } from "react";
import { SymptomFilter } from "@/lib/types/symptoms";

interface SymptomFiltersProps {
  filters: SymptomFilter;
  onChange: (filters: SymptomFilter) => void;
}

export const SymptomFilters = ({ filters, onChange }: SymptomFiltersProps) => {
  const updateFilter = (key: keyof SymptomFilter, value: SymptomFilter[typeof key]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
      <label className="flex flex-col gap-1">
        <span className="font-medium text-foreground">Search</span>
        <input
          type="text"
          value={filters.query ?? ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateFilter("query", event.target.value)
          }
          className="rounded-lg border border-border bg-background px-3 py-2"
          placeholder="Name, note, trigger"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium text-foreground">Severity minimum</span>
        <input
          type="number"
          min={0}
          max={10}
          value={filters.severityRange?.[0] ?? ""}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateFilter("severityRange", [Number(event.target.value || 0), filters.severityRange?.[1] ?? 10])
          }
          className="w-24 rounded-lg border border-border bg-background px-3 py-2"
        />
      </label>
    </div>
  );
};
