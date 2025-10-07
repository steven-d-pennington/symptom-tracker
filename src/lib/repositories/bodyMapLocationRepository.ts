import { db } from "../db/client";
import { BodyMapLocationRecord } from "../db/schema";
import { generateId } from "../utils/idGenerator";

export class BodyMapLocationRepository {
  /**
   * Get all body map locations for a user
   */
  async getAll(userId: string): Promise<BodyMapLocationRecord[]> {
    return await db.bodyMapLocations
      .where("userId")
      .equals(userId)
      .reverse()
      .sortBy("createdAt");
  }

  /**
   * Get body map location by ID
   */
  async getById(id: string): Promise<BodyMapLocationRecord | undefined> {
    return await db.bodyMapLocations.get(id);
  }

  /**
   * Get locations for a specific daily entry
   */
  async getByDailyEntry(
    userId: string,
    dailyEntryId: string
  ): Promise<BodyMapLocationRecord[]> {
    return await db.bodyMapLocations
      .where("dailyEntryId")
      .equals(dailyEntryId)
      .filter((loc) => loc.userId === userId)
      .toArray();
  }

  /**
   * Get locations for a specific symptom
   */
  async getBySymptom(
    userId: string,
    symptomId: string
  ): Promise<BodyMapLocationRecord[]> {
    return await db.bodyMapLocations
      .where("[userId+symptomId]")
      .equals([userId, symptomId])
      .reverse()
      .sortBy("createdAt");
  }

  /**
   * Get locations for a specific body region
   */
  async getByBodyRegion(
    userId: string,
    bodyRegionId: string
  ): Promise<BodyMapLocationRecord[]> {
    return await db.bodyMapLocations
      .where("bodyRegionId")
      .equals(bodyRegionId)
      .filter((loc) => loc.userId === userId)
      .reverse()
      .sortBy("createdAt");
  }

  /**
   * Get locations within a date range
   */
  async getByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<BodyMapLocationRecord[]> {
    return await db.bodyMapLocations
      .where("userId")
      .equals(userId)
      .filter(
        (loc) =>
          loc.createdAt >= startDate && loc.createdAt <= endDate
      )
      .reverse()
      .sortBy("createdAt");
  }

  /**
   * Create a new body map location
   */
  async create(
    locationData: Omit<BodyMapLocationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<string> {
    const id = generateId();
    const now = new Date();

    await db.bodyMapLocations.add({
      ...locationData,
      id,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  }

  /**
   * Update an existing body map location
   */
  async update(
    id: string,
    updates: Partial<BodyMapLocationRecord>
  ): Promise<void> {
    await db.bodyMapLocations.update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Delete a body map location
   */
  async delete(id: string): Promise<void> {
    await db.bodyMapLocations.delete(id);
  }

  /**
   * Bulk create body map locations
   */
  async bulkCreate(
    locations: Omit<BodyMapLocationRecord, "id" | "createdAt" | "updatedAt">[]
  ): Promise<string[]> {
    const now = new Date();
    const locationsWithIds = locations.map((location) => ({
      ...location,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }));

    await db.bodyMapLocations.bulkAdd(locationsWithIds);
    return locationsWithIds.map((l) => l.id);
  }

  /**
   * Get most affected body regions
   */
  async getMostAffectedRegions(
    userId: string,
    limit: number = 10
  ): Promise<Array<{ bodyRegionId: string; count: number; avgSeverity: number }>> {
    const locations = await this.getAll(userId);

    const regionStats = new Map<
      string,
      { count: number; totalSeverity: number }
    >();

    locations.forEach((loc) => {
      const stats = regionStats.get(loc.bodyRegionId) || {
        count: 0,
        totalSeverity: 0,
      };
      stats.count++;
      stats.totalSeverity += loc.severity;
      regionStats.set(loc.bodyRegionId, stats);
    });

    return Array.from(regionStats.entries())
      .map(([bodyRegionId, stats]) => ({
        bodyRegionId,
        count: stats.count,
        avgSeverity: stats.totalSeverity / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get average severity for a body region over time
   */
  async getRegionSeverityTrend(
    userId: string,
    bodyRegionId: string,
    days: number = 30
  ): Promise<Array<{ date: string; avgSeverity: number; count: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const locations = await db.bodyMapLocations
      .where("bodyRegionId")
      .equals(bodyRegionId)
      .filter(
        (loc) => loc.userId === userId && loc.createdAt >= startDate
      )
      .toArray();

    // Group by date
    const dateGroups = new Map<
      string,
      { totalSeverity: number; count: number }
    >();

    locations.forEach((loc) => {
      const dateStr = loc.createdAt.toISOString().split("T")[0];
      const group = dateGroups.get(dateStr) || {
        totalSeverity: 0,
        count: 0,
      };
      group.totalSeverity += loc.severity;
      group.count++;
      dateGroups.set(dateStr, group);
    });

    return Array.from(dateGroups.entries())
      .map(([date, group]) => ({
        date,
        avgSeverity: group.totalSeverity / group.count,
        count: group.count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const bodyMapLocationRepository = new BodyMapLocationRepository();
