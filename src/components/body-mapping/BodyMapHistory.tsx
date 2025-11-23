"use client";

import React, { useState, useMemo } from "react";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { Calendar, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { analyzeMostAffectedRegions } from "@/lib/utils/bodyMapAnalytics";

interface BodyMapHistoryProps {
  locations: BodyMapLocation[];
  dateRange?: { start: Date; end: Date };
}

export function BodyMapHistory({
  locations,
  dateRange,
}: BodyMapHistoryProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const filteredLocations = useMemo(() => {
    if (!dateRange) return locations;
    return locations.filter((loc) => {
      const date = new Date(loc.createdAt);
      return date >= dateRange.start && date <= dateRange.end;
    });
  }, [locations, dateRange]);

  const analytics = useMemo(
    () => analyzeMostAffectedRegions(filteredLocations),
    [filteredLocations]
  );

  const groupedByDate = useMemo(() => {
    const grouped = new Map<string, BodyMapLocation[]>();
    filteredLocations.forEach((loc) => {
      const dateKey = new Date(loc.createdAt).toISOString().split("T")[0];
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, loc]);
    });
    return Array.from(grouped.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 30); // Last 30 days
  }, [filteredLocations]);

  const getTrendIcon = (trend: "improving" | "worsening" | "stable") => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case "worsening":
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Body Map History
      </h2>

      {/* Timeline */}
      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
        <div className="max-h-96 overflow-y-auto space-y-2">
          {groupedByDate.map(([date, locs]) => (
            <button
              key={date}
              onClick={() => setSelectedDate(new Date(date))}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedDate?.toISOString().split("T")[0] === date
                  ? "bg-blue-100 border-2 border-blue-600"
                  : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="font-medium text-gray-900">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {locs.length} location{locs.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    Avg: {(locs.reduce((sum, l) => sum + l.severity, 0) / locs.length).toFixed(1)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Regional Analytics */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Most Affected Regions
        </h3>
        <div className="space-y-2">
          {analytics.map((region) => (
            <div
              key={region.regionId}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {region.regionId.replace(/-/g, " ")}
                  </span>
                  {getTrendIcon(region.trend)}
                </div>
                <span className="text-sm text-gray-600">
                  {region.count} occurrences
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Avg:</span>
                  <span className="ml-1 font-semibold text-gray-900">
                    {region.avgSeverity.toFixed(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Max:</span>
                  <span className="ml-1 font-semibold text-red-600">
                    {region.maxSeverity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Min:</span>
                  <span className="ml-1 font-semibold text-green-600">
                    {region.minSeverity}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-500">
                First: {region.firstOccurrence.toLocaleDateString()} → Last:{" "}
                {region.lastOccurrence.toLocaleDateString()}
              </div>

              {/* Trend indicator */}
              <div className="mt-2">
                {region.trend === "improving" && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Improving
                  </span>
                )}
                {region.trend === "worsening" && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    Worsening
                  </span>
                )}
                {region.trend === "stable" && (
                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                    Stable
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {filteredLocations.length}
            </div>
            <div className="text-sm text-gray-600">Total Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {new Set(filteredLocations.map((l) => l.bodyRegionId)).size}
            </div>
            <div className="text-sm text-gray-600">Unique Regions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {(
                filteredLocations.reduce((sum, l) => sum + l.severity, 0) /
                filteredLocations.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Severity</div>
          </div>
        </div>
      </div>
    </div>
  );
}
