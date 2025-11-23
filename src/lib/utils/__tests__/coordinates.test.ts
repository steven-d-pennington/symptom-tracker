import {
  denormalizeCoordinates,
  getRegionBounds,
  normalizeCoordinates,
  NormalizedCoordinates,
  RegionBounds,
  SvgCoordinates,
} from '@/lib/utils/coordinates';

describe('normalizeCoordinates', () => {
  const bounds: RegionBounds = { x: 10, y: 20, width: 100, height: 80 };

  it('returns normalized values within 0-1 range', () => {
    const point: SvgCoordinates = { x: 60, y: 60 };
    expect(normalizeCoordinates(point, bounds)).toEqual({ x: 0.5, y: 0.5 });
  });

  it('clamps values outside of bounds', () => {
    const point: SvgCoordinates = { x: -10, y: 200 };
    expect(normalizeCoordinates(point, bounds)).toEqual({ x: 0, y: 1 });
  });

  it('handles zero-sized bounds by returning centered coordinates', () => {
    const zeroBounds: RegionBounds = { x: 0, y: 0, width: 0, height: 0 };
    expect(normalizeCoordinates({ x: 5, y: 5 }, zeroBounds)).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });
});

describe('denormalizeCoordinates', () => {
  const bounds: RegionBounds = { x: 0, y: 0, width: 200, height: 100 };

  it('converts normalized values back to SVG coordinates', () => {
    const normalized: NormalizedCoordinates = { x: 0.25, y: 0.8 };
    expect(denormalizeCoordinates(normalized, bounds)).toEqual({
      x: 50,
      y: 80,
    });
  });

  it('clamps normalized values before conversion', () => {
    const normalized: NormalizedCoordinates = { x: 2, y: -1 };
    expect(denormalizeCoordinates(normalized, bounds)).toEqual({
      x: 200,
      y: 0,
    });
  });

  it('keeps positions consistent across simulated zoom levels', () => {
    const originalBounds: RegionBounds = { x: 10, y: 20, width: 120, height: 180 };
    const zoomedBounds: RegionBounds = { x: 10, y: 20, width: 120 * 1.5, height: 180 * 1.5 };

    const svgPoint: SvgCoordinates = { x: 70, y: 150 };
    const normalized = normalizeCoordinates(svgPoint, originalBounds);
    const denormalized = denormalizeCoordinates(normalized, zoomedBounds);

    expect(denormalized).toEqual({
      x: zoomedBounds.x + (normalized.x * zoomedBounds.width),
      y: zoomedBounds.y + (normalized.y * zoomedBounds.height),
    });
  });
});

describe('getRegionBounds', () => {
  const createSvgWithRegion = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('id', 'test-region');

    Object.defineProperty(rect, 'getBBox', {
      value: jest.fn(() => ({ x: 5, y: 15, width: 40, height: 70 })),
    });

    svg.appendChild(rect);
    return svg;
  };

  it('returns bounding box for a known region', () => {
    const svg = createSvgWithRegion();
    expect(getRegionBounds(svg, 'test-region')).toEqual({
      x: 5,
      y: 15,
      width: 40,
      height: 70,
    });
  });

  it('returns null when region cannot be found', () => {
    const svg = createSvgWithRegion();
    expect(getRegionBounds(svg, 'missing-region')).toBeNull();
  });

  it('returns null when svg element is not provided', () => {
    expect(getRegionBounds(null, 'whatever')).toBeNull();
  });
});
