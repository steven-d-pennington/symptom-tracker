"use client";

import { FlareStats as FlareStatsType } from "@/lib/types/flare";

interface FlareStatsProps {
  stats: FlareStatsType;
}

export function FlareStats({ stats }: FlareStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Active Flares</div>
        <div className="text-3xl font-bold text-foreground">{stats.totalActive}</div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Avg Severity</div>
        <div className="text-3xl font-bold text-foreground">{stats.averageSeverity.toFixed(1)}</div>
        <div className="mt-1 text-xs text-muted-foreground">out of 10</div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Longest Duration</div>
        <div className="text-3xl font-bold text-foreground">{stats.longestDuration}</div>
        <div className="mt-1 text-xs text-muted-foreground">days</div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Most Affected</div>
        <div className="text-lg font-bold text-foreground">
          {stats.mostAffectedRegion || "—"}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">body region</div>
      </div>
    </div>
  );
}
