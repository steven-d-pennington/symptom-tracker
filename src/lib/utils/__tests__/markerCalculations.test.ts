/**
 * Unit tests for marker calculation utilities
 * Story 5.4: AC5.4.2 (size), AC5.4.3 (opacity), AC5.4.4 (offsets)
 */

import {
  getSeveritySize,
  getMarkerOpacity,
  calculateMarkerOffset,
  getTouchTargetPadding
} from '../markerCalculations';

describe('markerCalculations', () => {
  describe('getSeveritySize', () => {
    it('should return 16px for severity 1-3 (small)', () => {
      expect(getSeveritySize(1)).toBe(16);
      expect(getSeveritySize(2)).toBe(16);
      expect(getSeveritySize(3)).toBe(16);
    });

    it('should return 24px for severity 4-7 (medium)', () => {
      expect(getSeveritySize(4)).toBe(24);
      expect(getSeveritySize(5)).toBe(24);
      expect(getSeveritySize(6)).toBe(24);
      expect(getSeveritySize(7)).toBe(24);
    });

    it('should return 32px for severity 8-10 (large)', () => {
      expect(getSeveritySize(8)).toBe(32);
      expect(getSeveritySize(9)).toBe(32);
      expect(getSeveritySize(10)).toBe(32);
    });

    it('should handle edge cases', () => {
      expect(getSeveritySize(0)).toBe(16); // Below minimum
      expect(getSeveritySize(11)).toBe(32); // Above maximum
    });
  });

  describe('getMarkerOpacity', () => {
    it('should return 1.0 for markers less than 7 days old', () => {
      const now = Date.now();
      const yesterday = now - (1 * 24 * 60 * 60 * 1000);
      const sixDaysAgo = now - (6 * 24 * 60 * 60 * 1000);

      expect(getMarkerOpacity(now)).toBe(1.0);
      expect(getMarkerOpacity(yesterday)).toBe(1.0);
      expect(getMarkerOpacity(sixDaysAgo)).toBe(1.0);
    });

    it('should return 0.7 for markers 7-30 days old', () => {
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
      const fifteenDaysAgo = now - (15 * 24 * 60 * 60 * 1000);
      const twentyNineDaysAgo = now - (29 * 24 * 60 * 60 * 1000);

      expect(getMarkerOpacity(sevenDaysAgo)).toBe(0.7);
      expect(getMarkerOpacity(fifteenDaysAgo)).toBe(0.7);
      expect(getMarkerOpacity(twentyNineDaysAgo)).toBe(0.7);
    });

    it('should return 0.5 for markers older than 30 days', () => {
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
      const yearAgo = now - (365 * 24 * 60 * 60 * 1000);

      expect(getMarkerOpacity(thirtyDaysAgo)).toBe(0.5);
      expect(getMarkerOpacity(sixtyDaysAgo)).toBe(0.5);
      expect(getMarkerOpacity(yearAgo)).toBe(0.5);
    });
  });

  describe('calculateMarkerOffset', () => {
    it('should return zero offset for single marker', () => {
      const offset = calculateMarkerOffset(1, 0);
      expect(offset).toEqual({ x: 0, y: 0 });
    });

    it('should calculate circular distribution for 2 markers', () => {
      const markers = [1, 2]; // 2 markers
      const offset1 = calculateMarkerOffset(markers, 0, 8);
      const offset2 = calculateMarkerOffset(markers, 1, 8);

      // First marker at 0°, second at 180°
      expect(offset1.x).toBeCloseTo(8, 1);
      expect(offset1.y).toBeCloseTo(0, 1);
      expect(offset2.x).toBeCloseTo(-8, 1);
      expect(offset2.y).toBeCloseTo(0, 1);
    });

    it('should calculate circular distribution for 3 markers', () => {
      const markers = [1, 2, 3]; // 3 markers
      const offset1 = calculateMarkerOffset(markers, 0, 8);
      const offset2 = calculateMarkerOffset(markers, 1, 8);
      const offset3 = calculateMarkerOffset(markers, 2, 8);

      // Markers at 0°, 120°, 240°
      expect(offset1.x).toBeCloseTo(8, 1);
      expect(offset1.y).toBeCloseTo(0, 1);
      expect(offset2.x).toBeCloseTo(-4, 1);
      expect(offset2.y).toBeCloseTo(6.93, 1); // 8 * sin(120°)
      expect(offset3.x).toBeCloseTo(-4, 1);
      expect(offset3.y).toBeCloseTo(-6.93, 1); // 8 * sin(240°)
    });

    it('should calculate circular distribution for 4 markers', () => {
      const markers = [1, 2, 3, 4]; // 4 markers
      const offsets = markers.map((_, i) => calculateMarkerOffset(markers, i, 8));

      // Markers at 0°, 90°, 180°, 270°
      expect(offsets[0].x).toBeCloseTo(8, 1);
      expect(offsets[0].y).toBeCloseTo(0, 1);
      expect(offsets[1].x).toBeCloseTo(0, 1);
      expect(offsets[1].y).toBeCloseTo(8, 1);
      expect(offsets[2].x).toBeCloseTo(-8, 1);
      expect(offsets[2].y).toBeCloseTo(0, 1);
      expect(offsets[3].x).toBeCloseTo(0, 1);
      expect(offsets[3].y).toBeCloseTo(-8, 1);
    });

    it('should use custom radius', () => {
      const offset = calculateMarkerOffset(2, 0, 12);
      expect(offset.x).toBeCloseTo(12, 1);
    });

    it('should accept count as number instead of array', () => {
      const offset1 = calculateMarkerOffset(3, 0, 8);
      const offset2 = calculateMarkerOffset([1, 2, 3], 0, 8);

      expect(offset1).toEqual(offset2);
    });
  });

  describe('getTouchTargetPadding', () => {
    it('should return 0 for markers already >= 32px', () => {
      expect(getTouchTargetPadding(32)).toBe(0);
      expect(getTouchTargetPadding(40)).toBe(0);
    });

    it('should return correct padding for 16px marker', () => {
      // Need (32 - 16) / 2 = 8px padding
      expect(getTouchTargetPadding(16)).toBe(8);
    });

    it('should return correct padding for 24px marker', () => {
      // Need (32 - 24) / 2 = 4px padding
      expect(getTouchTargetPadding(24)).toBe(4);
    });

    it('should handle edge cases', () => {
      expect(getTouchTargetPadding(0)).toBe(16);
      expect(getTouchTargetPadding(10)).toBe(11);
    });
  });
});
