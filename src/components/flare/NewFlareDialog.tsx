"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { BodyRegionSelector } from "@/components/body-mapping/BodyRegionSelector";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyViewType } from "@/lib/types/body-mapping";
import { X } from "lucide-react";
import {
  denormalizeCoordinates,
  getRegionBounds,
  normalizeCoordinates,
  NormalizedCoordinates,
  RegionBounds,
} from "@/lib/utils/coordinates";
import { CoordinateMarker } from "@/components/body-map/CoordinateMarker";

interface NewFlareDialogProps {
  userId: string;
  onClose: () => void;
  onCreated: () => void;
  initialRegion?: string;
  initialCoordinates?: Record<string, NormalizedCoordinates>;
}

export function NewFlareDialog({
  userId,
  onClose,
  onCreated,
  initialRegion,
  initialCoordinates = {},
}: NewFlareDialogProps) {
  const [formData, setFormData] = useState({
    symptomName: "",
    severity: 5,
    bodyRegions: initialRegion ? [initialRegion] : ([] as string[]),
    notes: "",
  });
  const [currentView, setCurrentView] = useState<BodyViewType>("front");
  const [coordinatesByRegion, setCoordinatesByRegion] = useState<Record<string, NormalizedCoordinates>>(
    initialCoordinates
  );
  const [regionMarkers, setRegionMarkers] = useState<
    Record<string, { normalized: NormalizedCoordinates; bounds: RegionBounds }>
  >({});
  const svgRef = useRef<SVGSVGElement | null>(null);

  const handleRegionToggle = (regionId: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyRegions: prev.bodyRegions.includes(regionId)
        ? prev.bodyRegions.filter((r) => r !== regionId)
        : [...prev.bodyRegions, regionId],
    }));
  };

  const handleCoordinateCapture = useCallback(
    (event: React.MouseEvent<SVGSVGElement>) => {
      const target = event.target as SVGElement | null;
      if (!target) {
        return;
      }

      const isBodyRegionElement = target.classList?.contains("body-region");
      const regionIdFromTarget = target?.id;
      if (!regionIdFromTarget && !isBodyRegionElement) {
        return;
      }

      // Get the region ID from the clicked element
      const regionId = regionIdFromTarget;
      if (!regionId) {
        return;
      }

      // Only capture coordinates for selected regions
      if (!formData.bodyRegions.includes(regionId)) {
        return;
      }

      const svgElement = event.currentTarget;
      svgRef.current = svgElement;

      const point = svgElement.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;

      const ctm = svgElement.getScreenCTM();
      if (!ctm) {
        return;
      }

      const svgPoint = point.matrixTransform(ctm.inverse());
      const bounds = getRegionBounds(svgElement, regionId);
      if (!bounds) {
        return;
      }

      const normalized = normalizeCoordinates(
        { x: svgPoint.x, y: svgPoint.y },
        bounds
      );

      setRegionMarkers((previous) => ({
        ...previous,
        [regionId]: {
          normalized,
          bounds,
        },
      }));

      setCoordinatesByRegion((previous) => ({
        ...previous,
        [regionId]: normalized,
      }));
    },
    [formData.bodyRegions]
  );

  // Render coordinate markers for all selected regions with captured coordinates
  const coordinateMarkerNodes = useMemo(() => {
    return (
      <>
        {formData.bodyRegions.map((regionId) => {
          const marker = regionMarkers[regionId];
          if (!marker) {
            return null;
          }

          const { normalized, bounds } = marker;
          const svgPoint = denormalizeCoordinates(normalized, bounds);

          return (
            <CoordinateMarker
              key={regionId}
              x={svgPoint.x}
              y={svgPoint.y}
              zoomLevel={1} // No zoom in the dialog
              visible={true}
              regionId={regionId}
              normalized={normalized}
            />
          );
        })}
      </>
    );
  }, [formData.bodyRegions, regionMarkers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const coordinatesPayload = formData.bodyRegions
      .map((regionId) => {
        const coordinates = coordinatesByRegion[regionId];
        if (!coordinates) {
          return null;
        }
        return {
          regionId,
          x: coordinates.x,
          y: coordinates.y,
        };
      })
      .filter(Boolean) as Array<{ regionId: string; x: number; y: number }>;

    try {
      await flareRepository.create({
        userId,
        symptomId: "custom",
        symptomName: formData.symptomName,
        startDate: new Date(),
        severity: formData.severity,
        bodyRegions: formData.bodyRegions,
        status: "active",
        interventions: [],
        notes: formData.notes,
        photoIds: [],
        coordinates: coordinatesPayload.length > 0 ? coordinatesPayload : undefined,
      });

      onCreated();
    } catch (error) {
      console.error("Failed to create flare:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-screen flex items-start sm:items-center justify-center p-4">
        <div className="w-full max-w-4xl rounded-lg bg-card p-4 sm:p-6 my-4 sm:my-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Track New Flare</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Form fields */}
              <div className="space-y-4 order-2 md:order-1">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Symptom Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.symptomName}
                    onChange={(e) => setFormData({ ...formData, symptomName: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                    placeholder="e.g., Abscess, Lesion, Pain"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Severity: {formData.severity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Minimal</span>
                    <span>Extreme</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Affected Body Regions
                  </label>
                  <div className="text-sm text-muted-foreground mb-2">
                    {formData.bodyRegions.length === 0 ? (
                      <span>Click regions on the body map →</span>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {formData.bodyRegions.map((region) => (
                          <span
                            key={region}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium"
                          >
                            {region.replace(/-/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {formData.bodyRegions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Precise Coordinates</p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {formData.bodyRegions.map((region) => {
                        const coordinates = coordinatesByRegion[region];
                        return (
                          <li
                            key={region}
                            className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1"
                          >
                            <span className="truncate pr-2">{region.replace(/-/g, " ")}</span>
                            {coordinates ? (
                              <span>
                                x: {coordinates.x.toFixed(2)}, y: {coordinates.y.toFixed(2)}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground/80">Not captured</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    <p className="text-[11px] text-muted-foreground">
                      Normalized 0–1 scale relative to the selected region&apos;s bounds.
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:border-primary focus:outline-none resize-none"
                    placeholder="Additional details about this flare..."
                  />
                </div>
              </div>

              {/* Right column: Body map selector */}
              <div className="space-y-4 order-1 md:order-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    Select Affected Regions
                  </label>
                  <BodyViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
                <div className="h-[300px] sm:h-[400px] bg-gray-50 rounded-lg border border-border">
                  <BodyRegionSelector
                    view={currentView}
                    selectedRegions={formData.bodyRegions}
                    onRegionSelect={handleRegionToggle}
                    multiSelect={true}
                    onCoordinateCapture={handleCoordinateCapture}
                    coordinateCursorActive={formData.bodyRegions.length > 0}
                    coordinateMarker={coordinateMarkerNodes}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Click regions to select them, then click within a selected region to mark the precise location.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.symptomName || formData.bodyRegions.length === 0}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Flare
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
