import { FRONT_BODY_REGIONS, BACK_BODY_REGIONS } from "@/lib/data/bodyRegions";
import { BodyRegion } from "@/lib/types/body-mapping";

export interface RegionSVGData {
  regionId: string;
  viewBox: string;
  pathData: string;
  elementType: 'ellipse' | 'rect' | 'path' | 'polygon' | 'circle';
  attributes: Record<string, string>;
}

/**
 * Get region metadata from the regions data
 */
export function getRegionData(regionId: string, viewType: "front" | "back" | "left" | "right"): BodyRegion | null {
  const regions = viewType === "front" ? FRONT_BODY_REGIONS : BACK_BODY_REGIONS;
  return regions.find(r => r.id === regionId) || null;
}

/**
 * Calculate viewBox for isolated region based on its center and estimated size
 * This creates a focused view that gives the region maximum space
 */
export function calculateRegionViewBox(regionData: BodyRegion): string {
  // Use the center coordinates to calculate a focused viewBox
  const center = regionData.center || { x: 200, y: 400 };

  // Determine size based on region type
  let width = 200;
  let height = 200;

  // Special handling for specific regions first (tighter framing for smaller regions)
  if (regionData.id.includes('forearm')) {
    // Forearms are narrow and tall (38x110), need tight vertical framing
    width = 55;
    height = 130;
  } else if (regionData.id.includes('upper-arm')) {
    // Upper arms are 40x100
    width = 60;
    height = 120;
  } else if (regionData.id.includes('thigh')) {
    // Thighs are 45x120
    width = 65;
    height = 140;
  } else if (regionData.id.includes('calf')) {
    // Calves are 35x100
    width = 55;
    height = 120;
  } else if (regionData.id.includes('buttocks')) {
    width = 100;
    height = 100;
  } else if (regionData.id.includes('groin') || regionData.id.includes('armpit')) {
    width = 100;
    height = 100;
  } else if (regionData.id.includes('under-breast')) {
    width = 100;
    height = 80;
  } else if (regionData.id.includes('hand') || regionData.id.includes('foot')) {
    width = 70;
    height = 80;
  } else if (regionData.id.includes('wrist') || regionData.id.includes('ankle')) {
    width = 60;
    height = 60;
  } else if (regionData.id.includes('elbow') || regionData.id.includes('knee')) {
    width = 80;
    height = 80;
  } else if (regionData.id.includes('shoulder') || regionData.id.includes('hip')) {
    width = 100;
    height = 110;
  } else if (regionData.category === 'head') {
    width = 150;
    height = 180;
  } else if (regionData.category === 'torso') {
    width = 150;
    height = 140;
  } else if (regionData.category === 'limbs') {
    width = 80;
    height = 130;
  } else if (regionData.category === 'joints') {
    width = 80;
    height = 80;
  }

  // Calculate viewBox with region centered
  let x = center.x - width / 2;
  let y = center.y - height / 2;

  // Adjust aspect ratio to be more viewport-friendly (closer to 4:3 or 16:9)
  // This prevents tall narrow regions from being letterboxed
  const aspectRatio = width / height;
  const targetAspectRatio = 1.2; // Slightly wider than tall, works well for most viewports

  if (aspectRatio < 0.5) {
    // Very tall and narrow (like forearms) - widen the viewBox
    const newWidth = height * targetAspectRatio;
    x = center.x - newWidth / 2;
    width = newWidth;
  } else if (aspectRatio > 2) {
    // Very wide and short - increase height
    const newHeight = width / targetAspectRatio;
    y = center.y - newHeight / 2;
    height = newHeight;
  }

  return `${x} ${y} ${width} ${height}`;
}

/**
 * Get static SVG shape definitions for regions
 * This maps region IDs to their SVG element definitions
 */
