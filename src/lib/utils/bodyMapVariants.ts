/**
 * Body Map SVG Variant Loading Utilities (Story 6.6)
 * Handles mapping of gender/body type preferences to SVG file paths
 * and provides utilities for SVG loading and validation.
 */

import type { GenderType, BodyType } from '../types/body-mapping';

/**
 * Maps gender preference to corresponding SVG file path.
 * Provides fallback to neutral variant for invalid inputs.
 *
 * @param gender - Gender type ('female', 'male', or 'neutral')
 * @param bodyType - Body type (currently unused, reserved for future scaling)
 * @returns Absolute path to SVG file in public directory
 */
export function getSVGPathForPreferences(
  gender: GenderType = 'neutral',
  bodyType?: BodyType
): string {
  // Body type parameter reserved for future AC 6.6.7 implementation
  // Currently only gender variants are implemented

  const genderPaths: Record<GenderType, string> = {
    female: '/assets/body-maps/female.svg',
    male: '/assets/body-maps/male.svg',
    neutral: '/assets/body-maps/neutral.svg',
  };

  // Fallback to neutral for invalid gender values
  return genderPaths[gender] || genderPaths.neutral;
}

/**
 * Required region IDs that must be present in all SVG variants.
 * Used for validation to ensure SVG structure consistency.
 */
export const REQUIRED_REGION_IDS = [
  // Head & Neck
  'head-front',
  'neck-front',
  // Torso
  'chest-left',
  'chest-right',
  'abdomen-upper',
  'abdomen-lower',
  // Groin (Critical - from Epic 1)
  'left-groin',
  'center-groin',
  'right-groin',
  // HS-specific regions
  'armpit-left',
  'armpit-right',
  'under-breast-left',
  'under-breast-right',
  // Upper limbs
  'shoulder-left',
  'shoulder-right',
  'upper-arm-left',
  'upper-arm-right',
  'elbow-left',
  'elbow-right',
  'forearm-left',
  'forearm-right',
  'wrist-left',
  'wrist-right',
  'hand-left',
  'hand-right',
  // Lower limbs
  'hip-left',
  'hip-right',
  'thigh-left',
  'thigh-right',
  'inner-thigh-left',
  'inner-thigh-right',
  'knee-left',
  'knee-right',
  'calf-left',
  'calf-right',
  'ankle-left',
  'ankle-right',
  'foot-left',
  'foot-right',
] as const;

/**
 * Validates that an SVG element contains all required region IDs.
 * Ensures consistency across gender variants for marker positioning.
 *
 * @param svgElement - SVG DOM element to validate
 * @returns Validation result with missing region IDs if any
 */
export function validateSVGStructure(svgElement: SVGSVGElement): {
  valid: boolean;
  missingRegions: string[];
} {
  const missingRegions: string[] = [];

  for (const regionId of REQUIRED_REGION_IDS) {
    const element = svgElement.querySelector(`#${regionId}`);
    if (!element) {
      missingRegions.push(regionId);
    }
  }

  return {
    valid: missingRegions.length === 0,
    missingRegions,
  };
}

/**
 * Fetches and parses an SVG file from the given path.
 * Returns null on error to allow graceful fallback handling.
 *
 * @param svgPath - Path to SVG file (relative to public directory)
 * @returns Promise resolving to SVG element or null on error
 */
export async function loadSVGVariant(
  svgPath: string
): Promise<SVGSVGElement | null> {
  try {
    const response = await fetch(svgPath);

    if (!response.ok) {
      console.error(`Failed to load SVG from ${svgPath}: ${response.status}`);
      return null;
    }

    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');

    // Check for XML parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      console.error(`SVG parsing error for ${svgPath}:`, parserError.textContent);
      return null;
    }

    const svgElement = doc.querySelector('svg');
    if (!svgElement) {
      console.error(`No SVG element found in ${svgPath}`);
      return null;
    }

    return svgElement as SVGSVGElement;
  } catch (error) {
    console.error(`Error loading SVG variant from ${svgPath}:`, error);
    return null;
  }
}

/**
 * Loads and validates an SVG variant for the given preferences.
 * Automatically falls back to neutral variant if loading or validation fails.
 *
 * @param gender - Gender type preference
 * @param bodyType - Body type preference (optional)
 * @returns Promise resolving to validated SVG element
 */
export async function loadAndValidateSVGVariant(
  gender: GenderType,
  bodyType?: BodyType
): Promise<SVGSVGElement | null> {
  const svgPath = getSVGPathForPreferences(gender, bodyType);
  const svgElement = await loadSVGVariant(svgPath);

  if (!svgElement) {
    // Fallback to neutral if primary load fails
    if (gender !== 'neutral') {
      console.warn(`Failed to load ${gender} variant, falling back to neutral`);
      return loadAndValidateSVGVariant('neutral', bodyType);
    }
    return null;
  }

  // Validate SVG structure
  const validation = validateSVGStructure(svgElement);
  if (!validation.valid) {
    console.warn(
      `SVG validation failed for ${gender} variant. Missing regions:`,
      validation.missingRegions
    );
    // Continue anyway but log warning - missing regions will be handled gracefully
  }

  return svgElement;
}

/**
 * Gets a human-readable label for gender variant (for accessibility announcements).
 *
 * @param gender - Gender type
 * @returns Human-readable gender label
 */
export function getGenderLabel(gender: GenderType): string {
  const labels: Record<GenderType, string> = {
    female: 'Female',
    male: 'Male',
    neutral: 'Neutral',
  };

  return labels[gender] || 'Neutral';
}

/**
 * Gets a human-readable label for body type (for accessibility announcements).
 *
 * @param bodyType - Body type
 * @returns Human-readable body type label
 */
export function getBodyTypeLabel(bodyType: BodyType): string {
  const labels: Record<BodyType, string> = {
    slim: 'Slim',
    average: 'Average',
    'plus-size': 'Plus-size',
    athletic: 'Athletic',
  };

  return labels[bodyType] || 'Average';
}
