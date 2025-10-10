/**
 * Photo Annotation Types
 * For drawing shapes, text, and blur regions on medical photos
 */

export type AnnotationTool = 'arrow' | 'circle' | 'rectangle' | 'text' | 'blur' | 'none';

export interface PhotoAnnotation {
  id: string;
  type: AnnotationTool;
  color: string; // Hex color code
  lineWidth: number; // 2 | 4 | 6
  coordinates: AnnotationCoordinates;
  createdAt: Date;
  order: number; // Z-index for layering
}

export interface AnnotationCoordinates {
  // Arrow - all values as percentages (0-100) of image dimensions
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  
  // Circle - all values as percentages
  centerX?: number;
  centerY?: number;
  radius?: number; // Percentage of image width
  
  // Rectangle - all values as percentages
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  
  // Text (future - Story 1.2)
  text?: string;
  fontSize?: number;
  
  // Blur (future - Story 1.3)
  intensity?: number;
  permanent?: boolean;
}

export interface ToolConfig {
  color: string;
  lineWidth: number;
  fontSize?: number;
  blurIntensity?: number;
}

export const ANNOTATION_COLORS = {
  red: '#E53E3E',
  blue: '#3B82F6',
  yellow: '#EAB308',
  green: '#22C55E',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const LINE_WIDTHS = {
  thin: 2,
  medium: 4,
  thick: 6,
} as const;

export const FONT_SIZES = {
  small: 14,
  medium: 18,
  large: 24,
} as const;

export type ColorOption = keyof typeof ANNOTATION_COLORS;
export type LineWidthOption = keyof typeof LINE_WIDTHS;
export type FontSizeOption = keyof typeof FONT_SIZES;
