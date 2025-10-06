/**
 * Generate PWA icons from SVG
 * This is a placeholder script - icons should be generated using a proper tool
 * For now, we'll create simple colored squares as placeholders
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple SVG placeholders for each size
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.15}" fill="white" text-anchor="middle" dominant-baseline="middle">ST</text>
</svg>`;

  fs.writeFileSync(
    path.join(iconsDir, `icon-${size}x${size}.png.svg`),
    svg
  );

  console.log(`Created icon-${size}x${size}.png.svg`);
});

// Create shortcut icons
const shortcutSvg = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#10b981"/>
  <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">+</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'shortcut-new.png.svg'), shortcutSvg);

const calendarSvg = `<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" fill="#8b5cf6"/>
  <text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dominant-baseline="middle">📅</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'shortcut-calendar.png.svg'), calendarSvg);

console.log('Icon generation complete!');
console.log('Note: These are SVG placeholders. Convert to PNG using an image tool for production.');
