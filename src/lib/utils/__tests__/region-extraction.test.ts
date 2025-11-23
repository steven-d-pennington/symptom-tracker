/**
 * Tests for region-extraction utilities
 * Story 3.7.1 - Region Detail View Infrastructure
 */

import {
  getRegionData,
  calculateRegionViewBox,
  getRegionSVGDefinition,
} from '../region-extraction';
import { FRONT_BODY_REGIONS, BACK_BODY_REGIONS } from '@/lib/data/bodyRegions';

describe('region-extraction', () => {
  describe('[P1] getRegionData', () => {
    it('should return region data for valid front view region', () => {
      const result = getRegionData('head-front', 'front');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('head-front');
    });

    it('should return region data for valid back view region', () => {
      const result = getRegionData('head-back', 'back');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('head-back');
    });

    it('should return null for invalid region ID', () => {
      const result = getRegionData('invalid-region', 'front');

      expect(result).toBeNull();
    });

    it('should search in front regions when viewType is front', () => {
      // Get a region that only exists in FRONT_BODY_REGIONS
      const frontRegion = FRONT_BODY_REGIONS.find(r => r.id.includes('chest'));

      if (frontRegion) {
        const result = getRegionData(frontRegion.id, 'front');
        expect(result).not.toBeNull();
        expect(result?.id).toBe(frontRegion.id);
      }
    });

    it('should search in back regions when viewType is back', () => {
      // Get a region that only exists in BACK_BODY_REGIONS
      const backRegion = BACK_BODY_REGIONS.find(r => r.id.includes('upper-back'));

      if (backRegion) {
        const result = getRegionData(backRegion.id, 'back');
        expect(result).not.toBeNull();
        expect(result?.id).toBe(backRegion.id);
      }
    });
  });

  describe('[P1] calculateRegionViewBox', () => {
    it('should calculate viewBox for head region with correct dimensions', () => {
      const headRegion = {
        id: 'head-front',
        name: 'Head',
        category: 'head' as const,
        center: { x: 200, y: 100 },
      };

      const viewBox = calculateRegionViewBox(headRegion);

      // Head regions should be 150x180 (width x height)
      expect(viewBox).toContain('150'); // width
      expect(viewBox).toContain('180'); // height

      // Parse viewBox to verify structure: "x y width height"
      const parts = viewBox.split(' ').map(Number);
      expect(parts).toHaveLength(4);
      expect(parts[2]).toBe(150); // width
      expect(parts[3]).toBe(180); // height
    });

    it('should calculate viewBox for torso region with correct dimensions', () => {
      const torsoRegion = {
        id: 'chest-left',
        name: 'Left Chest',
        category: 'torso' as const,
        center: { x: 150, y: 200 },
      };

      const viewBox = calculateRegionViewBox(torsoRegion);

      // Torso regions should be 150x140
      const parts = viewBox.split(' ').map(Number);
      expect(parts[2]).toBe(150); // width
      expect(parts[3]).toBe(140); // height
    });

    it('should calculate viewBox for forearm with tight framing', () => {
      const forearmRegion = {
        id: 'forearm-left',
        name: 'Left Forearm',
        category: 'limbs' as const,
        center: { x: 100, y: 400 },
      };

      const viewBox = calculateRegionViewBox(forearmRegion);

      // Forearms are narrow and tall, should get tight framing: 55x130
      const parts = viewBox.split(' ').map(Number);
      expect(parts[2]).toBeGreaterThanOrEqual(55); // width (may be adjusted for aspect ratio)
      expect(parts[3]).toBeGreaterThanOrEqual(130); // height
    });

    it('should calculate viewBox for thigh with appropriate dimensions', () => {
      const thighRegion = {
        id: 'thigh-left',
        name: 'Left Thigh',
        category: 'limbs' as const,
        center: { x: 167, y: 490 },
      };

      const viewBox = calculateRegionViewBox(thighRegion);

      // Thighs should be 65x140
      const parts = viewBox.split(' ').map(Number);
      expect(parts[2]).toBeGreaterThanOrEqual(65);
      expect(parts[3]).toBeGreaterThanOrEqual(140);
    });

    it('should center the region in the viewBox', () => {
      const region = {
        id: 'test-region',
        name: 'Test Region',
        category: 'torso' as const,
        center: { x: 200, y: 300 },
      };

      const viewBox = calculateRegionViewBox(region);
      const [x, y, width, height] = viewBox.split(' ').map(Number);

      // Center of viewBox should be close to region center
      const viewBoxCenterX = x + width / 2;
      const viewBoxCenterY = y + height / 2;

      expect(viewBoxCenterX).toBeCloseTo(region.center.x, 0);
      expect(viewBoxCenterY).toBeCloseTo(region.center.y, 0);
    });

    it('should use default center when center is not provided', () => {
      const regionWithoutCenter = {
        id: 'test-region',
        name: 'Test Region',
        category: 'torso' as const,
      };

      const viewBox = calculateRegionViewBox(regionWithoutCenter);

      // Should not throw and should return valid viewBox
      expect(viewBox).toMatch(/^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/);
    });
  });

  describe('[P2] calculateRegionViewBox - aspect ratio adjustments', () => {
    it('should widen viewBox for very tall narrow regions', () => {
      const narrowRegion = {
        id: 'forearm-left',
        name: 'Left Forearm',
        category: 'limbs' as const,
        center: { x: 100, y: 400 },
      };

      const viewBox = calculateRegionViewBox(narrowRegion);
      const [, , width, height] = viewBox.split(' ').map(Number);

      // For very tall narrow regions, width should be increased to improve aspect ratio
      const aspectRatio = width / height;
      expect(aspectRatio).toBeGreaterThan(0.4); // Not too narrow
    });

    it('should handle regions with different special cases', () => {
      const testCases = [
        { id: 'hand-left', expectedWidth: 70, expectedHeight: 80 },
        { id: 'wrist-left', expectedWidth: 60, expectedHeight: 60 },
        { id: 'elbow-left', expectedWidth: 80, expectedHeight: 80 },
        { id: 'shoulder-left', expectedWidth: 100, expectedHeight: 110 },
      ];

      testCases.forEach(({ id, expectedWidth, expectedHeight }) => {
        const region = {
          id,
          name: id,
          category: 'joints' as const,
          center: { x: 100, y: 200 },
        };

        const viewBox = calculateRegionViewBox(region);
        const [, , width, height] = viewBox.split(' ').map(Number);

        // Width and height should match expected or be adjusted for aspect ratio
        expect(width).toBeGreaterThanOrEqual(expectedWidth * 0.8);
        expect(height).toBeGreaterThanOrEqual(expectedHeight * 0.8);
      });
    });
  });

  describe('[P1] getRegionSVGDefinition', () => {
    it('should return SVG definition for known front view region', () => {
      const result = getRegionSVGDefinition('head-front');

      expect(result).not.toBeNull();
      expect(result?.regionId).toBe('head-front');
      expect(result?.elementType).toBe('ellipse');
      expect(result?.attributes).toHaveProperty('cx');
      expect(result?.attributes).toHaveProperty('cy');
    });

    it('should return SVG definition for path-based region', () => {
      const result = getRegionSVGDefinition('chest-left');

      expect(result).not.toBeNull();
      expect(result?.elementType).toBe('path');
      expect(result?.attributes).toHaveProperty('d');
    });

    it('should return SVG definition for rect-based region', () => {
      const result = getRegionSVGDefinition('neck-front');

      expect(result).not.toBeNull();
      expect(result?.elementType).toBe('rect');
      expect(result?.attributes).toHaveProperty('x');
      expect(result?.attributes).toHaveProperty('y');
      expect(result?.attributes).toHaveProperty('width');
      expect(result?.attributes).toHaveProperty('height');
    });

    it('should include viewBox in the result', () => {
      const result = getRegionSVGDefinition('head-front');

      expect(result?.viewBox).toBeDefined();
      expect(result?.viewBox).toMatch(/^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/);
    });

    it('should handle back view regions', () => {
      const result = getRegionSVGDefinition('head-back');

      expect(result).not.toBeNull();
      expect(result?.regionId).toBe('head-back');
      expect(result?.elementType).toBe('ellipse');
    });
  });

  describe('[P2] getRegionSVGDefinition - unknown regions', () => {
    it('should return default rect for unknown region', () => {
      const result = getRegionSVGDefinition('unknown-region-xyz');

      expect(result).not.toBeNull();
      expect(result?.regionId).toBe('unknown-region-xyz');
      expect(result?.elementType).toBe('rect');
      expect(result?.attributes).toEqual({
        x: '10',
        y: '10',
        width: '80',
        height: '80',
      });
    });

    it('should return default viewBox for unknown region', () => {
      const result = getRegionSVGDefinition('unknown-region');

      expect(result?.viewBox).toBe('0 0 100 100');
    });
  });

  describe('[P1] Integration - multiple regions', () => {
    it('should handle all front view regions without errors', () => {
      const frontRegionIds = [
        'head-front',
        'neck-front',
        'chest-left',
        'chest-right',
        'shoulder-left',
        'shoulder-right',
      ];

      frontRegionIds.forEach(regionId => {
        const regionData = getRegionData(regionId, 'front');
        const svgDef = getRegionSVGDefinition(regionId);

        expect(svgDef).not.toBeNull();
        expect(svgDef?.regionId).toBe(regionId);

        if (regionData) {
          const viewBox = calculateRegionViewBox(regionData);
          expect(viewBox).toMatch(/^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/);
        }
      });
    });

    it('should handle all back view regions without errors', () => {
      const backRegionIds = [
        'head-back',
        'neck-back',
        'upper-back-left',
        'upper-back-right',
      ];

      backRegionIds.forEach(regionId => {
        const regionData = getRegionData(regionId, 'back');
        const svgDef = getRegionSVGDefinition(regionId);

        expect(svgDef).not.toBeNull();
        expect(svgDef?.regionId).toBe(regionId);

        if (regionData) {
          const viewBox = calculateRegionViewBox(regionData);
          expect(viewBox).toMatch(/^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/);
        }
      });
    });
  });
});
