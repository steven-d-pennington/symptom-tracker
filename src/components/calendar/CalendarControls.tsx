"use client";

import { FormEvent, useState } from "react";
import {
  CalendarFilterOptions,
  CalendarFilters,
  CalendarViewConfig,
  DisplayOptions,
  FilterPreset,
} from "@/lib/types/calendar";
import { DatePicker } from "./DatePicker";
import { Legend } from "./Legend";

interface CalendarControlsProps {
  view: CalendarViewConfig;
  filters: CalendarFilters;
  searchTerm: string;
  filterOptions: CalendarFilterOptions;
  presets: FilterPreset[];
  activePresetId: string | null;
  navigation: {
    rangeLabel: string;
    goToPrevious: () => void;
    goToNext: () => void;
    goToToday: () => void;
  };
  onViewChange: (view: Partial<CalendarViewConfig>) => void;
  onDisplayOptionsChange: (options: Partial<DisplayOptions>) => void;
  onFiltersChange: (update: Partial<CalendarFilters>) => void;
  onSeverityChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  onSearchTermChange: (term: string) => void;
  onSavePreset: (name: string) => void;
  onApplyPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
}

const toggleValue = (list: string[] = [], value: string) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

export const CalendarControls = ({
  view,
  filters,
  searchTerm,
  filterOptions,
  presets,
  activePresetId,
  navigation,
  onViewChange,
  onDisplayOptionsChange,
  onFiltersChange,
  onSeverityChange,
  onClearFilters,
  onSearchTermChange,
  onSavePreset,
  onApplyPreset,
  onDeletePreset,
}: CalendarControlsProps) => {
  const [presetName, setPresetName] = useState("");

  const handlePresetSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSavePreset(presetName);
    setPresetName("");
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { label: "Month", value: "month" },
            { label: "Week", value: "week" },
            { label: "Day", value: "day" },
            { label: "Timeline", value: "timeline" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border border-border px-3 py-1 font-medium transition-colors ${
                view.viewType === option.value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
              onClick={() => onViewChange({ viewType: option.value as CalendarViewConfig["viewType"] })}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1 text-foreground hover:bg-muted"
            onClick={navigation.goToPrevious}
            aria-label="Go to previous range"
          >
            ←
          </button>
          <span className="min-w-[120px] text-center font-medium text-foreground">{navigation.rangeLabel}</span>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1 text-foreground hover:bg-muted"
            onClick={navigation.goToNext}
            aria-label="Go to next range"
          >
            →
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1 text-foreground hover:bg-muted"
            onClick={navigation.goToToday}
          >
            Today
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DatePicker
          dateRange={view.dateRange}
          onChange={(dateRange) => onViewChange({ dateRange })}
        />
        <Legend displayOptions={view.displayOptions} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {([
          { label: "Health", key: "showHealthScore" },
          { label: "Symptoms", key: "showSymptoms" },
          { label: "Medications", key: "showMedications" },
          { label: "Triggers", key: "showTriggers" },
        ] as Array<{ label: string; key: keyof DisplayOptions }>).map((toggle) => (
          <label key={toggle.key} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={view.displayOptions[toggle.key]}
              onChange={(event) =>
                onDisplayOptionsChange({ [toggle.key]: event.target.checked } as Partial<DisplayOptions>)}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <span>{toggle.label}</span>
          </label>
        ))}
        <label className="flex items-center gap-1">
          <span className="text-foreground">Scheme</span>
          <select
            value={view.displayOptions.colorScheme}
            onChange={(event) =>
              onDisplayOptionsChange({ colorScheme: event.target.value as DisplayOptions["colorScheme"] })
            }
            className="rounded border border-border bg-background px-2 py-1 text-foreground"
          >
            <option value="severity">Severity</option>
            <option value="category">Category</option>
            <option value="frequency">Frequency</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Search entries</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search by mood, note, or keyword"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm"
            />
          </label>

          <div className="rounded-xl border border-border bg-background p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">Severity range</span>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => onSeverityChange([0, 10])}
              >
                Reset
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <label className="flex flex-col gap-1">
                <span>Min</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={filters.severityRange?.[0] ?? 0}
                  onChange={(event) =>
                    onSeverityChange([
                      Number(event.target.value),
                      filters.severityRange?.[1] ?? 10,
                    ])
                  }
                  className="rounded-lg border border-border bg-background px-2 py-1 text-foreground"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span>Max</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={filters.severityRange?.[1] ?? 10}
                  onChange={(event) =>
                    onSeverityChange([
                      filters.severityRange?.[0] ?? 0,
                      Number(event.target.value),
                    ])
                  }
                  className="rounded-lg border border-border bg-background px-2 py-1 text-foreground"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <details className="rounded-xl border border-border bg-background p-3" open>
            <summary className="cursor-pointer text-foreground">Filter by categories</summary>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {filterOptions.categories.map((category) => (
                <label key={category} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.categories?.includes(category) ?? false}
                    onChange={() =>
                      onFiltersChange({
                        categories: toggleValue(filters.categories, category),
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="rounded-xl border border-border bg-background p-3">
            <summary className="cursor-pointer text-foreground">Symptoms</summary>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {filterOptions.symptoms.map((symptom) => (
                <label key={symptom} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.symptoms?.includes(symptom) ?? false}
                    onChange={() =>
                      onFiltersChange({
                        symptoms: toggleValue(filters.symptoms, symptom),
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{symptom}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="rounded-xl border border-border bg-background p-3">
            <summary className="cursor-pointer text-foreground">Medications</summary>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {filterOptions.medications.map((medication) => (
                <label key={medication} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.medications?.includes(medication) ?? false}
                    onChange={() =>
                      onFiltersChange({
                        medications: toggleValue(filters.medications, medication),
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{medication}</span>
                </label>
              ))}
            </div>
          </details>

          <details className="rounded-xl border border-border bg-background p-3">
            <summary className="cursor-pointer text-foreground">Triggers</summary>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              {filterOptions.triggers.map((trigger) => (
                <label key={trigger} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.triggers?.includes(trigger) ?? false}
                    onChange={() =>
                      onFiltersChange({
                        triggers: toggleValue(filters.triggers, trigger),
                      })
                    }
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <span>{trigger}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1 text-foreground hover:bg-muted"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
          <form className="flex items-center gap-2" onSubmit={handlePresetSave}>
            <label className="sr-only" htmlFor="preset-name">
              Save filter preset
            </label>
            <input
              id="preset-name"
              type="text"
              value={presetName}
              onChange={(event) => setPresetName(event.target.value)}
              placeholder="Preset name"
              className="rounded-lg border border-border bg-background px-3 py-1 text-foreground"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1 font-medium text-primary-foreground hover:bg-primary/90"
            >
              Save preset
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {presets.length === 0 ? (
            <span>No presets saved yet</span>
          ) : (
            presets.map((preset) => (
              <div
                key={preset.id}
                className={`flex items-center gap-1 rounded-full border px-2 py-1 ${
                  activePresetId === preset.id ? "border-primary text-primary" : "border-border"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className="text-foreground hover:underline"
                >
                  {preset.name}
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${preset.name}`}
                  onClick={() => onDeletePreset(preset.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
