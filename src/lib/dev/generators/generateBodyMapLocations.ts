/**
 * Body Map Location Generator
 *
 * Generates BodyMapLocationRecord entries for symptom instances,
 * linking symptoms to specific body regions with coordinate precision.
 */

import { BodyMapLocationRecord, SymptomInstanceRecord } from "@/lib/db/schema";
import { generateId } from "@/lib/utils/idGenerator";
import { GenerationContext } from "./base/types";

/**
 * Common body regions for HS and related symptoms
 */
const BODY_REGIONS = [
  // HS-specific high-risk areas
  'armpit-left',
  'armpit-right',
  'groin-left',
  'groin-right',
  'under-breast-left',
  'under-breast-right',
  'inner-thigh-left',
  'inner-thigh-right',
  'buttocks-left',
  'buttocks-right',
  // General pain areas
  'neck-front',
  'neck-back',
  'shoulder-left',
  'shoulder-right',
  'knee-left',
  'knee-right',
  'wrist-left',
  'wrist-right',
  'ankle-left',
  'ankle-right',
];

/**
 * Map symptom names to likely body regions
 */
function getRegionsForSymptom(symptomName: string): string[] {
  switch (symptomName) {
    case 'Painful Nodules':
    case 'Inflammation':
    case 'Drainage':
    case 'Skin Tunneling':
      // HS-specific symptoms - high-risk areas
      return [
        'armpit-left',
        'armpit-right',
        'groin-left',
        'groin-right',
        'under-breast-left',
        'under-breast-right',
        'inner-thigh-left',
        'inner-thigh-right',
        'buttocks-left',
        'buttocks-right',
      ];

    case 'Headache':
      return ['head-front', 'head-back'];

    case 'Joint Pain':
      return [
        'knee-left',
        'knee-right',
        'shoulder-left',
        'shoulder-right',
        'wrist-left',
        'wrist-right',
        'ankle-left',
        'ankle-right',
        'hip-left',
        'hip-right',
      ];

    case 'Fatigue':
      // Fatigue is systemic, no specific body location
      return [];

    default:
      // Default to common areas
      return BODY_REGIONS;
  }
}

/**
 * Generate realistic coordinates within a body region (normalized 0-1 scale)
 */
function generateCoordinates(): { x: number; y: number } {
  // Generate coordinates with slight clustering (more realistic)
  // Use gaussian-like distribution centered around 0.5
  const gaussianRandom = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num / 10.0 + 0.5; // Scale to 0-1 range, centered at 0.5
  };

  return {
    x: Math.max(0, Math.min(1, gaussianRandom())),
    y: Math.max(0, Math.min(1, gaussianRandom())),
  };
}

/**
 * Generate body map locations for symptom instances
 */
export function generateBodyMapLocations(
  symptomInstances: SymptomInstanceRecord[],
  context: GenerationContext
): BodyMapLocationRecord[] {
  const locations: BodyMapLocationRecord[] = [];
  const now = new Date();

  for (const symptom of symptomInstances) {
    // Get appropriate regions for this symptom type
    const possibleRegions = getRegionsForSymptom(symptom.name);

    // Skip if no regions apply (e.g., Fatigue)
    if (possibleRegions.length === 0) continue;

    // 70% chance to create body map location (not all symptoms logged with location)
    if (Math.random() > 0.7) continue;

    // Select 1-2 regions (some symptoms affect multiple areas)
    const numLocations = Math.random() < 0.7 ? 1 : 2;

    for (let i = 0; i < numLocations && i < possibleRegions.length; i++) {
      // Select random region from possibilities
      const region = possibleRegions[Math.floor(Math.random() * possibleRegions.length)];

      // 60% of locations have precise coordinates, 40% are region-only
      const hasCoordinates = Math.random() < 0.6;
      const coordinates = hasCoordinates ? generateCoordinates() : undefined;

      locations.push({
        id: generateId(),
        userId: context.userId,
        symptomId: symptom.id,
        bodyRegionId: region,
        coordinates,
        severity: symptom.severity,
        notes: coordinates
          ? `Precise location marked on body map`
          : `General ${region.replace(/-/g, ' ')} area`,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  console.log(`[Body Map Locations] Generated ${locations.length} locations for ${symptomInstances.length} symptoms`);

  return locations;
}

/**
 * Generate body map locations specifically for flares
 * (Flares already have bodyRegionId, but we can add detailed coordinate records)
 */
export function generateFlareBodyMapLocations(
  flares: any[], // FlareRecord[]
  context: GenerationContext
): BodyMapLocationRecord[] {
  const locations: BodyMapLocationRecord[] = [];
  const now = new Date();

  for (const flare of flares) {
    // Only create locations for flares that don't already have coordinates
    if (!flare.coordinates) {
      // 50% chance to add detailed body map location
      if (Math.random() < 0.5) {
        locations.push({
          id: generateId(),
          userId: context.userId,
          symptomId: flare.id, // Use flare ID as symptom ID
          bodyRegionId: flare.bodyRegionId,
          coordinates: generateCoordinates(),
          severity: flare.currentSeverity,
          notes: `Flare location detail`,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
  }

  console.log(`[Flare Body Map Locations] Generated ${locations.length} locations for ${flares.length} flares`);

  return locations;
}
