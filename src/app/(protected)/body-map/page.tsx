"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { LayerSpecificCards } from "@/components/body-map/LayerSpecificCards";
import { BodyMapViewer, BodyMapViewerRef } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { LayerSelector } from "@/components/body-map/LayerSelector";
import { bodyMarkerRepository } from "@/lib/repositories/bodyMarkerRepository";
import { ActiveFlare } from "@/lib/types/flare";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useMarkers } from "@/lib/hooks/useMarkers";
import { useBodyMapLayers } from "@/lib/hooks/useBodyMapLayers";
import { cn } from "@/lib/utils/cn";
import { Plus, X, Maximize2, TrendingUp, TrendingDown, Activity, BarChart3, History } from "lucide-react";
import Link from "next/link";

export default function FlaresPage() {
  const router = useRouter();
  const { userId } = useCurrentUser();
  const { data: flares = [], isLoading: flaresLoading, refetch: refetchFlares } = useMarkers({ userId: userId || '', type: 'flare', includeResolved: false });

  // Layer management hook (Story 5.3, 5.5)
  const {
    currentLayer,
    lastUsedLayer,
    changeLayer,
    viewMode,
    changeViewMode,
    visibleLayers,
    toggleLayerVisibility,
    markerCounts,
    markers,
    isLoadingMarkers,
    refresh: refreshMarkers,
    showHistory,
    toggleShowHistory
  } = useBodyMapLayers(userId);

  const [selectedFlareId, setSelectedFlareId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");
  const [selectedCoordinates, setSelectedCoordinates] = useState<Array<{
    bodyRegionId: string;
    bodyRegionName: string;
    coordinates: { x: number; y: number };
  }>>([]);
  const [bodyMapViewMode, setBodyMapViewMode] = useState<'full-body' | 'region-detail'>('full-body');
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const bodyMapRef = useRef<BodyMapViewerRef>(null);

  // Force data refresh on mount to prevent stale cache issues
  useEffect(() => {
    // Invalidate any cached data when component mounts
    refetchFlares();
    refreshMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - dependencies intentionally omitted

  // Collapse body map by default on mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      setIsMapCollapsed(isMobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate stats from flares data
  const stats = useMemo(() => {
    const worsening = flares.filter(f => f.trend === "worsening").length;
    const improving = flares.filter(f => f.trend === "improving").length;
    const stable = flares.filter(f => f.trend === "stable").length;

    return {
      total: flares.length,
      worsening,
      improving,
      stable,
    };
  }, [flares]);

  // Calculate severity by region for heat map
  const flareSeverityByRegion = flares.reduce((acc, flare) => {
    flare.bodyRegions.forEach((regionId) => {
      if (!acc[regionId] || flare.severity > acc[regionId]) {
        acc[regionId] = flare.severity;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  // Markers now come from useBodyMapLayers hook, which queries bodyMapLocations table
  // and respects layer filtering

  const handleRegionSelect = (regionId: string) => {
    if (selectedRegion === regionId) {
      if (selectedCoordinates.length === 0) {
        setSelectedRegion(null);
        setSelectedFlareId(null);
      }
    } else {
      setSelectedRegion(regionId);
      setSelectedFlareId(null);

      const flareWithRegion = flares.find(f => f.bodyRegions.includes(regionId));
      if (flareWithRegion) {
        setSelectedFlareId(flareWithRegion.id);
      }
    }
  };

  const handleCoordinateMark = (regionId: string, coordinates: { x: number; y: number }) => {
    const regionName = regionId.replace(/-/g, ' ');

    setSelectedCoordinates(prev => [...prev, {
      bodyRegionId: regionId,
      bodyRegionName: regionName,
      coordinates,
    }]);

    setSelectedRegion(regionId);
    setSelectedFlareId(null);
  };

  // Story 9.4: Navigate to flare details page with body-map markers
  const handleDoneMarking = useCallback(() => {
    if (selectedCoordinates.length === 0) return;

    // Get the first coordinate's region (they should all be from the same region in region detail view)
    const bodyRegionId = selectedCoordinates[0].bodyRegionId;

    // Convert coordinates to the format expected by details page
    const markerCoordinates = selectedCoordinates.map(coord => coord.coordinates);

    // Construct URL params for flare details page
    const params = new URLSearchParams({
      source: 'body-map',
      layer: currentLayer,
      bodyRegionId,
      markerCoordinates: JSON.stringify(markerCoordinates),
    });

    // Analytics event: flare_creation_started from body-map
    console.log('[Analytics] flare_creation_started', {
      source: 'body-map',
      layer: currentLayer,
      markerCount: selectedCoordinates.length,
      timestamp: new Date().toISOString(),
    });

    // Navigate to flare details page (skipping placement page)
    router.push(`/flares/details?${params.toString()}`);
  }, [selectedCoordinates, currentLayer, router]);

  // Story 9.4: Handle return from flare creation flow
  // Refresh data when returning to body-map
  useEffect(() => {
    const handleFocus = () => {
      // Refresh data when page regains focus (user returns from details page)
      refetchFlares();
      refreshMarkers();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchFlares, refreshMarkers]);

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
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Stats Bar */}
      <div className="bg-muted border-b border-border px-6 py-4">
        <div className="container mx-auto flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-light flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="text-xl font-semibold">{stats.total}</h4>
              <p className="text-tiny">Active Flares</p>
            </div>
          </div>

          {stats.worsening > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-error" />
              </div>
              <div>
                <h4 className="text-xl font-semibold">{stats.worsening}</h4>
                <p className="text-tiny">Worsening</p>
              </div>
            </div>
          )}

          {stats.improving > 0 && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-success" />
              </div>
              <div>
                <h4 className="text-xl font-semibold">{stats.improving}</h4>
                <p className="text-tiny">Improving</p>
              </div>
            </div>
          )}

          <div className="ml-auto">
            <Link
              href="/body-map/analytics"
              className="btn-secondary inline-flex items-center gap-2"
              aria-label="View advanced analytics"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content: Cards + Sidebar */}
      <div className="flex-1 overflow-hidden flex">
        {/* Cards Column */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-4xl">
            {selectedRegion && (
              <div className="mb-4 badge badge-primary inline-flex items-center gap-2">
                Filtering: {selectedRegion}
                <button
                  onClick={() => {
                    setSelectedRegion(null);
                    setSelectedFlareId(null);
                  }}
                  className="hover:text-primary-dark"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            <LayerSpecificCards
              userId={userId}
              currentLayer={currentLayer}
              filterByRegion={selectedRegion}
              onCardClick={handleFlareCardClick}
            />
          </div>
        </div>

        {/* Body Map Sidebar - Full screen on mobile, sidebar on desktop */}
        {!isMapCollapsed && (
          <div className="fixed lg:relative inset-0 lg:inset-auto lg:w-[450px] border-l border-border bg-muted flex flex-col z-40 lg:z-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-h4">Body Map</h3>
              <div className="flex items-center gap-2">
                <button
                  className="icon-btn"
                  title="Expand full-screen"
                  onClick={() => bodyMapRef.current?.enterFullscreen()}
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  className="icon-btn"
                  title="Collapse map"
                  onClick={() => setIsMapCollapsed(true)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
              {/* Layer Selector with History Toggle */}
              <div className="mb-3 flex items-center gap-2">
                <div className="flex-1">
                  <LayerSelector
                    currentLayer={currentLayer}
                    onLayerChange={changeLayer}
                    lastUsedLayer={lastUsedLayer}
                  />
                </div>
                <button
                  onClick={toggleShowHistory}
                  className={cn(
                    "icon-btn flex items-center gap-2 px-3 transition-colors",
                    showHistory ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"
                  )}
                  title={showHistory ? "Hide resolved markers" : "Show history (resolved markers)"}
                >
                  <History className="h-4 w-4" />
                  {showHistory && <span className="text-xs font-medium">History</span>}
                </button>
              </div>

              <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden mb-4 flex items-center justify-center" style={{ minHeight: '400px' }}>
                <BodyMapViewer
                  ref={bodyMapRef}
                  view={currentView}
                  userId={userId}
                  selectedRegion={selectedRegion || undefined}
                  onRegionSelect={handleRegionSelect}
                  flareSeverityByRegion={flareSeverityByRegion}
                  symptoms={markers}
                  readOnly={false}
                  onCoordinateMark={handleCoordinateMark}
                  viewMode={bodyMapViewMode}
                  onViewModeChange={setBodyMapViewMode}
                  onDoneMarking={handleDoneMarking}
                  markerCount={selectedCoordinates.length}
                  hideFullscreenButton={true}
                />
              </div>

              <BodyViewSwitcher
                currentView={currentView}
                onViewChange={setCurrentView}
              />
            </div>
          </div>
        )}

        {/* Show Map Button (when collapsed) - Bottom left on mobile, centered on desktop */}
        {isMapCollapsed && (
          <button
            onClick={() => setIsMapCollapsed(false)}
            className="fixed bottom-20 lg:bottom-8 left-6 lg:left-1/2 lg:transform lg:-translate-x-1/2 btn-primary z-50 inline-flex items-center gap-2"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Body Map
          </button>
        )}
      </div>

      {/* Story 9.4: FAB navigates to placement page (dashboard entry flow) */}
      <button
        onClick={() => {
          console.log('[Analytics] flare_creation_started', {
            source: 'body-map',
            layer: currentLayer,
            timestamp: new Date().toISOString(),
          });
          router.push(`/flares/place?source=body-map&layer=${currentLayer}`);
        }}
        className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary-dark hover:scale-105 transition-all flex items-center justify-center z-50"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        title="Create New Flare"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
