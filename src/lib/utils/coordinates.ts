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
