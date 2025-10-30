"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { generateId } from "@/lib/utils/idGenerator";
import { toast } from "@/components/common/Toast";
import { FoodCategory } from "./FoodCategory";
import { FoodSearchInput } from "./FoodSearchInput";
import { MealComposer } from "@/components/food/MealComposer";
import type { SelectedFoodItem } from "@/components/food/MealComposer";
import type { FoodRecord, MealType, PortionSize } from "@/lib/db/schema";
import { Coffee, Sunset, Moon, Cookie } from "lucide-react";

interface FoodQuickLogFormProps {
  userId: string;
}

// Helper function to determine default meal type based on current time
function getDefaultMealType(): MealType {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return "breakfast";
  } else if (hour >= 11 && hour < 14) {
    return "lunch";
  } else if (hour >= 17 && hour < 21) {
    return "dinner";
  } else {
    return "snack";
  }
}

// Helper function to get meal type icon
function getMealTypeIcon(mealType: MealType) {
  switch (mealType) {
    case "breakfast":
      return Coffee;
    case "lunch":
      return Sunset;
    case "dinner":
      return Moon;
    case "snack":
      return Cookie;
  }
}

/**
 * Quick Log Form for Food Logging (Story 3.5.4)
 *
 * Features:
 * - Collapsible categories with smart defaults
 * - Search/filter functionality
 * - Quick log mode with optional details expansion
 * - Custom foods section
 *
 * AC3.5.4.2: Foods organized in collapsible categories
 * AC3.5.4.3: Smart defaults for category display
 * AC3.5.4.4: Quick search/filter functionality
 * AC3.5.4.5: Quick Log mode for frequent foods
 * AC3.5.4.6: Custom foods displayed prominently
 */
