"use client";

import React, { useState, useEffect } from "react";
import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { RegionDetailPanel } from "@/components/body-mapping/RegionDetailPanel";
import { useBodyMap } from "@/components/body-mapping/hooks/useBodyMap";
import { useBodyRegions } from "@/components/body-mapping/hooks/useBodyRegions";
import { BodyMapLocation } from "@/lib/types/body-mapping";
import { MapPin, X } from "lucide-react";

interface BodyMapSectionProps {
  userId: string;
  dailyEntryId?: string;
  initialSymptoms?: BodyMapLocation[];
  onSymptomsChange?: (symptoms: BodyMapLocation[]) => void;
  readOnly?: boolean;
}

export function BodyMapSection({
  userId,
  dailyEntryId,
  initialSymptoms: _initialSymptoms = [],
  onSymptomsChange,
  readOnly = false,
}: BodyMapSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSymptomId, setSelectedSymptomId] = useState<string>("");
  const [selectedSeverity, setSelectedSeverity] = useState(5);
  const [notes, setNotes] = useState("");

  const {
    selectedRegion,
    setSelectedRegion,
    currentView,
    changeView,
    symptoms,
    loadSymptoms,
    addSymptomLocation,
    getSymptomsForRegion,
  } = useBodyMap(userId);

  const { getRegionById } = useBodyRegions(currentView);

  useEffect(() => {
    if (dailyEntryId) {
      loadSymptoms();
    }
  }, [dailyEntryId, loadSymptoms]);

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
    if (!readOnly) {
      setShowAddModal(true);
    }
  };

  const handleAddSymptom = async () => {
    if (!selectedRegion || !selectedSymptomId) return;

    try {
      await addSymptomLocation({
        dailyEntryId,
        symptomId: selectedSymptomId,
        bodyRegionId: selectedRegion,
        severity: selectedSeverity,
        notes: notes || undefined,
      });

      // Notify parent of changes
      if (onSymptomsChange) {
        await loadSymptoms();
        onSymptomsChange(symptoms);
      }

      // Reset form
      setShowAddModal(false);
      setSelectedSymptomId("");
      setSelectedSeverity(5);
      setNotes("");
      setSelectedRegion(null);
    } catch (error) {
      console.error("Failed to add symptom:", error);
    }
  };

  const regionSymptoms = selectedRegion
    ? getSymptomsForRegion(selectedRegion)
    : [];
  const selectedRegionData = selectedRegion
    ? getRegionById(selectedRegion)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Body Map Locations
          </h3>
          {symptoms.length > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {symptoms.length} locations
            </span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Body Map */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <BodyViewSwitcher
                  currentView={currentView}
                  onViewChange={changeView}
                />
              </div>
              <div className="h-[600px] bg-gray-50 rounded-lg">
                <BodyMapViewer
                  userId={userId}
                  view={currentView}
                  symptoms={symptoms}
                  selectedRegion={selectedRegion || undefined}
                  onRegionSelect={handleRegionSelect}
                  readOnly={readOnly}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <BodyMapLegend />
              {selectedRegionData && (
                <RegionDetailPanel
                  region={selectedRegionData}
                  symptoms={regionSymptoms}
                  onClose={() => setSelectedRegion(null)}
                  onAddSymptom={() => setShowAddModal(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Symptom Modal */}
      {showAddModal && selectedRegionData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Add Symptom to {selectedRegionData.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Symptom Selection - Placeholder */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptom
                </label>
                <select
                  value={selectedSymptomId}
                  onChange={(e) => setSelectedSymptomId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a symptom</option>
                  <option value="symptom-1">Pain</option>
                  <option value="symptom-2">Abscess</option>
                  <option value="symptom-3">Lesion</option>
                  <option value="symptom-4">Rash</option>
                </select>
              </div>

              {/* Severity Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Severity: {selectedSeverity}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Minimal</span>
                  <span>Extreme</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSymptom}
                  disabled={!selectedSymptomId}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Symptom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
