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
 * Predefined body regions for left side view (left profile)
 * Focus on HS-critical areas visible from side angle
 */
export const LEFT_SIDE_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: "head-left-side", name: "Head (Left Side)", category: "head", side: "left", svgPath: "", selectable: true, zIndex: 10, center: { x: 230, y: 50 } },
  { id: "face-left-side", name: "Face (Left Side)", category: "head", side: "left", svgPath: "", selectable: true, zIndex: 10, center: { x: 260, y: 70 } },
  { id: "neck-left-side", name: "Neck (Left Side)", category: "head", side: "left", svgPath: "", selectable: true, zIndex: 9, center: { x: 215, y: 120 } },

  // Upper Body - HS Critical Areas
  { id: "shoulder-left-side", name: "Left Shoulder (Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 175, y: 160 } },
  { id: "armpit-left-side", name: "Left Armpit (Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["abscess", "lesion", "pain"], center: { x: 190, y: 185 } },
  { id: "chest-left-side", name: "Chest (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 240, y: 210 } },
  { id: "breast-left-side", name: "Breast (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 250, y: 230 } },
  { id: "under-breast-left-side", name: "Under Breast (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "pain", "abscess"], center: { x: 240, y: 260 } },

  // Torso
  { id: "upper-back-left-side", name: "Upper Back (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 150, y: 200 } },
  { id: "mid-back-left-side", name: "Mid Back (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 145, y: 280 } },
  { id: "abdomen-upper-left-side", name: "Upper Abdomen (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 220, y: 300 } },
  { id: "abdomen-lower-left-side", name: "Lower Abdomen (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 210, y: 360 } },
  { id: "abdomen-fold-left-side", name: "Abdominal Fold (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"], center: { x: 205, y: 345 } },

  // Lower Back & Hip - HS Critical
  { id: "lower-back-left-side", name: "Lower Back (Left Side)", category: "torso", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 150, y: 350 } },
  { id: "hip-left-side", name: "Hip (Left Side)", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 8, center: { x: 180, y: 390 } },
  { id: "buttocks-left-side", name: "Buttocks (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 155, y: 420 } },
  { id: "buttocks-crease-left-side", name: "Buttocks Crease (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "abscess"], center: { x: 165, y: 455 } },

  // Groin & Upper Thigh - HS Critical
  { id: "groin-left-side", name: "Groin (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 200, y: 410 } },
  { id: "groin-crease-left-side", name: "Groin Crease (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "abscess"], center: { x: 195, y: 425 } },
  { id: "inner-thigh-upper-left-side", name: "Upper Inner Thigh (Left Side)", category: "other", side: "left", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 195, y: 470 } },

  // Arms
  { id: "upper-arm-left-side", name: "Upper Arm (Left Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 155, y: 240 } },
  { id: "elbow-left-side", name: "Elbow (Left Side)", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 145, y: 310 } },
  { id: "forearm-left-side", name: "Forearm (Left Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 150, y: 380 } },
  { id: "wrist-left-side", name: "Wrist (Left Side)", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 155, y: 445 } },
  { id: "hand-left-side", name: "Hand (Left Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 7, center: { x: 160, y: 475 } },

  // Legs
  { id: "thigh-left-side", name: "Thigh (Left Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 185, y: 510 } },
  { id: "knee-left-side", name: "Knee (Left Side)", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 185, y: 570 } },
  { id: "calf-left-side", name: "Calf (Left Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 190, y: 650 } },
  { id: "ankle-left-side", name: "Ankle (Left Side)", category: "joints", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 195, y: 720 } },
  { id: "foot-left-side", name: "Foot (Left Side)", category: "limbs", side: "left", svgPath: "", selectable: true, zIndex: 6, center: { x: 220, y: 760 } },
];

/**
 * Predefined body regions for right side view (right profile)
 * Mirror of left side view with adjusted coordinates
 */
export const RIGHT_SIDE_REGIONS: BodyRegion[] = [
  // Head & Neck
  { id: "head-right-side", name: "Head (Right Side)", category: "head", side: "right", svgPath: "", selectable: true, zIndex: 10, center: { x: 170, y: 50 } },
  { id: "face-right-side", name: "Face (Right Side)", category: "head", side: "right", svgPath: "", selectable: true, zIndex: 10, center: { x: 140, y: 70 } },
  { id: "neck-right-side", name: "Neck (Right Side)", category: "head", side: "right", svgPath: "", selectable: true, zIndex: 9, center: { x: 185, y: 120 } },

  // Upper Body - HS Critical Areas
  { id: "shoulder-right-side", name: "Right Shoulder (Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 225, y: 160 } },
  { id: "armpit-right-side", name: "Right Armpit (Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["abscess", "lesion", "pain"], center: { x: 210, y: 185 } },
  { id: "chest-right-side", name: "Chest (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 160, y: 210 } },
  { id: "breast-right-side", name: "Breast (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 150, y: 230 } },
  { id: "under-breast-right-side", name: "Under Breast (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "pain", "abscess"], center: { x: 160, y: 260 } },

  // Torso
  { id: "upper-back-right-side", name: "Upper Back (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 250, y: 200 } },
  { id: "mid-back-right-side", name: "Mid Back (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 255, y: 280 } },
  { id: "abdomen-upper-right-side", name: "Upper Abdomen (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 180, y: 300 } },
  { id: "abdomen-lower-right-side", name: "Lower Abdomen (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 190, y: 360 } },
  { id: "abdomen-fold-right-side", name: "Abdominal Fold (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "pain"], center: { x: 195, y: 345 } },

  // Lower Back & Hip - HS Critical
  { id: "lower-back-right-side", name: "Lower Back (Right Side)", category: "torso", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 250, y: 350 } },
  { id: "hip-right-side", name: "Hip (Right Side)", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 8, center: { x: 220, y: 390 } },
  { id: "buttocks-right-side", name: "Buttocks (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 245, y: 420 } },
  { id: "buttocks-crease-right-side", name: "Buttocks Crease (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "abscess"], center: { x: 235, y: 455 } },

  // Groin & Upper Thigh - HS Critical
  { id: "groin-right-side", name: "Groin (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 200, y: 410 } },
  { id: "groin-crease-right-side", name: "Groin Crease (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 9, commonSymptoms: ["lesion", "abscess"], center: { x: 205, y: 425 } },
  { id: "inner-thigh-upper-right-side", name: "Upper Inner Thigh (Right Side)", category: "other", side: "right", svgPath: "", selectable: true, zIndex: 8, commonSymptoms: ["lesion", "abscess", "pain"], center: { x: 205, y: 470 } },

  // Arms
  { id: "upper-arm-right-side", name: "Upper Arm (Right Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 245, y: 240 } },
  { id: "elbow-right-side", name: "Elbow (Right Side)", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 255, y: 310 } },
  { id: "forearm-right-side", name: "Forearm (Right Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 250, y: 380 } },
  { id: "wrist-right-side", name: "Wrist (Right Side)", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 245, y: 445 } },
  { id: "hand-right-side", name: "Hand (Right Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 7, center: { x: 240, y: 475 } },

  // Legs
  { id: "thigh-right-side", name: "Thigh (Right Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 215, y: 510 } },
  { id: "knee-right-side", name: "Knee (Right Side)", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 215, y: 570 } },
  { id: "calf-right-side", name: "Calf (Right Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 210, y: 650 } },
  { id: "ankle-right-side", name: "Ankle (Right Side)", category: "joints", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 205, y: 720 } },
  { id: "foot-right-side", name: "Foot (Right Side)", category: "limbs", side: "right", svgPath: "", selectable: true, zIndex: 6, center: { x: 180, y: 760 } },
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
      return LEFT_SIDE_REGIONS;
    case "right":
      return RIGHT_SIDE_REGIONS;
    default:
      return FRONT_BODY_REGIONS;
  }
}

/**
 * Get a body region by its ID from all available regions
 */
export function getBodyRegionById(id: string): BodyRegion | undefined {
  const allRegions = [
    ...FRONT_BODY_REGIONS,
    ...BACK_BODY_REGIONS,
    ...LEFT_SIDE_REGIONS,
    ...RIGHT_SIDE_REGIONS
  ];
  return allRegions.find(region => region.id === id);
}