export function getRegionSVGDefinition(regionId: string): RegionSVGData | null {
  // Map of region IDs to their SVG definitions
  // These match the definitions in FrontBody.tsx and BackBody.tsx
  const regionDefinitions: Record<string, Partial<RegionSVGData>> = {
    // Front view - Head & Neck
    "head-front": {
      elementType: "ellipse",
      attributes: { cx: "200", cy: "40", rx: "50", ry: "60" }
    },
    "neck-front": {
      elementType: "rect",
      attributes: { x: "175", y: "90", width: "50", height: "40" }
    },

    // Front view - Torso
    "chest-left": {
      elementType: "path",
      attributes: { d: "M 120 140 L 180 140 L 180 260 L 150 280 L 120 260 Z" }
    },
    "chest-right": {
      elementType: "path",
      attributes: { d: "M 220 140 L 280 140 L 280 260 L 250 280 L 220 260 Z" }
    },
    "abdomen-upper": {
      elementType: "rect",
      attributes: { x: "150", y: "280", width: "100", height: "60" }
    },
    "abdomen-lower": {
      elementType: "rect",
      attributes: { x: "150", y: "340", width: "100", height: "60" }
    },

    // Front view - Groin regions
    "left-groin": {
      elementType: "path",
      attributes: { d: "M 150 395 L 180 395 L 175 430 L 145 430 Z" }
    },
    "center-groin": {
      elementType: "path",
      attributes: { d: "M 180 400 L 220 400 L 215 430 L 185 430 Z" }
    },
    "right-groin": {
      elementType: "path",
      attributes: { d: "M 220 395 L 250 395 L 255 430 L 225 430 Z" }
    },

    // Front view - Armpits
    "armpit-left": {
      elementType: "ellipse",
      attributes: { cx: "120", cy: "195", rx: "25", ry: "35" }
    },
    "armpit-right": {
      elementType: "ellipse",
      attributes: { cx: "280", cy: "195", rx: "25", ry: "35" }
    },

    // Front view - Under breast
    "under-breast-left": {
      elementType: "path",
      attributes: { d: "M 140 240 Q 165 255 190 240 L 190 260 Q 165 270 140 260 Z" }
    },
    "under-breast-right": {
      elementType: "path",
      attributes: { d: "M 210 240 Q 235 255 260 240 L 260 260 Q 235 270 210 260 Z" }
    },

    // Front view - Arms
    "shoulder-left": {
      elementType: "ellipse",
      attributes: { cx: "100", cy: "170", rx: "30", ry: "40" }
    },
    "shoulder-right": {
      elementType: "ellipse",
      attributes: { cx: "300", cy: "170", rx: "30", ry: "40" }
    },
    "upper-arm-left": {
      elementType: "rect",
      attributes: { x: "75", y: "210", width: "40", height: "100", rx: "15" }
    },
    "upper-arm-right": {
      elementType: "rect",
      attributes: { x: "285", y: "210", width: "40", height: "100", rx: "15" }
    },
    "elbow-left": {
      elementType: "ellipse",
      attributes: { cx: "95", cy: "325", rx: "20", ry: "22" }
    },
    "elbow-right": {
      elementType: "ellipse",
      attributes: { cx: "305", cy: "325", rx: "20", ry: "22" }
    },
    "forearm-left": {
      elementType: "rect",
      attributes: { x: "75", y: "350", width: "38", height: "110", rx: "12" }
    },
    "forearm-right": {
      elementType: "rect",
      attributes: { x: "287", y: "350", width: "38", height: "110", rx: "12" }
    },
    "wrist-left": {
      elementType: "ellipse",
      attributes: { cx: "92", cy: "465", rx: "15", ry: "12" }
    },
    "wrist-right": {
      elementType: "ellipse",
      attributes: { cx: "308", cy: "465", rx: "15", ry: "12" }
    },
    "hand-left": {
      elementType: "path",
      attributes: { d: "M 77 478 L 107 478 L 110 505 L 105 515 L 100 520 L 95 520 L 90 518 L 85 515 L 80 505 Z" }
    },
    "hand-right": {
      elementType: "path",
      attributes: { d: "M 293 478 L 323 478 L 320 505 L 315 515 L 310 520 L 305 520 L 300 518 L 295 515 L 290 505 Z" }
    },

    // Front view - Legs
    "hip-left": {
      elementType: "ellipse",
      attributes: { cx: "165", cy: "405", rx: "28", ry: "30" }
    },
    "hip-right": {
      elementType: "ellipse",
      attributes: { cx: "235", cy: "405", rx: "28", ry: "30" }
    },
    "thigh-left": {
      elementType: "rect",
      attributes: { x: "145", y: "430", width: "45", height: "120", rx: "10" }
    },
    "thigh-right": {
      elementType: "rect",
      attributes: { x: "210", y: "430", width: "45", height: "120", rx: "10" }
    },
    "inner-thigh-left": {
      elementType: "rect",
      attributes: { x: "185", y: "445", width: "18", height: "90", rx: "8" }
    },
    "inner-thigh-right": {
      elementType: "rect",
      attributes: { x: "197", y: "445", width: "18", height: "90", rx: "8" }
    },
    "knee-left": {
      elementType: "ellipse",
      attributes: { cx: "167", cy: "565", rx: "22", ry: "25" }
    },
    "knee-right": {
      elementType: "ellipse",
      attributes: { cx: "233", cy: "565", rx: "22", ry: "25" }
    },
    "calf-left": {
      elementType: "rect",
      attributes: { x: "154", y: "595", width: "35", height: "100", rx: "10" }
    },
    "calf-right": {
      elementType: "rect",
      attributes: { x: "211", y: "595", width: "35", height: "100", rx: "10" }
    },
    "ankle-left": {
      elementType: "ellipse",
      attributes: { cx: "169", cy: "720", rx: "14", ry: "12" }
    },
    "ankle-right": {
      elementType: "ellipse",
      attributes: { cx: "231", cy: "720", rx: "14", ry: "12" }
    },
    "foot-left": {
      elementType: "path",
      attributes: { d: "M 159 735 L 179 735 L 182 750 L 180 760 L 175 765 L 165 765 L 160 762 L 158 755 Z" }
    },
    "foot-right": {
      elementType: "path",
      attributes: { d: "M 221 735 L 241 735 L 242 755 L 240 762 L 235 765 L 225 765 L 220 760 L 218 750 Z" }
    },

    // Back view - similar structure
    "head-back": {
      elementType: "ellipse",
      attributes: { cx: "200", cy: "40", rx: "50", ry: "60" }
    },
    "neck-back": {
      elementType: "rect",
      attributes: { x: "175", y: "90", width: "50", height: "40" }
    },
    "upper-back-left": {
      elementType: "rect",
      attributes: { x: "120", y: "140", width: "80", height: "100" }
    },
    "upper-back-right": {
      elementType: "rect",
      attributes: { x: "200", y: "140", width: "80", height: "100" }
    },
    "mid-back-left": {
      elementType: "rect",
      attributes: { x: "120", y: "245", width: "80", height: "70" }
    },
    "mid-back-right": {
      elementType: "rect",
      attributes: { x: "200", y: "245", width: "80", height: "70" }
    },
    "lower-back": {
      elementType: "rect",
      attributes: { x: "140", y: "320", width: "120", height: "60" }
    },
    "buttocks-left": {
      elementType: "path",
      attributes: { d: "M 140 380 Q 175 380 175 420 Q 175 440 140 440 Q 120 420 120 400 Q 120 380 140 380" }
    },
    "buttocks-right": {
      elementType: "path",
      attributes: { d: "M 260 380 Q 225 380 225 420 Q 225 440 260 440 Q 280 420 280 400 Q 280 380 260 380" }
    },

    // Back view - Arms
    "shoulder-back-left": {
      elementType: "ellipse",
      attributes: { cx: "100", cy: "170", rx: "30", ry: "40" }
    },
    "shoulder-back-right": {
      elementType: "ellipse",
      attributes: { cx: "300", cy: "170", rx: "30", ry: "40" }
    },
    "upper-arm-back-left": {
      elementType: "rect",
      attributes: { x: "75", y: "210", width: "40", height: "100", rx: "15" }
    },
    "upper-arm-back-right": {
      elementType: "rect",
      attributes: { x: "285", y: "210", width: "40", height: "100", rx: "15" }
    },
    "elbow-back-left": {
      elementType: "ellipse",
      attributes: { cx: "95", cy: "325", rx: "20", ry: "22" }
    },
    "elbow-back-right": {
      elementType: "ellipse",
      attributes: { cx: "305", cy: "325", rx: "20", ry: "22" }
    },
    "forearm-back-left": {
      elementType: "rect",
      attributes: { x: "75", y: "350", width: "38", height: "110", rx: "12" }
    },
    "forearm-back-right": {
      elementType: "rect",
      attributes: { x: "287", y: "350", width: "38", height: "110", rx: "12" }
    },

    // Back view - Legs
    "thigh-back-left": {
      elementType: "rect",
      attributes: { x: "145", y: "445", width: "45", height: "110", rx: "10" }
    },
    "thigh-back-right": {
      elementType: "rect",
      attributes: { x: "210", y: "445", width: "45", height: "110", rx: "10" }
    },
    "knee-back-left": {
      elementType: "ellipse",
      attributes: { cx: "167", cy: "565", rx: "22", ry: "25" }
    },
    "knee-back-right": {
      elementType: "ellipse",
      attributes: { cx: "233", cy: "565", rx: "22", ry: "25" }
    },
    "calf-back-left": {
      elementType: "rect",
      attributes: { x: "154", y: "595", width: "35", height: "100", rx: "10" }
    },
    "calf-back-right": {
      elementType: "rect",
      attributes: { x: "211", y: "595", width: "35", height: "100", rx: "10" }
    },
  };

  const definition = regionDefinitions[regionId];
  if (!definition) {
    // Return a default rectangle for undefined regions
    return {
      regionId,
      viewBox: "0 0 100 100",
      pathData: "",
      elementType: "rect",
      attributes: { x: "10", y: "10", width: "80", height: "80" }
    };
  }

  // Get the region data to calculate proper viewBox
  const regionData = [...FRONT_BODY_REGIONS, ...BACK_BODY_REGIONS].find(r => r.id === regionId);
  const viewBox = regionData ? calculateRegionViewBox(regionData) : "0 0 200 200";

  return {
    regionId,
    viewBox,
    pathData: definition.attributes?.d || "",
    elementType: definition.elementType || "rect",
    attributes: definition.attributes || {}
  } as RegionSVGData;
}