import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  CloudRain,
  RefreshCw,
  Zap,
  Droplets,
  Wind,
  Activity,
  AlertTriangle,
  Radio,
  Waves,
  ScanLine,
  MapPin,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../store';
import { ThemeVariant } from '../types';

declare global {
  interface Window { google: any }
}

// ── Types ────────────────────────────────────────────────────────────────────
type RainfallBand = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';

interface GridSector {
  id: string;
  name: string;
  lat: number;
  lng: number;
  mmPerHour: number;
  band: RainfallBand;
  humidity: number;
  windKph: number;
  updatedAt: number;
}

interface ActiveOverlay {
  circle: any;
  infoMarker: any;
  sectorId: string;
}

// ── Constants & Visual Styling Design Tokens ─────────────────────────────────
const MAPUSA_CENTER = { lat: 15.5938, lng: 73.8035 };

const DARK_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0f172a' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020617' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1e293b' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const BAND_THRESHOLDS = { LOW: 2.5, MEDIUM: 10.0 } as const;

const BAND_STYLE: Record<RainfallBand, {
  fill: string; stroke: string; text: string; bg: string; border: string;
  label: string; sub: string;
}> = {
  NONE:   { fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0.05)', text: 'text-slate-500', bg: 'bg-slate-950/40', border: 'border-slate-900', label: 'Clear Sky', sub: '0.0 mm/hr' },
  LOW:    { fill: 'rgba(52,211,153,0.12)', stroke: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Light Drizzle', sub: '< 2.5 mm/hr' },
  MEDIUM: { fill: 'rgba(245,158,11,0.15)', stroke: '#f59e0b', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Steady Rain', sub: '2.5–10 mm/hr' },
  HIGH:   { fill: 'rgba(239,68,68,0.22)', stroke: '#ef4444', text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Cloudburst', sub: '> 10 mm/hr' },
};

const SECTOR_RADIUS = 350; // Compact grids matching Mapusa layout limits
const LIVE_REFRESH_MS = 60000;

// Localized Mapusa Geo-Spatial Grid Matrix sectors
const MAPUSA_SECTORS: Omit<GridSector, 'band'>[] = [
  { id: 'MPS-K01', name: 'Khorlim Down Basin', lat: 15.5962, lng: 73.7981, mmPerHour: 12.4, humidity: 89, windKph: 24, updatedAt: Date.now() },
  { id: 'MPS-P02', name: 'Peddem Highland Grid', lat: 15.6025, lng: 73.8082, mmPerHour: 1.2, humidity: 76, windKph: 14, updatedAt: Date.now() },
  { id: 'MPS-A03', name: 'Altinho Central Ridge', lat: 15.5904, lng: 73.8012, mmPerHour: 4.8, humidity: 82, windKph: 18, updatedAt: Date.now() },
  { id: 'MPS-M04', name: 'Mapusa Market Lowline', lat: 15.5928, lng: 73.8095, mmPerHour: 24.1, humidity: 94, windKph: 32, updatedAt: Date.now() },
  { id: 'MPS-G05', name: 'Ganeshpuri Valley Node', lat: 15.6041, lng: 73.7942, mmPerHour: 0.0, humidity: 68, windKph: 8, updatedAt: Date.now() },
  { id: 'MPS-C06', name: 'Carrasco Flood Plain', lat: 15.5821, lng: 73.8114, mmPerHour: 8.5, humidity: 87, windKph: 21, updatedAt: Date.now() },
];

function classifyBand(mmhr: number): RainfallBand {
  if (mmhr <= 0) return 'NONE';
  if (mmhr < BAND_THRESHOLDS.LOW) return 'LOW';
  if (mmhr < BAND_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'HIGH';
}

function withBand(s: Omit<GridSector, 'band'>): GridSector {
  return { ...s, band: classifyBand(s.mmPerHour) };
}

export default function RainRadarView(): React.ReactElement {
  const { activeLayout } = useAppStore();
  const isGlass = activeLayout === ThemeVariant.GLASSMORPHISM;

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const overlaysRef = useRef<ActiveOverlay[]>([]);
  const liveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── States ─────────────────────────────────────────────────────────────────
  const [mapsReady, setMapsReady] = useState(false);
  const [sectors, setSectors] = useState<GridSector[]>([]);
  const [simRain, setSimRain] = useState(0); 
  const [simActive, setSimActive] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [liveMode, setLiveMode] = useState(false);

  const mapsApiKey = import.meta.env.VITE_MAPS_API_KEY as string | undefined;
  const weatherApiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

  // ── Geo-Data Scaling Logic ────────────────────────────────────────────────
  const displaySectors = useMemo<GridSector[]>(() => {
    if (!simActive || sectors.length === 0) return sectors;
    return sectors.map((s, i) => {
      const variance = 0.5 + ((i * 43) % 90) / 100;
      const mm = parseFloat((simRain * variance).toFixed(2));
      return withBand({ ...s, mmPerHour: mm, updatedAt: Date.now() });
    });
  }, [sectors, simRain, simActive]);

  const highSectors = useMemo(() => displaySectors.filter((s) => s.band === 'HIGH'), [displaySectors]);

  // ── Initialize Google Maps script safely ──────────────────────────────────
  useEffect(() => {
    if (!mapsApiKey) return;

    const initGoogleMapInstance = () => {
      if (!mapDivRef.current || mapRef.current || !window.google?.maps) return;
      
      setMapsReady(true);
      mapRef.current = new window.google.maps.Map(mapDivRef.current, {
        center: MAPUSA_CENTER,
        zoom: 13,
        styles: DARK_RADAR_MAP_STYLE || DARK_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
      });
    };

    if (window.google?.maps) {
      initGoogleMapInstance();
    } else {
      const existingScript = document.querySelector('script[data-radar-gmaps="true"]');
      if (existingScript) {
        existingScript.addEventListener('load', initGoogleMapInstance);
      } else {
        const script = document.createElement('script');
        script.dataset.radarGmaps = 'true';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}`;
        script.async = true;
        script.onload = initGoogleMapInstance;
        document.head.appendChild(script);
      }
    }
  }, [mapsApiKey]);

  // ── Hydrometric Data Extraction Layer ──────────────────────────────────────
  const loadData = useCallback(async (force = false) => {
    if (fetching && !force) return;
    setFetching(true);
    setFetchError('');

    try {
      if (weatherApiKey && weatherApiKey !== 'mock_key') {
        const fetchedSectors = await Promise.all(
          MAPUSA_SECTORS.map(async (s) => {
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lng}&appid=${weatherApiKey}&units=metric`
            );
            if (!response.ok) throw new Error(`OWM Error Status ${response.status}`);
            const data = await response.json();
            const rainMm = (data.rain?.['1h'] ?? 0) as number;
            return withBand({
              ...s,
              mmPerHour: rainMm,
              humidity: data.main?.humidity ?? s.humidity,
              windKph: Math.round((data.wind?.speed ?? 0) * 3.6),
              updatedAt: Date.now()
            });
          })
        );
        setSectors(fetchedSectors);
      } else {
        // Safe Simulation execution fallback loop
        const mockProcessed = MAPUSA_SECTORS.map((s) => withBand({
          ...s,
          mmPerHour: parseFloat((s.mmPerHour * (0.8 + Math.random() * 0.4)).toFixed(2)),
          updatedAt: Date.now()
        }));
        setSectors(mockProcessed);
      }
      setLastRefresh(new Date());
    } catch (e: any) {
      setFetchError(e.message ?? 'Data pipeline error');
      if (sectors.length === 0) setSectors(MAPUSA_SECTORS.map(withBand));
    } finally {
      setFetching(false);
    }
  }, [weatherApiKey, fetching, sectors.length]);

  useEffect(() => { loadData(); }, []);

  // Live Sync Effect Poller Loop
  useEffect(() => {
    if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    if (liveMode) {
      liveTimerRef.current = setInterval(() => loadData(true), LIVE_REFRESH_MS);
    }
    return () => { if (liveTimerRef.current) clearInterval(liveTimerRef.current); };
  }, [liveMode, loadData]);

  // ── Overlay Mapping & Geometric Animations ─────────────────────────────────
  const clearOverlays = useCallback(() => {
    overlaysRef.current.forEach((o) => {
      o.circle.setMap(null);
      o.infoMarker.setMap(null);
    });
    overlaysRef.current = [];
  }, []);

  const renderOverlays = useCallback((data: GridSector[]) => {
    if (!mapRef.current || !window.google?.maps) return;
    clearOverlays();
    const G = window.google.maps;

    data.forEach((sector) => {
      const style = BAND_STYLE[sector.band];
      if (sector.band === 'NONE') return;

      const circle = new G.Circle({
        map: mapRef.current,
        center: { lat: sector.lat, lng: sector.lng },
        radius: SECTOR_RADIUS,
        fillColor: style.fill,
        fillOpacity: 1,
        strokeColor: style.stroke,
        strokeWeight: 1.5,
        strokeOpacity: 0.8,
      });

      // Harmonic Pulse Engine loop for extreme precipitation nodes
      if (sector.band === 'HIGH') {
        let weight = 1.5;
        let ascending = true;
        const pulseLoop = setInterval(() => {
          if (!circle.getMap()) { clearInterval(pulseLoop); return; }
          weight += ascending ? 0.15 : -0.15;
          if (weight > 4.0 || weight < 1.5) ascending = !ascending;
          circle.setOptions({ strokeWeight: weight });
        }, 90);
      }

      const infoMarker = new G.Marker({
        map: mapRef.current,
        position: { lat: sector.lat, lng: sector.lng },
        icon: { path: G.SymbolPath.CIRCLE, scale: 0 },
        label: {
          text: `${sector.mmPerHour.toFixed(1)} mm/h`,
          color: style.stroke,
          fontFamily: 'monospace',
          fontSize: '10px',
          fontWeight: '800'
        }
      });

      overlaysRef.current.push({ circle, infoMarker, sectorId: sector.id });
    });
  }, [clearOverlays]);

  useEffect(() => {
    if (mapsReady && displaySectors.length > 0) {
      renderOverlays(displaySectors);
    }
  }, [displaySectors, mapsReady, renderOverlays]);

  useEffect(() => () => clearOverlays(), [clearOverlays]);

  const bandCount = (band: RainfallBand) => displaySectors.filter((s) => s.band === band).length;

  return (
    <div className="w-full h-screen bg-[#020203] flex relative overflow-hidden text-neutral-200 font-sans">
      
      {/* ════════════════ LEFT DASHBOARD CONTROL PANEL ════════════════ */}
      <aside className={`w-[420px] min-w-[420px] h-full z-10 flex flex-col border-r border-neutral-900 overflow-y-auto no-scrollbar transition-all
        ${isGlass ? 'bg-neutral-950/70 backdrop-blur-2xl' : 'bg-[#09090b]'}`}
      >
        <div className="p-6 space-y-6 flex-1 flex flex-col">
          
          {/* Module Identifier Node */}
          <div className="flex justify-between items-center border-b border-neutral-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)] animate-scan-line" />
                <CloudRain className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Isohyetal Radar</h2>
                <p className="text-[10px] font-mono tracking-widest text-neutral-500 uppercase">Precipitation Stream</p>
              </div>
            </div>

            {/* Execution Controls Panel Grid */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiveMode(prev => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-300
                  ${liveMode 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
              >
                <Radio className={`w-3 h-3 ${liveMode ? 'animate-pulse' : ''}`} />
                {liveMode ? 'LIVE' : 'HOLD'}
              </button>

              <button
                onClick={() => loadData(true)}
                disabled={fetching}
                className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center transition-all hover:border-neutral-700 active:scale-95 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-neutral-400 ${fetching ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Core Grid Matrix Connectivity Badges */}
          <div className="flex justify-between items-center text-xs font-mono text-neutral-500">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
              <span>{weatherApiKey ? 'Barometric Network API' : 'Local Telemetry Cache'}</span>
            </div>
            {lastRefresh && (
              <span className="text-[10px] text-neutral-600">
                REFRESH: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </div>

          {fetchError && (
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-400/90 font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{fetchError}. Falling back to structural defaults.</span>
            </div>
          )}

          {/* Classification Range Spectrum Scale Matrix */}
          <div className="space-y-2.5">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Intensity Spectra</p>
            <div className="space-y-1.5">
              {(['NONE', 'LOW', 'MEDIUM', 'HIGH'] as RainfallBand[]).map((band) => {
                const style = BAND_STYLE[band];
                const count = bandCount(band);
                return (
                  <div key={band} className={`flex justify-between items-center px-4 py-2.5 rounded-xl border transition-all ${style.bg} ${style.border}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full border shadow-sm" style={{ backgroundColor: style.stroke, borderColor: style.stroke }} />
                      <div>
                        <span className={`text-xs font-mono font-bold uppercase tracking-wider ${style.text}`}>{band}</span>
                        <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">{style.label} · {style.sub}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-0.5 border rounded-md min-w-[28px] text-center transition-all duration-300
                      ${count > 0 ? `${style.text} bg-white/5 border-white/10` : 'text-neutral-700 bg-neutral-950/20 border-neutral-900'}`}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Configuration Simulation Slider Block */}
          <div className="space-y-3 bg-neutral-950/40 border border-neutral-900 rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulation Injection</span>
              </div>
              <div className="flex items-center gap-2">
                {simActive && (
                  <span className={`text-[9px] font-mono font-bold uppercase border rounded-md px-1.5 py-0.5
                    ${BAND_STYLE[classifyBand(simRain)].text} ${BAND_STYLE[classifyBand(simRain)].bg} ${BAND_STYLE[classifyBand(simRain)].border}`}
                  >
                    {classifyBand(simRain)}
                  </span>
                )}
                <span className="font-mono text-xs font-bold text-white">
                  {simRain.toFixed(1)} <span className="text-neutral-500 text-[10px]">mm/h</span>
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={60}
              step={0.5}
              value={simRain}
              onChange={(e) => {
                setSimRain(parseFloat(e.target.value));
                if (!simActive) setSimActive(true);
              }}
              className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />

            <div className="flex justify-between text-[9px] font-mono text-neutral-600">
              <span>0 (OFF)</span>
              <span>2.5 LOW</span>
              <span>10.0 MED</span>
              <span>60.0 CRIT</span>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setSimActive(prev => !prev)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider border transition-all duration-300
                  ${simActive 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                    : 'bg-neutral-900 border-neutral-800 text-neutral-500'}`}
              >
                {simActive ? 'Override Active' : 'Engage Override'}
              </button>
              {simActive && (
                <button
                  onClick={() => { setSimRain(0); setSimActive(false); }}
                  className="px-3 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Micro Map Sector Data Matrix Grid Array */}
          <div className="space-y-2 flex-1 flex flex-col min-h-0">
            <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">Localized Matrix Arrays</p>
            <div className="overflow-y-auto no-scrollbar space-y-2 flex-1 pr-0.5">
              {displaySectors.map((sector) => {
                const style = BAND_STYLE[sector.band];
                return (
                  <div
                    key={sector.id}
                    onClick={() => {
                      if (!mapRef.current) return;
                      mapRef.current.panTo({ lat: sector.lat, lng: sector.lng });
                      mapRef.current.setZoom(15);
                    }}
                    className="p-3 bg-neutral-900/30 hover:bg-neutral-900/70 border border-neutral-900 rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full border shrink-0 transition-transform duration-300 group-hover:scale-125"
                        style={{ backgroundColor: style.stroke, borderColor: style.stroke }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white transition-colors truncate">
                          {sector.name}
                        </h4>
                        <span className="text-[9px] font-mono text-neutral-500 block mt-0.5">
                          {sector.id} · {sector.humidity}% RH · {sector.windKph} km/h
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1 shrink-0 ml-4">
                      <span className={`font-mono text-xs font-bold ${style.text}`}>
                        {sector.mmPerHour.toFixed(1)} <span className="text-[9px] text-neutral-600 font-normal">mm/h</span>
                      </span>
                      <span className={`text-[8px] font-mono font-black border rounded px-1.5 py-0.25 uppercase tracking-wide ${style.text} ${style.bg} ${style.border}`}>
                        {sector.band}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </aside>

      {/* ════════════════ GEOSPATIAL GOOGLE MAP LAYER ════════════════ */}
      <div className="flex-1 h-full relative">
        <div ref={mapDivRef} className="w-full h-full" />

        {/* Floating Top Left Map Legend Array Panel */}
        {mapsReady && (
          <div className="absolute top-4 left-4 z-20 bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2 backdrop-blur-md shadow-2xl animate-in fade-in duration-300">
            <div className="text-[9px] font-mono font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-cyan-400" /> Layer Density Configuration
            </div>
            {(['LOW', 'MEDIUM', 'HIGH'] as RainfallBand[]).map((band) => {
              const style = BAND_STYLE[band];
              return (
                <div key={band} className="flex items-center gap-3 text-[10px] font-mono text-neutral-400">
                  <div className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: style.stroke }} />
                  <span className={`${style.text} font-bold w-12`}>{band}</span>
                  <span className="text-neutral-600">{style.sub}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Floating Top Right Cloudburst Warning Hub Overlay */}
        {highSectors.length > 0 && (
          <div className="absolute top-4 right-4 z-20 w-72 flex flex-col gap-2 pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-300">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_24px_rgba(239,68,68,0.15)] backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">Cloudburst Emergency</h4>
                  <p className="text-[9px] font-mono text-neutral-500 mt-0.5">{highSectors.length} Grid sectors critical</p>
                </div>
              </div>
              <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>

            {/* Individual Critical Sector Quick View Arrays */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {highSectors.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    if (!mapRef.current) return;
                    mapRef.current.panTo({ lat: s.lat, lng: s.lng });
                    mapRef.current.setZoom(15);
                  }}
                  className="bg-neutral-950/90 border border-rose-500/20 border-left-[3px] border-l-rose-500 rounded-lg p-2.5 flex justify-between items-center cursor-pointer hover:border-rose-500/40 transition-all"
                >
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{s.name}</h5>
                    <span className="text-[9px] font-mono text-neutral-500">{s.id}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-rose-400 shrink-0 ml-4">
                    {s.mmPerHour.toFixed(1)} <span className="text-[8px] text-neutral-600 font-normal">mm/h</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Global Script Loader Initialisation Mask Block */}
        {!mapsReady && (
          <div className="absolute inset-0 bg-[#020203] flex items-center justify-center z-30">
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-8 max-w-sm w-full text-center space-y-4 backdrop-blur-md shadow-2xl">
              <div className="relative w-12 h-12 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-neutral-800 border-t-cyan-400 animate-spin" />
                <CloudRain className="w-4 h-4 text-cyan-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Initializing Radar Arrays</h3>
                <p className="text-xs text-neutral-500 font-mono mt-1 leading-relaxed">
                  Configuring localized coordinates and anchoring Isohyetal telemetry overlays...
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>{`
        @keyframes scan-line-movement {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line-movement 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

const DARK_RADAR_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#09090b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3f3f46' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#09090b' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#18181b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#09090b' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#27272a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#020203' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#18181b' }] },
];