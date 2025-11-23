"use client";

import React from "react";
import { ALLERGEN_LABELS, ALLERGEN_TYPES } from "@/lib/constants/allergens";
import { cn } from "@/lib/utils/cn";

interface AllergenFilterProps {
  selected: string | null;
  onChange: (tag: string | null) => void;
  showCount?: number; // optional count to display next to label
}

export function AllergenFilter({ selected, onChange, showCount }: AllergenFilterProps) {
  return (
    <div className="flex items-center gap-2" role="group" aria-label="Allergen filter">
      <span className="text-sm text-muted-foreground mr-2">
        Filter by Allergen{typeof showCount === "number" ? ` (${showCount})` : ""}
      </span>
      {ALLERGEN_TYPES.map((tag) => {
        const isActive = selected === tag;
        return (
          <button
            key={tag}
            type="button"
            className={cn(
              "px-2 py-1 rounded border text-sm min-h-[32px]",
              isActive ? "bg-primary text-primary-foreground" : "bg-muted"
            )}
            aria-pressed={isActive}
            aria-label={`${isActive ? "Remove" : "Apply"} ${ALLERGEN_LABELS[tag]} allergen filter`}
            onClick={() => onChange(isActive ? null : tag)}
          >
            {ALLERGEN_LABELS[tag]}
          </button>
        );
      })}
      {selected && (
        <button
          type="button"
          className="ml-1 px-2 py-1 rounded border text-sm bg-muted"
          aria-label="Clear allergen filter"
          onClick={() => onChange(null)}
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default AllergenFilter;

