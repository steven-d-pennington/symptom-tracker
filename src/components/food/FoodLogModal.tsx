"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Plus, Pencil, Trash2, Coffee, Sunset, Moon, Cookie } from "lucide-react";
import { useFoodContext } from "@/contexts/FoodContext";
import { handleModalKeyboard, focusFirstElement } from "@/lib/utils/a11y";
import { cn } from "@/lib/utils/cn";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { foodEventRepository } from "@/lib/repositories/foodEventRepository";
import { generateId } from "@/lib/utils/idGenerator";
import { AllergenBadgeList } from "@/components/food/AllergenBadge";
import { AddFoodModal } from "@/components/food/AddFoodModal";
import { EditFoodModal } from "@/components/food/EditFoodModal";
import { CustomFoodBadge } from "@/components/food/CustomFoodBadge";
import { ConfirmDialog } from "@/components/manage/ConfirmDialog";
import { MealComposer } from "@/components/food/MealComposer";
import type { SelectedFoodItem } from "@/components/food/MealComposer";
import type { FoodRecord, MealType, PortionSize } from "@/lib/db/schema";
import { userRepository } from "@/lib/repositories/userRepository";
import type { AllergenType } from "@/lib/constants/allergens";

interface FoodLogModalProps {
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

export function FoodLogModal({ userId }: FoodLogModalProps) {
  const { isFoodLogModalOpen, closeFoodLog, markFoodLogReady } = useFoodContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);
  const [mealType, setMealType] = useState<MealType>(getDefaultMealType());
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isEditFoodModalOpen, setIsEditFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deletingFood, setDeletingFood] = useState<FoodRecord | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load foods when modal opens or search changes
  useEffect(() => {
    if (!isFoodLogModalOpen) return;

    const loadFoods = async () => {
      try {
        setLoading(true);
        const startTime = performance.now();

        // Use search if query exists, otherwise get default foods
        const results = searchQuery
          ? await foodRepository.search(userId, searchQuery)
          : await foodRepository.getDefault(userId);

        // Load favorites for ranking
        const user = await userRepository.getOrCreateCurrentUser();
        const favs = await userRepository.getFoodFavorites(user.id);
        setFavoriteIds(favs);

        // Rank favorites first
        const ranked = [...results].sort((a, b) => {
          const aFav = favs.includes(a.id) ? 1 : 0;
          const bFav = favs.includes(b.id) ? 1 : 0;
          if (aFav !== bFav) return bFav - aFav; // favorites first
          return a.name.localeCompare(b.name);
        });

        setFoods(ranked);

        const endTime = performance.now();
        const searchTime = endTime - startTime;
        console.log(`[Performance] Food search completed in ${searchTime.toFixed(2)}ms`);

        // AC9: Search should complete in < 250ms
        if (searchTime > 250) {
          console.warn(`[Performance] Food search took ${searchTime.toFixed(2)}ms (target: <250ms)`);
        }
      } catch (err) {
        console.error("Failed to load foods:", err);
        setError("Failed to load food items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadFoods();
  }, [isFoodLogModalOpen, searchQuery, userId]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isFoodLogModalOpen && searchInputRef.current) {
      // Record performance mark for modal open (AC4)
      performance.mark("food-log-modal-open");

      setTimeout(() => {
        searchInputRef.current?.focus();
        // Mark modal as ready for interaction (AC4)
        markFoodLogReady();
        performance.mark("food-log-modal-ready");

        // Measure time from button click to modal ready
        try {
          performance.measure(
            "food-log-launch-time",
            "food-log-button-click",
            "food-log-modal-ready"
          );
          const measures = performance.getEntriesByName("food-log-launch-time");
          if (measures.length > 0) {
            const launchTime = measures[0].duration;
            console.log(`[Performance] Food log modal ready in ${launchTime.toFixed(2)}ms`);
          }
        } catch (e) {
          // Mark may not exist if button wasn't clicked, ignore
        }
      }, 100);
    }
  }, [isFoodLogModalOpen, markFoodLogReady]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isFoodLogModalOpen) {
      setSearchQuery("");
      setSelectedFoods([]);
      setMealType(getDefaultMealType()); // Reset to time-based default
      setNotes("");
      setSuccessMessage(null);
      setError(null);
      setFoods([]);
      setSaving(false);
    }
  }, [isFoodLogModalOpen]);

  const handleFoodSelect = (food: FoodRecord) => {
    // Check if food is already selected
    const isAlreadySelected = selectedFoods.some((item) => item.food.id === food.id);
    
    if (isAlreadySelected) {
      setError(`${food.name} is already selected`);
      setTimeout(() => setError(null), 2000);
      return;
    }

    // Add food with default medium portion
    setSelectedFoods([...selectedFoods, { food, portion: "medium" }]);
    setSuccessMessage(`${food.name} added to meal`);
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  const handleRemoveFood = (foodId: string) => {
    const removedFood = selectedFoods.find((item) => item.food.id === foodId);
    setSelectedFoods(selectedFoods.filter((item) => item.food.id !== foodId));
    
    if (removedFood) {
      setSuccessMessage(`${removedFood.food.name} removed from meal`);
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const toggleFavorite = async (food: FoodRecord) => {
    try {
      const user = await userRepository.getOrCreateCurrentUser();
      await userRepository.toggleFoodFavorite(user.id, food.id);
      const updated = await userRepository.getFoodFavorites(user.id);
      setFavoriteIds(updated);
      // Re-rank current list
      setFoods((prev) => [...prev].sort((a, b) => {
        const aFav = updated.includes(a.id) ? 1 : 0;
        const bFav = updated.includes(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return a.name.localeCompare(b.name);
      }));
    } catch (e) {
      console.error("Failed to toggle favorite", e);
    }
  };

  const handlePortionChange = (foodId: string, portion: PortionSize) => {
    setSelectedFoods(
      selectedFoods.map((item) =>
        item.food.id === foodId ? { ...item, portion } : item
      )
    );
  };

  const handleSave = async () => {
    if (selectedFoods.length === 0) {
      setError("Please select at least one food item");
      return;
    }

    try {
      setError(null);
      setSaving(true);
      
      const startTime = performance.now();

      // Create food event with meal composition
      const mealId = generateId(); // Group foods logged together
      const timestamp = Date.now();
      
      // Build foodIds array and portionMap
      const foodIds = selectedFoods.map((item) => item.food.id);
      const portionMap: Record<string, PortionSize> = {};
      selectedFoods.forEach((item) => {
        portionMap[item.food.id] = item.portion;
      });
      
      const eventId = await foodEventRepository.create({
        userId,
        mealId,
        foodIds: JSON.stringify(foodIds),
        timestamp,
        mealType,
        portionMap: JSON.stringify(portionMap),
        notes: notes.trim() || undefined,
      });

      const endTime = performance.now();
      const saveTime = endTime - startTime;
      console.log(`[Performance] Food event saved in ${saveTime.toFixed(2)}ms`);

      // AC9: Save should complete in < 500ms
      if (saveTime > 500) {
        console.warn(`[Performance] Food save took ${saveTime.toFixed(2)}ms (target: <500ms)`);
      }

      const foodCount = selectedFoods.length;
      setSuccessMessage(`Meal logged with ${foodCount} ${foodCount === 1 ? "food" : "foods"}!`);

      // Close modal after brief delay
      setTimeout(() => {
        closeFoodLog();
      }, 1000);
    } catch (err) {
      console.error("Failed to log food:", err);
      setError(err instanceof Error ? err.message : "Failed to log food. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    closeFoodLog();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleModalKeyboard(e, handleClose, containerRef);
  };

  // Handle custom food creation
  const handleCustomFoodSave = async (foodData: {
    name: string;
    category?: string;
    allergenTags: AllergenType[];
    preparationMethod?: string;
  }) => {
    try {
      // Create custom food with isDefault: false
      const foodId = await foodRepository.create({
        userId,
        name: foodData.name,
        category: foodData.category || "Snacks",
        allergenTags: JSON.stringify(foodData.allergenTags),
        preparationMethod: foodData.preparationMethod,
        isDefault: false,
        isActive: true,
      });

      // Reload foods to include the new custom food
      await refreshFoods();

      // Auto-select the newly created food
      const updatedFoods = searchQuery
        ? await foodRepository.search(userId, searchQuery)
        : await foodRepository.getDefault(userId);
      const newFood = updatedFoods.find((f) => f.id === foodId);
      if (newFood) {
        handleFoodSelect(newFood);
      }

      // Close the AddFoodModal
      setIsAddFoodModalOpen(false);

      // Show success message
      setSuccessMessage(`Custom food "${foodData.name}" created and selected!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to create custom food:", err);
      setError(err instanceof Error ? err.message : "Failed to create custom food. Please try again.");
    }
  };

  // Helper to refresh foods list
  const refreshFoods = async () => {
    const results = searchQuery
      ? await foodRepository.search(userId, searchQuery)
      : await foodRepository.getDefault(userId);
    setFoods(results);
  };

  // Handle custom food edit
  const handleEditFood = (food: FoodRecord) => {
    setEditingFood(food);
    setIsEditFoodModalOpen(true);
  };

  const handleCustomFoodUpdate = async (updates: {
    name: string;
    category?: string;
    allergenTags: AllergenType[];
    preparationMethod?: string;
  }) => {
    if (!editingFood) return;

    try {
      await foodRepository.update(editingFood.id, {
        name: updates.name,
        category: updates.category || "Snacks",
        allergenTags: JSON.stringify(updates.allergenTags),
        preparationMethod: updates.preparationMethod,
      });

      // Reload foods to reflect the update
      await refreshFoods();

      // Close the EditFoodModal
      setIsEditFoodModalOpen(false);
      setEditingFood(null);

      // Show success message
      setSuccessMessage(`Custom food "${updates.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to update custom food:", err);
      setError(err instanceof Error ? err.message : "Failed to update custom food. Please try again.");
    }
  };

  // Handle custom food delete
  const handleDeleteFood = (food: FoodRecord) => {
    setDeletingFood(food);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingFood) return;

    try {
      // Soft delete (archive) the custom food
      await foodRepository.archive(deletingFood.id);

      // If the deleted food was selected, remove it from selectedFoods
      setSelectedFoods(selectedFoods.filter((item) => item.food.id !== deletingFood.id));

      // Reload foods to remove the deleted item
      await refreshFoods();

      // Show success message
      setSuccessMessage(`Custom food "${deletingFood.name}" deleted successfully.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to delete custom food:", err);
      setError(err instanceof Error ? err.message : "Failed to delete custom food. Please try again.");
    } finally {
      setDeletingFood(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  if (!isFoodLogModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="food-log-modal-title"
      onKeyDown={handleKeyDown}
    >
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div
          ref={containerRef}
          className="w-full max-w-lg rounded-lg bg-card p-4 sm:p-6 my-4 sm:my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3
              id="food-log-modal-title"
              className="text-lg font-semibold text-foreground"
            >
              Log Food
            </h3>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Close food log modal"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Success/Error messages */}
          {successMessage && (
            <div
              className="mb-4 p-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-lg text-sm"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </div>
          )}

          {error && (
            <div
              className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Search Input (AC3: focused on open) */}
          <div className="mb-6">
            <label htmlFor="food-search" className="sr-only">
              Search food items
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                id="food-search"
                type="text"
                placeholder="Search food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-lg",
                  "border border-border bg-background",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-shadow"
                )}
              />
            </div>
          </div>

          {/* Favorites Grid (AC3: favorites visible) */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              {searchQuery ? "Search Results" : "Default Foods"}
            </h4>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                Loading foods...
              </p>
            ) : foods.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                No food items found
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {foods.map((food) => {
                  const allergens = JSON.parse(food.allergenTags) as AllergenType[];
                  const isCustomFood = !food.isDefault;
                  const isSelected = selectedFoods.some((item) => item.food.id === food.id);
                  
                  return (
                    <div key={food.id} className="relative">
                      <button
                        type="button"
                        onClick={() => handleFoodSelect(food)}
                        className={cn(
                          "w-full px-4 py-3 rounded-lg text-left transition-all",
                          "border-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted"
                        )}
                        aria-pressed={isSelected}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground text-sm">
                              {food.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {food.category}
                            </div>
                          </div>
                          {isCustomFood && (
                            <CustomFoodBadge className="flex-shrink-0" />
                          )}
                        </div>
                        {allergens.length > 0 && (
                          <div className="mt-1.5">
                            <AllergenBadgeList allergens={allergens} maxVisible={2} />
                          </div>
                        )}
                      </button>
                      
                      {/* Edit/Delete buttons for custom foods */}
                      {isCustomFood && (
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditFood(food);
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              "bg-white/90 hover:bg-blue-100 border border-border",
                              "focus:outline-none focus:ring-2 focus:ring-blue-500"
                            )}
                            aria-label={`Edit ${food.name}`}
                          >
                            <Pencil className="w-3 h-3 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFood(food);
                            }}
                            className={cn(
                              "p-1.5 rounded-md transition-colors",
                              "bg-white/90 hover:bg-red-100 border border-border",
                              "focus:outline-none focus:ring-2 focus:ring-red-500"
                            )}
                            aria-label={`Delete ${food.name}`}
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      )}

                      {/* Favorite toggle */}
                      <div className="absolute bottom-2 right-2">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(food); }}
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium border",
                            favoriteIds.includes(food.id)
                              ? "bg-yellow-100 border-yellow-300 text-yellow-800"
                              : "bg-white/90 border-border text-muted-foreground hover:bg-muted"
                          )}
                          aria-pressed={favoriteIds.includes(food.id)}
                          aria-label={favoriteIds.includes(food.id) ? `Unfavorite ${food.name}` : `Favorite ${food.name}`}
                        >
                          {favoriteIds.includes(food.id) ? '★ Favorite' : '☆ Favorite'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Custom Food Button */}
            <button
              type="button"
              onClick={() => setIsAddFoodModalOpen(true)}
              className={cn(
                "mt-3 w-full px-4 py-3 rounded-lg text-left transition-all",
                "border-2 border-dashed border-border hover:border-primary/50",
                "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center gap-2 text-sm font-medium text-foreground"
              )}
            >
              <Plus className="w-4 h-4" />
              Add Custom Food
            </button>
          </div>

          {/* MealComposer - shows selected foods with portion controls */}
          <MealComposer
            selectedFoods={selectedFoods}
            onRemoveFood={handleRemoveFood}
            onPortionChange={handlePortionChange}
          />

          {/* Meal Type & Notes - always visible */}
          <div className="mb-4">
            <label
              htmlFor="meal-type"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Meal Type
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {(() => {
                  const Icon = getMealTypeIcon(mealType);
                  return <Icon className="w-4 h-4 text-muted-foreground" />;
                })()}
              </div>
              <select
                id="meal-type"
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 rounded-lg",
                  "border border-border bg-background",
                  "text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "transition-shadow"
                )}
              >
                <option value="breakfast">🌅 Breakfast</option>
                <option value="lunch">☀️ Lunch</option>
                <option value="dinner">🌙 Dinner</option>
                <option value="snack">🍪 Snack</option>
              </select>
            </div>
          </div>

          {/* Optional Notes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="food-notes"
                className="block text-sm font-medium text-foreground"
              >
                Notes (optional)
              </label>
              <span className="text-xs text-muted-foreground">
                {notes.length}/500
              </span>
            </div>
            <textarea
              id="food-notes"
              value={notes}
              onChange={(e) => {
                // Limit to 500 characters
                if (e.target.value.length <= 500) {
                  setNotes(e.target.value);
                }
              }}
              placeholder="Optional: Add context about this meal (location, preparation, etc.)"
              rows={3}
              className={cn(
                "w-full px-4 py-2.5 rounded-lg resize-none",
                "border border-border bg-background",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                "transition-shadow"
              )}
              maxLength={500}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className={cn(
                "px-4 py-2.5 rounded-lg font-medium",
                "bg-muted text-foreground hover:bg-muted/80",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-colors"
              )}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={selectedFoods.length === 0 || saving}
              className={cn(
                "px-4 py-2.5 rounded-lg font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "transition-colors"
              )}
            >
              {saving ? "Saving..." : "Log Food"}
            </button>
          </div>
        </div>
      </div>

      {/* AddFoodModal for creating custom foods */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        onSave={handleCustomFoodSave}
      />

      {/* EditFoodModal for editing custom foods */}
      {editingFood && (
        <EditFoodModal
          food={editingFood}
          isOpen={isEditFoodModalOpen}
          onClose={() => {
            setIsEditFoodModalOpen(false);
            setEditingFood(null);
          }}
          onSave={handleCustomFoodUpdate}
        />
      )}

      {/* ConfirmDialog for deleting custom foods */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setDeletingFood(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Custom Food"
        message={deletingFood ? `Are you sure you want to delete "${deletingFood.name}"?\n\nThis action cannot be undone.` : ''}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
