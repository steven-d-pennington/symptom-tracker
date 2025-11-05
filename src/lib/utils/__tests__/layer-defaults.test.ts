/**
 * Tests for layer-defaults utilities (Story 3.7.3)
 * Validates smart defaults storage, retrieval, and layer independence
 */

import {
  getLayerDefaults,
  setLayerDefaults,
  clearLayerDefaults,
  getAllLayerDefaults,
} from '@/lib/utils/layer-defaults';
import { LayerType } from '@/lib/types/body-mapping';

describe('layer-defaults', () => {
  // Mock localStorage
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock = {};

    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => localStorageMock[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLayerDefaults', () => {
    it('returns null when no defaults exist (first-time user)', () => {
      expect(getLayerDefaults('flares')).toBeNull();
      expect(getLayerDefaults('pain')).toBeNull();
    });

    it('returns layer-specific defaults when they exist', () => {
      // Setup: Save defaults for flares
      const flareDefaults = { severity: 7, notes: 'Painful and swollen' };
      setLayerDefaults('flares', flareDefaults);

      // Test: Retrieve flares defaults
      const result = getLayerDefaults('flares');
      expect(result).toEqual(flareDefaults);
    });

    it('returns default values when layer has no custom defaults but other layers do', () => {
      // Setup: Save defaults for pain only
      setLayerDefaults('pain', { severity: 5, notes: 'Moderate discomfort' });

      // Test: Retrieve flares defaults (should be default empty values, not null)
      // Once one layer is set, all layers get initialized with defaults
      expect(getLayerDefaults('flares')).toEqual({ severity: 5, notes: '' });
    });

    it('validates severity range and returns null for invalid values', () => {
      // Manually set invalid data in localStorage
      localStorageMock['pocket:layerDefaults'] = JSON.stringify({
        flares: { severity: 15, notes: 'Invalid' }, // severity > 10
        pain: { severity: 0, notes: 'Invalid' },    // severity < 1
        mobility: { severity: 5.5, notes: 'Invalid' }, // non-integer
      });

      expect(getLayerDefaults('flares')).toBeNull();
      expect(getLayerDefaults('pain')).toBeNull();
      expect(getLayerDefaults('mobility')).toBeNull();
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorageMock['pocket:layerDefaults'] = 'invalid json';

      expect(getLayerDefaults('flares')).toBeNull();
    });

    it('returns null when notes field is not a string', () => {
      localStorageMock['pocket:layerDefaults'] = JSON.stringify({
        flares: { severity: 5, notes: 123 }, // notes should be string
      });

      expect(getLayerDefaults('flares')).toBeNull();
    });
  });

  describe('setLayerDefaults', () => {
    it('saves layer-specific defaults successfully', () => {
      const defaults = { severity: 8, notes: 'Severe pain' };
      const result = setLayerDefaults('pain', defaults);

      expect(result).toBe(true);
      expect(getLayerDefaults('pain')).toEqual(defaults);
    });

    it('updates existing defaults for a layer', () => {
      // First save
      setLayerDefaults('flares', { severity: 5, notes: 'Initial' });

      // Update
      const updated = { severity: 7, notes: 'Updated notes' };
      setLayerDefaults('flares', updated);

      expect(getLayerDefaults('flares')).toEqual(updated);
    });

    it('rejects invalid severity values (< 1)', () => {
      const result = setLayerDefaults('flares', { severity: 0, notes: 'Test' });

      expect(result).toBe(false);
      expect(getLayerDefaults('flares')).toBeNull();
    });

    it('rejects invalid severity values (> 10)', () => {
      const result = setLayerDefaults('flares', { severity: 11, notes: 'Test' });

      expect(result).toBe(false);
      expect(getLayerDefaults('flares')).toBeNull();
    });

    it('rejects non-integer severity values', () => {
      const result = setLayerDefaults('flares', { severity: 5.5, notes: 'Test' });

      expect(result).toBe(false);
      expect(getLayerDefaults('flares')).toBeNull();
    });

    it('rejects non-string notes values', () => {
      const result = setLayerDefaults('flares', { severity: 5, notes: 123 as any });

      expect(result).toBe(false);
      expect(getLayerDefaults('flares')).toBeNull();
    });

    it('accepts empty string for notes', () => {
      const defaults = { severity: 5, notes: '' };
      const result = setLayerDefaults('flares', defaults);

      expect(result).toBe(true);
      expect(getLayerDefaults('flares')).toEqual(defaults);
    });

    it('preserves other layer defaults when updating one layer', () => {
      // Setup multiple layers
      setLayerDefaults('flares', { severity: 7, notes: 'Flare notes' });
      setLayerDefaults('pain', { severity: 5, notes: 'Pain notes' });

      // Update pain layer
      setLayerDefaults('pain', { severity: 6, notes: 'Updated pain' });

      // Verify flares unchanged
      expect(getLayerDefaults('flares')).toEqual({
        severity: 7,
        notes: 'Flare notes',
      });

      // Verify pain updated
      expect(getLayerDefaults('pain')).toEqual({
        severity: 6,
        notes: 'Updated pain',
      });
    });
  });

  describe('Layer independence (AC 3.7.3.8)', () => {
    it('maintains independent defaults for each layer', () => {
      // Set defaults for all four layers
      setLayerDefaults('flares', { severity: 7, notes: 'Flare notes' });
      setLayerDefaults('pain', { severity: 5, notes: 'Pain notes' });
      setLayerDefaults('mobility', { severity: 3, notes: 'Mobility notes' });
      setLayerDefaults('inflammation', { severity: 6, notes: 'Inflammation notes' });

      // Verify each layer has independent values
      expect(getLayerDefaults('flares')).toEqual({ severity: 7, notes: 'Flare notes' });
      expect(getLayerDefaults('pain')).toEqual({ severity: 5, notes: 'Pain notes' });
      expect(getLayerDefaults('mobility')).toEqual({ severity: 3, notes: 'Mobility notes' });
      expect(getLayerDefaults('inflammation')).toEqual({ severity: 6, notes: 'Inflammation notes' });
    });

    it('changing flare defaults does not affect pain defaults', () => {
      // Set initial defaults for both layers
      setLayerDefaults('flares', { severity: 7, notes: 'Flare notes' });
      setLayerDefaults('pain', { severity: 5, notes: 'Pain notes' });

      // Update flares
      setLayerDefaults('flares', { severity: 9, notes: 'Updated flare' });

      // Verify pain unchanged
      expect(getLayerDefaults('pain')).toEqual({ severity: 5, notes: 'Pain notes' });
    });
  });

  describe('clearLayerDefaults', () => {
    it('clears all layer defaults', () => {
      // Setup defaults
      setLayerDefaults('flares', { severity: 7, notes: 'Test' });
      setLayerDefaults('pain', { severity: 5, notes: 'Test' });

      // Clear
      const result = clearLayerDefaults();

      expect(result).toBe(true);
      expect(getLayerDefaults('flares')).toBeNull();
      expect(getLayerDefaults('pain')).toBeNull();
    });

    it('returns true even when no defaults exist', () => {
      const result = clearLayerDefaults();
      expect(result).toBe(true);
    });
  });

  describe('getAllLayerDefaults', () => {
    it('returns empty structure when no defaults exist', () => {
      const all = getAllLayerDefaults();

      expect(all).toEqual({
        flares: { severity: 5, notes: '' },
        pain: { severity: 5, notes: '' },
        mobility: { severity: 5, notes: '' },
        inflammation: { severity: 5, notes: '' },
      });
    });

    it('returns all layer defaults when they exist', () => {
      // Setup all layers
      setLayerDefaults('flares', { severity: 7, notes: 'Flare notes' });
      setLayerDefaults('pain', { severity: 5, notes: 'Pain notes' });
      setLayerDefaults('mobility', { severity: 3, notes: 'Mobility notes' });
      setLayerDefaults('inflammation', { severity: 6, notes: 'Inflammation notes' });

      const all = getAllLayerDefaults();

      expect(all).toEqual({
        flares: { severity: 7, notes: 'Flare notes' },
        pain: { severity: 5, notes: 'Pain notes' },
        mobility: { severity: 3, notes: 'Mobility notes' },
        inflammation: { severity: 6, notes: 'Inflammation notes' },
      });
    });

    it('returns empty structure when localStorage contains invalid data', () => {
      localStorageMock['pocket:layerDefaults'] = 'invalid json';

      const all = getAllLayerDefaults();

      expect(all).toEqual({
        flares: { severity: 5, notes: '' },
        pain: { severity: 5, notes: '' },
        mobility: { severity: 5, notes: '' },
        inflammation: { severity: 5, notes: '' },
      });
    });
  });

  describe('Persistence across sessions (AC 3.7.3.7)', () => {
    it('simulates persistence by storing and retrieving after mock "restart"', () => {
      // Session 1: Set defaults
      setLayerDefaults('flares', { severity: 8, notes: 'Persistent notes' });

      // Simulate app restart by getting fresh reference
      const stored = localStorageMock['pocket:layerDefaults'];
      expect(stored).toBeDefined();

      // Session 2: Retrieve defaults (simulating new session)
      const retrieved = getLayerDefaults('flares');
      expect(retrieved).toEqual({ severity: 8, notes: 'Persistent notes' });
    });
  });

  describe('Edge cases and error handling', () => {
    it('handles boundary severity values (1 and 10)', () => {
      expect(setLayerDefaults('flares', { severity: 1, notes: 'Min' })).toBe(true);
      expect(setLayerDefaults('pain', { severity: 10, notes: 'Max' })).toBe(true);

      expect(getLayerDefaults('flares')).toEqual({ severity: 1, notes: 'Min' });
      expect(getLayerDefaults('pain')).toEqual({ severity: 10, notes: 'Max' });
    });

    it('handles very long notes strings', () => {
      const longNotes = 'A'.repeat(1000);
      const result = setLayerDefaults('flares', { severity: 5, notes: longNotes });

      expect(result).toBe(true);
      expect(getLayerDefaults('flares')?.notes).toBe(longNotes);
    });

    it('handles special characters in notes', () => {
      const specialNotes = 'Test 🔥 with émojis & spëcial çharacters!';
      setLayerDefaults('flares', { severity: 5, notes: specialNotes });

      expect(getLayerDefaults('flares')?.notes).toBe(specialNotes);
    });
  });
});
