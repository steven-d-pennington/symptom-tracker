import { db } from "../db/client";
import { SymptomRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class SymptomRepository {
  /**
   * Get all symptoms for a user
   */
  async getAll(userId: string): Promise<SymptomRecord[]> {
    return await db.symptoms.where("userId").equals(userId).toArray();
  }

  /**
   * Get active symptoms for a user
   * Only returns symptoms that are both active AND enabled (visible to user)
   */
  async getActive(userId: string): Promise<SymptomRecord[]> {
    return await db.symptoms
      .where("userId")
      .equals(userId)
      .filter((symptom) => symptom.isActive && symptom.isEnabled !== false) // isEnabled can be undefined for old records
      .toArray();
  }

  /**
   * Get symptoms by category
   */
  async getByCategory(
    userId: string,
    category: string
  ): Promise<SymptomRecord[]> {
    return await db.symptoms
      .where("[userId+category]")
      .equals([userId, category])
      .toArray();
  }

  /**
   * Get symptom by ID
   */
  async getById(id: string): Promise<SymptomRecord | undefined> {
    return await db.symptoms.get(id);
  }

  /**
   * Search symptoms by name
   */
  async searchByName(userId: string, query: string): Promise<SymptomRecord[]> {
    const allSymptoms = await this.getAll(userId);
    const lowerQuery = query.toLowerCase();

    return allSymptoms.filter((symptom) =>
      symptom.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get unique categories for a user
   */
  async getCategories(userId: string): Promise<string[]> {
    const symptoms = await this.getAll(userId);
    const categories = new Set(symptoms.map((s) => s.category));
    return Array.from(categories);
  }

  /**
   * Create a new symptom
   */
  async create(
    symptomData: Omit<SymptomRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateId();
    const now = new Date();

    await db.symptoms.add({
      ...symptomData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing symptom
   */
  async update(id: string, updates: Partial<SymptomRecord>): Promise<void> {
    await db.symptoms.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Soft delete a symptom (mark as inactive)
   */
  async softDelete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * Hard delete a symptom
   */
  async delete(id: string): Promise<void> {
    await db.symptoms.delete(id);
  }

  /**
   * Bulk create symptoms
   */
  async bulkCreate(
    symptoms: Omit<SymptomRecord, "id" | "createdAt" | "updatedAt">[]
  ): Promise<string[]> {
    const now = new Date();
    const symptomsWithIds = symptoms.map((symptom) => ({
      ...symptom,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    await db.symptoms.bulkAdd(symptomsWithIds);
    return symptomsWithIds.map((s) => s.id);
  }

  /**
   * Get symptom statistics
   */
  async getStats(userId: string) {
    const symptoms = await this.getAll(userId);
    const activeSymptoms = symptoms.filter((s) => s.isActive);
    const categories = await this.getCategories(userId);

    return {
      total: symptoms.length,
      active: activeSymptoms.length,
      inactive: symptoms.length - activeSymptoms.length,
      categories: categories.length,
      categoryCounts: categories.map((category) => ({
        category,
        count: symptoms.filter((s) => s.category === category).length,
      })),
    };
  }
}

export const symptomRepository = new SymptomRepository();
