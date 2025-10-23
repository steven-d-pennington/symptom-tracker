"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ActiveFlareCards } from "@/components/flares/ActiveFlareCards";
import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { FlareCreationModal } from "@/components/flares/FlareCreationModal";
import { FlaresMapIntro } from "@/components/flares/FlaresMapIntro"; // Story 0.3 Task 2
import { FlaresSummaryPanel } from "@/components/flares/FlaresSummaryPanel"; // Story 0.3 Task 3
import { flareRepository } from "@/lib/repositories/flareRepository";
import { userRepository } from "@/lib/repositories/userRepository";
import { ActiveFlare } from "@/lib/types/flare";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useFlares } from "@/lib/hooks/useFlares";
import { cn } from "@/lib/utils/cn";
import { LayoutGrid, MapPin, Layers, Plus, TrendingUp, TrendingDown, Activity } from "lucide-react";

type ViewMode = "cards" | "map" | "both";

export default function FlaresPage() {
  const { userId } = useCurrentUser();
  const { data: flares = [], isLoading: flaresLoading, refetch: refetchFlares } = useFlares({ userId: userId || '', includeResolved: true });
  const [viewMode, setViewMode] = useState<ViewMode>("cards"); // Story 0.3: Default to cards-first
  const [selectedFlareId, setSelectedFlareId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    bodyRegionId: string;
    bodyRegionName: string;
    coordinates: { x: number; y: number };
  } | null>(null);
  const [isFlareCreationModalOpen, setIsFlareCreationModalOpen] = useState(false);
  const [showMapIntro, setShowMapIntro] = useState(false); // Story 0.3 Task 2: Progressive guidance

  // Calculate stats from flares data
  const stats = useMemo(() => {
    const worsening = flares.filter(f => f.trend === "worsening").length;
    const improving = flares.filter(f => f.trend === "improving").length;
    const stable = flares.filter(f => f.trend === "stable").length;
    const avgSeverity = flares.length > 0
      ? flares.reduce((sum, f) => sum + f.severity, 0) / flares.length
      : 0;

    return {
      total: flares.length,
      worsening,
      improving,
      stable,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
    };
  }, [flares]);

  useEffect(() => {
    if (!userId) return;

    const hydrateViewMode = async () => {
      try {
        const user = await userRepository.getById(userId);
        if (user?.preferences.flareViewMode) {
          setViewMode(user.preferences.flareViewMode);
        }
      } catch (error) {
        console.error("Failed to load view mode preference:", error);
      }
    };

    hydrateViewMode();
  }, [userId]);

  // Story 0.3: Persist viewMode changes to user preferences
  const handleViewModeChange = useCallback(async (newMode: ViewMode) => {
    setViewMode(newMode);

    // Story 0.3 Task 2: Show intro when switching to map/split view
    if ((newMode === "map" || newMode === "both") && viewMode === "cards") {
      setShowMapIntro(true);
    }

    if (!userId) return;

    try {
      await userRepository.updatePreferences(userId, {
        flareViewMode: newMode,
      });
    } catch (error) {
      console.error("Failed to persist view mode preference:", error);
    }
  }, [userId, viewMode]);

  // Calculate severity by region for heat map
  const flareSeverityByRegion = flares.reduce((acc, flare) => {
    flare.bodyRegions.forEach((regionId) => {
      if (!acc[regionId] || flare.severity > acc[regionId]) {
        acc[regionId] = flare.severity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Highlight selected flare's regions on map
  const highlightedRegions = selectedFlareId
    ? flares.find(f => f.id === selectedFlareId)?.bodyRegions || []
    : [];

  // Filter flares by selected region
  const filteredFlares = selectedRegion
    ? flares.filter(f => f.bodyRegions.includes(selectedRegion))
    : flares;

  const handleRegionSelect = (regionId: string) => {
    if (selectedRegion === regionId) {
      // Don't deselect if coordinates are marked (allows re-clicking to mark different coordinates)
      if (!selectedCoordinates) {
        setSelectedRegion(null);
        setSelectedFlareId(null);
        setSelectedCoordinates(null); // Clear coordinates when deselecting region
      }
    } else {
      setSelectedRegion(regionId);
      setSelectedFlareId(null);
      
      // Find first flare with this region and auto-select it
      const flareWithRegion = flares.find(f => f.bodyRegions.includes(regionId));
      if (flareWithRegion) {
        setSelectedFlareId(flareWithRegion.id);
      }
    }
  };

  const handleCoordinateMark = (regionId: string, coordinates: { x: number; y: number }) => {
    // Get region name for display
    const regionName = regionId.replace(/-/g, ' ');
    
    setSelectedCoordinates({
      bodyRegionId: regionId,
      bodyRegionName: regionName,
      coordinates,
    });
    
    // Also select the region for consistency
    setSelectedRegion(regionId);
    setSelectedFlareId(null);
  };

  const handleCreateFlareFromCoordinates = () => {
    if (selectedCoordinates) {
      setIsFlareCreationModalOpen(true);
    }
  };

  const handleFlareCreated = () => {
    // Clear coordinate selection after successful creation
    setSelectedCoordinates(null);
    // Refresh flares data
    refetchFlares();
  };

  const handleFlareCardClick = (flareId: string) => {
    if (selectedFlareId === flareId) {
      setSelectedFlareId(null);
      setSelectedRegion(null);
    } else {
      const flare = flares.find(f => f.id === flareId);
      if (flare && flare.bodyRegions.length > 0) {
        setSelectedFlareId(flareId);
        setSelectedRegion(flare.bodyRegions[0]);
      }
    }
  };

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - Story 0.3: More welcoming copy */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your Flares</h1>
            <p className="mt-2 text-muted-foreground">
              {stats.total === 0
                ? "Track and manage symptom flares as they happen"
                : "Keep tabs on your active flares and their progress"
              }
            </p>
          </div>
          <button
            onClick={() => setIsFlareCreationModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            aria-label="Create new flare"
          >
            <Plus className="h-5 w-5" />
            New Flare
          </button>
        </div>

        {/* Story 0.3 Task 3: Collapsible summary panel */}
        <div className="mb-6">
          <FlaresSummaryPanel
            stats={stats}
            selectedRegion={selectedRegion}
            onClearRegionFilter={() => {
              setSelectedRegion(null);
              setSelectedFlareId(null);
            }}
          />
        </div>

        {/* Story 0.3: CTA Buttons for cards-only mode */}
        {viewMode === "cards" && (
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm font-medium text-foreground mb-3">
              Want to visualize where your flares are located?
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleViewModeChange("map")}
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Switch to map view"
              >
                <MapPin className="h-4 w-4" />
                Explore Map View
              </button>
              <button
                onClick={() => handleViewModeChange("both")}
                className="inline-flex items-center gap-2 rounded-lg border border-primary bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Switch to split view"
              >
                <Layers className="h-4 w-4" />
                Show Split Layout
              </button>
            </div>
          </div>
        )}

        {/* View Mode Toggle - Story 0.3: Persist preferences */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => handleViewModeChange("cards")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "cards"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={viewMode === "cards"}
            aria-label="Cards only view"
          >
            <LayoutGrid className="h-4 w-4" />
            Cards Only
          </button>
          <button
            onClick={() => handleViewModeChange("map")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "map"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={viewMode === "map"}
            aria-label="Map only view"
          >
            <MapPin className="h-4 w-4" />
            Map Only
          </button>
          <button
            onClick={() => handleViewModeChange("both")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "both"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-pressed={viewMode === "both"}
            aria-label="Split view with both cards and map"
          >
            <Layers className="h-4 w-4" />
            Split View
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className={cn(
        "grid gap-6",
        viewMode === "both" ? "lg:grid-cols-2" : "grid-cols-1"
      )}>
        {/* Flare Cards Section */}
        {(viewMode === "cards" || viewMode === "both") && (
          <div className="space-y-4">
            {selectedRegion && (
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                <span className="font-medium text-primary">
                  Filtering by region: {selectedRegion}
                </span>
                <button
                  onClick={() => {
                    setSelectedRegion(null);
                    setSelectedFlareId(null);
                  }}
                  className="ml-2 text-primary hover:underline"
                >
                  Clear filter
                </button>
              </div>
            )}
            <ActiveFlareCards
              userId={userId}
              onUpdateFlare={handleFlareCardClick}
              externalFlares={flares}
              filterByRegion={selectedRegion}
            />
          </div>
        )}

        {/* Body Map Section */}
        {(viewMode === "map" || viewMode === "both") && (
          <div className="space-y-4">
            {/* Story 0.3 Task 2: Progressive body map guidance */}
            <FlaresMapIntro
              isOpen={showMapIntro}
              onDismiss={() => setShowMapIntro(false)}
              viewMode={viewMode === "both" ? "both" : "map"}
            />

            <div id="flare-cards" className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Body Map View</h2>
                <BodyViewSwitcher
                  currentView={currentView}
                  onViewChange={setCurrentView}
                />
              </div>
              
              {selectedFlareId && (
                <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">
                      Highlighting: {flares.find(f => f.id === selectedFlareId)?.symptomName}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFlareId(null);
                        setSelectedRegion(null);
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div className="h-[600px] bg-gray-50 rounded-lg mb-4 overflow-visible relative">
                <BodyMapViewer
                  view={currentView}
                  userId={userId}
                  selectedRegion={selectedRegion || undefined}
                  onRegionSelect={handleRegionSelect}
                  flareSeverityByRegion={flareSeverityByRegion}
                  readOnly={false}
                  onCoordinateMark={handleCoordinateMark}
                />
                
                {/* Create Flare Button - appears when coordinates are selected */}
                {selectedCoordinates && (
                  <button
                    onClick={handleCreateFlareFromCoordinates}
                    className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 z-10"
                    aria-label="Create flare at marked location"
                  >
                    <Plus className="h-4 w-4" />
                    Create Flare Here
                  </button>
                )}
              </div>

              <BodyMapLegend />

              <div className="mt-4 text-sm text-muted-foreground">
                <p className="mb-2">💡 <strong>Tip:</strong> Click on body regions to filter flares</p>
                <p>Color intensity shows severity (darker = more severe)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flare Creation Modal */}
      {userId && (
        <FlareCreationModal
          isOpen={isFlareCreationModalOpen}
          onClose={() => setIsFlareCreationModalOpen(false)}
          userId={userId}
          selection={selectedCoordinates}
          onCreated={handleFlareCreated}
        />
      )}
    </div>
  );
}
