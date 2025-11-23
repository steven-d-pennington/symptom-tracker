/**
 * Marker calculation utilities for layer-aware body map marker rendering
 * Story 5.4: Implement Layer-Aware Marker Rendering
 */

/**
 * Calculate marker size based on severity (AC5.4.2)
 * Severity 1-3: 16px (small)
 * Severity 4-7: 24px (medium)
 * Severity 8-10: 32px (large)
 *
 * @param severity - Severity rating from 1-10
 * @returns Marker diameter in pixels
 */
export function getSeveritySize(severity: number): number {
  if (severity <= 3) return 16;
  if (severity <= 7) return 24;
  return 32; // severity 8-10
}

/**
 * Calculate marker opacity based on age (AC5.4.3)
 * < 7 days: 100% opaque (1.0)
 * 7-30 days: 70% opaque (0.7)
 * > 30 days: 50% opaque (0.5)
 *
 * @param timestamp - Unix timestamp (milliseconds) when marker was created
 * @returns Opacity value between 0.5 and 1.0
 */
export function getMarkerOpacity(timestamp: number): number {
  const daysSince = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);

  if (daysSince < 7) return 1.0;   // 100% opaque
  if (daysSince < 30) return 0.7;  // 70% opaque
  return 0.5;                       // 50% opaque
}

/**
 * Calculate offset for overlapping markers using circular distribution (AC5.4.4)
 * Uses circular distribution pattern to prevent complete overlap.
 * Markers are distributed evenly around a circle using angle = index / count * 2π
 *
 * @param markers - Array of markers at the same location (or count)
 * @param currentIndex - Index of current marker in the group
 * @param radius - Radius of offset circle in pixels (default: 8)
 * @returns Offset coordinates {x, y} in pixels
 */
export function calculateMarkerOffset(
  markers: Array<unknown> | number,
  currentIndex: number,
  radius: number = 8
): { x: number; y: number } {
  const count = typeof markers === 'number' ? markers : markers.length;

  if (count === 1) {
    return { x: 0, y: 0 }; // No offset needed
  }

  const angle = (currentIndex / count) * 2 * Math.PI;

  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle)
  };
}

/**
 * Ensure minimum touch target size is met (AC5.4.2)
 * Returns padding needed to reach 32px minimum touch target
 *
 * @param markerSize - Current marker size in pixels
 * @returns Padding needed to reach 32px minimum (0 if already >= 32px)
 */
export function getTouchTargetPadding(markerSize: number): number {
  const MIN_TOUCH_TARGET = 32;
  return Math.max(0, (MIN_TOUCH_TARGET - markerSize) / 2);
}
