import { BodyRegion } from "../types/body-mapping";

/**
 * Predefined body regions for front view
 * In production, these would have actual SVG path data
 */
export const FRONT_BODY_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: "head-front", name: "Head", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 10, center: { x: 200, y: 60 } },
  { id: "neck-front", name: "Neck", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 9, center: { x: 200, y: 130 } },

  // Torso
  { id: "chest-left", name: "Left Chest", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["pain", "rash"], center: { x: 165, y: 205 } },
  { id: "chest-right", name: "Right Chest", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["pain", "rash"], center: { x: 235, y: 205 } },
  { id: "abdomen-upper", name: "Upper Abdomen", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8, center: { x: 200, y: 295 } },
  { id: "abdomen-lower", name: "Lower Abdomen", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8, center: { x: 200, y: 355 } },

  // HS-Specific Regions - Groin
  { id: "left-groin", name: "Left Groin", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 175, y: 410 } },
  { id: "center-groin", name: "Center Groin", category: "other", side: "center", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 200, y: 415 } },
  { id: "right-groin", name: "Right Groin", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 225, y: 410 } },

  // HS-Specific Regions - Armpits
  { id: "armpit-left", name: "Left Armpit", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["abscess", "lesion", "pain"], center: { x: 145, y: 195 } },
  { id: "armpit-right", name: "Right Armpit", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["abscess", "lesion", "pain"], center: { x: 255, y: 195 } },
  { id: "under-breast-left", name: "Under Left Breast", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"], center: { x: 165, y: 250 } },
  { id: "under-breast-right", name: "Under Right Breast", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"], center: { x: 235, y: 250 } },

  // Upper Limbs
  { id: "shoulder-left", name: "Left Shoulder", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 120, y: 170 } },
  { id: "shoulder-right", name: "Right Shoulder", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 280, y: 170 } },
  { id: "upper-arm-left", name: "Left Upper Arm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 95, y: 255 } },
  { id: "upper-arm-right", name: "Right Upper Arm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 305, y: 255 } },
  { id: "elbow-left", name: "Left Elbow", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 95, y: 325 } },
  { id: "elbow-right", name: "Right Elbow", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 305, y: 325 } },
  { id: "forearm-left", name: "Left Forearm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 92, y: 400 } },
  { id: "forearm-right", name: "Right Forearm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 308, y: 400 } },
  { id: "wrist-left", name: "Left Wrist", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 92, y: 465 } },
  { id: "wrist-right", name: "Right Wrist", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 308, y: 465 } },
  { id: "hand-left", name: "Left Hand", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 92, y: 495 } },
  { id: "hand-right", name: "Right Hand", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 308, y: 495 } },

  // Lower Limbs
  { id: "hip-left", name: "Left Hip", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 145, y: 385 } },
  { id: "hip-right", name: "Right Hip", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 255, y: 385 } },
  { id: "thigh-left", name: "Left Thigh", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 167, y: 490 } },
  { id: "thigh-right", name: "Right Thigh", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 233, y: 490 } },
  { id: "inner-thigh-left", name: "Left Inner Thigh", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 6, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 190, y: 490 } },
  { id: "inner-thigh-right", name: "Right Inner Thigh", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 6, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 210, y: 490 } },
  { id: "knee-left", name: "Left Knee", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 167, y: 565 } },
  { id: "knee-right", name: "Right Knee", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 233, y: 565 } },
  { id: "calf-left", name: "Left Calf", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 169, y: 650 } },
  { id: "calf-right", name: "Right Calf", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 231, y: 650 } },
  { id: "ankle-left", name: "Left Ankle", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 169, y: 720 } },
  { id: "ankle-right", name: "Right Ankle", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 231, y: 720 } },
  { id: "foot-left", name: "Left Foot", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 169, y: 755 } },
  { id: "foot-right", name: "Right Foot", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 231, y: 755 } },
];

/**
 * Predefined body regions for back view
 */
export const BACK_BODY_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: "head-back", name: "Back of Head", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 10, center: { x: 200, y: 60 } },
  { id: "neck-back", name: "Back of Neck", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 9, center: { x: 200, y: 130 } },

  // Torso
  { id: "upper-back-left", name: "Left Upper Back", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 165, y: 200 } },
  { id: "upper-back-right", name: "Right Upper Back", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 235, y: 200 } },
  { id: "mid-back-left", name: "Left Mid Back", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 165, y: 280 } },
  { id: "mid-back-right", name: "Right Mid Back", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 235, y: 280 } },
  { id: "lower-back", name: "Lower Back", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8, center: { x: 200, y: 350 } },
  { id: "buttocks-left", name: "Left Buttock", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 175, y: 400 } },
  { id: "buttocks-right", name: "Right Buttock", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 225, y: 400 } },

  // Upper Limbs (back view)
  { id: "shoulder-back-left", name: "Back of Left Shoulder", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 120, y: 170 } },
  { id: "shoulder-back-right", name: "Back of Right Shoulder", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 280, y: 170 } },
  { id: "upper-arm-back-left", name: "Back of Left Upper Arm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 95, y: 255 } },
  { id: "upper-arm-back-right", name: "Back of Right Upper Arm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 305, y: 255 } },
  { id: "elbow-back-left", name: "Back of Left Elbow", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 95, y: 325 } },
  { id: "elbow-back-right", name: "Back of Right Elbow", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 305, y: 325 } },
  { id: "forearm-back-left", name: "Back of Left Forearm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 92, y: 400 } },
  { id: "forearm-back-right", name: "Back of Right Forearm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 308, y: 400 } },

  // Lower Limbs (back view)
  { id: "thigh-back-left", name: "Back of Left Thigh", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 167, y: 490 } },
  { id: "thigh-back-right", name: "Back of Right Thigh", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 233, y: 490 } },
  { id: "knee-back-left", name: "Back of Left Knee", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 167, y: 565 } },
  { id: "knee-back-right", name: "Back of Right Knee", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 233, y: 565 } },
  { id: "calf-back-left", name: "Back of Left Calf", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 169, y: 650 } },
  { id: "calf-back-right", name: "Back of Right Calf", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 231, y: 650 } },
];

/**
 * Get regions for a specific view
 */
export function getRegionsForView(view: "front" | "back" | "left" | "right"): BodyRegion[] {
  switch (view) {
    case "front":
      return FRONT_BODY_REGIONS;
    case "back":
      return BACK_BODY_REGIONS;
    case "left":
    case "right":
      // For now, use front regions for side views
      // In production, we'd have dedicated side view regions
      return FRONT_BODY_REGIONS;
    default:
      return FRONT_BODY_REGIONS;
  }
}

/**
 * Get a body region by its ID from all available regions
 */
export function getBodyRegionById(id: string): BodyRegion | undefined {
  const allRegions = [...FRONT_BODY_REGIONS, ...BACK_BODY_REGIONS];
  return allRegions.find(region => region.id === id);
}
