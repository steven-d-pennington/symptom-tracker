"use client";

import { useCallback, useEffect, useState } from "react";
import { foodRepository } from "@/lib/repositories/foodRepository";
import { FoodRecord } from "@/lib/db/schema";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export interface FoodFormData {
  name: string;
  category: string;
  allergenTags: string; // JSON-stringified string[]
  preparationMethod?: string;
  isActive: boolean;
}

export const useFoodManagement = () => {
  const { userId } = useCurrentUser();
  const [foods, setFoods] = useState<FoodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const loadFoods = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const allFoods = await foodRepository.getAll(userId);
      setFoods(allFoods);
    } catch (error) {
      console.error("Failed to load foods:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadFoods();
  }, [loadFoods]);

  const createFood = useCallback(async (data: FoodFormData) => {
    if (!userId) return;

    try {
      const id = await foodRepository.create({
        userId,
        name: data.name,
        category: data.category,
        allergenTags: data.allergenTags,
        preparationMethod: data.preparationMethod,
        isActive: data.isActive,
        isDefault: false,
      });

      await loadFoods();
      return id;
    } catch (error) {
      console.error("Failed to create food:", error);
      throw error;
    }
  }, [userId, loadFoods]);

  const updateFood = useCallback(async (id: string, data: Partial<FoodFormData>) => {
    try {
      await foodRepository.update(id, {
        name: data.name,
        category: data.category,
        allergenTags: data.allergenTags,
        preparationMethod: data.preparationMethod,
        isActive: data.isActive,
      });

      await loadFoods();
    } catch (error) {
      console.error("Failed to update food:", error);
      throw error;
    }
  }, [loadFoods]);

  const toggleFoodActive = useCallback(async (id: string) => {
    try {
      const food = foods.find(f => f.id === id);
      if (!food) return;

      await foodRepository.update(id, {
        isActive: !food.isActive,
      });

      await loadFoods();
    } catch (error) {
      console.error("Failed to toggle food:", error);
      throw error;
    }
  }, [foods, loadFoods]);

  const deleteFood = useCallback(async (id: string) => {
    try {
      await foodRepository.delete(id);
      await loadFoods();
    } catch (error) {
      console.error("Failed to delete food:", error);
      throw error;
    }
  }, [loadFoods]);

  const getFoodUsageCount = useCallback(async (foodId: string): Promise<number> => {
    if (!userId) return 0;

    try {
      // Import at call time to avoid circular dependencies
      const { foodEventRepository } = await import("@/lib/repositories/foodEventRepository");
      const events = await foodEventRepository.getAll(userId);

      const usageCount = events.filter(event => {
        const foodIds = JSON.parse(event.foodIds) as string[];
        return foodIds.includes(foodId);
      }).length;

      return usageCount;
    } catch (error) {
      console.error("Failed to get food usage:", error);
      return 0;
    }
  }, [userId]);

  const checkDuplicateName = useCallback((name: string, excludeId?: string): boolean => {
    const lowerName = name.toLowerCase().trim();
    return foods.some(
      f => f.name.toLowerCase().trim() === lowerName && f.id !== excludeId
    );
  }, [foods]);

  // Filter foods
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || food.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(foods.map(f => f.category)));

  return {
    foods: filteredFoods,
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
    refresh: loadFoods,
  };
};
