"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { RegionDetailPanel } from "@/components/body-mapping/RegionDetailPanel";
import { NewFlareDialog } from "@/components/flare/NewFlareDialog";
import { useBodyMap } from "@/components/body-mapping/hooks/useBodyMap";
import { useBodyRegions } from "@/components/body-mapping/hooks/useBodyRegions";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { ActiveFlare } from "@/lib/types/flare";

export default function BodyMapPage() {
  // In a real app, get userId from auth context
  const userId = "demo-user";
  const searchParams = useSearchParams();
  const flareId = searchParams.get("flareId");

  const [showFlareDialog, setShowFlareDialog] = useState(false);
  const [selectedFlareRegion, setSelectedFlareRegion] = useState<string | undefined>();
  const [highlightedFlare, setHighlightedFlare] = useState<ActiveFlare | null>(null);
  const [activeFlares, setActiveFlares] = useState<ActiveFlare[]>([]);

  const {
    selectedRegion,
    setSelectedRegion,
    currentView,
    changeView,
    symptoms,
    getSymptomsForRegion,
  } = useBodyMap(userId);

  const { getRegionById } = useBodyRegions(currentView);

  // Load active flares and highlight specific flare from URL
  useEffect(() => {
    const loadFlares = async () => {
      const flares = await flareRepository.getActiveFlares(userId);
      setActiveFlares(flares);

      if (flareId) {
        const flare = flares.find((f) => f.id === flareId);
        if (flare) {
          setHighlightedFlare(flare);
          // Auto-select first region of the flare
          if (flare.bodyRegions.length > 0) {
            setSelectedRegion(flare.bodyRegions[0]);
          }
        }
      }
    };

    loadFlares();
  }, [userId, flareId]);

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const handleTrackAsFlare = (regionId: string) => {
    setSelectedFlareRegion(regionId);
    setShowFlareDialog(true);
  };

  const handleFlareCreated = () => {
    setShowFlareDialog(false);
    setSelectedFlareRegion(undefined);
    setSelectedRegion(null);
  };

  const regionSymptoms = selectedRegion
    ? getSymptomsForRegion(selectedRegion)
    : [];
  const selectedRegionData = selectedRegion
    ? getRegionById(selectedRegion)
    : null;

  // Get active flares for the selected region
  const regionFlares = selectedRegion
    ? activeFlares.filter((flare) => flare.bodyRegions.includes(selectedRegion))
    : [];

  // Calculate severity by region for heat map (from active flares)
  const flareSeverityByRegion = activeFlares.reduce((acc, flare) => {
    flare.bodyRegions.forEach((regionId) => {
      // Use the highest severity if multiple flares affect the same region
      if (!acc[regionId] || flare.severity > acc[regionId]) {
        acc[regionId] = flare.severity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Body Map</h1>
        <p className="mt-2 text-muted-foreground">
          Track symptom locations visually on an interactive body map
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Body Map */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <BodyViewSwitcher
                currentView={currentView}
                onViewChange={changeView}
              />
            </div>
            <div className="h-[600px] bg-gray-50 rounded-lg overflow-visible">
              <BodyMapViewer
                view={currentView}
                symptoms={symptoms}
                selectedRegion={selectedRegion || undefined}
                onRegionSelect={handleRegionSelect}
                readOnly={false}
                flareSeverityByRegion={flareSeverityByRegion}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <BodyMapLegend />

            {/* Highlighted Flare Info */}
            {highlightedFlare && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-red-900">
                      Viewing Flare: {highlightedFlare.symptomName}
                    </h3>
                    <p className="text-sm text-red-700">
                      Affected regions: {highlightedFlare.bodyRegions.join(", ")}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                    Severity: {highlightedFlare.severity}/10
                  </span>
                </div>
                <button
                  onClick={() => {
                    setHighlightedFlare(null);
                    setSelectedRegion(null);
                  }}
                  className="text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  Clear highlight
                </button>
              </div>
            )}

            {selectedRegionData && (
              <RegionDetailPanel
                region={selectedRegionData}
                symptoms={regionSymptoms}
                flares={regionFlares}
                onClose={() => setSelectedRegion(null)}
                onTrackAsFlare={handleTrackAsFlare}
              />
            )}
          </div>
        </div>
      </div>

      {/* Flare Dialog */}
      {showFlareDialog && (
        <NewFlareDialog
          userId={userId}
          onClose={() => {
            setShowFlareDialog(false);
            setSelectedFlareRegion(undefined);
          }}
          onCreated={handleFlareCreated}
          initialRegion={selectedFlareRegion}
        />
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">How to Use</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Click on body regions to mark symptom locations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Switch between front and back views</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>Use zoom controls to focus on specific areas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              <span>View historical data and patterns</span>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">✓</span>
              <span>Visual symptom location tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">✓</span>
              <span>Color-coded severity indicators</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">✓</span>
              <span>Historical body map overlays</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-primary">✓</span>
              <span>Integration with daily entries</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
