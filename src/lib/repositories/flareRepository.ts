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
};
