"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LayerSelector } from "@/components/body-map/LayerSelector";
import { BodyMapViewer } from "@/components/body-mapping/BodyMapViewer";
import { LayerType } from "@/lib/db/schema";
import { NormalizedCoordinates } from "@/lib/utils/coordinates";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { announce } from "@/lib/utils/announce";

// URL param types
type FlareCreationSource = 'dashboard' | 'body-map';

interface Marker {
  x: number;
  y: number;
  regionId: string;
}

/**
 * Story 9.1: Body Map Placement Page
 *
 * Full-page body map placement interface for flare creation.
 * Reuses existing components: BodyMapViewer, RegionDetailView, LayerSelector.
 *
 * Features:
 * - URL-based state management (source, layer params)
 * - Conditional layer selector (shown when source=dashboard)
 * - Multi-marker placement within regions
 * - "Next" button with marker count
 * - Navigation to details page with marker data
 * - Mobile-first responsive design (44x44px touch targets)
 * - Full accessibility (ARIA labels, keyboard navigation, screen reader announcements)
 * - Analytics tracking (started, completed, abandoned events)
 */
export default function FlareBodyMapPlacementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useCurrentUser();

  // AC 9.1.1: Parse URL params - source (required), layer (optional, default='flares')
  const source = searchParams.get('source') as FlareCreationSource | null;
  const layerParam = searchParams.get('layer') as LayerType | null;

  // AC 9.1.1: Redirect to dashboard if source invalid or missing
  useEffect(() => {
    if (!source || (source !== 'dashboard' && source !== 'body-map')) {
      console.warn('Invalid or missing source param, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [source, router]);

  // AC 9.1.2: Selected layer state (defaults to 'flares')
  const [selectedLayer, setSelectedLayer] = useState<LayerType>(
    layerParam || 'flares'
  );

  // AC 9.1.3: Region selection state for body map
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // AC 9.1.4: Multi-marker placement state
  const [markers, setMarkers] = useState<Marker[]>([]);

  // Track if user has navigated to details (for analytics)
  const hasNavigatedRef = useRef(false);

  // AC 9.1.10: Fire 'flare_creation_started' event on page load
  useEffect(() => {
    if (source) {
      // Analytics: Track flare creation start
      console.log('[Analytics] flare_creation_started', {
        source,
        layer: selectedLayer,
        timestamp: new Date().toISOString(),
      });

      // AC 9.1.9: Announce page to screen readers
      announce('Flare placement', 'assertive');
    }
  }, []); // Only fire once on mount

  // AC 9.1.10: Fire 'flare_creation_abandoned' event on unmount if not completed
  useEffect(() => {
    return () => {
      if (!hasNavigatedRef.current) {
        console.log('[Analytics] flare_creation_abandoned', {
          source,
          layer: selectedLayer,
          markerCount: markers.length,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, [source, selectedLayer, markers.length]);

  // AC 9.1.2: Handle layer change (local state only, not URL)
  const handleLayerChange = useCallback((newLayer: LayerType) => {
    setSelectedLayer(newLayer);
  }, []);

  // AC 9.1.3: Handle region selection
  const handleRegionSelect = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
  }, []);

  // AC 9.1.4: Handle marker placement
  const handleMarkerPlace = useCallback((
    regionId: string,
    coordinates: NormalizedCoordinates
  ) => {
    const newMarker: Marker = {
      x: coordinates.x,
      y: coordinates.y,
      regionId,
    };

    setMarkers(prev => [...prev, newMarker]);

    console.log('[Marker Placed]', {
      regionId,
      coordinates: { x: coordinates.x.toFixed(3), y: coordinates.y.toFixed(3) },
      totalMarkers: markers.length + 1,
    });
  }, [markers.length]);

  // AC 9.1.6: Navigate to details page with marker data
  const handleNext = useCallback(() => {
    if (markers.length === 0 || !selectedRegion) {
      console.warn('Cannot navigate: no markers or no region selected');
      return;
    }

    // Mark as navigated (prevents abandoned event)
    hasNavigatedRef.current = true;

    // AC 9.1.10: Fire 'flare_creation_placement_completed' event
    console.log('[Analytics] flare_creation_placement_completed', {
      source,
      layer: selectedLayer,
      markerCount: markers.length,
      timestamp: new Date().toISOString(),
    });

    // AC 9.1.6: Construct URL with params
    const params = new URLSearchParams({
      source: source || 'dashboard',
      layer: selectedLayer,
      bodyRegionId: selectedRegion,
      markerCoordinates: JSON.stringify(
        markers.map(m => ({ x: m.x, y: m.y }))
      ),
    });

    router.push(`/flares/details?${params.toString()}`);
  }, [markers, selectedRegion, source, selectedLayer, router]);

  // AC 9.1.9: Keyboard navigation - Escape to cancel/return
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Navigate back to source
        if (source === 'dashboard') {
          router.push('/dashboard');
        } else if (source === 'body-map') {
          router.push('/body-map');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [source, router]);

  // Show loading state if source not yet parsed
  if (!source) {
    return null; // Will redirect in useEffect
  }

  return (
    <main
      role="main"
      aria-label="Flare placement"
      className="flex flex-col h-screen w-screen bg-background"
    >
      {/* AC 9.1.9: ARIA live region for announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {/* Announcements populated by announce() utility */}
      </div>

      {/* AC 9.1.2: Layer selector - conditional rendering based on source */}
      {source === 'dashboard' && (
        <div className="flex-shrink-0 px-4 py-4 border-b border-border bg-card">
          <LayerSelector
            currentLayer={selectedLayer}
            onLayerChange={handleLayerChange}
            disabled={false}
          />
        </div>
      )}

      {/* AC 9.1.3: Body map with region selection */}
      <div className="flex-1 relative overflow-hidden">
        <BodyMapViewer
          view="front"
          userId={userId || ''}
          selectedRegion={selectedRegion || undefined}
          onRegionSelect={handleRegionSelect}
          onCoordinateMark={handleMarkerPlace}
          readOnly={false}
          showFlareMarkers={false}
          hideFullscreenButton={true}
          markerCount={markers.length}
        />
      </div>

      {/* AC 9.1.5: "Next" button with marker count */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card">
        <button
          onClick={handleNext}
          disabled={markers.length === 0}
          className="w-full min-h-[48px] px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          aria-label={
            markers.length > 0
              ? `Next with ${markers.length} marker${markers.length !== 1 ? 's' : ''}`
              : 'Next - disabled, no markers placed'
          }
        >
          {markers.length > 0
            ? `Next (${markers.length} marker${markers.length !== 1 ? 's' : ''})`
            : 'Next'}
        </button>
      </div>
    </main>
  );
}
