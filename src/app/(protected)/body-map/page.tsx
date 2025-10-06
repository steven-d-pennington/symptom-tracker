"use client";

import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { RegionDetailPanel } from "@/components/body-mapping/RegionDetailPanel";
import { useBodyMap } from "@/components/body-mapping/hooks/useBodyMap";
import { useBodyRegions } from "@/components/body-mapping/hooks/useBodyRegions";

export default function BodyMapPage() {
  // In a real app, get userId from auth context
  const userId = "demo-user";

  const {
    selectedRegion,
    setSelectedRegion,
    currentView,
    changeView,
    symptoms,
    getSymptomsForRegion,
  } = useBodyMap(userId);

  const { getRegionById } = useBodyRegions(currentView);

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId);
  };

  const regionSymptoms = selectedRegion
    ? getSymptomsForRegion(selectedRegion)
    : [];
  const selectedRegionData = selectedRegion
    ? getRegionById(selectedRegion)
    : null;

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
            <div className="h-[600px] bg-gray-50 rounded-lg">
              <BodyMapViewer
                view={currentView}
                symptoms={symptoms}
                selectedRegion={selectedRegion || undefined}
                onRegionSelect={handleRegionSelect}
                readOnly={false}
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
              />
            )}
          </div>
        </div>
      </div>

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
