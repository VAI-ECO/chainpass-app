# PWA Icons

This directory should contain all required PWA icon sizes.

## Required Icon Sizes

- `icon-72x72.png` - 72x72 pixels
- `icon-96x96.png` - 96x96 pixels
- `icon-128x128.png` - 128x128 pixels
- `icon-144x144.png` - 144x144 pixels
- `icon-152x152.png` - 152x152 pixels (Apple touch icon)
- `icon-192x192.png` - 192x192 pixels
- `icon-384x384.png` - 384x384 pixels
- `icon-512x512.png` - 512x512 pixels

## Maskable Icons

For Android, also create maskable versions:
- `icon-maskable-192x192.png`
- `icon-maskable-512x512.png`

## Generation Instructions

1. Use the existing `pwa-192x192.png` and `pwa-512x512.png` as source
2. Resize to all required sizes using an image editor or tool like:
   - ImageMagick: `convert pwa-512x512.png -resize 72x72 icon-72x72.png`
   - Online tool: https://www.pwabuilder.com/imageGenerator
   - Sharp (Node.js): See `scripts/generate-icons.js` if created

3. For maskable icons, ensure the icon has safe zone (inner 80% of canvas)

## Current Status

Icons are currently using fallback to `/pwa-192x192.png` and `/pwa-512x512.png` in the manifest.
Once icons are generated and placed in this directory, the manifest will automatically use them.









