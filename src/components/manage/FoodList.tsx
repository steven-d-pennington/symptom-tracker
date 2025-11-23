"use client";

import { useState, useMemo, useEffect } from "react";
import { Apple, Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, ChevronDown, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FoodRecord } from "@/lib/db/schema";
import { EmptyState } from "./EmptyState";
import { FoodForm } from "./FoodForm";
import { ConfirmDialog } from "./ConfirmDialog";
import { useFoodManagement } from "@/lib/hooks/useFoodManagement";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { userRepository } from "@/lib/repositories/userRepository";
import { AllergenBadgeList } from "@/components/food/AllergenBadge";
import type { AllergenType } from "@/lib/constants/allergens";

export const FoodList = () => {
  const { userId } = useCurrentUser();
  const {
    foods,
    loading,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    categories,
    createFood,
    updateFood,
    toggleFoodActive,
    deleteFood,
    getFoodUsageCount,
    checkDuplicateName,
  } = useFoodManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    food: FoodRecord;
    usageCount: number;
  } | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set(["__custom__", "__favorites__"]));
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (!userId) return;
      try {
        const favs = await userRepository.getFoodFavorites(userId);
        setFavoriteIds(favs);
      } catch (error) {
        console.error("Failed to load favorites:", error);
      }
    };
    loadFavorites();
  }, [userId]);

  // Collapse all categories when foods load
  useEffect(() => {
    if (foods.length > 0 && !searchQuery && filterCategory === "all") {
      const allCategories = new Set(categories);
      allCategories.add("__custom__");
      allCategories.add("__favorites__");
      setCollapsedCategories(allCategories);
    }
  }, [foods.length, categories.length]);

  const handleAddClick = () => {
    setEditingFood(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (food: FoodRecord) => {
    setEditingFood(food);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (food: FoodRecord) => {
    const usageCount = await getFoodUsageCount(food.id);
    setDeleteConfirm({ food, usageCount });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteFood(deleteConfirm.food.id);
    } catch (error) {
      console.error("Failed to delete food:", error);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (food: FoodRecord) => {
    try {
      await toggleFoodActive(food.id);
    } catch (error) {
      console.error("Failed to toggle food:", error);
    }
  };

  const toggleFavorite = async (food: FoodRecord) => {
    if (!userId) return;

    try {
      await userRepository.toggleFoodFavorite(userId, food.id);
      const updatedFavs = await userRepository.getFoodFavorites(userId);
      setFavoriteIds(updatedFavs);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  // Group foods by category
  const foodsByCategory = useMemo(() => {
    const grouped = new Map<string, FoodRecord[]>();

    foods.forEach((food) => {
      const category = food.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(food);
    });

    // Sort foods within each category: favorites first, then alphabetically
    for (const [, categoryFoods] of grouped) {
      categoryFoods.sort((a, b) => {
        // Favorites first
        const aFav = favoriteIds.includes(a.id);
        const bFav = favoriteIds.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        // Then alphabetically
        return a.name.localeCompare(b.name);
      });
    }

    return grouped;
  }, [foods]);

  const customFoods = foods.filter(f => !f.isDefault);
  const favoriteFoods = foods.filter(f => favoriteIds.includes(f.id));
  const hasSearch = searchQuery.trim().length > 0;
  const hasFilter = filterCategory !== "all";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading foods...</p>
        </div>
      </div>
    );
  }

  const renderFoodCard = (food: FoodRecord, showCategory = false) => {
    const allergens = JSON.parse(food.allergenTags) as AllergenType[];
    const isCustom = !food.isDefault;
    const isFavorite = favoriteIds.includes(food.id);

    return (
      <div
        key={food.id}
        className={cn(
          "flex items-start gap-4 rounded-lg border p-4 transition-all hover:shadow-sm",
          food.isActive ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
        )}
      >
        <div className={cn(
          "mt-0.5 rounded-lg p-2",
          isCustom
            ? "bg-green-100 text-green-700"
            : food.isActive
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
        )}>
          <Apple className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{food.name}</h3>
            {isCustom && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Custom
              </span>
            )}
            {!isCustom && (
              <span className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium",
                food.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              )}>
                {food.isActive ? "Active" : "Inactive"}
              </span>
            )}
          </div>
          {showCategory && (
            <p className="mt-0.5 text-sm text-muted-foreground">{food.category}</p>
          )}
          {allergens.length > 0 && (
            <div className="mt-2">
              <AllergenBadgeList allergens={allergens} maxVisible={3} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFavorite(food)}
            className={cn(
              "rounded-lg p-2 transition-colors",
              isFavorite
                ? "text-yellow-500 hover:bg-yellow-50"
                : "text-muted-foreground hover:bg-muted",
            )}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-500")} />
          </button>

          {isCustom ? (
            <>
              <button
                type="button"
                onClick={() => handleEditClick(food)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Edit food"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteClick(food)}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                aria-label="Delete food"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleToggleActive(food)}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={food.isActive ? "Deactivate" : "Activate"}
              aria-label={food.isActive ? "Deactivate food" : "Activate food"}
            >
              {food.isActive ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Foods</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage foods • {foods.length} total • {customFoods.length} custom • {favoriteFoods.length} favorites
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Custom Food
        </button>
      </div>

      {foods.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search foods..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {foods.length === 0 ? (
        <EmptyState
          icon={<Apple className="h-16 w-16" />}
          title="No foods found"
          description="Add your first custom food to expand beyond the defaults."
          actionLabel="Add Custom Food"
          onAction={handleAddClick}
        />
      ) : hasSearch || hasFilter ? (
        /* Search/Filter Results - Flat List */
        <div className="space-y-3">
          {foods.map((food) => renderFoodCard(food, true))}
        </div>
      ) : (
        /* Category View */
        <div className="space-y-3">
          {/* Favorites Category */}
          {favoriteFoods.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden bg-yellow-50/50 dark:bg-yellow-950/20">
              <button
                type="button"
                onClick={() => {
                  const newCollapsed = new Set(collapsedCategories);
                  if (collapsedCategories.has("__favorites__")) {
                    newCollapsed.delete("__favorites__");
                  } else {
                    newCollapsed.add("__favorites__");
                  }
                  setCollapsedCategories(newCollapsed);
                }}
                className="w-full px-4 py-3 bg-yellow-100/50 dark:bg-yellow-900/30 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">Favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {favoriteFoods.length} {favoriteFoods.length === 1 ? "item" : "items"}
                  </span>
                  {collapsedCategories.has("__favorites__") ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {!collapsedCategories.has("__favorites__") && (
                <div className="p-4 bg-background space-y-3">
                  {favoriteFoods.map((food) => renderFoodCard(food, true))}
                </div>
              )}
            </div>
          )}

          {/* Custom Foods Category */}
          {customFoods.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden bg-green-50/50 dark:bg-green-950/20">
              <button
                type="button"
                onClick={() => {
                  const newCollapsed = new Set(collapsedCategories);
                  if (collapsedCategories.has("__custom__")) {
                    newCollapsed.delete("__custom__");
                  } else {
                    newCollapsed.add("__custom__");
                  }
                  setCollapsedCategories(newCollapsed);
                }}
                className="w-full px-4 py-3 bg-green-100/50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Apple className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-foreground">Custom Foods</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {customFoods.length} {customFoods.length === 1 ? "item" : "items"}
                  </span>
                  {collapsedCategories.has("__custom__") ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {!collapsedCategories.has("__custom__") && (
                <div className="p-4 bg-background space-y-3">
                  {customFoods.map((food) => renderFoodCard(food, true))}
                </div>
              )}
            </div>
          )}

          {/* Default Foods by Category */}
          {Array.from(foodsByCategory.entries()).map(([category, categoryFoods]) => {
            const defaultInCategory = categoryFoods.filter(f => f.isDefault);
            if (defaultInCategory.length === 0) return null;

            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    const newCollapsed = new Set(collapsedCategories);
                    if (isCollapsed) {
                      newCollapsed.delete(category);
                    } else {
                      newCollapsed.add(category);
                    }
                    setCollapsedCategories(newCollapsed);
                  }}
                  className="w-full px-4 py-3 bg-muted/50 hover:bg-muted flex items-center justify-between transition-colors"
                >
                  <span className="font-medium text-foreground">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {defaultInCategory.length} {defaultInCategory.length === 1 ? "item" : "items"}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-4 space-y-3">
                    {defaultInCategory.map((food) => renderFoodCard(food, false))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <FoodForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFood(null);
        }}
        onSubmit={async (data) => {
          if (editingFood) {
            await updateFood(editingFood.id, data);
          } else {
            await createFood(data);
          }
        }}
        food={editingFood}
        checkDuplicateName={checkDuplicateName}
        categories={categories}
      />

      {deleteConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Custom Food"
          message={
            deleteConfirm.usageCount > 0
              ? `This food has been used in ${deleteConfirm.usageCount} food ${deleteConfirm.usageCount === 1 ? "entry" : "entries"
              }.\n\nDeleting it will permanently remove it from your records.\n\nAre you sure you want to delete "${deleteConfirm.food.name}"?`
              : `Are you sure you want to delete "${deleteConfirm.food.name}"?`
          }
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};
