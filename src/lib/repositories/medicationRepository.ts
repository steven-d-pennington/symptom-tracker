import { db } from "../db/client";
import { MedicationRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class MedicationRepository {
  /**
   * Get all medications for a user
   */
  async getAll(userId: string): Promise<MedicationRecord[]> {
    return await db.medications.where("userId").equals(userId).toArray();
  }

  /**
   * Get active medications for a user
   * Only returns medications that are both active AND enabled (visible to user)
   */
  async getActive(userId: string): Promise<MedicationRecord[]> {
    return await db.medications
      .where("userId")
      .equals(userId)
      .filter((medication) => medication.isActive && medication.isEnabled !== false) // isEnabled can be undefined for old records
      .toArray();
  }

  /**
   * Get medication by ID
   */
  async getById(id: string): Promise<MedicationRecord | undefined> {
    return await db.medications.get(id);
  }

  /**
   * Search medications by name
   */
  async searchByName(
    userId: string,
    query: string
  ): Promise<MedicationRecord[]> {
    const allMedications = await this.getAll(userId);
    const lowerQuery = query.toLowerCase();

    return allMedications.filter((medication) =>
      medication.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get medications by frequency
   */
  async getByFrequency(
    userId: string,
    frequency: string
  ): Promise<MedicationRecord[]> {
    const allMedications = await this.getAll(userId);
    return allMedications.filter((m) => m.frequency === frequency);
  }

  /**
   * Create a new medication
   */
  async create(
    medicationData: Omit<MedicationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateId();
    const now = new Date();

    await db.medications.add({
      ...medicationData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing medication
   */
  async update(
    id: string,
    updates: Partial<MedicationRecord>
  ): Promise<void> {
    await db.medications.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Soft delete a medication (mark as inactive)
   */
  async softDelete(id: string): Promise<void> {
    await this.update(id, { isActive: false });
  }

  /**
   * Hard delete a medication
   */
  async delete(id: string): Promise<void> {
    await db.medications.delete(id);
  }

  /**
   * Bulk create medications
   */
  async bulkCreate(
    medications: Omit<MedicationRecord, "id" | "createdAt" | "updatedAt">[]
  ): Promise<string[]> {
    const now = new Date();
    const medicationsWithIds = medications.map((medication) => ({
      ...medication,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    await db.medications.bulkAdd(medicationsWithIds);
    return medicationsWithIds.map((m) => m.id);
  }

  /**
   * Get medication statistics
   */
  async getStats(userId: string) {
    const medications = await this.getAll(userId);
    const activeMedications = medications.filter((m) => m.isActive);

    const frequencyCounts: Record<string, number> = {};
    medications.forEach((m) => {
      frequencyCounts[m.frequency] = (frequencyCounts[m.frequency] || 0) + 1;
    });

    return {
      total: medications.length,
      active: activeMedications.length,
      inactive: medications.length - activeMedications.length,
      frequencies: Object.entries(frequencyCounts).map(
        ([frequency, count]) => ({
          frequency,
          count,
        })
      ),
      withSideEffects: medications.filter(
        (m) => m.sideEffects && m.sideEffects.length > 0
      ).length,
    };
  }

  /**
   * Get medications scheduled for a specific day
   */
  async getScheduledForDay(
    userId: string,
    dayOfWeek: number
  ): Promise<MedicationRecord[]> {
    const activeMedications = await this.getActive(userId);

    return activeMedications.filter((medication) =>
      medication.schedule.some((s) => s.daysOfWeek.includes(dayOfWeek))
    );
  }
}

export const medicationRepository = new MedicationRepository();
