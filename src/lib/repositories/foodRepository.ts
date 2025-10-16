import { db } from "../db/client";
import type { FoodRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";
import { validateAllergens } from "../constants/allergens";

export interface FoodFilters {
  category?: string;
  allergens?: string[];
}

export class FoodRepository {
  /**
   * Get all foods for a user
   */
  async getAll(userId: string): Promise<FoodRecord[]> {
    return await db.foods.where("userId").equals(userId).toArray();
  }

  /**
   * Get active foods for a user
   */
  async getActive(userId: string): Promise<FoodRecord[]> {
    return await db.foods
      .where("userId")
      .equals(userId)
      .filter((food) => food.isActive)
      .toArray();
  }

  /**
   * Get default (seeded) foods for a user
   */
  async getDefault(userId: string): Promise<FoodRecord[]> {
    return await db.foods
      .where("userId")
      .equals(userId)
      .filter((food) => food.isDefault && food.isActive)
      .toArray();
  }

  /**
   * Get food by ID
   */
  async getById(id: string): Promise<FoodRecord | undefined> {
    return await db.foods.get(id);
  }

  /**
   * Search foods by name with optional filters
   */
  async search(
    userId: string,
    query: string,
    filters?: FoodFilters
  ): Promise<FoodRecord[]> {
    // Start with indexed query for performance
    let foods = await this.getActive(userId);

    // Filter by name (case-insensitive)
    if (query) {
      const lowerQuery = query.toLowerCase();
      foods = foods.filter((food) =>
        food.name.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by category
    if (filters?.category) {
      foods = foods.filter((food) => food.category === filters.category);
    }

    // Filter by allergens (foods that contain ANY of the specified allergens)
    if (filters?.allergens && filters.allergens.length > 0) {
      foods = foods.filter((food) => {
        const allergenTags = JSON.parse(food.allergenTags) as string[];
        return filters.allergens!.some((allergen) =>
          allergenTags.includes(allergen)
        );
      });
    }

    return foods;
  }

  /**
   * Get unique categories for a user
   */
  async getCategories(userId: string): Promise<string[]> {
    const foods = await this.getActive(userId);
    const categories = new Set(foods.map((f) => f.category));
    return Array.from(categories).sort();
  }

  /**
   * Create a new food
   */
  async create(
    foodData: Omit<FoodRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    // Validate allergen tags
    const allergenTags = JSON.parse(foodData.allergenTags) as string[];
    if (!validateAllergens(allergenTags)) {
      throw new Error(
        "Invalid allergen tag. Allowed: dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish"
      );
    }

    const id = generateId();
    const now = Date.now();

    await db.foods.add({
      ...foodData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing food
   */
  async update(id: string, updates: Partial<FoodRecord>): Promise<void> {
    // If allergen tags are being updated, validate them
    if (updates.allergenTags) {
      const allergenTags = JSON.parse(updates.allergenTags) as string[];
      if (!validateAllergens(allergenTags)) {
        throw new Error(
          "Invalid allergen tag. Allowed: dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish"
        );
      }
    }

    await db.foods.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  /**
   * Soft delete a food (mark as inactive)
   */
  async archive(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * Hard delete a food
   */
  async delete(id: string): Promise<void> {
    await db.foods.delete(id);
  }

  /**
   * Bulk create foods
   */
  async bulkCreate(
    foods: Omit<FoodRecord, "id" | "createdAt" | "updatedAt">[]
  ): Promise<string[]> {
    // Validate all allergen tags
    for (const food of foods) {
      const allergenTags = JSON.parse(food.allergenTags) as string[];
      if (!validateAllergens(allergenTags)) {
        throw new Error(
          `Invalid allergen tag in food "${food.name}". Allowed: dairy, gluten, nuts, shellfish, nightshades, soy, eggs, fish`
        );
      }
    }

    const now = Date.now();
    const foodsWithIds = foods.map((food) => ({
      ...food,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    await db.foods.bulkAdd(foodsWithIds);
    return foodsWithIds.map((f) => f.id);
  }

  /**
   * Get food statistics
   */
  async getStats(userId: string) {
    const foods = await this.getAll(userId);
    const activeFoods = foods.filter((f) => f.isActive);
    const categories = await this.getCategories(userId);

    return {
      total: foods.length,
      active: activeFoods.length,
      inactive: foods.length - activeFoods.length,
      default: foods.filter((f) => f.isDefault).length,
      custom: foods.filter((f) => !f.isDefault).length,
      categories: categories.length,
      categoryCounts: categories.map((category) => ({
        category,
        count: activeFoods.filter((f) => f.category === category).length,
      })),
    };
  }
}

export const foodRepository = new FoodRepository();
