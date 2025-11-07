'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { LayerType, LAYER_CONFIG } from '@/lib/db/schema';
import { cn } from '@/lib/utils/cn';

export interface LayerSelectorProps {
  /** Active layer from parent state */
  currentLayer: LayerType;
  /** Callback when user selects layer */
  onLayerChange: (layer: LayerType) => void;
  /** Disable selection during loading */
  disabled?: boolean;
  /** Show "Last used" badge on this layer */
  lastUsedLayer?: LayerType;
}

/**
 * LayerSelector component for body map multi-layer tracking (Story 5.3).
 * Provides tab-like interface for switching between flares, pain, and inflammation layers.
 *
 * Features:
 * - Optimistic UI updates (no loading delay)
 * - Keyboard navigation (Tab, Arrow keys, Enter/Space)
 * - Mobile-optimized 44x44px touch targets
 * - Full accessibility with ARIA attributes
 * - Last-used layer badge
 */
export function LayerSelector({
  currentLayer,
  onLayerChange,
  disabled = false,
  lastUsedLayer
}: LayerSelectorProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const layers = Object.values(LAYER_CONFIG) as Array<typeof LAYER_CONFIG[keyof typeof LAYER_CONFIG]>;

  // Update focused index when current layer changes
  useEffect(() => {
    const index = layers.findIndex(layer => layer.id === currentLayer);
    if (index !== -1) {
      setFocusedIndex(index);
    }
  }, [currentLayer, layers]);

  const handleLayerClick = useCallback((layer: LayerType) => {
    if (!disabled) {
      onLayerChange(layer);
      // Update screen reader announcement
      setAnnouncement(`${LAYER_CONFIG[layer].label} layer selected`);
    }
  }, [disabled, onLayerChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    const layerIds = layers.map(l => l.id);

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        {
          const nextIndex = (focusedIndex + 1) % layers.length;
          setFocusedIndex(nextIndex);
          buttonRefs.current[nextIndex]?.focus();
        }
        break;

      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        {
          const prevIndex = (focusedIndex - 1 + layers.length) % layers.length;
          setFocusedIndex(prevIndex);
          buttonRefs.current[prevIndex]?.focus();
        }
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        {
          // Find which button is currently focused by checking refs
          const focusedButton = buttonRefs.current.find(btn => btn === document.activeElement);
          const buttonIndex = buttonRefs.current.indexOf(focusedButton || null);
          const layer = buttonIndex >= 0 ? layerIds[buttonIndex] : layerIds[focusedIndex];
          if (layer) {
            handleLayerClick(layer);
          }
        }
        break;
    }
  }, [disabled, focusedIndex, layers, handleLayerClick]);

  return (
    <div
      role="radiogroup"
      aria-label="Layer selector"
      className="flex gap-2 flex-wrap"
      onKeyDown={handleKeyDown}
    >
      {layers.map((layer, index) => {
        const isActive = currentLayer === layer.id;
        const showBadge = lastUsedLayer === layer.id && lastUsedLayer !== currentLayer;

        return (
          <button
            key={layer.id}
            ref={el => buttonRefs.current[index] = el}
            role="radio"
            aria-checked={isActive}
            aria-label={`${layer.label} layer`}
            onClick={() => handleLayerClick(layer.id)}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            tabIndex={index === focusedIndex ? 0 : -1}
            className={cn(
              // Base styles
              "min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg border-2 transition-all",
              "flex flex-col items-center justify-center gap-1",
              "relative",

              // Active state
              isActive && "ring-2 ring-primary bg-primary/10 border-primary",
              !isActive && "border-border hover:border-primary/50",

              // Disabled state
              disabled && "opacity-50 cursor-not-allowed",
              !disabled && "cursor-pointer",

              // Hover and focus states
              !disabled && "hover:bg-accent",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",

              // Dark mode
              "dark:border-gray-700 dark:hover:border-gray-600"
            )}
          >
            {/* Icon */}
            <span className="text-2xl" aria-hidden="true">
              {layer.icon}
            </span>

            {/* Label */}
            <span className={cn(
              "text-xs font-medium whitespace-nowrap",
              layer.color
            )}>
              {layer.label}
            </span>

            {/* Last used badge */}
            {showBadge && (
              <span className={cn(
                "absolute -top-1 -right-1",
                "px-1.5 py-0.5 text-[9px] font-semibold",
                "bg-blue-500 text-white rounded",
                "border border-white dark:border-gray-900"
              )}>
                Last
              </span>
            )}
          </button>
        );
      })}

      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
    </div>
  );
}
