"use client";

import { useState, useEffect } from "react";
import { ActiveFlareCards } from "@/components/flares/ActiveFlareCards";
import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { BodyViewSwitcher } from "@/components/body-mapping/BodyViewSwitcher";
import { BodyMapLegend } from "@/components/body-mapping/BodyMapLegend";
import { FlareCreationModal } from "@/components/flares/FlareCreationModal";
import { flareRepository } from "@/lib/repositories/flareRepository";
import { ActiveFlare } from "@/lib/types/flare";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { cn } from "@/lib/utils/cn";
import { LayoutGrid, MapPin, Layers, Plus, TrendingUp, TrendingDown, Activity } from "lucide-react";

type ViewMode = "cards" | "map" | "both";

export default function FlaresPage() {
  const { userId } = useCurrentUser();
  const [viewMode, setViewMode] = useState<ViewMode>("both");
  const [flares, setFlares] = useState<Array<ActiveFlare & { trend: "worsening" | "stable" | "improving" }>>([]);
  const [selectedFlareId, setSelectedFlareId] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"front" | "back" | "left" | "right">("front");
  const [isFlareCreationModalOpen, setIsFlareCreationModalOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    worsening: 0,
    improving: 0,
    stable: 0,
    avgSeverity: 0,
  });

  useEffect(() => {
    if (userId) {
      loadFlares();
    }
  }, [userId]);

  const loadFlares = async () => {
    if (!userId) return;

    try {
      const activeFlares = await flareRepository.getActiveFlaresWithTrend(userId);
      setFlares(activeFlares);

      // Calculate stats
      const worsening = activeFlares.filter(f => f.trend === "worsening").length;
      const improving = activeFlares.filter(f => f.trend === "improving").length;
      const stable = activeFlares.filter(f => f.trend === "stable").length;
      const avgSeverity = activeFlares.length > 0
        ? activeFlares.reduce((sum, f) => sum + f.severity, 0) / activeFlares.length
        : 0;

      setStats({
        total: activeFlares.length,
        worsening,
        improving,
        stable,
        avgSeverity: Math.round(avgSeverity * 10) / 10,
      });
    } catch (error) {
      console.error("Failed to load flares:", error);
    }
  };

  const handleFlareCreate = async (flareData: {
    bodyRegionId: string;
    severity: number;
    notes?: string;
  }) => {
    if (!userId) return;

    await flareRepository.create({
      userId,
      symptomId: "custom",
      symptomName: "Flare",
      startDate: new Date(),
      severity: flareData.severity,
      bodyRegions: [flareData.bodyRegionId],
      status: "active",
      interventions: [],
      notes: flareData.notes || "",
      photoIds: [],
    });

    await loadFlares();
    setIsFlareCreationModalOpen(false);
  };

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
      // Deselect if clicking the same region
      setSelectedRegion(null);
      setSelectedFlareId(null);
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Active Flares</h1>
            <p className="mt-2 text-muted-foreground">
              Monitor and manage your active symptom flares
            </p>
          </div>
          <button
            onClick={() => setIsFlareCreationModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            New Flare
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Activity className="h-4 w-4" />
              Total Active
            </div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700 text-sm mb-1">
              <TrendingUp className="h-4 w-4" />
              Worsening
            </div>
            <div className="text-2xl font-bold text-red-900">{stats.worsening}</div>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex items-center gap-2 text-yellow-700 text-sm mb-1">
              <Activity className="h-4 w-4" />
              Stable
            </div>
            <div className="text-2xl font-bold text-yellow-900">{stats.stable}</div>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-700 text-sm mb-1">
              <TrendingDown className="h-4 w-4" />
              Improving
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.improving}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-muted-foreground text-sm mb-1">Avg Severity</div>
            <div className="text-2xl font-bold text-foreground">{stats.avgSeverity}/10</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setViewMode("cards")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "cards"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
            Cards Only
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "map"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MapPin className="h-4 w-4" />
            Map Only
          </button>
          <button
            onClick={() => setViewMode("both")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
              viewMode === "both"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
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
            <div className="rounded-lg border border-border bg-card p-6">
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

              <div className="h-[600px] bg-gray-50 rounded-lg mb-4 overflow-visible">
                <BodyMapViewer
                  view={currentView}
                  userId={userId}
                  selectedRegion={selectedRegion || undefined}
                  onRegionSelect={handleRegionSelect}
                  flareSeverityByRegion={flareSeverityByRegion}
                  readOnly={false}
                />
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
          onSave={handleFlareCreate}
          userId={userId}
        />
      )}
    </div>
  );
}
