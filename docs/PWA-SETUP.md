# PWA Setup Documentation

## Overview

ChainPass is a fully installable Progressive Web App (PWA) that provides a native app-like experience on mobile and desktop devices. Users can install ChainPass to their home screen for faster access, offline functionality, and improved performance.

## PWA Features

### Core Features
- **Installable**: Add to home screen on iOS and Android
- **Offline Support**: Cached pages work offline with service worker
- **Fast Loading**: Static assets cached for instant loading
- **App-like Experience**: Standalone display mode (no browser UI)
- **Push Notifications**: Ready for future push notification support

## Installation Instructions

### For Users

#### Android (Chrome/Edge)
1. Visit ChainPass in your browser
2. Look for the install banner or prompt
3. Tap "Install" when prompted
4. Or use browser menu (⋮) → "Install app" or "Add to Home screen"

#### iOS (Safari)
1. Visit ChainPass in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

### For Developers

#### Testing PWA Installation

**Android:**
- Use Chrome DevTools → Application → Manifest
- Check "Add to homescreen" button
- Test on actual Android device for best results

**iOS:**
- Test on actual iOS device (Safari only)
- Use Chrome DevTools → Application → Manifest (for manifest validation)
- Check responsive design mode

#### Service Worker Testing
1. Open Chrome DevTools → Application → Service Workers
2. Check service worker status
3. Test offline mode: DevTools → Network → Offline
4. Verify cached assets load correctly

## Technical Implementation

### Manifest Configuration

The PWA manifest is configured in `vite.config.ts` using the VitePWA plugin:

```typescript
VitePWA({
  manifest: {
    name: 'ChainPass - Verified Identity Authentication',
    short_name: 'ChainPass',
    theme_color: '#1e3a8a',
    background_color: '#0f172a',
    display: 'standalone',
    orientation: 'portrait',
    // ... icons and screenshots
  }
})
```

### Service Worker Strategy

**Cache-First (Static Assets):**
- JavaScript bundles
- CSS files
- Images (PNG, SVG, etc.)
- Fonts (Google Fonts)

**Network-First (API Calls):**
- Supabase API requests
- Edge function calls
- 5-minute cache expiration

**Offline Fallback:**
- `offline.html` page shown when offline
- Retry button to reconnect
- Link back to home

### Icon Generation

Icons are stored in `public/icons/` directory. Required sizes:
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Maskable versions for Android

**Generation:**
1. Use existing `pwa-192x192.png` or `pwa-512x512.png` as source
2. Resize to all required sizes
3. For maskable icons, ensure safe zone (inner 80% of canvas)
4. Place in `public/icons/` directory

**Tools:**
- ImageMagick: `convert source.png -resize 72x72 icon-72x72.png`
- Online: https://www.pwabuilder.com/imageGenerator
- Sharp (Node.js): Can create script if needed

### Install Prompt Components

**PWAInstallBanner** (`src/components/PWAInstallBanner.tsx`):
- Top banner on landing page
- Shows install prompt when available
- Dismissible with 30-day preference

**PWAInstallPrompt** (`src/components/PWAInstallPrompt.tsx`):
- Floating prompt at bottom of page
- Platform-specific (iOS vs Android)
- Shows instructions modal for iOS

**PWAInstallInstructions** (`src/components/PWAInstallInstructions.tsx`):
- Modal with step-by-step instructions
- iOS: Safari share button instructions
- Android: Browser menu instructions

## Mobile-First Responsive Design

### Touch Targets
- All buttons minimum 44x44px (enforced in `index.css`)
- Proper spacing between interactive elements
- Safe area insets for iOS devices with notch

### Responsive Breakpoints
- Mobile: Default (no prefix)
- Tablet: `sm:` (640px+)
- Desktop: `md:` (768px+)
- Large: `lg:` (1024px+)

### Mobile Optimizations
- Base font size: 16px (prevents iOS zoom on input focus)
- Touch-friendly scrolling: `-webkit-overflow-scrolling: touch`
- Safe area insets: `env(safe-area-inset-*)`
- Viewport meta tag: `width=device-width, initial-scale=1.0, viewport-fit=cover`

### Pages Audited
All critical pages have been audited for mobile responsiveness:
- ✅ Payment Selection & Form
- ✅ Verification Transition & ComplyCube
- ✅ Law Enforcement Declaration
- ✅ Signature Agreement
- ✅ Contract Signature
- ✅ VAI Processing & Success
- ✅ Signup Forms

## Development

### Building for Production

```bash
npm run build
```

The build process will:
1. Generate service worker with Workbox
2. Create manifest.webmanifest
3. Optimize and cache static assets
4. Generate offline fallback page

### Service Worker Updates

Service workers auto-update when new version is deployed. Users will see update prompt on next visit.

### Testing Checklist

- [ ] PWA installs on Android Chrome
- [ ] PWA installs on iOS Safari (with instructions)
- [ ] Offline mode works (cached pages)
- [ ] Service worker updates properly
- [ ] Icons display correctly on home screen
- [ ] All pages are mobile-responsive
- [ ] Touch interactions work properly
- [ ] Camera access works on mobile (facial verification)
- [ ] Forms are usable on mobile
- [ ] No horizontal scrolling on mobile
- [ ] Text is readable without zooming

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify HTTPS (required for service workers)
- Clear browser cache and reload
- Check `vite.config.ts` PWA configuration

### Icons Not Showing
- Verify icons exist in `public/icons/` directory
- Check manifest icon paths
- Clear browser cache
- Regenerate icons if needed

### Install Prompt Not Showing
- Check if already installed (standalone mode)
- Verify `beforeinstallprompt` event is firing
- Check browser support (Chrome/Edge on Android, Safari on iOS)
- Clear localStorage dismiss preference

### Offline Mode Not Working
- Verify service worker is registered
- Check cache in DevTools → Application → Cache Storage
- Ensure `offline.html` exists in `public/` directory
- Test with Network tab set to Offline

## Future Enhancements

- Push notifications for verification status
- Background sync for pending operations
- App shortcuts (Android)
- Share target API
- File system access (for document uploads)

## Resources

- [PWA Builder](https://www.pwabuilder.com/) - PWA testing and optimization
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)









