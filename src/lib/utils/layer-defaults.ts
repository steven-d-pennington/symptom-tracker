/**
 * Layer Defaults Persistence
 * Utilities for managing layer-specific smart defaults in localStorage
 */

import { LayerType, LayerDefaultValue, LayerDefaults, isValidSeverity } from '@/lib/types/body-mapping';

/**
 * Storage key for layer defaults in localStorage
 */
const STORAGE_KEY = 'pocket:layerDefaults';

/**
 * Default severity value for first-time users (mid-range)
 */
const DEFAULT_SEVERITY = 5;

/**
 * Retrieves layer-specific defaults from localStorage
 * @param layer - The tracking layer type (flares, pain, mobility, inflammation)
 * @returns Layer default values, or null if not found or invalid
 */
export const getLayerDefaults = (layer: LayerType): LayerDefaultValue | null => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed: LayerDefaults = JSON.parse(stored);

    // Validate the parsed data
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const layerData = parsed[layer];
    if (!layerData || typeof layerData !== 'object') {
      return null;
    }

    // Validate severity is in valid range
    if (typeof layerData.severity !== 'number' || !isValidSeverity(layerData.severity)) {
      return null;
    }

    // Validate notes is a string
    if (typeof layerData.notes !== 'string') {
      return null;
    }

    return layerData;
  } catch (error) {
    // JSON parse error or other localStorage errors
    console.warn(`Failed to retrieve layer defaults for ${layer}:`, error);
    return null;
  }
};

/**
 * Saves layer-specific defaults to localStorage
 * @param layer - The tracking layer type
 * @param defaults - Default values to save (severity and notes)
 * @returns true if save succeeded, false otherwise
 */
export const setLayerDefaults = (
  layer: LayerType,
  defaults: LayerDefaultValue
): boolean => {
  try {
    // Check if localStorage is available
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    // Validate input
    if (!isValidSeverity(defaults.severity)) {
      console.warn(`Invalid severity value: ${defaults.severity}. Must be 1-10.`);
      return false;
    }

    if (typeof defaults.notes !== 'string') {
      console.warn('Invalid notes value. Must be a string.');
      return false;
    }

    // Load existing defaults or create new structure
    let allDefaults: LayerDefaults;
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (stored) {
      try {
        allDefaults = JSON.parse(stored);
      } catch {
        // If parsing fails, create new structure
        allDefaults = createEmptyDefaults();
      }
    } else {
      allDefaults = createEmptyDefaults();
    }

    // Update the specific layer
    allDefaults[layer] = {
      severity: defaults.severity,
      notes: defaults.notes,
    };

    // Save to localStorage
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(allDefaults));
    return true;
  } catch (error) {
    // localStorage quota exceeded or other errors
    console.error(`Failed to save layer defaults for ${layer}:`, error);
    return false;
  }
};

/**
 * Creates an empty LayerDefaults structure with initial values
 * @returns Empty defaults structure with default severity for all layers
 */
const createEmptyDefaults = (): LayerDefaults => {
  return {
    flares: { severity: DEFAULT_SEVERITY, notes: '' },
    pain: { severity: DEFAULT_SEVERITY, notes: '' },
    mobility: { severity: DEFAULT_SEVERITY, notes: '' },
    inflammation: { severity: DEFAULT_SEVERITY, notes: '' },
  };
};

/**
 * Clears all layer defaults from localStorage
 * Useful for testing or user preference reset
 * @returns true if clear succeeded, false otherwise
 */
export const clearLayerDefaults = (): boolean => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    window.localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear layer defaults:', error);
    return false;
  }
};

/**
 * Gets all layer defaults at once
 * @returns All layer defaults, or empty structure if none exist
 */
export const getAllLayerDefaults = (): LayerDefaults => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return createEmptyDefaults();
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyDefaults();
    }

    const parsed: LayerDefaults = JSON.parse(stored);

    // Validate structure
    if (!parsed || typeof parsed !== 'object') {
      return createEmptyDefaults();
    }

    return parsed;
  } catch (error) {
    console.warn('Failed to retrieve all layer defaults:', error);
    return createEmptyDefaults();
  }
};
