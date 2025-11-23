export interface SvgCoordinates {
  x: number;
  y: number;
}

export interface NormalizedCoordinates {
  x: number;
  y: number;
}

export interface RegionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const normalizeCoordinates = (
  point: SvgCoordinates,
  bounds: RegionBounds
): NormalizedCoordinates => {
  const { width, height } = bounds;

  if (width === 0 || height === 0) {
    return { x: 0.5, y: 0.5 };
  }

  const normalizedX = (point.x - bounds.x) / width;
  const normalizedY = (point.y - bounds.y) / height;

  return {
    x: clamp(normalizedX, 0, 1),
    y: clamp(normalizedY, 0, 1),
  };
};

export const denormalizeCoordinates = (
  coordinate: NormalizedCoordinates,
  bounds: RegionBounds
): SvgCoordinates => {
  const { width, height } = bounds;

  return {
    x: bounds.x + clamp(coordinate.x, 0, 1) * width,
    y: bounds.y + clamp(coordinate.y, 0, 1) * height,
  };
};

export const getRegionBounds = (
  svgElement: SVGSVGElement | null,
  regionId: string
): RegionBounds | null => {
  if (!svgElement || !regionId) {
    return null;
  }

  const selector =
    typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
      ? `#${CSS.escape(regionId)}`
      : `#${regionId}`;

  const regionElement =
    (svgElement.querySelector(selector) as SVGGraphicsElement | null) ?? null;

  if (!regionElement || typeof regionElement.getBBox !== 'function') {
    return null;
  }

  try {
    const box = regionElement.getBBox();
    return {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    };
  } catch (error) {
    return null;
  }
};

// Task 5.1: Transform coordinates from region view to full body view
export const transformRegionToFullBody = (
  regionCoords: NormalizedCoordinates,
  regionId: string,
  fullBodySvgElement: SVGSVGElement | null
): NormalizedCoordinates | null => {
  // Get the region bounds in the full body SVG
  const regionBounds = getRegionBounds(fullBodySvgElement, regionId);
  if (!regionBounds) {
    return null;
  }

  // Get the full body SVG viewBox
  const viewBox = fullBodySvgElement?.viewBox.baseVal;
  if (!viewBox) {
    return null;
  }

  // Convert region-normalized coords to absolute SVG coordinates
  const absoluteX = regionBounds.x + regionCoords.x * regionBounds.width;
  const absoluteY = regionBounds.y + regionCoords.y * regionBounds.height;

  // Normalize to full body viewBox
  return {
    x: clamp((absoluteX - viewBox.x) / viewBox.width, 0, 1),
    y: clamp((absoluteY - viewBox.y) / viewBox.height, 0, 1),
  };
};

// Task 5.2: Transform coordinates from full body view to region view
export const transformFullBodyToRegion = (
  fullBodyCoords: NormalizedCoordinates,
  regionId: string,
  fullBodySvgElement: SVGSVGElement | null
): NormalizedCoordinates | null => {
  // Get the region bounds in the full body SVG
  const regionBounds = getRegionBounds(fullBodySvgElement, regionId);
  if (!regionBounds) {
    return null;
  }

  // Get the full body SVG viewBox
  const viewBox = fullBodySvgElement?.viewBox.baseVal;
  if (!viewBox) {
    return null;
  }

  // Convert full-body normalized coords to absolute SVG coordinates
  const absoluteX = viewBox.x + fullBodyCoords.x * viewBox.width;
  const absoluteY = viewBox.y + fullBodyCoords.y * viewBox.height;

  // Check if the point is within the region bounds
  if (
    absoluteX < regionBounds.x ||
    absoluteX > regionBounds.x + regionBounds.width ||
    absoluteY < regionBounds.y ||
    absoluteY > regionBounds.y + regionBounds.height
  ) {
    // Point is outside the region
    return null;
  }

  // Normalize to region bounds
  return {
    x: clamp((absoluteX - regionBounds.x) / regionBounds.width, 0, 1),
    y: clamp((absoluteY - regionBounds.y) / regionBounds.height, 0, 1),
  };
};
