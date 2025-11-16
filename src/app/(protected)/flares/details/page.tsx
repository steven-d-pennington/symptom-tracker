"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LifecycleStageSelector } from "@/components/LifecycleStageSelector";
import { SeverityScale } from "@/components/symptoms/SeverityScale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayerType, FlareLifecycleStage } from "@/lib/db/schema";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { bodyMarkerRepository } from "@/lib/repositories/bodyMarkerRepository";
import { announce } from "@/lib/utils/announce";
import { cn } from "@/lib/utils/cn";

// URL param types (AC 9.2.1)
type FlareCreationSource = 'dashboard' | 'body-map';

interface MarkerCoordinate {
  x: number;
  y: number;
}

/**
 * Story 9.2: Flare Details Page
 *
 * Full-page flare details form for capturing severity, lifecycle stage, and notes.
 * Follows Story 9.1 patterns: URL state management, accessibility, analytics tracking.
 *
 * Features:
 * - URL param parsing and validation (source, layer, bodyRegionId, markerCoordinates)
 * - Severity slider (1-10 scale, required field) with visual feedback
 * - LifecycleStageSelector integration (pre-selected to "onset")
 * - Notes textarea with 500-character limit and counter
 * - Save button with validation and loading state
 * - Multi-marker flare creation (bodyMarkerRepository.createMarker)
 * - Success navigation with flare summary
 * - Error handling with state preservation
 * - Mobile-first responsive design (44x44px touch targets)
 * - Full accessibility (ARIA labels, keyboard navigation, screen reader announcements)
 * - Analytics tracking (details_completed, saved, abandoned events)
 */
