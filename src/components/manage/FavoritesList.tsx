"use client";

import { useState, useEffect } from "react";
import { Star, Search, ChevronDown, ChevronRight } from "lucide-react";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import type { FoodRecord } from "@/lib/db/schema";
import { cn } from "@/lib/utils/cn";
import { AllergenBadgeList } from "@/components/food/AllergenBadge";
import type { AllergenType } from "@/lib/constants/allergens";
import { CustomFoodBadge } from "@/components/food/CustomFoodBadge";

export function FavoritesList() {
  const [userId, setUserId] = useState<string>("");
  const [foodsByCategory, setFoodsByCategory] = useState<Map<string, FoodRecord[]>>(new Map());
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load foods on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery && userId) {
      performSearch();
    }
  }, [searchQuery, userId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = await userRepository.getOrCreateCurrentUser();
      setUserId(user.id);

      const favIds = await userRepository.getFoodFavorites(user.id);
      setFavoriteIds(favIds);

      // Load all foods grouped by category
      const grouped = await foodRepository.getAllByCategory(user.id);
      setFoodsByCategory(grouped);

      // Start with all categories collapsed
      setCollapsedCategories(new Set(grouped.keys()));
    } catch (err) {
      console.error("Failed to load foods:", err);
      setError("Failed to load foods. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const results = await foodRepository.search(userId, searchQuery);
      // Sort: favorites first, then alphabetically
      const sorted = [...results].sort((a, b) => {
        const aFav = favoriteIds.includes(a.id) ? 1 : 0;
        const bFav = favoriteIds.includes(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return a.name.localeCompare(b.name);
      });
      setSearchResults(sorted);
    } catch (err) {
      console.error("Failed to search foods:", err);
    }
  };

  const toggleFavorite = async (food: FoodRecord) => {
    try {
      await userRepository.toggleFoodFavorite(userId, food.id);
      const updatedFavs = await userRepository.getFoodFavorites(userId);
      setFavoriteIds(updatedFavs);

      const isFavorite = updatedFavs.includes(food.id);
      setSuccessMessage(
        isFavorite
          ? `Added "${food.name}" to favorites`
          : `Removed "${food.name}" from favorites`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
      setError("Failed to update favorite. Please try again.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const totalFoods = Array.from(foodsByCategory.values()).reduce(
    (sum, foods) => sum + foods.length,
    0
  );

  const totalFavorites = favoriteIds.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">Food Management</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and manage all foods • {totalFoods} total • {totalFavorites} favorites
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search foods..."
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

      {/* Success/Error Messages */}
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading foods...</p>
        </div>
      )}

      {/* Search Results */}
      {!loading && searchQuery && (
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Search Results ({searchResults.length})
          </h3>
          {searchResults.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground text-sm">
              No foods found matching "{searchQuery}"
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.map((food) => {
                const allergens = JSON.parse(food.allergenTags) as AllergenType[];
                const isCustom = !food.isDefault;
                const isFavorite = favoriteIds.includes(food.id);

                return (
                  <div
                    key={food.id}
                    className="relative rounded-lg border border-border bg-background p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-foreground text-sm">
                            {food.name}
                          </h4>
                          {isCustom && <CustomFoodBadge className="flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {food.category}
                        </p>
                        {allergens.length > 0 && (
                          <div className="mt-2">
                            <AllergenBadgeList allergens={allergens} maxVisible={3} />
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(food)}
                        className={cn(
                          "p-1.5 rounded-md transition-colors flex-shrink-0",
                          isFavorite
                            ? "text-yellow-500 hover:bg-yellow-50"
                            : "text-muted-foreground hover:bg-muted",
                          "focus:outline-none focus:ring-2 focus:ring-primary"
                        )}
                        aria-label={isFavorite ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={cn("w-4 h-4", isFavorite && "fill-yellow-500")} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Category View (when not searching) */}
      {!loading && !searchQuery && foodsByCategory.size > 0 && (
        <div className="space-y-3">
          {/* Favorites Category - Always First */}
          {favoriteIds.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden bg-yellow-50/50 dark:bg-yellow-950/20">
              {/* Favorites Category Header */}
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
                    {favoriteIds.length} {favoriteIds.length === 1 ? "item" : "items"}
                  </span>
                  {collapsedCategories.has("__favorites__") ? (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Favorites Foods */}
              {!collapsedCategories.has("__favorites__") && (
                <div className="p-4 bg-background">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.from(foodsByCategory.values())
                      .flat()
                      .filter((food) => favoriteIds.includes(food.id))
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((food) => {
                        const allergens = JSON.parse(food.allergenTags) as AllergenType[];
                        const isCustom = !food.isDefault;

                        return (
                          <div
                            key={food.id}
                            className="relative rounded-lg border border-border bg-background p-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-foreground text-sm">
                                    {food.name}
                                  </h4>
                                  {isCustom && <CustomFoodBadge className="flex-shrink-0" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {food.category}
                                </p>
                                {allergens.length > 0 && (
                                  <div className="mt-2">
                                    <AllergenBadgeList allergens={allergens} maxVisible={3} />
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleFavorite(food)}
                                className={cn(
                                  "p-1.5 rounded-md transition-colors flex-shrink-0",
                                  "text-yellow-500 hover:bg-yellow-50",
                                  "focus:outline-none focus:ring-2 focus:ring-primary"
                                )}
                                aria-label={`Remove ${food.name} from favorites`}
                                title="Remove from favorites"
                              >
                                <Star className="w-4 h-4 fill-yellow-500" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Regular Categories */}
          {Array.from(foodsByCategory.entries()).map(([category, foods]) => {
            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} className="border border-border rounded-lg overflow-hidden">
                {/* Category Header */}
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
                      {foods.length} {foods.length === 1 ? "item" : "items"}
                    </span>
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Category Foods */}
                {!isCollapsed && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {foods.map((food) => {
                        const allergens = JSON.parse(food.allergenTags) as AllergenType[];
                        const isCustom = !food.isDefault;
                        const isFavorite = favoriteIds.includes(food.id);

                        return (
                          <div
                            key={food.id}
                            className="relative rounded-lg border border-border bg-background p-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-foreground text-sm">
                                    {food.name}
                                  </h4>
                                  {isCustom && <CustomFoodBadge className="flex-shrink-0" />}
                                </div>
                                {allergens.length > 0 && (
                                  <div className="mt-2">
                                    <AllergenBadgeList allergens={allergens} maxVisible={3} />
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleFavorite(food)}
                                className={cn(
                                  "p-1.5 rounded-md transition-colors flex-shrink-0",
                                  isFavorite
                                    ? "text-yellow-500 hover:bg-yellow-50"
                                    : "text-muted-foreground hover:bg-muted",
                                  "focus:outline-none focus:ring-2 focus:ring-primary"
                                )}
                                aria-label={isFavorite ? `Remove ${food.name} from favorites` : `Add ${food.name} to favorites`}
                                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Star className={cn("w-4 h-4", isFavorite && "fill-yellow-500")} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
