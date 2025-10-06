"use client";

import { useState } from "react";
import { PhotoFilter } from "@/lib/types/photo";

interface PhotoFiltersProps {
  onFilterChange: (filter: PhotoFilter) => void;
  availableTags: string[];
}

export function PhotoFilters({ onFilterChange, availableTags }: PhotoFiltersProps) {
  const [filter, setFilter] = useState<PhotoFilter>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTagToggle = (tag: string) => {
    const currentTags = filter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];

    const newFilter = {
      ...filter,
      tags: newTags.length > 0 ? newTags : undefined,
    };

    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    const newFilter = {
      ...filter,
      [type === "start" ? "startDate" : "endDate"]: value ? new Date(value) : undefined,
    };

    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleClearFilters = () => {
    const newFilter: PhotoFilter = {};
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const hasActiveFilters =
    (filter.tags && filter.tags.length > 0) || filter.startDate || filter.endDate;

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 hover:bg-muted"
      >
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {(filter.tags?.length || 0) + (filter.startDate ? 1 : 0) + (filter.endDate ? 1 : 0)}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-6 border-t border-border p-4">
          {/* Date range */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-foreground">Date Range</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">From</label>
                <input
                  type="date"
                  value={filter.startDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => handleDateRangeChange("start", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">To</label>
                <input
                  type="date"
                  value={filter.endDate?.toISOString().split("T")[0] || ""}
                  onChange={(e) => handleDateRangeChange("end", e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <h4 className="mb-3 text-sm font-medium text-foreground">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filter.tags?.includes(tag) || false;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`rounded-full px-3 py-1 text-sm transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:border-primary"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
