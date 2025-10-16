import { db } from "../db/client";
import type { FoodEventRecord, MealType } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class FoodEventRepository {
  /**
   * Create a new food event
   */
  async create(
    eventData: Omit<FoodEventRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    // Validation: ensure timestamp exists
    if (!eventData.timestamp) {
      throw new Error("Timestamp is required for food event");
    }

    // Validation: ensure at least one food
    const foodIds = JSON.parse(eventData.foodIds) as string[];
    if (foodIds.length === 0) {
      throw new Error("At least one food is required for food event");
    }

    // Validation: ensure valid meal type
    const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(eventData.mealType)) {
      throw new Error(
        `Invalid meal type: ${eventData.mealType}. Allowed: breakfast, lunch, dinner, snack`
      );
    }

    const id = generateId();
    const now = Date.now();

    await db.foodEvents.add({
      ...eventData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing food event
   */
  async update(id: string, updates: Partial<FoodEventRecord>): Promise<void> {
    // Validate foodIds if being updated
    if (updates.foodIds) {
      const foodIds = JSON.parse(updates.foodIds) as string[];
      if (foodIds.length === 0) {
        throw new Error("At least one food is required for food event");
      }
    }

    // Validate meal type if being updated
    if (updates.mealType) {
      const validMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(updates.mealType)) {
        throw new Error(
          `Invalid meal type: ${updates.mealType}. Allowed: breakfast, lunch, dinner, snack`
        );
      }
    }

    await db.foodEvents.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  /**
   * Delete a food event (hard delete)
   */
  async delete(id: string): Promise<void> {
    await db.foodEvents.delete(id);
  }

  /**
   * Find food events by date range
   */
  async findByDateRange(
    userId: string,
    startMs: number,
    endMs: number
  ): Promise<FoodEventRecord[]> {
    const events = await db.foodEvents
      .where("userId")
      .equals(userId)
      .filter((event) => event.timestamp >= startMs && event.timestamp <= endMs)
      .toArray();
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Find food events by meal type
   */
  async findByMealType(
    userId: string,
    mealType: MealType
  ): Promise<FoodEventRecord[]> {
    const events = await db.foodEvents
      .where("[userId+mealType]")
      .equals([userId, mealType])
      .toArray();
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Find food events by meal ID (grouped foods)
   */
  async findByMealId(
    userId: string,
    mealId: string
  ): Promise<FoodEventRecord[]> {
    const events = await db.foodEvents
      .where("[userId+mealId]")
      .equals([userId, mealId])
      .toArray();
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get recent food events
   */
  async getRecent(userId: string, limit: number = 10): Promise<FoodEventRecord[]> {
    const events = await db.foodEvents
      .where("userId")
      .equals(userId)
      .toArray();
    
    return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Get all food events for a user
   */
  async getAll(userId: string): Promise<FoodEventRecord[]> {
    const events = await db.foodEvents
      .where("userId")
      .equals(userId)
      .toArray();
    
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get food event by ID
   */
  async getById(id: string): Promise<FoodEventRecord | undefined> {
    return await db.foodEvents.get(id);
  }

  /**
   * Get statistics for food events
   */
  async getStats(userId: string) {
    const events = await this.getAll(userId);
    
    const mealTypeCounts = events.reduce((acc, event) => {
      acc[event.mealType] = (acc[event.mealType] || 0) + 1;
      return acc;
    }, {} as Record<MealType, number>);

    return {
      total: events.length,
      byMealType: mealTypeCounts,
      recentCount: Math.min(10, events.length),
    };
  }
}

export const foodEventRepository = new FoodEventRepository();
