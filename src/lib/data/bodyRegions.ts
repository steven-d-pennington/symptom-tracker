import { BodyRegion } from "../types/body-mapping";

/**
 * Predefined body regions for front view
 * In production, these would have actual SVG path data
 */
export const FRONT_BODY_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: "head-front", name: "Head", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 10 },
  { id: "neck-front", name: "Neck", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 9 },

  // Torso
  { id: "chest-left", name: "Left Chest", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["pain", "rash"] },
  { id: "chest-right", name: "Right Chest", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["pain", "rash"] },
  { id: "abdomen-upper", name: "Upper Abdomen", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8 },
  { id: "abdomen-lower", name: "Lower Abdomen", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8 },
  { id: "groin", name: "Groin", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"] },

  // HS-Specific Regions
  { id: "armpit-left", name: "Left Armpit", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["abscess", "lesion", "pain"] },
  { id: "armpit-right", name: "Right Armpit", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["abscess", "lesion", "pain"] },
  { id: "under-breast-left", name: "Under Left Breast", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"] },
  { id: "under-breast-right", name: "Under Right Breast", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"] },

  // Upper Limbs
  { id: "shoulder-left", name: "Left Shoulder", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "shoulder-right", name: "Right Shoulder", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "upper-arm-left", name: "Left Upper Arm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "upper-arm-right", name: "Right Upper Arm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "elbow-left", name: "Left Elbow", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "elbow-right", name: "Right Elbow", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "forearm-left", name: "Left Forearm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "forearm-right", name: "Right Forearm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "wrist-left", name: "Left Wrist", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "wrist-right", name: "Right Wrist", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "hand-left", name: "Left Hand", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "hand-right", name: "Right Hand", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },

  // Lower Limbs
  { id: "hip-left", name: "Left Hip", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "hip-right", name: "Right Hip", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "thigh-left", name: "Left Thigh", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "thigh-right", name: "Right Thigh", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "inner-thigh-left", name: "Left Inner Thigh", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 6, commonSymptoms: ["lesion", "abscess", "pain"] },
  { id: "inner-thigh-right", name: "Right Inner Thigh", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 6, commonSymptoms: ["lesion", "abscess", "pain"] },
  { id: "knee-left", name: "Left Knee", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "knee-right", name: "Right Knee", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "calf-left", name: "Left Calf", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "calf-right", name: "Right Calf", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "ankle-left", name: "Left Ankle", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "ankle-right", name: "Right Ankle", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "foot-left", name: "Left Foot", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "foot-right", name: "Right Foot", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6 },
];

/**
 * Predefined body regions for back view
 */
export const BACK_BODY_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: "head-back", name: "Back of Head", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 10 },
  { id: "neck-back", name: "Back of Neck", category: "head", side: "center", svgPath: "", selectable: true, zIndex: 9 },

  // Torso
  { id: "upper-back-left", name: "Left Upper Back", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8 },
  { id: "upper-back-right", name: "Right Upper Back", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8 },
  { id: "mid-back-left", name: "Left Mid Back", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8 },
  { id: "mid-back-right", name: "Right Mid Back", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8 },
  { id: "lower-back", name: "Lower Back", category: "torso", side: "center", svgPath: "", selectable: true, zIndex: 8 },
  { id: "buttocks-left", name: "Left Buttock", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"] },
  { id: "buttocks-right", name: "Right Buttock", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"] },

  // Upper Limbs (back view)
  { id: "shoulder-back-left", name: "Back of Left Shoulder", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "shoulder-back-right", name: "Back of Right Shoulder", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "upper-arm-back-left", name: "Back of Left Upper Arm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "upper-arm-back-right", name: "Back of Right Upper Arm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "elbow-back-left", name: "Back of Left Elbow", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "elbow-back-right", name: "Back of Right Elbow", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7 },
  { id: "forearm-back-left", name: "Back of Left Forearm", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7 },
  { id: "forearm-back-right", name: "Back of Right Forearm", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7 },

  // Lower Limbs (back view)
  { id: "thigh-back-left", name: "Back of Left Thigh", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "thigh-back-right", name: "Back of Right Thigh", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "knee-back-left", name: "Back of Left Knee", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "knee-back-right", name: "Back of Right Knee", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6 },
  { id: "calf-back-left", name: "Back of Left Calf", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6 },
  { id: "calf-back-right", name: "Back of Right Calf", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6 },
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
