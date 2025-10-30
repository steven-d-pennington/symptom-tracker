"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { FoodRecord } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";
import { CustomFoodBadge } from "@/components/food/CustomFoodBadge";

interface FoodCategoryProps {
  name: string;
  foods: FoodRecord[];
  isExpanded: boolean;
  onToggle: (expanded: boolean) => void;
  onSelectFood: (food: FoodRecord) => void;
  selectedFoodIds?: Set<string>;
  searchQuery?: string;
}

/**
 * Collapsible Food Category Component (Story 3.5.4)
 *
 * Accordion-style category with expand/collapse functionality.
 *
 * AC3.5.4.2: Foods organized in collapsible categories
 * - Category header shows: name, item count, expand state
 * - Clicking category header toggles expansion state
 * - Smooth CSS transitions for expand/collapse animations
 *
 * AC3.5.4.8: Mobile-optimized category interaction
 * - Category headers minimum 44x44px touch targets
 * - Expand/collapse icons clearly visible (chevron up/down)
 * - Food item selection uses large touch-friendly cards
 */
export function FoodCategory({
  name,
  foods,
  isExpanded,
  onToggle,
  onSelectFood,
  selectedFoodIds,
  searchQuery,
}: FoodCategoryProps) {
  // Highlight matching text in food names if searching
  const highlightText = (text: string) => {
    if (!searchQuery) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = searchQuery.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + searchQuery.length);
    const after = text.slice(index + searchQuery.length);

    return (
      <>
        {before}
        <mark className="bg-yellow-200 dark:bg-yellow-700 font-semibold">
          {match}
        </mark>
        {after}
      </>
    );
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg mb-2 overflow-hidden bg-white dark:bg-gray-800">
      {/* Category Header - AC3.5.4.8: 44x44px minimum touch target */}
      <button
        onClick={() => onToggle(!isExpanded)}
        className="w-full flex items-center justify-between p-4 min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={isExpanded}
        aria-controls={`category-${name}`}
      >
        <span className="font-medium text-foreground">
          {name} ({foods.length} {foods.length === 1 ? 'item' : 'items'})
        </span>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground transition-transform" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
        )}
      </button>

      {/* Category Content - AC3.5.4.2: Smooth CSS transition */}
      <div
        id={`category-${name}`}
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="p-4 pt-0 space-y-2">
          {foods.map((food) => (
            <button
              key={food.id}
              onClick={() => onSelectFood(food)}
              className={cn(
                "w-full text-left p-3 border rounded-lg min-h-[44px] transition-all",
                selectedFoodIds?.has(food.id)
                  ? "bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 ring-2 ring-blue-500 dark:ring-blue-400"
                  : "border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600"
              )}
              aria-pressed={selectedFoodIds?.has(food.id) ?? false}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex-1 font-medium text-foreground">
                  {highlightText(food.name)}
                </span>
                {!food.isDefault && <CustomFoodBadge />}
              </div>
              {food.preparationMethod && (
                <span className="text-xs text-muted-foreground mt-1 block">
                  {food.preparationMethod}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
