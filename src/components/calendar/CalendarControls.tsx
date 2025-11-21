"use client";

import { FormEvent, useState } from "react";
import {
  CalendarFilterOptions,
  CalendarFilters as CalendarFiltersType,
  CalendarViewConfig,
  DisplayOptions,
  FilterPreset,
} from "@/lib/types/calendar";
import { DatePicker } from "./DatePicker";
import { Legend } from "./Legend";
import { CalendarFilters } from "./CalendarFilters";

interface CalendarControlsProps {
  view: CalendarViewConfig;
  filters: CalendarFiltersType;
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
  onFiltersChange: (update: Partial<CalendarFiltersType>) => void;
  onSeverityChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  onSearchTermChange: (term: string) => void;
  onSavePreset: (name: string) => void;
  onApplyPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
}

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
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: View Switcher */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { label: "Year", value: "year" },
            { label: "Month", value: "month" },
            { label: "Week", value: "week" },
            { label: "Day", value: "day" },
            { label: "Timeline", value: "timeline" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              className={`rounded-lg border border-border px-3 py-1 font-medium transition-colors ${view.viewType === option.value ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              onClick={() => onViewChange({ viewType: option.value as CalendarViewConfig["viewType"] })}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Right: Navigation & Actions */}
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

          <div className="h-4 w-px bg-border mx-2" />

          <CalendarFilters
            filters={filters}
            searchTerm={searchTerm}
            filterOptions={filterOptions}
            displayOptions={view.displayOptions}
            presets={presets}
            activePresetId={activePresetId}
            onFiltersChange={onFiltersChange}
            onDisplayOptionsChange={onDisplayOptionsChange}
            onSeverityChange={onSeverityChange}
            onClearFilters={onClearFilters}
            onSearchTermChange={onSearchTermChange}
            onSavePreset={onSavePreset}
            onApplyPreset={onApplyPreset}
            onDeletePreset={onDeletePreset}
          />
        </div>
      </div>

      {/* Secondary Row: Date Picker & Legend (if needed) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DatePicker
          dateRange={view.dateRange}
          onChange={(dateRange) => onViewChange({ dateRange })}
        />
        <Legend displayOptions={view.displayOptions} />
      </div>
    </div>
  );
};
