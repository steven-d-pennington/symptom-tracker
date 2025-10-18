/**
 * FoodCombinationsSection Component
 * Displays synergistic food combinations below individual correlations
 * Integrates with existing analysis dashboards
 */

"use client";

import { useState } from "react";
import FoodCombinationCard from "../food/FoodCombinationCard";
import type { FoodCombination } from "@/lib/services/food/CombinationAnalysisService";

export interface FoodCombinationsSectionProps {
  combinations: FoodCombination[];
  isLoading?: boolean;
  onSelectCombination?: (combination: FoodCombination) => void;
}

function FoodCombinationsSection({
  combinations,
  isLoading = false,
  onSelectCombination,
}: FoodCombinationsSectionProps) {
  const [showOnlySynergistic, setShowOnlySynergistic] = useState(true);

  // Filter combinations based on synergistic toggle
  const filteredCombinations = showOnlySynergistic
    ? combinations.filter((c) => c.synergistic)
    : combinations;

  // Sort by synergy strength (combinationCorrelation - individualMax) descending
  const sortedCombinations = [...filteredCombinations].sort((a, b) => {
    const synergyA = a.combinationCorrelation - a.individualMax;
    const synergyB = b.combinationCorrelation - b.individualMax;
    return synergyB - synergyA;
  });

  // Take top 5 for display
  const displayCombinations = sortedCombinations.slice(0, 5);

  const synergyCount = combinations.filter((c) => c.synergistic).length;

  if (isLoading) {
    return (
      <div
        className="rounded-lg border p-6"
        role="status"
        aria-live="polite"
        aria-label="Loading food combinations"
      >
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
          <span className="ml-3 text-sm text-gray-600">
            Analyzing food combinations...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Food Combinations</h3>
          <p className="text-sm text-gray-600">
            {synergyCount} synergistic combination{synergyCount !== 1 ? "s" : ""} detected
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center space-x-2">
          <label
            htmlFor="synergy-filter"
            className="text-sm font-medium text-gray-700"
          >
            Show only synergistic:
          </label>
          <button
            id="synergy-filter"
            role="switch"
            aria-checked={showOnlySynergistic}
            onClick={() => setShowOnlySynergistic(!showOnlySynergistic)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              showOnlySynergistic ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showOnlySynergistic ? "translate-x-6" : "translate-x-1"
              }`}
            />
            <span className="sr-only">
              {showOnlySynergistic
                ? "Showing only synergistic combinations"
                : "Showing all combinations"}
            </span>
          </button>
        </div>
      </div>

      {/* Combinations List */}
      {displayCombinations.length > 0 ? (
        <div
          className="grid gap-4 md:grid-cols-1 lg:grid-cols-2"
          role="list"
          aria-label="Food combinations"
        >
          {displayCombinations.map((combination, index) => (
            <div key={`${combination.foodIds.join("-")}-${index}`} role="listitem">
              <FoodCombinationCard
                combination={combination}
                onSelect={onSelectCombination}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h4 className="mt-2 text-sm font-semibold text-gray-900">
            {showOnlySynergistic
              ? "No synergistic combinations found"
              : "No combinations detected"}
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            {showOnlySynergistic
              ? "Try toggling the filter to see all combinations, or log more meals to discover patterns."
              : "No statistically significant combinations found. Log more meals to discover patterns."}
          </p>
        </div>
      )}

      {/* Show count if there are more combinations */}
      {sortedCombinations.length > 5 && (
        <p className="text-center text-sm text-gray-600">
          Showing top 5 of {sortedCombinations.length} combination
          {sortedCombinations.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export default FoodCombinationsSection;
