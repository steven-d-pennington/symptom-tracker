"use client";

import React, { useMemo } from "react";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import {
  analyzeMostAffectedRegions,
  analyzeSymmetry,
  detectMigrationPatterns,
} from "@/lib/utils/bodyMapAnalytics";
import { FileText, Download, Printer } from "lucide-react";

interface BodyMapReportProps {
  locations: BodyMapLocation[];
  patientName?: string;
  dateRange?: { start: Date; end: Date };
}

export function BodyMapReport({
  locations,
  patientName = "Patient",
  dateRange,
}: BodyMapReportProps) {
  const regionAnalytics = useMemo(
    () => analyzeMostAffectedRegions(locations),
    [locations]
  );

  const symmetryAnalysis = useMemo(
    () => analyzeSymmetry(locations),
    [locations]
  );

  const migrationPatterns = useMemo(
    () => detectMigrationPatterns(locations).slice(0, 5),
    [locations]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const reportData = {
      patientName,
      dateRange,
      totalLocations: locations.length,
      regionAnalytics,
      symmetryAnalysis,
      migrationPatterns,
      generatedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `body-map-report-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md print:shadow-none">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 print:border-black">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600 print:hidden" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Body Map Summary Report
              </h2>
              <p className="text-sm text-gray-600">
                {patientName} •{" "}
                {dateRange
                  ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
                  : "All Time"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg print:border print:border-gray-300">
            <div className="text-2xl font-bold text-blue-900">
              {locations.length}
            </div>
            <div className="text-sm text-blue-700">Total Locations</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg print:border print:border-gray-300">
            <div className="text-2xl font-bold text-purple-900">
              {new Set(locations.map((l) => l.bodyRegionId)).size}
            </div>
            <div className="text-sm text-purple-700">Unique Regions</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg print:border print:border-gray-300">
            <div className="text-2xl font-bold text-orange-900">
              {(
                locations.reduce((sum, l) => sum + l.severity, 0) /
                locations.length
              ).toFixed(1)}
            </div>
            <div className="text-sm text-orange-700">Avg Severity</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg print:border print:border-gray-300">
            <div className="text-2xl font-bold text-green-900">
              {symmetryAnalysis.symmetryScore.toFixed(0)}%
            </div>
            <div className="text-sm text-green-700">Symmetry Score</div>
          </div>
        </div>
      </div>

      {/* Most Affected Regions */}
      <div className="p-6 border-b border-gray-200 print:border-black print:break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Most Affected Regions
        </h3>
        <div className="space-y-3">
          {regionAnalytics.slice(0, 5).map((region, index) => (
            <div
              key={region.regionId}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg print:border print:border-gray-300"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-400">
                  {index + 1}
                </span>
                <div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {region.regionId.replace(/-/g, " ")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {region.count} occurrences • Avg severity:{" "}
                    {region.avgSeverity.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700 capitalize">
                  {region.trend}
                </div>
                <div className="text-xs text-gray-500">
                  Max: {region.maxSeverity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Symmetry Analysis */}
      <div className="p-6 border-b border-gray-200 print:border-black print:break-inside-avoid">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Symmetry Analysis
        </h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg print:border print:border-gray-300">
            <div className="text-xl font-bold text-blue-900">
              {symmetryAnalysis.leftCount}
            </div>
            <div className="text-sm text-blue-700">Left Side</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg print:border print:border-gray-300">
            <div className="text-xl font-bold text-purple-900">
              {symmetryAnalysis.centerCount}
            </div>
            <div className="text-sm text-purple-700">Center</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg print:border print:border-gray-300">
            <div className="text-xl font-bold text-blue-900">
              {symmetryAnalysis.rightCount}
            </div>
            <div className="text-sm text-blue-700">Right Side</div>
          </div>
        </div>
        {symmetryAnalysis.asymmetricRegions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Asymmetric Regions:
            </h4>
            <div className="flex flex-wrap gap-2">
              {symmetryAnalysis.asymmetricRegions.map((region) => (
                <span
                  key={region}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm capitalize print:border print:border-yellow-800"
                >
                  {region.replace(/-/g, " ")}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Migration Patterns */}
      {migrationPatterns.length > 0 && (
        <div className="p-6 print:break-inside-avoid">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Symptom Migration Patterns
          </h3>
          <div className="space-y-2">
            {migrationPatterns.map((pattern, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg print:border print:border-gray-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 capitalize">
                      {pattern.fromRegion.replace(/-/g, " ")}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {pattern.toRegion.replace(/-/g, " ")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {pattern.occurrences} times
                    {pattern.avgDaysBetween > 0 && (
                      <span className="ml-2">
                        (avg {pattern.avgDaysBetween.toFixed(0)} days)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 print:border-black text-sm text-gray-500 print:break-inside-avoid">
        <div className="flex justify-between items-center">
          <div>
            Report generated on {new Date().toLocaleDateString()} at{" "}
            {new Date().toLocaleTimeString()}
          </div>
          <div>Symptom Tracker App</div>
        </div>
      </div>
    </div>
  );
}
