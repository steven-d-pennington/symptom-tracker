"use client";

import React from "react";
import Link from "next/link";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { BodyRegion } from "@/lib/types/body-mapping";
import { ActiveFlare } from "@/lib/types/flare";
import { Calendar, TrendingUp, AlertCircle, Flame } from "lucide-react";

interface RegionDetailPanelProps {
  region: BodyRegion | null;
  symptoms: BodyMapLocation[];
  flares?: ActiveFlare[];
  onClose: () => void;
  onAddSymptom?: () => void;
  onTrackAsFlare?: (regionId: string) => void;
}

export function RegionDetailPanel({
  region,
  symptoms,
  flares = [],
  onClose,
  onAddSymptom,
  onTrackAsFlare,
}: RegionDetailPanelProps) {
  if (!region) return null;

  const regionSymptoms = symptoms.filter(
    (s) => s.bodyRegionId === region.id
  );

  const avgSeverity =
    regionSymptoms.length > 0
      ? regionSymptoms.reduce((sum, s) => sum + s.severity, 0) /
        regionSymptoms.length
      : 0;

  const maxSeverity = regionSymptoms.length > 0
    ? Math.max(...regionSymptoms.map((s) => s.severity))
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{region.name}</h3>
          <p className="text-sm text-gray-500 capitalize">
            {region.category} • {region.side || "center"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <Calendar className="w-5 h-5 text-blue-600 mb-1" />
          <div className="text-2xl font-bold text-gray-900">
            {regionSymptoms.length}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-3">
          <TrendingUp className="w-5 h-5 text-orange-600 mb-1" />
          <div className="text-2xl font-bold text-gray-900">
            {avgSeverity.toFixed(1)}
          </div>
          <div className="text-xs text-gray-600">Avg Severity</div>
        </div>

        <div className="bg-red-50 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 text-red-600 mb-1" />
          <div className="text-2xl font-bold text-gray-900">{maxSeverity}</div>
          <div className="text-xs text-gray-600">Max Severity</div>
        </div>
      </div>

      {/* Common Symptoms */}
      {region.commonSymptoms && region.commonSymptoms.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Common Symptoms for This Region
          </h4>
          <div className="flex flex-wrap gap-2">
            {region.commonSymptoms.map((symptom) => (
              <span
                key={symptom}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm capitalize"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Active Flares */}
      {flares.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Flame className="w-4 h-4 text-red-600" />
            Active Flares ({flares.length})
          </h4>
          <div className="space-y-2">
            {flares.map((flare) => (
              <div
                key={flare.id}
                className="bg-red-50 rounded-lg p-3 border border-red-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-red-900">
                    {flare.symptomName}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">
                    {flare.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-red-700">
                  <span>Severity: {flare.severity}/10</span>
                  <span>
                    {Math.floor(
                      (new Date().getTime() - new Date(flare.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days active
                  </span>
                </div>
                {flare.notes && (
                  <p className="text-xs text-red-600 mt-1 line-clamp-2">
                    {flare.notes}
                  </p>
                )}
                <Link
                  href="/body-map"
                  className="mt-2 inline-block text-xs text-red-700 hover:text-red-900 font-medium"
                >
                  View in Body Map →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Symptoms */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Recent Symptoms ({regionSymptoms.length})
        </h4>
        {regionSymptoms.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {regionSymptoms.slice(0, 5).map((symptom) => (
              <div
                key={symptom.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    Severity: {symptom.severity}/10
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(symptom.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {symptom.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {symptom.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            No symptoms recorded for this region
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        {onAddSymptom && (
          <button
            onClick={onAddSymptom}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Add Symptom to This Region
          </button>
        )}
        {onTrackAsFlare && (
          <button
            onClick={() => onTrackAsFlare(region.id)}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Track as Active Flare
          </button>
        )}
      </div>
    </div>
  );
}
