/**
 * Gaussian Blur Utility
 * Fast box blur approximation for privacy-protecting blur
 */

/**
 * Apply gaussian blur to ImageData using box blur approximation
 * 3 passes of box blur ≈ gaussian blur
 */
export function gaussianBlur(imageData: ImageData, radius: number): ImageData {
  if (radius < 1) return imageData;

  const { width, height, data } = imageData;
  
  // Apply box blur in horizontal and vertical passes
  boxBlur(data, width, height, radius);
  boxBlur(data, width, height, radius);
  boxBlur(data, width, height, radius);

  return imageData;
}

/**
 * Box blur (fast averaging filter)
 */
function boxBlur(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number
): void {
  const tempData = new Uint8ClampedArray(data);
  
  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let kx = -radius; kx <= radius; kx++) {
        const px = x + kx;
        if (px >= 0 && px < width) {
          const kidx = (y * width + px) * 4;
          r += tempData[kidx];
          g += tempData[kidx + 1];
          b += tempData[kidx + 2];
          count++;
        }
      }
      
      data[idx] = r / count;
      data[idx + 1] = g / count;
      data[idx + 2] = b / count;
      // Keep alpha unchanged: data[idx + 3]
    }
  }
  
  // Copy for vertical pass
  tempData.set(data);
  
  // Vertical pass
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let ky = -radius; ky <= radius; ky++) {
        const py = y + ky;
        if (py >= 0 && py < height) {
          const kidx = (py * width + x) * 4;
          r += tempData[kidx];
          g += tempData[kidx + 1];
          b += tempData[kidx + 2];
          count++;
        }
      }
      
      data[idx] = r / count;
      data[idx + 1] = g / count;
      data[idx + 2] = b / count;
      // Keep alpha unchanged: data[idx + 3]
    }
  }
}

/**
 * Apply blur to specific region of canvas
 */
export function blurRegion(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Ensure coordinates are within bounds
  x = Math.max(0, Math.floor(x));
  y = Math.max(0, Math.floor(y));
  width = Math.min(canvas.width - x, Math.floor(width));
  height = Math.min(canvas.height - y, Math.floor(height));

  if (width <= 0 || height <= 0) return;

  // Get region pixels
  const imageData = ctx.getImageData(x, y, width, height);
  
  // Apply blur
  const blurredData = gaussianBlur(imageData, radius);
  
  // Put blurred pixels back
  ctx.putImageData(blurredData, x, y);
}