export default function FlareDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId } = useCurrentUser();

  // AC 9.2.1: Parse URL params
  const source = searchParams.get('source') as FlareCreationSource | null;
  const layer = searchParams.get('layer') as LayerType | null;
  const bodyRegionId = searchParams.get('bodyRegionId');
  const markerCoordinatesParam = searchParams.get('markerCoordinates');

  // Parse marker coordinates from JSON - do this immediately, not in useEffect
  let markerCoordinates: MarkerCoordinate[] = [];
  let isParamValid = true;

  // AC 9.2.1: Validate params and parse coordinates
  if (!source || !layer || !bodyRegionId || !markerCoordinatesParam) {
    isParamValid = false;
  } else {
    try {
      const coords = JSON.parse(markerCoordinatesParam) as MarkerCoordinate[];
      if (!Array.isArray(coords) || coords.length === 0) {
        isParamValid = false;
      } else {
        markerCoordinates = coords;
      }
    } catch (err) {
      isParamValid = false;
    }
  }

  // Redirect if params invalid
  useEffect(() => {
    if (!isParamValid) {
      console.warn('Invalid params, redirecting to placement page');
      router.push('/flares/place?source=dashboard');
    }
  }, [isParamValid, router]);

  // AC 9.2.3: Form state - severity (required)
  const [severity, setSeverity] = useState<number | null>(null);

  // AC 9.2.4: Lifecycle stage state (pre-selected to "onset")
  const [lifecycleStage, setLifecycleStage] = useState<FlareLifecycleStage>('onset');

  // AC 9.2.5: Notes state (optional, 500-char limit)
  const [notes, setNotes] = useState<string>('');

  // AC 9.2.6: Loading and error state
  const [isSaving, setIsSaving] = useState(false);

  // AC 9.2.9: Error state
  const [error, setError] = useState<string | null>(null);

  // Track if user has saved (for analytics)
  const hasSavedRef = useRef(false);

  // AC 9.2.2: Convert bodyRegionId to display name
  const formatRegionName = useCallback((regionId: string): string => {
    return regionId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, []);

  const regionName = bodyRegionId ? formatRegionName(bodyRegionId) : '';

  // AC 9.2.2: Format layer for display
  const formatLayerName = useCallback((layerType: LayerType): string => {
    if (layerType === 'flares') return 'Flares';
    if (layerType === 'pain') return 'Pain';
    return 'Custom';
  }, []);

  // AC 9.2.4: Handle lifecycle stage change
  const handleLifecycleStageChange = useCallback((stage: FlareLifecycleStage, stageNotes?: string) => {
    setLifecycleStage(stage);
  }, []);

  // AC 9.2.5: Handle notes change with character limit
  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setNotes(value);
    }
  }, []);

  // AC 9.2.7, 9.2.8, 9.2.9: Handle save with multi-location creation
  const handleSave = useCallback(async () => {
    if (!severity || !userId || !bodyRegionId || !layer) {
      console.warn('Cannot save: missing required fields');
      return;
    }

    // AC 9.2.11: Fire details_completed event BEFORE save
    console.log('[Analytics] flare_creation_details_completed', {
      severity,
      lifecycleStage,
      timestamp: new Date().toISOString(),
    });

    setIsSaving(true);
    setError(null);

    try {
      // AC 9.2.7: Construct marker data with all locations
      const bodyLocations = markerCoordinates.map(coord => ({
        bodyRegionId,
        coordinates: { x: coord.x, y: coord.y },
      }));

      // AC 9.2.7: Create flare with all marker locations
      const flare = await bodyMarkerRepository.createMarker(userId, {
        type: 'flare',
        bodyRegionId,
        initialSeverity: severity,
        currentSeverity: severity,
        status: 'active',
        currentLifecycleStage: lifecycleStage,
        initialEventNotes: notes.trim() || undefined,
        bodyLocations,
      });

      // Mark as saved (prevents abandoned event)
      hasSavedRef.current = true;

      // AC 9.2.11: Fire flare_creation_saved event
      console.log('[Analytics] flare_creation_saved', {
        flareId: flare.id,
        timestamp: new Date().toISOString(),
      });

      // AC 9.2.8: Navigate to success page with summary
      const params = new URLSearchParams({
        source: source || 'dashboard',
        flareId: flare.id,
        region: regionName,
        severity: severity.toString(),
        lifecycleStage,
        locations: markerCoordinates.length.toString(),
      });

      router.push(`/flares/success?${params.toString()}`);
    } catch (err) {
      // AC 9.2.9: Handle error with user-friendly message
      console.error('Failed to save flare:', err);
      setError('Failed to save flare. Please try again.');
      setIsSaving(false);

      // AC 9.2.9: Announce error to screen readers
      announce('Error: Failed to save flare', 'assertive');
    }
  }, [severity, userId, bodyRegionId, layer, markerCoordinates, lifecycleStage, notes, source, regionName, router]);

  // AC 9.2.11: Fire abandoned event on unmount if not saved
  useEffect(() => {
    return () => {
      if (!hasSavedRef.current) {
        console.log('[Analytics] flare_creation_abandoned', {
          source,
          layer,
          bodyRegionId,
          markerCount: markerCoordinates.length,
          timestamp: new Date().toISOString(),
        });
      }
    };
  }, [source, layer, bodyRegionId, markerCoordinates.length]);

  // AC 9.2.10: Keyboard navigation - Escape to return to placement page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) {
        // Navigate back to placement page
        const params = new URLSearchParams({
          source: source || 'dashboard',
          layer: layer || 'flares',
        });
        router.push(`/flares/place?${params.toString()}`);
      } else if (e.key === 'Enter' && severity !== null && !isSaving) {
        // AC 9.2.10: Enter submits form
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [severity, isSaving, source, layer, router, handleSave]);

  // Show nothing if params invalid (will redirect)
  if (!isParamValid || !source || !layer || !bodyRegionId) {
    return null;
  }

  return (
    <main
      role="main"
      aria-label="Flare details"
      className="flex flex-col min-h-screen w-full bg-background"
      data-testid="flare-details-page"
    >
      {/* AC 9.2.9: ARIA live region for error announcements */}
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {error}
      </div>

      {/* Page content container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
          {/* AC 9.2.2: Display region name prominently */}
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {regionName}
          </h1>

          {/* AC 9.2.2: Display marker count (Story 9.4: always show for body-map confirmation) */}
          {markerCoordinates.length > 0 && (
            <p className="text-muted-foreground mb-4">
              {markerCoordinates.length} {markerCoordinates.length === 1 ? 'marker' : 'markers'} placed in {regionName}
            </p>
          )}

          {/* AC 9.2.2: Display layer badge */}
          <div className="mb-6">
            <Badge variant="outline" className="text-sm">
              {layer && formatLayerName(layer)}
            </Badge>
          </div>

          {/* AC 9.2.9: Error message display */}
          {error && (
            <div
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Form content */}
          <div className="space-y-8">
            {/* AC 9.2.3: Severity slider with visual feedback */}
            <div className="space-y-3">
              <label
                htmlFor="severity-slider"
                className="block text-sm font-medium text-foreground"
              >
                Severity <span className="text-destructive">*</span>
              </label>
              <div id="severity-slider">
                <SeverityScale
                  value={severity ?? 5}
                  onChange={(value) => setSeverity(value)}
                  scale={{ type: 'numeric', min: 1, max: 10, step: 1 }}
                  ariaLabel="Flare severity from 1 to 10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Rate the severity of this flare from 1 (mild) to 10 (severe)
              </p>
            </div>

            {/* AC 9.2.4: Lifecycle stage selector */}
            <div className="space-y-3">
              <LifecycleStageSelector
                currentStage={lifecycleStage}
                onStageChange={handleLifecycleStageChange}
                showSuggestion={false}
                compact={false}
                disabled={isSaving}
              />
            </div>

            {/* AC 9.2.5: Notes textarea with character limit */}
            <div className="space-y-3">
              <label
                htmlFor="flare-notes"
                className="block text-sm font-medium text-foreground"
              >
                Notes (optional)
              </label>
              <textarea
                id="flare-notes"
                value={notes}
                onChange={handleNotesChange}
                disabled={isSaving}
                placeholder="Add notes about this flare (optional)"
                maxLength={500}
                rows={4}
                className={cn(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                  'ring-offset-background placeholder:text-muted-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                  'min-h-[88px]', // Larger touch target for textarea
                  'resize-none'
                )}
                aria-label="Flare notes"
                aria-describedby="notes-counter"
              />
              {/* AC 9.2.5: Character counter */}
              <p
                id="notes-counter"
                className="text-xs text-muted-foreground text-right"
              >
                {notes.length}/500
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AC 9.2.6: Save button with validation and loading state */}
      <div className="flex-shrink-0 p-4 border-t border-border bg-card">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSave}
            disabled={severity === null || isSaving}
            className={cn(
              'w-full min-h-[48px] px-6 py-3 font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={
              severity === null
                ? 'Save - disabled, severity required'
                : isSaving
                ? 'Saving flare...'
                : 'Save flare'
            }
            data-testid="save-button"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </main>
  );
}
