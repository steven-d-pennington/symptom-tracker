"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ActiveFlareCards } from "@/components/flares/ActiveFlareCards";
import { BodyMapViewer, BodyMapViewerRef } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { FlareCreationModal } from "@/components/flares/FlareCreationModal";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { ActiveFlare } from "@/lib/types/flare";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { useFlares } from "@/lib/hooks/useFlares";
import { cn } from "@/lib/utils/cn";
import { Plus, X, Maximize2, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function FlaresPage() {
  const { userId } = useCurrentUser();
  const { data: flares = [], isLoading: flaresLoading, refetch: refetchFlares } = useFlares({ userId: userId || '', includeResolved: false });
  const [selectedFlareId, setSelectedFlareId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");
  const [selectedCoordinates, setSelectedCoordinates] = useState<Array<{
    bodyRegionId: string;
    bodyRegionName: string;
    coordinates: { x: number; y: number };
  }>>([]);
  const [isFlareCreationModalOpen, setIsFlareCreationModalOpen] = useState(false);
  const [bodyMapViewMode, setBodyMapViewMode] = useState<'full-body' | 'region-detail'>('full-body');
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const bodyMapRef = useRef<BodyMapViewerRef>(null);

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

  // Convert flare coordinates to BodyMapLocation format for display
  const flareMarkers = useMemo(() => {
    if (!userId) return [];

    return flares.flatMap(flare =>
      (flare.coordinates || []).map(coord => ({
        id: coord.locationId || `${flare.id}-${coord.regionId}`,
        userId: userId,
        bodyRegionId: coord.regionId,
        symptomId: flare.id,
        coordinates: { x: coord.x, y: coord.y },
        severity: flare.severity,
        notes: '',
        createdAt: flare.startDate,
        updatedAt: flare.startDate,
      }))
    );
  }, [flares, userId]);

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

  const handleCreateFlareFromCoordinates = () => {
    if (selectedCoordinates.length > 0) {
      setIsFlareCreationModalOpen(true);
    }
  };

  const handleDoneMarking = () => {
    if (selectedCoordinates.length > 0) {
      setIsFlareCreationModalOpen(true);
    }
  };

  const handleFlareCreated = (_flare: unknown, stayInRegion?: boolean) => {
    setSelectedCoordinates([]);
    refetchFlares();

    if (!stayInRegion) {
      setBodyMapViewMode('full-body');
      setSelectedRegion(null);
    }
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
              href="/flares/analytics"
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

            <ActiveFlareCards
              userId={userId}
              onUpdateFlare={handleFlareCardClick}
              externalFlares={flares}
              filterByRegion={selectedRegion}
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
              <div className="flex-1 bg-card border border-border rounded-xl overflow-hidden mb-4 flex items-center justify-center" style={{ minHeight: '400px' }}>
                <BodyMapViewer
                  ref={bodyMapRef}
                  view={currentView}
                  userId={userId}
                  selectedRegion={selectedRegion || undefined}
                  onRegionSelect={handleRegionSelect}
                  flareSeverityByRegion={flareSeverityByRegion}
                  symptoms={flareMarkers}
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

      {/* Floating Action Button - Above bottom nav on mobile */}
      <button
        onClick={() => setIsFlareCreationModalOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary-dark hover:scale-105 transition-all flex items-center justify-center z-50"
        style={{ boxShadow: 'var(--shadow-lg)' }}
        title="Create New Flare"
      >
        <Plus className="h-6 w-6" />
      </button>

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
