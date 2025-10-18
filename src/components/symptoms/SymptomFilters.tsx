"use client";

import { useMemo, useState } from "react";
import {
  SymptomCategory,
  SymptomFilter,
  SymptomFilterPreset,
} from "@/lib/types/symptoms";

interface SymptomFiltersProps {
  filters: SymptomFilter;
  onChange: (filters: SymptomFilter) => void;
  onReset: () => void;
  categories: SymptomCategory[];
  presets: SymptomFilterPreset[];
  onSavePreset: (name: string, filters: SymptomFilter) => void;
  onApplyPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  locations: string[];
}

const formatDateInput = (date?: Date) => {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ensureRange = (range?: [number, number]): [number, number] => {
  if (!range) {
    return [0, 10];
  }

  const [min, max] = range;
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return [0, 10];
  }

  if (min > max) {
    return [max, min];
  }

  return [min, max];
};

export const SymptomFilters = ({
  filters,
  onChange,
  onReset,
  categories,
  presets,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
  locations,
}: SymptomFiltersProps) => {
  const [presetName, setPresetName] = useState("");

  const severityRange = useMemo(() => ensureRange(filters.severityRange), [filters.severityRange]);

  const toggleCategory = (categoryId: string) => {
    const current = new Set(filters.categories ?? []);
    if (current.has(categoryId)) {
      current.delete(categoryId);
    } else {
      current.add(categoryId);
    }

    onChange({
      ...filters,
      categories: current.size ? Array.from(current) : undefined,
    });
  };

  const updateSeverity = (index: 0 | 1, value: number) => {
    const next: [number, number] = [...severityRange];
    next[index] = value;
    if (index === 0 && value > next[1]) {
      next[1] = value;
    }
    if (index === 1 && value < next[0]) {
      next[0] = value;
    }
    onChange({
      ...filters,
      severityRange: next,
    });
  };

  const updateDate = (key: "startDate" | "endDate", value: string) => {
    onChange({
      ...filters,
      [key]: value ? new Date(value) : undefined,
    });
  };

  const handlePresetSave = () => {
    const trimmed = presetName.trim();
    if (!trimmed) {
      return;
    }
    onSavePreset(trimmed, filters);
    setPresetName("");
  };

  return (
    <section className="rounded-2xl border border-border bg-muted/30 p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-foreground">Filters</h3>
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-muted"
          onClick={onReset}
        >
          Reset filters
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="font-medium text-foreground">Search</span>
          <input
            type="text"
            value={filters.query ?? ""}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2"
            placeholder="Name, note, or trigger"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-foreground">Location</span>
          <input
            list="symptom-filter-locations"
            value={filters.location ?? ""}
            onChange={(event) => onChange({ ...filters, location: event.target.value })}
            className="rounded-lg border border-border bg-background px-3 py-2"
            placeholder="Anywhere"
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="font-medium text-foreground">Severity range</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={10}
              value={severityRange[0]}
              onChange={(event) => updateSeverity(0, Number(event.target.value))}
              className="w-20 rounded-lg border border-border bg-background px-3 py-2"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="number"
              min={0}
              max={10}
              value={severityRange[1]}
              onChange={(event) => updateSeverity(1, Number(event.target.value))}
              className="w-20 rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={10}
              value={severityRange[0]}
              onChange={(event) => updateSeverity(0, Number(event.target.value))}
              className="h-2 w-full rounded-full bg-muted"
              aria-label="Minimum severity"
            />
            <input
              type="range"
              min={0}
              max={10}
              value={severityRange[1]}
              onChange={(event) => updateSeverity(1, Number(event.target.value))}
              className="h-2 w-full rounded-full bg-muted"
              aria-label="Maximum severity"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-medium text-foreground">Date range</span>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">From</span>
              <input
                type="date"
                value={formatDateInput(filters.startDate)}
                onChange={(event) => updateDate("startDate", event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">To</span>
              <input
                type="date"
                value={formatDateInput(filters.endDate)}
                onChange={(event) => updateDate("endDate", event.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="flex flex-col gap-2">
          <span className="font-medium text-foreground">Categories</span>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = filters.categories?.includes(category.id) ?? false;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-foreground/40"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <span className="font-medium text-foreground">Saved filter presets</span>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="Preset name"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2"
            />
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
              onClick={handlePresetSave}
            >
              Save current
            </button>
          </div>
          {presets.length ? (
            <ul className="space-y-2">
              {presets.map((preset) => (
                <li key={preset.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{preset.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Saved {preset.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      className="rounded-lg border border-border px-3 py-1 font-medium text-foreground hover:bg-muted"
                      onClick={() => onApplyPreset(preset.id)}
                    >
                      Apply
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-border px-3 py-1 font-medium text-destructive hover:bg-destructive/10"
                      onClick={() => onDeletePreset(preset.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">No saved presets yet.</p>
          )}
        </section>
      </div>

      <datalist id="symptom-filter-locations">
        {locations.map((location) => (
          <option key={location} value={location} />
        ))}
      </datalist>
    </section>
  );
};
