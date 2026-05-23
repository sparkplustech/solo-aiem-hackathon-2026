/**
 * Diagnostic script for Google Maps loader
 * Add this to main.tsx temporarily to debug
 */

import { loadGoogleMaps } from './googleMapsLoader';

export async function diagnoseGoogleMaps() {
  console.log('🔍 Starting Google Maps diagnostics...');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  console.log(`Backend URL: ${backendUrl}`);
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing backend health...');
    const healthRes = await fetch(`${backendUrl}/api/health/`);
    const health = await healthRes.json();
    console.log('✅ Health check:', health);
    
    // Test 2: Google Maps config
    console.log('\n2️⃣ Testing Google Maps config endpoint...');
    const configRes = await fetch(`${backendUrl}/api/google-maps-config/`);
    if (!configRes.ok) {
      console.error(`❌ Config endpoint failed: ${configRes.status} ${configRes.statusText}`);
      const error = await configRes.json();
      console.error('Error details:', error);
      return;
    }
    const config = await configRes.json();
    console.log('✅ Config received:', {
      apiKey: config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'MISSING',
      libraries: config.libraries,
    });
    
    // Test 3: Load Google Maps
    console.log('\n3️⃣ Attempting to load Google Maps script...');
    await loadGoogleMaps();
    console.log('✅ Google Maps script loaded');
    
    // Test 4: Check window.google
    console.log('\n4️⃣ Checking window.google availability...');
    if (window.google?.maps) {
      console.log('✅ window.google.maps is available');
      console.log('Available services:', {
        Map: !!window.google.maps.Map,
        Marker: !!window.google.maps.Marker,
        DirectionsService: !!window.google.maps.DirectionsService,
      });
    } else {
      console.error('❌ window.google.maps is NOT available');
    }
    
    console.log('\n✅ All diagnostics passed!');
  } catch (error) {
    console.error('\n❌ Diagnostic failed:', error);
  }
}

// Run diagnostics when the script loads
diagnoseGoogleMaps();
