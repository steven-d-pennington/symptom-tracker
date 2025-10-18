"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FoodRecord, PortionSize } from "@/lib/db/schema";
import { AllergenBadgeList } from "@/components/food/AllergenBadge";
import type { AllergenType } from "@/lib/constants/allergens";

export interface SelectedFoodItem {
  food: FoodRecord;
  portion: PortionSize;
}

interface MealComposerProps {
  selectedFoods: SelectedFoodItem[];
  onRemoveFood: (foodId: string) => void;
  onPortionChange: (foodId: string, portion: PortionSize) => void;
}

export function MealComposer({
  selectedFoods,
  onRemoveFood,
  onPortionChange,
}: MealComposerProps) {
  if (selectedFoods.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-foreground">
          Selected Foods
        </h4>
        <span className="text-xs text-muted-foreground">
          {selectedFoods.length} {selectedFoods.length === 1 ? "food" : "foods"} selected
        </span>
      </div>

      <div className="space-y-2">
        {selectedFoods.map(({ food, portion }) => {
          const allergens = JSON.parse(food.allergenTags) as AllergenType[];
          
          return (
            <div
              key={food.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                "border border-border bg-muted/50"
              )}
            >
              {/* Food info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm">
                  {food.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {food.category}
                </div>
                {allergens.length > 0 && (
                  <div className="mt-1.5">
                    <AllergenBadgeList allergens={allergens} maxVisible={3} />
                  </div>
                )}
              </div>

              {/* Portion size selector */}
              <div className="flex-shrink-0">
                <label htmlFor={`portion-${food.id}`} className="sr-only">
                  Portion size for {food.name}
                </label>
                <select
                  id={`portion-${food.id}`}
                  value={portion}
                  onChange={(e) => onPortionChange(food.id, e.target.value as PortionSize)}
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    "border border-border bg-background",
                    "text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary",
                    "transition-shadow"
                  )}
                  aria-label={`Portion size for ${food.name}`}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemoveFood(food.id)}
                className={cn(
                  "p-1 rounded-md transition-colors flex-shrink-0",
                  "hover:bg-red-100 dark:hover:bg-red-900/20",
                  "focus:outline-none focus:ring-2 focus:ring-red-500"
                )}
                aria-label={`Remove ${food.name} from meal`}
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
