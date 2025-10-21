import { getFlareMarkerColor, calculateFlareAge, calculateRadialOffsets } from '../flareMarkers';

describe('flareMarkers utilities', () => {
  describe('getFlareMarkerColor', () => {
    it('returns correct color for active status', () => {
      expect(getFlareMarkerColor('active')).toBe('fill-red-500');
    });

    it('returns correct color for worsening status', () => {
      expect(getFlareMarkerColor('worsening')).toBe('fill-orange-500');
    });

    it('returns correct color for improving status', () => {
      expect(getFlareMarkerColor('improving')).toBe('fill-yellow-400');
    });

    it('returns correct color for resolved status', () => {
      expect(getFlareMarkerColor('resolved')).toBe('fill-gray-400');
    });
  });

  describe('calculateFlareAge', () => {
    it('calculates correct age for flare started today', () => {
      const today = new Date();
      const age = calculateFlareAge(today);
      expect(age).toBe(0);
    });

    it('calculates correct age for flare started 1 day ago', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const age = calculateFlareAge(yesterday);
      expect(age).toBe(1);
    });

    it('calculates correct age for flare started 7 days ago', () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const age = calculateFlareAge(weekAgo);
      expect(age).toBe(7);
    });

    it('calculates correct age for flare started 30 days ago', () => {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const age = calculateFlareAge(monthAgo);
      expect(age).toBe(30);
    });
  });

  describe('calculateRadialOffsets', () => {
    it('returns zero offset for single marker', () => {
      const offsets = calculateRadialOffsets(1, 20);
      expect(offsets).toHaveLength(1);
      expect(offsets[0]).toEqual({ x: 0, y: 0 });
    });

    it('returns 2 offsets at opposite sides for 2 markers', () => {
      const offsets = calculateRadialOffsets(2, 20);
      expect(offsets).toHaveLength(2);
      
      // First marker at 0 degrees (right)
      expect(offsets[0].x).toBeCloseTo(20, 1);
      expect(offsets[0].y).toBeCloseTo(0, 1);
      
      // Second marker at 180 degrees (left)
      expect(offsets[1].x).toBeCloseTo(-20, 1);
      expect(offsets[1].y).toBeCloseTo(0, 1);
    });

    it('returns 3 offsets evenly distributed for 3 markers', () => {
      const offsets = calculateRadialOffsets(3, 20);
      expect(offsets).toHaveLength(3);
      
      // Verify they're evenly distributed in a circle
      // 0 degrees, 120 degrees, 240 degrees
      expect(offsets[0].x).toBeCloseTo(20, 1); // 0°
      expect(offsets[0].y).toBeCloseTo(0, 1);
      
      expect(offsets[1].x).toBeCloseTo(-10, 1); // 120°
      expect(offsets[1].y).toBeCloseTo(17.32, 1); // sqrt(3) * 10
      
      expect(offsets[2].x).toBeCloseTo(-10, 1); // 240°
      expect(offsets[2].y).toBeCloseTo(-17.32, 1);
    });

    it('returns 4 offsets in cardinal directions for 4 markers', () => {
      const offsets = calculateRadialOffsets(4, 20);
      expect(offsets).toHaveLength(4);
      
      // 0°, 90°, 180°, 270°
      expect(offsets[0].x).toBeCloseTo(20, 1);
      expect(offsets[0].y).toBeCloseTo(0, 1);
      
      expect(offsets[1].x).toBeCloseTo(0, 1);
      expect(offsets[1].y).toBeCloseTo(20, 1);
      
      expect(offsets[2].x).toBeCloseTo(-20, 1);
      expect(offsets[2].y).toBeCloseTo(0, 1);
      
      expect(offsets[3].x).toBeCloseTo(0, 1);
      expect(offsets[3].y).toBeCloseTo(-20, 1);
    });

    it('respects custom radius parameter', () => {
      const offsets = calculateRadialOffsets(2, 30);
      expect(offsets).toHaveLength(2);
      
      // With radius 30 instead of 20
      expect(offsets[0].x).toBeCloseTo(30, 1);
      expect(offsets[0].y).toBeCloseTo(0, 1);
      
      expect(offsets[1].x).toBeCloseTo(-30, 1);
      expect(offsets[1].y).toBeCloseTo(0, 1);
    });

    it('handles 5 markers', () => {
      const offsets = calculateRadialOffsets(5, 20);
      expect(offsets).toHaveLength(5);
      
      // Verify all offsets are at radius 20
      offsets.forEach(offset => {
        const distance = Math.sqrt(offset.x ** 2 + offset.y ** 2);
        expect(distance).toBeCloseTo(20, 1);
      });
    });
  });
});