export function FoodQuickLogForm({ userId }: FoodQuickLogFormProps) {
  const router = useRouter();

  // Form state - Quick Log fields (essential)
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);
  const [timestamp, setTimestamp] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );

  // Form state - Add Details fields (optional, progressive disclosure)
  const [showDetails, setShowDetails] = useState(false);
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [notes, setNotes] = useState("");

  // Data state
  const [customFoods, setCustomFoods] = useState<FoodRecord[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<Map<string, FoodRecord[]>>(new Map());
  const [recentFoods, setRecentFoods] = useState<FoodRecord[]>([]);
  const [allFoodsByCategory, setAllFoodsByCategory] = useState<Map<string, FoodRecord[]>>(new Map());
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load category expansion state from localStorage (AC3.5.4.3)
  useEffect(() => {
    const storageKey = `food-categories-expanded-${userId}`;
    const savedState = localStorage.getItem(storageKey);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setExpandedCategories(new Set(parsed));
      } catch (error) {
        console.error("Failed to parse saved expansion state:", error);
      }
    }
  }, [userId]);

  // Save category expansion state to localStorage (AC3.5.4.3)
  const saveExpansionState = useCallback((categories: Set<string>) => {
    const storageKey = `food-categories-expanded-${userId}`;
    localStorage.setItem(storageKey, JSON.stringify(Array.from(categories)));
  }, [userId]);

  // Load all food data
  useEffect(() => {
    const loadFoodData = async () => {
      try {
        setIsLoading(true);

        // Load user favorites
        const user = await userRepository.getOrCreateCurrentUser();
        const favIds = await userRepository.getFoodFavorites(user.id);
        setFavoriteIds(favIds);

        // Load custom foods (AC3.5.4.6)
        const custom = await foodRepository.getCustom(userId);
        setCustomFoods(custom);

        // Load favorites by category (AC3.5.4.3)
        const favsByCategory = await foodRepository.getFavoritesByCategory(userId, favIds);
        setFavoriteFoods(favsByCategory);

        // Load all foods by category
        const allByCategory = await foodRepository.getAllByCategory(userId);
        setAllFoodsByCategory(allByCategory);

        // Load recent foods (AC3.5.4.3)
        // Note: This would ideally query foodEventRepository for recent foods
        // For now, we'll just show an empty array
        // TODO: Implement getRecentFoods() in foodEventRepository
        setRecentFoods([]);

        // Set default expansion state (AC3.5.4.3)
        // - Favorites and Custom Foods expanded if they exist
        // - Other categories collapsed by default
        const defaultExpanded = new Set<string>();
        if (custom.length > 0) {
          defaultExpanded.add("My Foods");
        }
        if (favsByCategory.size > 0) {
          defaultExpanded.add("Favorites");
        }

        // Only set default if no saved state
        setExpandedCategories((current) => {
          if (current.size === 0) {
            saveExpansionState(defaultExpanded);
            return defaultExpanded;
          }
          return current;
        });
      } catch (error) {
        console.error("Failed to load food data:", error);
        toast.error("Failed to load food data", {
          description: "Please try refreshing the page"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFoodData();
  }, [userId, saveExpansionState]);

  // Handle category toggle
  const handleCategoryToggle = (categoryName: string, expanded: boolean) => {
    setExpandedCategories((current) => {
      const newSet = new Set(current);
      if (expanded) {
        newSet.add(categoryName);
      } else {
        newSet.delete(categoryName);
      }
      saveExpansionState(newSet);
      return newSet;
    });
  };

  // Handle food selection - add to meal
  const handleFoodSelect = (food: FoodRecord) => {
    // Check if food is already selected
    const isAlreadySelected = selectedFoods.some(item => item.food.id === food.id);
    if (isAlreadySelected) {
      toast.error("This food is already in your meal");
      return;
    }

    // Add food with default medium portion
    setSelectedFoods(prev => [...prev, { food, portion: "medium" }]);

    // Scroll to form after first selection on mobile
    if (selectedFoods.length === 0) {
      setTimeout(() => {
        document.getElementById("quick-log-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  };

  // Handle removing a food from the meal
  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(item => item.food.id !== foodId));
  };

  // Handle portion size change for a food
  const handlePortionChange = (foodId: string, portion: PortionSize) => {
    setSelectedFoods(prev =>
      prev.map(item =>
        item.food.id === foodId ? { ...item, portion } : item
      )
    );
  };

  // Filter foods based on search query (AC3.5.4.4)
  const filteredFoodsByCategory = useMemo(() => {
    if (!searchQuery) {
      return allFoodsByCategory;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = new Map<string, FoodRecord[]>();

    for (const [category, foods] of allFoodsByCategory) {
      const matchingFoods = foods.filter((food) =>
        food.name.toLowerCase().includes(lowerQuery)
      );
      if (matchingFoods.length > 0) {
        filtered.set(category, matchingFoods);
      }
    }

    return filtered;
  }, [allFoodsByCategory, searchQuery]);

  // Auto-expand categories with matching foods when searching (AC3.5.4.4)
  useEffect(() => {
    if (searchQuery) {
      const categoriesToExpand = new Set<string>();
      for (const [category] of filteredFoodsByCategory) {
        categoriesToExpand.add(category);
      }
      setExpandedCategories(categoriesToExpand);
    }
  }, [searchQuery, filteredFoodsByCategory]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (selectedFoods.length === 0) {
      toast.error("Please select at least one food");
      return;
    }

    try {
      setIsSaving(true);

      // Create meal ID (same for all foods in this meal)
      const mealId = generateId();

      // Extract food IDs
      const foodIds = selectedFoods.map(item => item.food.id);

      // Create portion map
      const portionMap: Record<string, PortionSize> = {};
      selectedFoods.forEach(item => {
        portionMap[item.food.id] = item.portion;
      });

      // Create food event
      await foodEventRepository.create({
        userId,
        mealId,
        foodIds: JSON.stringify(foodIds),
        timestamp: new Date(timestamp).getTime(),
        mealType: showDetails ? mealType : getDefaultMealType(),
        portionMap: JSON.stringify(portionMap),
        notes: showDetails ? notes : undefined,
      });

      // Success feedback
      const foodCount = selectedFoods.length;
      const foodNames = selectedFoods.map(item => item.food.name).join(", ");
      toast.success("Meal logged successfully", {
        description: foodCount === 1 ? foodNames : `${foodCount} foods logged`,
        duration: 3000,
      });

      // Navigate back to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to log food:", error);
      toast.error("Failed to log food", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading foods...</p>
        </div>
      </div>
    );
  }

  const MealTypeIcon = getMealTypeIcon(mealType);

  // Get IDs of selected foods for highlighting
  const selectedFoodIds = new Set(selectedFoods.map(item => item.food.id));

  return (
    <div className="space-y-6">
      {/* Search Input - AC3.5.4.4 */}
      <FoodSearchInput
        onSearchChange={setSearchQuery}
        placeholder="Search foods..."
      />

      {/* MealComposer - shows selected foods with portion controls */}
      <MealComposer
        selectedFoods={selectedFoods}
        onRemoveFood={handleRemoveFood}
        onPortionChange={handlePortionChange}
      />

      {/* Empty state when search returns no results - AC3.5.4.4 */}
      {searchQuery && filteredFoodsByCategory.size === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No foods found. Try different keywords.
          </p>
        </div>
      )}

      {/* Food Categories */}
      {!searchQuery && (
        <>
          {/* Custom Foods Section - AC3.5.4.6 */}
          {customFoods.length > 0 && (
            <div className="mb-4">
              <FoodCategory
                name="My Foods"
                foods={customFoods}
                isExpanded={expandedCategories.has("My Foods")}
                onToggle={(expanded) => handleCategoryToggle("My Foods", expanded)}
                onSelectFood={handleFoodSelect}
                selectedFoodIds={selectedFoodIds}
              />
            </div>
          )}

          {/* Favorites Section - AC3.5.4.3 */}
          {favoriteFoods.size > 0 && (
            <div className="mb-4">
              <div className="mb-2">
                <h2 className="text-lg font-semibold text-foreground">Favorites</h2>
              </div>
              {Array.from(favoriteFoods).map(([category, foods]) => (
                <FoodCategory
                  key={`fav-${category}`}
                  name={category}
                  foods={foods}
                  isExpanded={expandedCategories.has(`Favorites-${category}`)}
                  onToggle={(expanded) => handleCategoryToggle(`Favorites-${category}`, expanded)}
                  onSelectFood={handleFoodSelect}
                  selectedFoodIds={selectedFoodIds}
                />
              ))}
            </div>
          )}

          {/* All Foods by Category */}
          <div>
            <div className="mb-2">
              <h2 className="text-lg font-semibold text-foreground">All Foods</h2>
            </div>
            {Array.from(allFoodsByCategory).map(([category, foods]) => (
              <FoodCategory
                key={category}
                name={category}
                foods={foods}
                isExpanded={expandedCategories.has(category)}
                onToggle={(expanded) => handleCategoryToggle(category, expanded)}
                onSelectFood={handleFoodSelect}
                selectedFoodIds={selectedFoodIds}
              />
            ))}
          </div>
        </>
      )}

      {/* Search results */}
      {searchQuery && filteredFoodsByCategory.size > 0 && (
        <div>
          {Array.from(filteredFoodsByCategory).map(([category, foods]) => (
            <FoodCategory
              key={category}
              name={category}
              foods={foods}
              isExpanded={expandedCategories.has(category)}
              onToggle={(expanded) => handleCategoryToggle(category, expanded)}
              onSelectFood={handleFoodSelect}
              selectedFoodIds={selectedFoodIds}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}

      {/* Quick Log Form - AC3.5.4.5 */}
      {selectedFoods.length > 0 && (
        <form
          id="quick-log-form"
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-foreground">
            {selectedFoods.length === 1 ? `Log ${selectedFoods[0].food.name}` : `Log Meal (${selectedFoods.length} foods)`}
          </h3>

          {/* Timestamp */}
          <div>
            <label htmlFor="timestamp" className="block text-sm font-medium text-foreground mb-2">
              Time
            </label>
            <input
              id="timestamp"
              type="datetime-local"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Details Button - AC3.5.4.5 */}
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            {showDetails ? "Hide Details" : "Add Details"}
          </button>

          {/* Details Section - AC3.5.4.5 */}
          {showDetails && (
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["breakfast", "lunch", "dinner", "snack"] as MealType[]).map((type) => {
                    const Icon = getMealTypeIcon(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`flex items-center justify-center gap-2 p-3 border rounded-lg transition-all ${
                          mealType === type
                            ? "bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                            : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="capitalize">{type}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? "Saving..." : selectedFoods.length === 1 ? "Log Food" : "Log Meal"}
          </button>
        </form>
      )}
    </div>
  );
}
