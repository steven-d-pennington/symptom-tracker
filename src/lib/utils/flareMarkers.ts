import { ActiveFlare } from '@/lib/types/flare';

/**
 * Get Tailwind color class for flare marker based on severity
 * Story 2.3 AC2.3.2: red 9-10, orange 7-8, yellow 4-6, green 1-3
 */
export const getFlareMarkerColor = (severity: number): string => {
  if (severity >= 9) return 'fill-red-500';
  if (severity >= 7) return 'fill-orange-500';
  if (severity >= 4) return 'fill-yellow-500';
  return 'fill-green-500';
};

/**
 * @deprecated Use getFlareMarkerColor with severity instead
 * Get Tailwind color class for flare status (legacy)
 */
export const getFlareMarkerColorByStatus = (status: ActiveFlare['status']): string => {
  const colorMap: Record<ActiveFlare['status'], string> = {
    active: 'fill-red-500',
    worsening: 'fill-orange-500',
    improving: 'fill-yellow-400',
    resolved: 'fill-gray-400',
  };
  return colorMap[status];
};

/**
 * Calculate the age of a flare in days
 */
export const calculateFlareAge = (startDate: Date): number => {
  return Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Calculate offset positions for multiple flares in the same region
 * Uses radial distribution to prevent overlap
 */
export const calculateRadialOffsets = (
  count: number,
  radius: number = 20
): Array<{ x: number; y: number }> => {
  if (count === 1) {
    return [{ x: 0, y: 0 }];
  }

  const offsets: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI;
    offsets.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }

  return offsets;
};
