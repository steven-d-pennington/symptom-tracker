"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announce } from "@/lib/utils/announce";
import { cn } from "@/lib/utils/cn";

// URL param types (AC 9.3.1)
type FlareCreationSource = 'dashboard' | 'body-map';

/**
 * Story 9.3: Success Screen with Add Another Flow
 *
 * Full-page success confirmation screen for flare creation.
 * Displays flare summary and enables multi-flare logging workflow.
 *
 * Features:
 * - URL param parsing and validation (source, flareId, region, severity, lifecycleStage, locations)
 * - Success message with location count
 * - Flare summary card (region, severity, lifecycle stage)
 * - "Add another flare" button for multi-flare workflow
 * - Contextual return button (dashboard vs body-map)
 * - Navigation context preservation (source param)
 * - Mobile-first responsive design (44x44px touch targets)
 * - Full accessibility (ARIA labels, keyboard navigation, screen reader announcements)
 * - Analytics tracking (add_another_clicked event)
 */
export default function FlareSuccessScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // AC 9.3.1: Parse URL params
  const source = searchParams.get('source') as FlareCreationSource | null;
  const flareId = searchParams.get('flareId');
  const region = searchParams.get('region');
  const severity = searchParams.get('severity');
  const lifecycleStage = searchParams.get('lifecycleStage');
  const locations = searchParams.get('locations') || '1'; // Default to 1

  // Track if user has navigated (for analytics)
  const hasNavigatedRef = useRef(false);

  // AC 9.3.1: Redirect to dashboard if source invalid or missing
  useEffect(() => {
    if (!source || (source !== 'dashboard' && source !== 'body-map')) {
      console.warn('Invalid or missing source param, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [source, router]);

  // AC 9.3.8: Announce success message to screen readers
  useEffect(() => {
    if (source) {
      const locationCount = parseInt(locations, 10) || 1;
      announce(`Flare saved with ${locationCount} ${locationCount === 1 ? 'location' : 'locations'}`, 'polite');
    }
  }, []); // Only fire once on mount

  // AC 9.3.2: Format location count for success message
  const locationCount = parseInt(locations, 10) || 1;

  // AC 9.3.3: Format region name (URL-decode and title case)
  const formatRegionName = useCallback((regionId: string | null): string => {
    if (!regionId) return 'N/A';
    try {
      // Decode URL-encoded region name
      const decoded = decodeURIComponent(regionId);
      // Convert hyphenated or underscored names to title case
      return decoded
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } catch {
      return 'N/A';
    }
  }, []);

  // AC 9.3.3: Format severity (X/10)
  const formatSeverity = useCallback((sev: string | null): string => {
    if (!sev) return 'N/A';
    const sevNum = parseInt(sev, 10);
    if (isNaN(sevNum)) return 'N/A';
    return `${sevNum}/10`;
  }, []);

  // AC 9.3.3: Format lifecycle stage (title case)
  const formatLifecycleStage = useCallback((stage: string | null): string => {
    if (!stage) return 'N/A';
    return stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase();
  }, []);

  // AC 9.3.5: Determine return button text and destination based on source
  const returnButtonText = source === 'dashboard'
    ? '🏠 Back to dashboard'
    : '🗺️ Back to body-map';
  const returnDestination = source === 'dashboard'
    ? '/dashboard'
    : '/body-map';

  // AC 9.3.4 & 9.3.7: Handle "Add another flare" navigation with analytics
  const handleAddAnother = useCallback(() => {
    // AC 9.3.7: Fire analytics event
    console.log('[Analytics] flare_creation_add_another_clicked', {
      source,
      timestamp: new Date().toISOString(),
    });

    hasNavigatedRef.current = true;

    // AC 9.3.6: Navigate to placement page with preserved source param
    router.push(`/flares/place?source=${source}`);
  }, [source, router]);

  // AC 9.3.5: Handle contextual return navigation
  const handleReturn = useCallback(() => {
    hasNavigatedRef.current = true;
    router.push(returnDestination);
  }, [returnDestination, router]);

  return (
    <main
      role="main"
      className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-background"
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* AC 9.3.2: Success message with location count */}
        <div
          role="status"
          aria-live="polite"
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-500">
            ✅ Flare saved with {locationCount} {locationCount === 1 ? 'location' : 'locations'}!
          </h1>
        </div>

        {/* AC 9.3.3: Flare summary card */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Flare Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Body Region */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Body Region</div>
              <div className="text-lg font-medium text-foreground">
                {formatRegionName(region)}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Severity</div>
              <div className="text-lg font-medium text-foreground">
                {formatSeverity(severity)}
              </div>
            </div>

            {/* Lifecycle Stage */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Lifecycle Stage</div>
              <div className="text-lg font-medium text-foreground">
                {formatLifecycleStage(lifecycleStage)}
              </div>
            </div>
          </div>
        </div>

        {/* AC 9.3.4: "Add another flare" button - Primary CTA */}
        <div className="space-y-4">
          <Button
            onClick={handleAddAnother}
            size="lg"
            className={cn(
              "w-full h-12 text-lg font-semibold",
              // AC 9.3.4: Minimum 44x44px touch target (48px height for comfort)
              "min-h-[44px]"
            )}
            aria-label="Add another flare and continue logging"
          >
            🔄 Add another flare
          </Button>

          {/* AC 9.3.5: Contextual return button - Secondary action */}
          <Button
            onClick={handleReturn}
            variant="outline"
            size="lg"
            className={cn(
              "w-full h-12 text-lg",
              // AC 9.3.5: Minimum 44x44px touch target
              "min-h-[44px]"
            )}
            aria-label={`Return to ${source === 'dashboard' ? 'dashboard' : 'body map'}`}
          >
            {returnButtonText}
          </Button>
        </div>
      </div>
    </main>
  );
}
