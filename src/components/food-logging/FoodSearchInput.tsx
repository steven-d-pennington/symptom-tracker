"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface FoodSearchInputProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

/**
 * Food Search Input Component (Story 3.5.4)
 *
 * Real-time search with debouncing for performance.
 *
 * AC3.5.4.4: Quick search/filter functionality
 * - Search input at top of page filters foods across all categories in real-time
 * - Search is debounced (300ms) to avoid performance issues
 * - Search is case-insensitive and matches partial names
 * - Clear search button (X icon) resets filter
 */
export function FoodSearchInput({
  onSearchChange,
  placeholder = "Search foods...",
}: FoodSearchInputProps) {
  const [searchValue, setSearchValue] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AC3.5.4.4: Debounced search (300ms)
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue, onSearchChange]);

  const handleClear = () => {
    setSearchValue("");
    // onSearchChange will be called automatically via useEffect
  };

  return (
    <div className="relative mb-4">
      {/* Search Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />

      {/* Search Input */}
      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        aria-label="Search foods"
      />

      {/* Clear Button - AC3.5.4.4: Clear button (X icon) */}
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded transition-colors"
          aria-label="Clear search"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
