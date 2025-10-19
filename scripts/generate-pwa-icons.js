/**
 * Simple PWA Icon Generator
 * Creates placeholder icons with "DK" text on gradient background
 * 
 * To use:
 * 1. Install sharp: npm install sharp
 * 2. Run: node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG template
function generateSVG(size) {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f7e7f0;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e8d5df;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="#8b4d6f" text-anchor="middle" dominant-baseline="central">DK</text>
</svg>`;
}

// Try to use sharp if available, otherwise create SVG files
try {
  const sharp = require('sharp');
  
  console.log('🎨 Generating PWA icons with sharp...\n');
  
  sizes.forEach(async (size) => {
    const svg = Buffer.from(generateSVG(size));
    const outputPath = path.join(iconsDir, `icon-${size}.png`);
    
    try {
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`✅ Generated icon-${size}.png`);
    } catch (err) {
      console.error(`❌ Error generating icon-${size}.png:`, err.message);
    }
  });
  
  console.log('\n✨ All icons generated successfully!');
} catch (err) {
  console.log('⚠️  sharp not installed. Installing SVG placeholders instead...\n');
  console.log('For better quality PNG icons, run: npm install sharp && node scripts/generate-pwa-icons.js\n');
  
  // Fallback: create SVG files
  sizes.forEach((size) => {
    const svg = generateSVG(size);
    const outputPath = path.join(iconsDir, `icon-${size}.svg`);
    fs.writeFileSync(outputPath, svg);
    console.log(`✅ Generated icon-${size}.svg (placeholder)`);
  });
  
  console.log('\n⚠️  Note: SVG files created. For production, generate PNG files or use custom icons.');
}

