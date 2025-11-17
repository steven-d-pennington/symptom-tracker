import { db } from "../db/client";
import { BodyMapLocationRecord, LayerType } from "../db/schema";
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
      // Default to 'flares' layer if not specified (Story 5.1 backward compatibility)
      layer: locationData.layer || 'flares',
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
      // Default to 'flares' layer if not specified (Story 5.1 backward compatibility)
      layer: location.layer || 'flares',
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

  /**
   * Get markers filtered by a specific layer (Story 5.1)
   * Uses compound index [userId+layer+createdAt] for efficient queries
   *
   * @param userId - User ID to filter by
   * @param layer - Layer type ('flares', 'pain', or 'inflammation')
   * @param options - Optional filters: limit, startTime, endTime, includeResolved
   * @returns Array of body map location records for the specified layer
   */
  async getMarkersByLayer(
    userId: string,
    layer: LayerType,
    options?: { limit?: number; startTime?: Date; endTime?: Date; includeResolved?: boolean }
  ): Promise<BodyMapLocationRecord[]> {
    const startTime = options?.startTime || new Date(0);
    const endTime = options?.endTime || new Date();
    const includeResolved = options?.includeResolved ?? false;

    let query = db.bodyMapLocations
      .where('[userId+layer+createdAt]')
      .between(
        [userId, layer, startTime],
        [userId, layer, endTime],
        true,
        true
      );

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const locations = await query.reverse().toArray();

    // CRITICAL: Enrich locations with current severity from bodyMarkers
    // Get all marker IDs that need severity lookup
    const markerIds = locations
      .map(loc => loc.markerId)
      .filter((id): id is string => id !== undefined);

    let severityMap = new Map<string, number>();
    let resolvedMarkerIds = new Set<string>();

    if (markerIds.length > 0) {
      // Fetch marker data in bulk to get current severity
      const markers = await db.bodyMarkers
        .where('id')
        .anyOf(markerIds)
        .toArray();

      // Build map of markerId -> currentSeverity
      markers.forEach(marker => {
        severityMap.set(marker.id, marker.currentSeverity);
        if (marker.status === 'resolved') {
          resolvedMarkerIds.add(marker.id);
        }
      });
    }

    // Enrich locations with current severity from bodyMarkers
    // This ensures markers always display the latest severity, not the stored severity
    const enrichedLocations = locations.map(loc => {
      // If this location has a markerId, use currentSeverity from bodyMarkers
      if (loc.markerId && severityMap.has(loc.markerId)) {
        return {
          ...loc,
          severity: severityMap.get(loc.markerId)!, // Use current severity from bodyMarkers
        };
      }
      // Fallback to stored severity (for legacy markers without markerId)
      return loc;
    });

    // Filter out resolved markers if includeResolved is false
    if (!includeResolved) {
      return enrichedLocations.filter(loc =>
        !loc.markerId || !resolvedMarkerIds.has(loc.markerId)
      );
    }

    return enrichedLocations;
  }

  /**
   * Get markers from multiple layers (Story 5.1)
   * Performs parallel queries for each layer and combines results
   *
   * @param userId - User ID to filter by
   * @param layers - Array of layer types to retrieve
   * @param options - Optional filters: limit (per layer), startTime, endTime, includeResolved
   * @returns Combined and sorted array of markers from all specified layers
   */
  async getMarkersByLayers(
    userId: string,
    layers: LayerType[],
    options?: { limit?: number; startTime?: Date; endTime?: Date; includeResolved?: boolean }
  ): Promise<BodyMapLocationRecord[]> {
    const results = await Promise.all(
      layers.map(layer => this.getMarkersByLayer(userId, layer, options))
    );

    return results
      .flat()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get count of markers per layer for a user (Story 5.1)
   * Uses compound index for efficient counting
   *
   * @param userId - User ID to filter by
   * @returns Object with counts for each layer type
   */
  async getMarkerCountsByLayer(userId: string): Promise<Record<LayerType, number>> {
    const counts: Record<LayerType, number> = {
      flares: 0,
      pain: 0,
      inflammation: 0
    };

    for (const layer of Object.keys(counts) as LayerType[]) {
      counts[layer] = await db.bodyMapLocations
        .where('[userId+layer+createdAt]')
        .between(
          [userId, layer, new Date(0)],
          [userId, layer, new Date()],
          true,
          true
        )
        .count();
    }

    return counts;
  }
}

export const bodyMapLocationRepository = new BodyMapLocationRepository();
