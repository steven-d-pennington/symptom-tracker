/**
 * Annotation Rendering Utilities
 * Canvas drawing functions for photo annotations
 */

import { PhotoAnnotation, AnnotationCoordinates } from '@/lib/types/annotation';

/**
 * Convert percentage coordinates to pixel coordinates
 */
export function percentToPixel(percent: number, dimension: number): number {
  return (percent / 100) * dimension;
}

/**
 * Convert pixel coordinates to percentage coordinates
 */
export function pixelToPercent(pixel: number, dimension: number): number {
  return (pixel / dimension) * 100;
}

/**
 * Render an arrow annotation on canvas
 */
export function renderArrow(
  ctx: CanvasRenderingContext2D,
  coords: AnnotationCoordinates,
  color: string,
  lineWidth: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (coords.startX === undefined || coords.startY === undefined || 
      coords.endX === undefined || coords.endY === undefined) return;

  const startX = percentToPixel(coords.startX, canvasWidth);
  const startY = percentToPixel(coords.startY, canvasHeight);
  const endX = percentToPixel(coords.endX, canvasWidth);
  const endY = percentToPixel(coords.endY, canvasHeight);

  // Calculate arrow angle
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowHeadLength = lineWidth * 4; // Arrowhead size proportional to line width

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw arrow line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Draw arrowhead
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
    endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
    endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

/**
 * Render a circle annotation on canvas
 */
export function renderCircle(
  ctx: CanvasRenderingContext2D,
  coords: AnnotationCoordinates,
  color: string,
  lineWidth: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (coords.centerX === undefined || coords.centerY === undefined || 
      coords.radius === undefined) return;

  const centerX = percentToPixel(coords.centerX, canvasWidth);
  const centerY = percentToPixel(coords.centerY, canvasHeight);
  const radius = percentToPixel(coords.radius, canvasWidth);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.stroke();
}

/**
 * Wrap text to fit within max width
 */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + word + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine !== '') {
      lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * Get contrasting background color for text
 */
export function getTextBackgroundColor(textColor: string): string {
  // Light text colors need dark background
  const lightColors = ['#FFFFFF', '#EAB308']; // white, yellow
  return lightColors.includes(textColor.toUpperCase())
    ? 'rgba(0, 0, 0, 0.7)'
    : 'rgba(255, 255, 255, 0.7)';
}

/**
 * Render text annotation on canvas
 */
export function renderText(
  ctx: CanvasRenderingContext2D,
  coords: AnnotationCoordinates,
  color: string,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (coords.x === undefined || coords.y === undefined || 
      !coords.text || !coords.fontSize) return;

  const x = percentToPixel(coords.x, canvasWidth);
  const y = percentToPixel(coords.y, canvasHeight);
  const fontSize = coords.fontSize;
  const lineHeight = fontSize * 1.4;
  const maxWidth = canvasWidth * 0.8; // 80% of canvas width
  const padding = 4;
  const borderRadius = 2;

  // Set font
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  ctx.textBaseline = 'top';

  // Wrap text
  const lines = wrapText(ctx, coords.text, maxWidth);

  // Calculate background dimensions
  let maxLineWidth = 0;
  lines.forEach((line) => {
    const metrics = ctx.measureText(line);
    maxLineWidth = Math.max(maxLineWidth, metrics.width);
  });

  const bgWidth = maxLineWidth + padding * 2;
  const bgHeight = lines.length * lineHeight + padding * 2;

  // Draw background with rounded corners
  const bgColor = getTextBackgroundColor(color);
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x - padding, y - padding, bgWidth, bgHeight, borderRadius);
  ctx.fill();

  // Draw text
  ctx.fillStyle = color;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
}

/**
 * Render a rectangle annotation on canvas
 */
export function renderRectangle(
  ctx: CanvasRenderingContext2D,
  coords: AnnotationCoordinates,
  color: string,
  lineWidth: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (coords.x === undefined || coords.y === undefined || 
      coords.width === undefined || coords.height === undefined) return;

  const x = percentToPixel(coords.x, canvasWidth);
  const y = percentToPixel(coords.y, canvasHeight);
  const width = percentToPixel(coords.width, canvasWidth);
  const height = percentToPixel(coords.height, canvasHeight);

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.strokeRect(x, y, width, height);
}

/**
 * Render all annotations on canvas
 */
export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: PhotoAnnotation[],
  canvasWidth: number,
  canvasHeight: number
): void {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Render annotations in order (oldest first for correct layering)
  annotations.forEach((annotation) => {
    switch (annotation.type) {
      case 'arrow':
        renderArrow(
          ctx,
          annotation.coordinates,
          annotation.color,
          annotation.lineWidth,
          canvasWidth,
          canvasHeight
        );
        break;
      case 'circle':
        renderCircle(
          ctx,
          annotation.coordinates,
          annotation.color,
          annotation.lineWidth,
          canvasWidth,
          canvasHeight
        );
        break;
      case 'rectangle':
        renderRectangle(
          ctx,
          annotation.coordinates,
          annotation.color,
          annotation.lineWidth,
          canvasWidth,
          canvasHeight
        );
        break;
      case 'text':
        renderText(
          ctx,
          annotation.coordinates,
          annotation.color,
          canvasWidth,
          canvasHeight
        );
        break;
    }
  });
}
