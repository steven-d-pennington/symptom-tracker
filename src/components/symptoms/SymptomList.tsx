"use client";

import { ChangeEvent, useMemo } from "react";
import {
  Symptom,
  SymptomCategory,
  SymptomSort,
} from "@/lib/types/symptoms";
import { SymptomCard } from "./SymptomCard";

interface SymptomListProps {
  symptoms: Symptom[];
  categories: SymptomCategory[];
  isLoading: boolean;
  onEdit: (symptom: Symptom) => void;
  onDelete: (symptom: Symptom) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  sort: SymptomSort;
  onSortChange: (sort: SymptomSort) => void;
}

const SORT_LABELS: Record<SymptomSort["key"], string> = {
  timestamp: "Most recent",
  severity: "Severity",
  name: "Name",
  duration: "Duration",
};

const SkeletonCard = () => (
  <div className="animate-pulse rounded-2xl border border-border bg-muted/30 p-4">
    <div className="h-4 w-1/3 rounded bg-muted" />
    <div className="mt-4 h-3 w-2/3 rounded bg-muted" />
    <div className="mt-6 grid gap-3 md:grid-cols-3">
      <div className="h-3 rounded bg-muted" />
      <div className="h-3 rounded bg-muted" />
      <div className="h-3 rounded bg-muted" />
    </div>
  </div>
);

export const SymptomList = ({
  symptoms,
  categories,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  totalCount,
  sort,
  onSortChange,
}: SymptomListProps) => {
  const categoryMap = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category]));
  }, [categories]);

  const sortOptions = useMemo(() => {
    return Object.entries(SORT_LABELS).flatMap(([key, label]) => [
      { value: `${key}:desc`, label: `${label} · Desc` },
      { value: `${key}:asc`, label: `${label} · Asc` },
    ]);
  }, []);

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = event.target.value.split(":");
    onSortChange({ key: key as SymptomSort["key"], direction: direction as SymptomSort["direction"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
        <h3 className="text-lg font-semibold text-foreground">No symptoms yet</h3>
        <p className="mt-2">
          Start logging symptoms to build a history. You can add categories, triggers, and notes to capture rich context.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="text-muted-foreground">
          Showing {symptoms.length} of {totalCount} logged symptoms
        </span>
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Sort by</span>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2"
            value={`${sort.key}:${sort.direction}`}
            onChange={handleSortChange}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="space-y-3">
        {symptoms.map((symptom) => (
          <li key={symptom.id}>
            <SymptomCard
              symptom={symptom}
              category={categoryMap.get(symptom.category)}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>

      <nav className="flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Symptom pagination">
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <div className="flex items-center gap-2 text-muted-foreground">
          Page {page} of {totalPages}
        </div>
        <button
          type="button"
          className="rounded-lg border border-border px-3 py-2 font-medium text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
};
