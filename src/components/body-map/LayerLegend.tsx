'use client';

import { useState, useEffect } from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import { cn } from '@/lib/utils/cn';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

/**
 * Props for LayerLegend component
 * Story 5.6: Layer Legend and Accessibility Features
 */
export interface LayerLegendProps {
  /** Layers to show in legend - only visible layers displayed (AC5.6.2) */
  visibleLayers: LayerType[];
  /** Optional toggle handler - enables interactive mode (AC5.6.4) */
  onToggleLayer?: (layer: LayerType) => void;
  /** Optional marker counts per layer (AC5.6.1) */
  markerCounts?: Record<LayerType, number>;
  /** Enable click to toggle layers (default: false) (AC5.6.4) */
  interactive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * LayerLegend Component
 *
 * Displays a clear visual guide explaining what each marker represents on the body map.
 * Provides alternative interaction method for toggling layer visibility.
 *
 * Features (Story 5.6):
 * - AC5.6.1: Shows icon, color, label, and description for each visible layer
 * - AC5.6.2: Dynamically updates when visibleLayers changes
 * - AC5.6.3: Responsive design - collapsible on mobile (< 768px)
 * - AC5.6.4: Interactive legend items toggle layer visibility
 * - AC5.6.5: WCAG AA color contrast compliance in light/dark themes
 * - AC5.6.6: Screen reader support with proper ARIA structure
 * - AC5.6.7: Keyboard navigation (Tab, Enter/Space)
 * - AC5.6.8: Help tooltip explaining layer system
 * - AC5.6.9: Structure supports future screenshot export
 *
 * @example
 * // Non-interactive legend (view-only)
 * <LayerLegend visibleLayers={['flares', 'pain']} />
 *
 * @example
 * // Interactive legend with toggles
 * <LayerLegend
 *   visibleLayers={visibleLayers}
 *   onToggleLayer={handleToggle}
 *   markerCounts={counts}
 *   interactive={true}
 * />
 */
export function LayerLegend({
  visibleLayers,
  onToggleLayer,
  markerCounts,
  interactive = false,
  className
}: LayerLegendProps) {
  // Mobile collapse state (AC5.6.3)
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport (AC5.6.3)
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Default collapsed on mobile, expanded on desktop
      setIsCollapsed(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle legend item interaction (AC5.6.4, AC5.6.7)
  const handleToggle = (layerId: LayerType) => {
    if (interactive && onToggleLayer) {
      onToggleLayer(layerId);
    }
  };

  // Keyboard navigation for legend items (AC5.6.7)
  const handleKeyDown = (e: React.KeyboardEvent, layerId: LayerType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(layerId);
    }
  };

  // Keyboard handler for help tooltip (AC5.6.8)
  const handleHelpKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowHelp(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Layer legend"
      className={cn(
        "fixed bottom-4 left-4 bg-white dark:bg-gray-800",
        "border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg",
        "transition-all duration-300 ease-in-out",
        "z-40", // Above map but below modals
        className
      )}
      // AC5.6.9: data attribute for future export integration
      data-legend-export="true"
    >
      {/* Header with help button and collapse toggle (AC5.6.8, AC5.6.3) */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            Legend
          </h3>

          {/* Help tooltip (AC5.6.8) */}
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root open={showHelp} onOpenChange={setShowHelp}>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() => setShowHelp(!showHelp)}
                  onKeyDown={handleHelpKeyDown}
                  className={cn(
                    "inline-flex items-center justify-center w-5 h-5 rounded-full",
                    "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                    "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  )}
                  aria-label="Show layer system help"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className={cn(
                    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                    "rounded-lg p-3 shadow-lg max-w-xs",
                    "text-sm text-gray-700 dark:text-gray-300 z-50",
                    "animate-in fade-in-0 zoom-in-95"
                  )}
                  sideOffset={5}
                  side="top"
                >
                  <p>
                    Layers separate different tracking types. Switch layers to log different conditions,
                    or view all layers to see comprehensive patterns.
                  </p>
                  <Tooltip.Arrow className="fill-gray-200 dark:fill-gray-700" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* Collapse button - mobile only (AC5.6.3) */}
        {isMobile && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-1 rounded text-gray-500 dark:text-gray-400",
              "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-blue-500"
            )}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expand legend" : "Collapse legend"}
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Legend items list (AC5.6.1, AC5.6.2, AC5.6.3) */}
      {!isCollapsed && (
        <ul
          className="p-2 space-y-1 min-w-[240px]"
          role="list"
        >
          {visibleLayers.map(layerId => {
            const layer = LAYER_CONFIG[layerId];
            const count = markerCounts?.[layerId];

            // Build accessible label (AC5.6.6)
            const ariaLabel = `${layer.label}: ${layer.description}${
              count !== undefined ? `, ${count} marker${count !== 1 ? 's' : ''}` : ''
            }`;

            return (
              <li
                key={layerId}
                role={interactive ? "button" : undefined}
                tabIndex={interactive ? 0 : undefined}
                onClick={() => handleToggle(layerId)}
                onKeyDown={e => handleKeyDown(e, layerId)}
                aria-label={ariaLabel}
                className={cn(
                  "flex items-center gap-2 p-2 rounded",
                  "transition-colors duration-150",
                  interactive && "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                  interactive && "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                )}
              >
                {/* Layer icon (AC5.6.1, AC5.6.5) */}
                <span className="text-xl" aria-hidden="true">
                  {layer.icon}
                </span>

                {/* Layer details */}
                <div className="flex-1 min-w-0">
                  {/* Layer label with color (AC5.6.1, AC5.6.5) */}
                  <div className={cn("font-medium text-sm", layer.color)}>
                    {layer.label}
                  </div>
                  {/* Layer description (AC5.6.1) */}
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {layer.description}
                  </div>
                </div>

                {/* Marker count (AC5.6.1) */}
                {count !== undefined && (
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {count}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ARIA live region for dynamic announcements (AC5.6.6) */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {/* Screen readers will announce changes here */}
      </div>
    </div>
  );
}
