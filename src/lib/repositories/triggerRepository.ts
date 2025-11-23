import { db } from "../db/client";
import { TriggerRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class TriggerRepository {
  /**
   * Get all triggers for a user
   */
  async getAll(userId: string): Promise<TriggerRecord[]> {
    return await db.triggers.where("userId").equals(userId).toArray();
  }

  /**
   * Get active triggers for a user
   * Only returns triggers that are both active AND enabled (visible to user)
   */
  async getActive(userId: string): Promise<TriggerRecord[]> {
    return await db.triggers
      .where("userId")
      .equals(userId)
      .filter((trigger) => trigger.isActive && trigger.isEnabled !== false) // isEnabled can be undefined for old records
      .toArray();
  }

  /**
   * Get triggers by category
   */
  async getByCategory(
    userId: string,
    category: string
  ): Promise<TriggerRecord[]> {
    return await db.triggers
      .where("[userId+category]")
      .equals([userId, category])
      .toArray();
  }

  /**
   * Get trigger by ID
   */
  async getById(id: string): Promise<TriggerRecord | undefined> {
    return await db.triggers.get(id);
  }

  /**
   * Search triggers by name
   */
  async searchByName(userId: string, query: string): Promise<TriggerRecord[]> {
    const allTriggers = await this.getAll(userId);
    const lowerQuery = query.toLowerCase();

    return allTriggers.filter((trigger) =>
      trigger.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get unique categories for a user
   */
  async getCategories(userId: string): Promise<string[]> {
    const triggers = await this.getAll(userId);
    const categories = new Set(triggers.map((t) => t.category));
    return Array.from(categories);
  }

  /**
   * Create a new trigger
   */
  async create(
    triggerData: Omit<TriggerRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateId();
    const now = new Date();

    await db.triggers.add({
      ...triggerData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing trigger
   */
  async update(id: string, updates: Partial<TriggerRecord>): Promise<void> {
    await db.triggers.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Soft delete a trigger (mark as inactive)
   */
  async softDelete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * Hard delete a trigger
   */
  async delete(id: string): Promise<void> {
    await db.triggers.delete(id);
  }

  /**
   * Bulk create triggers
   */
  async bulkCreate(
    triggers: Omit<TriggerRecord, "id" | "createdAt" | "updatedAt">[]
  ): Promise<string[]> {
    const now = new Date();
    const triggersWithIds = triggers.map((trigger) => ({
      ...trigger,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    await db.triggers.bulkAdd(triggersWithIds);
    return triggersWithIds.map((t) => t.id);
  }

  /**
   * Get trigger statistics
   */
  async getStats(userId: string) {
    const triggers = await this.getAll(userId);
    const activeTriggers = triggers.filter((t) => t.isActive);
    const categories = await this.getCategories(userId);

    return {
      total: triggers.length,
      active: activeTriggers.length,
      inactive: triggers.length - activeTriggers.length,
      categories: categories.length,
      categoryCounts: categories.map((category) => ({
        category,
        count: triggers.filter((t) => t.category === category).length,
      })),
    };
  }
}

export const triggerRepository = new TriggerRepository();
