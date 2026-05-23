import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { loadGoogleMaps } from './utils/googleMapsLoader.ts';

// Pre-load Google Maps from VITE_MAPS_API_KEY (non-blocking)
// The script is injected once here so it's available across all views.
loadGoogleMaps().catch((error) => {
  console.error('[FloodVision] Failed to load Google Maps:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
