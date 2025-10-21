import { db } from "../db/client";
import { ActiveFlare, FlareStats } from "../types/flare";
import { generateId } from "../utils/idGenerator";

export const flareRepository = {
  async create(flare: Omit<ActiveFlare, "id" | "createdAt" | "updatedAt">): Promise<ActiveFlare> {
    const newFlare: ActiveFlare = {
      ...flare,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.table("flares").add(newFlare);
    return newFlare;
  },

  async getById(id: string): Promise<ActiveFlare | undefined> {
    return await db.table("flares").get(id);
  },

  async getByUserId(userId: string): Promise<ActiveFlare[]> {
    if (!userId || typeof userId !== 'string') {
      console.error('Invalid userId provided to getByUserId:', userId);
      return [];
    }
    return await db.table("flares").where("userId").equals(userId).toArray();
  },

  async getActiveFlares(userId: string): Promise<ActiveFlare[]> {
    const allFlares = await this.getByUserId(userId);
    return allFlares.filter((f) => f.status === "active" || f.status === "improving" || f.status === "worsening");
  },

  async getResolvedFlares(userId: string): Promise<ActiveFlare[]> {
    const allFlares = await this.getByUserId(userId);
    return allFlares.filter((f) => f.status === "resolved");
  },

  async update(id: string, updates: Partial<ActiveFlare>): Promise<void> {
    await db.table("flares").update(id, {
      ...updates,
      updatedAt: new Date(),
    });
  },

  async delete(id: string): Promise<void> {
    await db.table("flares").delete(id);
  },

  async getStats(userId: string): Promise<FlareStats> {
    const activeFlares = await this.getActiveFlares(userId);

    if (activeFlares.length === 0) {
      return {
        totalActive: 0,
        averageSeverity: 0,
        longestDuration: 0,
        mostAffectedRegion: "",
        commonInterventions: [],
      };
    }

    const totalSeverity = activeFlares.reduce((sum, f) => sum + f.severity, 0);
    const averageSeverity = totalSeverity / activeFlares.length;

    const durations = activeFlares.map((f) => {
      const start = new Date(f.startDate).getTime();
      const end = f.endDate ? new Date(f.endDate).getTime() : Date.now();
      return Math.floor((end - start) / (1000 * 60 * 60 * 24)); // days
    });
    const longestDuration = Math.max(...durations);

    // Count body regions
    const regionCounts = new Map<string, number>();
    activeFlares.forEach((f) => {
      f.bodyRegions.forEach((region) => {
        regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
      });
    });
    const mostAffectedRegion = Array.from(regionCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "";

    // Count interventions
    const interventionCounts = new Map<string, number>();
    activeFlares.forEach((f) => {
      f.interventions.forEach((i) => {
        interventionCounts.set(i.description, (interventionCounts.get(i.description) || 0) + 1);
      });
    });
    const commonInterventions = Array.from(interventionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    return {
      totalActive: activeFlares.length,
      averageSeverity: Math.round(averageSeverity * 10) / 10,
      longestDuration,
      mostAffectedRegion,
      commonInterventions,
    };
  },

  /**
   * Update flare severity and track history
   * Automatically updates status based on severity changes
   */
  async updateSeverity(
    id: string,
    newSeverity: number,
    status?: 'active' | 'improving' | 'worsening'
  ): Promise<void> {
    const flare = await this.getById(id);
    if (!flare) {
      throw new Error(`Flare not found: ${id}`);
    }

    // Validate severity (1-10 range)
    if (newSeverity < 1 || newSeverity > 10) {
      throw new Error('Severity must be between 1 and 10');
    }

    const timestamp = Date.now();

    // Auto-detect status if not provided
    let calculatedStatus = status;
    if (!calculatedStatus) {
      const severityDelta = newSeverity - flare.severity;
      if (severityDelta >= 2) {
        calculatedStatus = 'worsening';
      } else if (severityDelta <= -2) {
        calculatedStatus = 'improving';
      } else {
        calculatedStatus = 'active';
      }
    }

    // Initialize severityHistory if it doesn't exist (backward compatibility)
    const severityHistory = (flare as any).severityHistory || [];

    // Add new severity entry to history
    severityHistory.push({
      timestamp,
      severity: newSeverity,
      status: calculatedStatus,
    });

    await this.update(id, {
      severity: newSeverity,
      status: calculatedStatus,
      severityHistory,
    } as any);
  },

  /**
   * Add intervention to a flare
   */
  async addIntervention(
    id: string,
    type: 'ice' | 'medication' | 'rest' | 'other',
    notes?: string
  ): Promise<void> {
    const flare = await this.getById(id);
    if (!flare) {
      throw new Error(`Flare not found: ${id}`);
    }

    const timestamp = Date.now();

    // Initialize interventions arrays if they don't exist (avoid mutation with spread)
    const existingInterventions = (flare as any).interventions || [];
    const newInterventions = [...existingInterventions];

    // Add new intervention to the new format (array of objects)
    newInterventions.push({
      timestamp,
      type,
      notes,
    });

    await this.update(id, {
      interventions: newInterventions,
    } as any);
  },

  /**
   * Resolve a flare with optional notes about what helped
   */
  async resolve(id: string, resolutionNotes?: string): Promise<void> {
    const flare = await this.getById(id);
    if (!flare) {
      throw new Error(`Flare not found: ${id}`);
    }

    const now = new Date();

    await this.update(id, {
      status: 'resolved',
      endDate: now,
      resolutionNotes,
    } as any);
  },

  /**
   * Get active flares with trend indicators based on severity changes
   * Returns trend: 'worsening' (↑), 'stable' (→), 'improving' (↓)
   */
  async getActiveFlaresWithTrend(
    userId: string
  ): Promise<Array<ActiveFlare & { trend: 'worsening' | 'stable' | 'improving' }>> {
    const activeFlares = await this.getActiveFlares(userId);

    return activeFlares.map((flare) => {
      // Get severity history (with backward compatibility)
      const severityHistory = (flare as any).severityHistory || [];

      let trend: 'worsening' | 'stable' | 'improving' = 'stable';

      if (severityHistory.length >= 2) {
        // Get severity from 24 hours ago (or closest available)
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

        // Find the closest severity entry to 24 hours ago
        let previousSeverity = flare.severity;
        for (let i = severityHistory.length - 1; i >= 0; i--) {
          if (severityHistory[i].timestamp <= twentyFourHoursAgo) {
            previousSeverity = severityHistory[i].severity;
            break;
          }
        }

        const currentSeverity = flare.severity;
        const severityDelta = currentSeverity - previousSeverity;

        if (severityDelta >= 2) {
          trend = 'worsening';
        } else if (severityDelta <= -2) {
          trend = 'improving';
        } else {
          trend = 'stable';
        }
      }

      return {
        ...flare,
        trend,
      };
    });
  },
};
