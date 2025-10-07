import { BodyMapLocation } from "../types/body-mapping";

export interface RegionAnalytics {
  regionId: string;
  count: number;
  avgSeverity: number;
  maxSeverity: number;
  minSeverity: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  trend: "improving" | "worsening" | "stable";
}

export interface SymmetryAnalysis {
  leftCount: number;
  rightCount: number;
  centerCount: number;
  symmetryScore: number; // 0-100, higher means more symmetric
  asymmetricRegions: string[];
}

export interface MigrationPattern {
  fromRegion: string;
  toRegion: string;
  occurrences: number;
  avgDaysBetween: number;
}

/**
 * Analyze most affected body regions
 */
export function analyzeMostAffectedRegions(
  locations: BodyMapLocation[],
  limit: number = 10
): RegionAnalytics[] {
  const regionMap = new Map<string, BodyMapLocation[]>();

  // Group by region
  locations.forEach((loc) => {
    const existing = regionMap.get(loc.bodyRegionId) || [];
    regionMap.set(loc.bodyRegionId, [...existing, loc]);
  });

  // Calculate analytics for each region
  const analytics: RegionAnalytics[] = [];

  regionMap.forEach((locs, regionId) => {
    const severities = locs.map((l) => l.severity);
    const dates = locs.map((l) => new Date(l.createdAt));

    // Calculate trend (last 3 vs first 3 entries)
    const recentAvg =
      locs.slice(-3).reduce((sum, l) => sum + l.severity, 0) /
      Math.min(3, locs.length);
    const oldAvg =
      locs.slice(0, 3).reduce((sum, l) => sum + l.severity, 0) /
      Math.min(3, locs.length);

    let trend: "improving" | "worsening" | "stable" = "stable";
    if (recentAvg < oldAvg - 1) trend = "improving";
    if (recentAvg > oldAvg + 1) trend = "worsening";

    analytics.push({
      regionId,
      count: locs.length,
      avgSeverity: severities.reduce((a, b) => a + b, 0) / severities.length,
      maxSeverity: Math.max(...severities),
      minSeverity: Math.min(...severities),
      firstOccurrence: new Date(Math.min(...dates.map((d) => d.getTime()))),
      lastOccurrence: new Date(Math.max(...dates.map((d) => d.getTime()))),
      trend,
    });
  });

  return analytics.sort((a, b) => b.count - a.count).slice(0, limit);
}

/**
 * Analyze symptom symmetry (left vs right)
 */
export function analyzeSymmetry(
  locations: BodyMapLocation[]
): SymmetryAnalysis {
  let leftCount = 0;
  let rightCount = 0;
  let centerCount = 0;
  const asymmetricRegions: string[] = [];

  // Count by side
  locations.forEach((loc) => {
    if (loc.bodyRegionId.includes("-left")) leftCount++;
    else if (loc.bodyRegionId.includes("-right")) rightCount++;
    else centerCount++;
  });

  // Find asymmetric pairs
  const leftRegions = new Set(
    locations
      .filter((l) => l.bodyRegionId.includes("-left"))
      .map((l) => l.bodyRegionId.replace("-left", ""))
  );

  const rightRegions = new Set(
    locations
      .filter((l) => l.bodyRegionId.includes("-right"))
      .map((l) => l.bodyRegionId.replace("-right", ""))
  );

  // Check for asymmetry
  leftRegions.forEach((region) => {
    if (!rightRegions.has(region)) {
      asymmetricRegions.push(`${region}-left`);
    }
  });

  rightRegions.forEach((region) => {
    if (!leftRegions.has(region)) {
      asymmetricRegions.push(`${region}-right`);
    }
  });

  // Calculate symmetry score
  const total = leftCount + rightCount;
  const diff = Math.abs(leftCount - rightCount);
  const symmetryScore = total > 0 ? ((total - diff) / total) * 100 : 100;

  return {
    leftCount,
    rightCount,
    centerCount,
    symmetryScore,
    asymmetricRegions,
  };
}

/**
 * Detect symptom migration patterns
 */
export function detectMigrationPatterns(
  locations: BodyMapLocation[]
): MigrationPattern[] {
  const patterns: MigrationPattern[] = [];
  const migrations = new Map<string, { dates: Date[]; count: number }>();

  // Sort by date
  const sorted = [...locations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Detect migrations
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];

    if (prev.bodyRegionId !== curr.bodyRegionId) {
      const key = `${prev.bodyRegionId}→${curr.bodyRegionId}`;
      const existing = migrations.get(key) || { dates: [], count: 0 };
      existing.dates.push(new Date(curr.createdAt));
      existing.count++;
      migrations.set(key, existing);
    }
  }

  // Calculate patterns
  migrations.forEach((data, key) => {
    const [fromRegion, toRegion] = key.split("→");

    // Calculate average days between migrations
    let totalDays = 0;
    for (let i = 1; i < data.dates.length; i++) {
      const diff =
        data.dates[i].getTime() - data.dates[i - 1].getTime();
      totalDays += diff / (1000 * 60 * 60 * 24);
    }
    const avgDaysBetween =
      data.dates.length > 1 ? totalDays / (data.dates.length - 1) : 0;

    patterns.push({
      fromRegion,
      toRegion,
      occurrences: data.count,
      avgDaysBetween,
    });
  });

  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Generate severity heatmap data
 */
export function generateSeverityHeatmap(
  locations: BodyMapLocation[],
  days: number = 30
): Map<string, number[]> {
  const heatmap = new Map<string, number[]>();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  locations
    .filter((loc) => new Date(loc.createdAt) >= startDate)
    .forEach((loc) => {
      const existing = heatmap.get(loc.bodyRegionId) || [];
      heatmap.set(loc.bodyRegionId, [...existing, loc.severity]);
    });

  return heatmap;
}

/**
 * Analyze temporal patterns by body region
 */
export function analyzeTemporalPatterns(
  locations: BodyMapLocation[],
  regionId: string
): {
  hourlyDistribution: number[];
  dailyDistribution: number[];
  monthlyTrend: { month: string; avgSeverity: number; count: number }[];
} {
  const regionLocations = locations.filter(
    (loc) => loc.bodyRegionId === regionId
  );

  // Hourly distribution (24 hours)
  const hourlyDistribution = new Array(24).fill(0);
  regionLocations.forEach((loc) => {
    const hour = new Date(loc.createdAt).getHours();
    hourlyDistribution[hour]++;
  });

  // Daily distribution (7 days)
  const dailyDistribution = new Array(7).fill(0);
  regionLocations.forEach((loc) => {
    const day = new Date(loc.createdAt).getDay();
    dailyDistribution[day]++;
  });

  // Monthly trend (last 12 months)
  const monthlyData = new Map<
    string,
    { totalSeverity: number; count: number }
  >();
  regionLocations.forEach((loc) => {
    const date = new Date(loc.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = monthlyData.get(monthKey) || {
      totalSeverity: 0,
      count: 0,
    };
    existing.totalSeverity += loc.severity;
    existing.count++;
    monthlyData.set(monthKey, existing);
  });

  const monthlyTrend = Array.from(monthlyData.entries())
    .map(([month, data]) => ({
      month,
      avgSeverity: data.totalSeverity / data.count,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  return {
    hourlyDistribution,
    dailyDistribution,
    monthlyTrend,
  };
}
