/**
 * googleMapsLoader.ts
 *
 * Loads the Google Maps JavaScript API directly from VITE_MAPS_API_KEY.
 * No backend dependency required.
 *
 * Required Vite env variable:
 *   VITE_MAPS_API_KEY=your_api_key_here
 *
 * Loaded libraries: places, geometry
 */

declare global {
  interface Window { google: any; _googleMapsLoading?: Promise<void>; }
}

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY as string;
const LIBRARIES    = 'places,geometry';

/**
 * Injects the Google Maps script tag once and caches the loading Promise.
 * Safe to call multiple times — script is only injected once.
 */
export function loadGoogleMaps(): Promise<void> {
  // Already loaded
  if (window.google?.maps) {
    return Promise.resolve();
  }

  // Already loading — return same promise
  if (window._googleMapsLoading) {
    return window._googleMapsLoading;
  }

  if (!MAPS_API_KEY) {
    const err = new Error(
      'VITE_MAPS_API_KEY is not set. Add it to your .env file:\n  VITE_MAPS_API_KEY=your_api_key_here'
    );
    console.error('[FloodVision Maps]', err.message);
    return Promise.reject(err);
  }

  const scriptUrl =
    `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=${LIBRARIES}&loading=async`;

  window._googleMapsLoading = new Promise<void>((resolve, reject) => {
    const script       = document.createElement('script');
    script.src         = scriptUrl;
    script.async       = true;
    script.defer       = true;
    script.onload      = () => { window._googleMapsLoading = undefined; resolve(); };
    script.onerror     = () => {
      window._googleMapsLoading = undefined;
      reject(new Error('Google Maps script failed to load. Check your API key and enable Maps JavaScript API + Directions API.'));
    };
    document.head.appendChild(script);
  });

  return window._googleMapsLoading;
}

/**
 * Returns a promise that resolves when window.google.maps is available.
 * Kicks off loadGoogleMaps() if it hasn't been started yet.
 */
export function waitForGoogle(maxMs = 15_000): Promise<void> {
  if (window.google?.maps) return Promise.resolve();

  // Trigger load if not yet started
  loadGoogleMaps().catch(() => {});

  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    const iv = setInterval(() => {
      if (window.google?.maps) {
        clearInterval(iv);
        resolve();
      } else if (Date.now() - t0 > maxMs) {
        clearInterval(iv);
        reject(new Error(
          `Google Maps did not initialise within ${maxMs / 1000}s. ` +
          `Check VITE_MAPS_API_KEY, enable Maps JavaScript API + Directions API in Google Cloud Console, ` +
          `and check browser console for script errors.`
        ));
      }
    }, 100);
  });
}
