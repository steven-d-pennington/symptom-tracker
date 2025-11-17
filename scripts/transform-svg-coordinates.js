/**
 * SVG Path Coordinate Transformation Script
 *
 * Transforms SVG paths from the original coordinate system (5000x5000 with transform matrix)
 * to the target coordinate system (400x800)
 *
 * Original transform: matrix(0.13333333,0,0,-0.13333333,0,666.66667)
 * This scales by 1/7.5 and flips Y axis
 *
 * Usage: node scripts/transform-svg-coordinates.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse SVG path data and extract coordinates
 * Simplified parser for the specific path format we have
 */
function transformPathCoordinates(pathData, transformFn) {
  // Match all number pairs in the path
  return pathData.replace(
    /(-?\d+\.?\d*)\s*,?\s*(-?\d+\.?\d*)/g,
    (match, x, y) => {
      const [newX, newY] = transformFn(parseFloat(x), parseFloat(y));
      return `${newX.toFixed(2)},${newY.toFixed(2)}`;
    }
  );
}

/**
 * Transform from original 5000x5000 space to 666x666 space
 */
function applyOriginalTransform(x, y) {
  const scaleX = 0.13333333;
  const scaleY = -0.13333333;
  const translateY = 666.66667;

  return [
    x * scaleX,
    translateY + (y * scaleY)
  ];
}

/**
 * Transform from 666x666 space to 400x800 space
 * Centers the body and scales to fit
 */
function transformTo400x800(x666, y666) {
  // The 666x666 SVG appears to show the full body
  // We want to fit it into 400x800 while maintaining aspect ratio

  // Scale to fit width (666 -> 400)
  const scale = 400 / 666;

  // Apply scale
  const scaledX = x666 * scale;
  const scaledY = y666 * scale;

  // The scaled height will be ~400 (since it's square source)
  // Center it vertically in 800 height space
  const verticalOffset = (800 - 400) / 2;

  return [
    scaledX,
    scaledY + verticalOffset
  ];
}

/**
 * Complete transformation pipeline
 */
function fullTransform(x, y) {
  const [x666, y666] = applyOriginalTransform(x, y);
  return transformTo400x800(x666, y666);
}

/**
 * Main transformation function
 */
function transformPath(originalPath) {
  return transformPathCoordinates(originalPath, fullTransform);
}

// Front body path (path6) - the main body outline
const frontBodyPath = `m 1449.69,3529.81 -53.42,-459.31 c 9.97,-86.42 -23.93,-209.48 -41.23,-264.87 -3.13,-10.01 -38.31,-145.97 -62.15,-238.38 -14.22,-55.09 -11.67,-113.87 7.2,-167.18 v 0 c 7.02,-19.82 9.66,-40.36 7.8,-60.64 l -13.08,-142.63 c -0.7,-7.67 -2.55,-15.27 -6.16,-21.83 -8.91,-16.19 -17.77,-8.07 -24.24,3.53 -6.9,12.37 -10.06,26.91 -10.36,41.49 l -2.08,102.85 c -14.13,-24.59 -19.1,-53.83 -20.74,-74.75 -1.3,-16.67 3.38,-33.45 13.44,-48.4 l 51.17,-76.05 c 11.48,-17.5 9.98,-30.03 5.18,-38.4 -4.7,-8.2 -18.97,-8.56 -25.25,-0.72 l -21.03,26.23 -73.69,72.73 c -6.42,6.34 -10.91,13.79 -13.09,21.71 l -19.39,70.76 c -1.53,5.59 -1.88,11.31 -1.03,16.92 l 25.37,167.64 c 7.49,49.56 10.92,99.78 10.23,150.03 l -4.73,344.21 c -0.48,35.02 5.58,69.69 17.97,102.84 16.28,43.53 24.1,89.16 23.19,135.17 -2.1,105.08 -6.97,210.18 -6.43,315.3 0.33,64.35 -10.18,318.93 267.93,342.56 l 114.15,-6.22`;

// Back body path (path13) - the main back body outline
const backBodyPath = `m 2146.68,3529.81 53.42,-459.31 c -9.97,-86.42 23.93,-209.48 41.23,-264.87 3.13,-10.01 38.31,-145.97 62.15,-238.38 14.22,-55.09 11.67,-113.87 -7.2,-167.18 v 0 c -7.02,-19.82 -9.66,-40.36 -7.8,-60.64 l 13.08,-142.63 c 0.7,-7.67 2.55,-15.27 6.16,-21.83 8.91,-16.19 17.77,-8.07 24.24,3.53 6.9,12.37 10.06,26.91 10.36,41.49 l 2.08,102.85 c 14.13,-24.59 19.1,-53.83 20.74,-74.75 1.3,-16.67 -3.38,-33.45 -13.44,-48.4 l -51.17,-76.05 c -11.48,-17.5 -9.98,-30.03 -5.18,-38.4 4.7,-8.2 18.97,-8.56 25.25,-0.72 l 21.03,26.23 73.69,72.73 c 6.42,6.34 10.91,13.79 13.09,21.71 l 19.39,70.76 c 1.53,5.59 1.88,11.31 1.03,16.92 l -25.37,167.64 c -7.5,49.56 -10.92,99.78 -10.23,150.03 l 4.73,344.21 c 0.48,35.02 -5.58,69.69 -17.97,102.84 -16.28,43.53 -24.1,89.16 -23.19,135.17 2.1,105.08 6.96,210.18 6.43,315.3 -0.33,64.35 10.18,318.93 -267.93,342.56 l -114.15,-6.22`;

console.log('Transforming SVG paths from original coordinate system to 400x800...\n');

console.log('=== FRONT BODY PATH (Transformed) ===');
const transformedFrontPath = transformPath(frontBodyPath);
console.log(transformedFrontPath);
console.log('\n');

console.log('=== BACK BODY PATH (Transformed) ===');
const transformedBackPath = transformPath(backBodyPath);
console.log(transformedBackPath);
console.log('\n');

// Write to a file for easy copying
const outputPath = path.join(__dirname, '../docs/body-map-options/transformed-paths.txt');
const output = `
TRANSFORMED PATHS FOR 400x800 VIEWBOX
======================================

Front Body Path:
${transformedFrontPath}

Back Body Path:
${transformedBackPath}

USAGE:
Copy these paths into SimplifiedFemaleBody.tsx
Replace the existing path "d" attributes with these transformed versions.
`;

fs.writeFileSync(outputPath, output);
console.log(`✅ Transformed paths written to: ${outputPath}`);
console.log('\nYou can now copy these paths into SimplifiedFemaleBody.tsx');
