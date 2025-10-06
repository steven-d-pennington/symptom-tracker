import { db } from "../db/client";
import { DailyEntryRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class DailyEntryRepository {
  /**
   * Get all daily entries for a user
   */
  async getAll(userId: string): Promise<DailyEntryRecord[]> {
    return await db.dailyEntries
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("date");
  }

  /**
   * Get daily entry by ID
   */
  async getById(id: string): Promise<DailyEntryRecord | undefined> {
    return await db.dailyEntries.get(id);
  }

  /**
   * Get daily entry by date
   */
  async getByDate(
    userId: string,
    date: string
  ): Promise<DailyEntryRecord | undefined> {
    return await db.dailyEntries
      .where("[userId+date]")
      .equals([userId, date])
      .first();
  }

  /**
   * Get daily entries in a date range
   */
  async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyEntryRecord[]> {
    return await db.dailyEntries
      .where("userId")
      .equals(userId)
      .filter(
        (entry) => entry.date >= startDate && entry.date <= endDate
      )
      .sortBy("date");
  }

  /**
   * Get recent entries (last N days)
   */
  async getRecent(userId: string, limit: number = 30): Promise<DailyEntryRecord[]> {
    return await db.dailyEntries
      .where("userId")
      .equals(userId)
      .reverse()
      .limit(limit)
      .sortBy("date");
  }

  /**
   * Get entries with specific symptom
   */
  async getWithSymptom(
    userId: string,
    symptomId: string
  ): Promise<DailyEntryRecord[]> {
    const allEntries = await this.getAll(userId);
    return allEntries.filter((entry) =>
      entry.symptoms.some((s) => s.symptomId === symptomId)
    );
  }

  /**
   * Get entries with specific medication
   */
  async getWithMedication(
    userId: string,
    medicationId: string
  ): Promise<DailyEntryRecord[]> {
    const allEntries = await this.getAll(userId);
    return allEntries.filter((entry) =>
      entry.medications.some((m) => m.medicationId === medicationId)
    );
  }

  /**
   * Get entries with specific trigger
   */
  async getWithTrigger(
    userId: string,
    triggerId: string
  ): Promise<DailyEntryRecord[]> {
    const allEntries = await this.getAll(userId);
    return allEntries.filter((entry) =>
      entry.triggers.some((t) => t.triggerId === triggerId)
    );
  }

  /**
   * Create a new daily entry
   */
  async create(
    entryData: Omit<DailyEntryRecord, "id">
  ): Promise<string> {
    const id = generateId();

    await db.dailyEntries.add({
      ...entryData,
      id,
    });

    return id;
  }

  /**
   * Update an existing daily entry
   */
  async update(id: string, updates: Partial<DailyEntryRecord>): Promise<void> {
    await db.dailyEntries.update(id, updates);
  }

  /**
   * Delete a daily entry
   */
  async delete(id: string): Promise<void> {
    await db.dailyEntries.delete(id);
  }

  /**
   * Bulk create daily entries
   */
  async bulkCreate(
    entries: Omit<DailyEntryRecord, "id">[]
  ): Promise<string[]> {
    const entriesWithIds = entries.map((entry) => ({
      ...entry,
      id: generateId(),
    }));

    await db.dailyEntries.bulkAdd(entriesWithIds);
    return entriesWithIds.map((e) => e.id);
  }

  /**
   * Get entry statistics for a date range
   */
  async getStats(userId: string, startDate?: string, endDate?: string) {
    let entries: DailyEntryRecord[];

    if (startDate && endDate) {
      entries = await this.getByDateRange(userId, startDate, endDate);
    } else {
      entries = await this.getAll(userId);
    }

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageHealth: 0,
        averageEnergy: 0,
        averageSleep: 0,
        averageStress: 0,
        totalSymptoms: 0,
        totalMedications: 0,
        totalTriggers: 0,
      };
    }

    const totalHealth = entries.reduce((sum, e) => sum + e.overallHealth, 0);
    const totalEnergy = entries.reduce((sum, e) => sum + e.energyLevel, 0);
    const totalSleep = entries.reduce((sum, e) => sum + e.sleepQuality, 0);
    const totalStress = entries.reduce((sum, e) => sum + e.stressLevel, 0);
    const totalSymptoms = entries.reduce((sum, e) => sum + e.symptoms.length, 0);
    const totalMedications = entries.reduce((sum, e) => sum + e.medications.length, 0);
    const totalTriggers = entries.reduce((sum, e) => sum + e.triggers.length, 0);

    return {
      totalEntries: entries.length,
      averageHealth: totalHealth / entries.length,
      averageEnergy: totalEnergy / entries.length,
      averageSleep: totalSleep / entries.length,
      averageStress: totalStress / entries.length,
      totalSymptoms,
      totalMedications,
      totalTriggers,
      averageSymptomsPerEntry: totalSymptoms / entries.length,
      averageMedicationsPerEntry: totalMedications / entries.length,
      averageTriggersPerEntry: totalTriggers / entries.length,
    };
  }

  /**
   * Get health trends (aggregated by week or month)
   */
  async getHealthTrends(
    userId: string,
    startDate: string,
    endDate: string,
    groupBy: "week" | "month" = "week"
  ) {
    const entries = await this.getByDateRange(userId, startDate, endDate);

    const groups = new Map<string, DailyEntryRecord[]>();

    entries.forEach((entry) => {
      const date = new Date(entry.date);
      let key: string;

      if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(entry);
    });

    return Array.from(groups.entries()).map(([period, periodEntries]) => ({
      period,
      averageHealth:
        periodEntries.reduce((sum, e) => sum + e.overallHealth, 0) /
        periodEntries.length,
      averageEnergy:
        periodEntries.reduce((sum, e) => sum + e.energyLevel, 0) /
        periodEntries.length,
      averageSleep:
        periodEntries.reduce((sum, e) => sum + e.sleepQuality, 0) /
        periodEntries.length,
      averageStress:
        periodEntries.reduce((sum, e) => sum + e.stressLevel, 0) /
        periodEntries.length,
      entryCount: periodEntries.length,
    }));
  }

  /**
   * Check if entry exists for a specific date
   */
  async existsForDate(userId: string, date: string): Promise<boolean> {
    const entry = await this.getByDate(userId, date);
    return !!entry;
  }
}

export const dailyEntryRepository = new DailyEntryRepository();
