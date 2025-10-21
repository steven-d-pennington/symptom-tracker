import { ActiveFlare } from '@/lib/types/flare';

/**
 * Get Tailwind color class for flare status
 */
export const getFlareMarkerColor = (status: ActiveFlare['status']): string => {
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
