'use client';

import { useCallback, useEffect } from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import { cn } from '@/lib/utils/cn';

/**
 * Props for LayerToggle component
 * Story 5.5: Multi-layer view controls and filtering
 */
export interface LayerToggleProps {
  /** Currently visible layers */
  visibleLayers: LayerType[];
  /** Callback when user toggles individual layer */
  onToggleLayer: (layer: LayerType) => void;
  /** Marker counts per layer */
  markerCounts: Record<LayerType, number>;
  /** Current view mode */
  viewMode: 'single' | 'all';
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'single' | 'all') => void;
  /** Disable controls during loading */
  disabled?: boolean;
}

/**
 * LayerToggle Component
 *
 * Provides controls for multi-layer body map visualization.
 * Allows users to switch between single-layer tracking mode and multi-layer analysis mode,
 * and toggle visibility of individual layers.
 *
 * Features (Story 5.5):
 * - AC5.5.1: Checkboxes for each layer with marker counts
 * - AC5.5.2: View mode selector (Single Layer / All Layers)
 * - AC5.5.3: Individual layer visibility toggles
 * - AC5.5.7: Keyboard shortcuts (1-3 for layers, A for view mode)
 * - AC5.5.9: Real-time marker count updates
 */
export function LayerToggle({
  visibleLayers,
  onToggleLayer,
  markerCounts,
  viewMode,
  onViewModeChange,
  disabled = false
}: LayerToggleProps) {
  // Keyboard shortcuts handler (AC5.5.7)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger if user is typing in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key) {
      case '1':
        onToggleLayer('flares');
        break;
      case '2':
        onToggleLayer('pain');
        break;
      case '3':
        onToggleLayer('inflammation');
        break;
      case 'a':
      case 'A':
        onViewModeChange(viewMode === 'single' ? 'all' : 'single');
        break;
    }
  }, [viewMode, onToggleLayer, onViewModeChange]);

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const layers = Object.values(LAYER_CONFIG);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white dark:bg-gray-800">
      {/* View Mode Selector - AC5.5.2 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          View Mode
        </div>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="single"
              checked={viewMode === 'single'}
              onChange={() => onViewModeChange('single')}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900 dark:text-gray-100">
              Single Layer
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">(A)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="viewMode"
              value="all"
              checked={viewMode === 'all'}
              onChange={() => onViewModeChange('all')}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-900 dark:text-gray-100">
              All Layers
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">(A)</span>
          </label>
        </div>
      </div>

      {/* Layer Visibility Toggles - AC5.5.1, AC5.5.3 */}
      {viewMode === 'all' && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Visible Layers
          </div>
          <div className="space-y-2">
            {layers.map((layer, index) => {
              const isVisible = visibleLayers.includes(layer.id);
              const count = markerCounts[layer.id];

              return (
                <label
                  key={layer.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
                    "hover:bg-gray-50 dark:hover:bg-gray-700",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleLayer(layer.id)}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-xl" aria-hidden="true">
                    {layer.icon}
                  </span>
                  <span className={cn("font-medium text-sm", layer.color)}>
                    {layer.label}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    ({count})
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({index + 1})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
        <div className="font-medium mb-1">Keyboard Shortcuts:</div>
        <div className="space-y-0.5">
          <div>• <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">1-3</kbd> Toggle layers</div>
          <div>• <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">A</kbd> Switch view mode</div>
        </div>
      </div>
    </div>
  );
}
