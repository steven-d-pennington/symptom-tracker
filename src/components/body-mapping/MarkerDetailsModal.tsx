"use client";

import React, { useEffect, useState } from "react";
import { X, MapPin, Activity, Calendar, Layers } from "lucide-react";
import { format } from "date-fns";
import { bodyMarkerRepository } from "@/lib/repositories/bodyMarkerRepository";
import {
  getLifecycleStageIcon,
  formatLifecycleStage,
  getDaysInStage,
} from "@/lib/utils/lifecycleUtils";
import { BodyMarkerRecord, BodyMarkerEventRecord } from "@/lib/db/schema";

export interface MarkerDetails {
  id: string;
  severity: number;
  notes?: string;
  timestamp: Date;
  bodyRegionId: string;
  layer?: string;
  coordinates?: {
    x: number;
    y: number;
  };
  userId?: string; // Required for fetching lifecycle stage data
}

export interface MarkerDetailsModalProps {
  /** Marker details to display */
  marker: MarkerDetails | null;

  /** Callback when modal is closed */
  onClose: () => void;

  /** Whether the modal is open */
  isOpen: boolean;
}

/**
 * Read-only modal for displaying historical marker details
 * Story 3.7.5 - AC 3.7.5.8: Tapping historical marker shows details
 *
 * Displays: severity, notes, timestamp, associated layer, location
 * No editing allowed - read-only view only
 */
export function MarkerDetailsModal({
  marker,
  onClose,
  isOpen,
}: MarkerDetailsModalProps) {
  // Lifecycle stage state (for flare-type markers only)
  const [lifecycleStage, setLifecycleStage] = useState<string | null>(null);
  const [daysInStage, setDaysInStage] = useState<number | null>(null);
  const [isLoadingLifecycle, setIsLoadingLifecycle] = useState(false);

  // Fetch lifecycle stage data when modal opens for flare-type markers
  useEffect(() => {
    async function fetchLifecycleData() {
      if (!marker || marker.layer !== 'flares' || !marker.userId) {
        setLifecycleStage(null);
        setDaysInStage(null);
        return;
      }

      setIsLoadingLifecycle(true);
      try {
        // Fetch the full marker record to get currentLifecycleStage
        const markerRecord = await bodyMarkerRepository.getMarkerById(marker.userId, marker.id);
        
        if (markerRecord && markerRecord.currentLifecycleStage) {
          setLifecycleStage(markerRecord.currentLifecycleStage);
          
          // Fetch lifecycle stage history to calculate days in current stage
          const history = await bodyMarkerRepository.getLifecycleStageHistory(
            marker.userId,
            marker.id
          );
          
          // Calculate days in current stage
          const days = getDaysInStage(markerRecord, history);
          setDaysInStage(days);
        } else {
          setLifecycleStage(null);
          setDaysInStage(null);
        }
      } catch (error) {
        console.error('Failed to fetch lifecycle stage data:', error);
        setLifecycleStage(null);
        setDaysInStage(null);
      } finally {
        setIsLoadingLifecycle(false);
      }
    }

    if (isOpen && marker) {
      fetchLifecycleData();
    } else {
      // Reset when modal closes
      setLifecycleStage(null);
      setDaysInStage(null);
    }
  }, [isOpen, marker]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !marker) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="marker-details-title"
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2
              id="marker-details-title"
              className="text-lg font-semibold text-gray-900"
            >
              Historical Marker Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Timestamp */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">Date</div>
                <div className="text-base text-gray-900">
                  {format(marker.timestamp, "PPP")}
                </div>
                <div className="text-sm text-gray-500">
                  {format(marker.timestamp, "p")}
                </div>
              </div>
            </div>

            {/* Severity */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">Severity</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-gray-900">
                    {marker.severity}
                  </div>
                  <div className="text-sm text-gray-500">/ 10</div>
                </div>
                {/* Severity bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      marker.severity <= 3
                        ? "bg-green-500"
                        : marker.severity <= 6
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${(marker.severity / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">Location</div>
                <div className="text-base text-gray-900 capitalize">
                  {marker.bodyRegionId.replace(/-/g, " ")}
                </div>
                {marker.coordinates && (
                  <div className="text-sm text-gray-500 font-mono">
                    x: {marker.coordinates.x.toFixed(3)}, y:{" "}
                    {marker.coordinates.y.toFixed(3)}
                  </div>
                )}
              </div>
            </div>

            {/* Layer (if provided) */}
            {marker.layer && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Layers className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">Layer</div>
                  <div className="text-base text-gray-900 capitalize">
                    {marker.layer.replace(/-/g, " ")}
                  </div>
                </div>
              </div>
            )}

            {/* Lifecycle Stage (for flare-type markers only) */}
            {marker.layer === 'flares' && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <span className="text-2xl">
                    {lifecycleStage ? getLifecycleStageIcon(lifecycleStage as any) : '📊'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">Lifecycle Stage</div>
                  {isLoadingLifecycle ? (
                    <div className="text-base text-gray-500">Loading...</div>
                  ) : lifecycleStage ? (
                    <>
                      <div className="text-base text-gray-900 font-medium">
                        {formatLifecycleStage(lifecycleStage as any)}
                      </div>
                      {daysInStage !== null && (
                        <div className="text-sm text-gray-500 mt-1">
                          {daysInStage === 0
                            ? 'Less than 1 day'
                            : daysInStage === 1
                            ? '1 day'
                            : `${daysInStage} days`} in current stage
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-base text-gray-500">No lifecycle stage set</div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {marker.notes && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Notes
                </div>
                <div className="text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                  {marker.notes}
                </div>
              </div>
            )}

            {!marker.notes && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 italic">
                  No notes recorded for this marker.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                Read-only view • Editing not available
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
