/**
 * Body Mapping Types
 * Types for anatomical body mapping and symptom location tracking
 */

export type BodyRegionCategory = 'head' | 'torso' | 'limbs' | 'joints' | 'other';
export type BodySide = 'left' | 'right' | 'center';
export type BodyViewType = 'front' | 'back' | 'left' | 'right';

/**
 * Defines a selectable region on the body map
 */
export interface BodyRegion {
  id: string;
  name: string;
  category: BodyRegionCategory;
  side?: BodySide;
  svgPath: string; // SVG path data for the region
  commonSymptoms?: string[]; // Common symptoms for this area
  selectable: boolean;
  zIndex: number;
}

/**
 * Records a symptom location on the body map
 */
export interface BodyMapLocation {
  id: string;
  userId: string;
  dailyEntryId?: string;
  symptomId: string;
  bodyRegionId: string;
  coordinates?: {
    x: number; // Normalized 0-1
    y: number; // Normalized 0-1
  };
  severity: number; // 1-10
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a body view with its regions
 */
export interface BodyView {
  id: BodyViewType;
  name: string;
  regions: BodyRegion[];
  svgContent?: string;
}

/**
 * Severity color mapping for visual representation
 */
export const SEVERITY_COLORS = {
  minimal: '#10b981',    // green - 1-2
  mild: '#fbbf24',       // yellow - 3-4
  moderate: '#f59e0b',   // orange - 5-6
  severe: '#ef4444',     // red - 7-8
  extreme: '#991b1b',    // dark red - 9-10
} as const;

/**
 * Get color for a severity level
 */
export function getSeverityColor(severity: number): string {
  if (severity <= 2) return SEVERITY_COLORS.minimal;
  if (severity <= 4) return SEVERITY_COLORS.mild;
  if (severity <= 6) return SEVERITY_COLORS.moderate;
  if (severity <= 8) return SEVERITY_COLORS.severe;
  return SEVERITY_COLORS.extreme;
}

/**
 * Body region categories for HS-specific tracking
 */
export const BODY_REGIONS = {
  HEAD: ['scalp', 'face', 'ears', 'neck'],
  TORSO: ['chest', 'abdomen', 'back', 'groin'],
  UPPER_LIMBS: ['shoulders', 'arms', 'elbows', 'forearms', 'wrists', 'hands'],
  LOWER_LIMBS: ['hips', 'thighs', 'knees', 'calves', 'ankles', 'feet'],
  SPECIAL: ['armpits', 'under_breasts', 'inner_thighs', 'buttocks'], // HS-specific
} as const;
