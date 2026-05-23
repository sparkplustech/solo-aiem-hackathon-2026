import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  CloudRain,
  RefreshCw,
  Activity,
  AlertTriangle,
  Radio,
  ScanLine,
  Navigation,
  MapPin,
  ArrowRight,
  RouteOff,
  Zap,
  Droplets,
  Waves,
  Wind,
} from "lucide-react";
import { useAppStore } from "../store";
import { ThemeVariant } from "../types";

declare global {
  interface Window {
    google: any;
    __googleMapsLoaded?: boolean;
  }
}

const mapsApiKey = import.meta.env.VITE_MAPS_API_KEY as string | undefined;

type RainfallBand = "NONE" | "LOW" | "MEDIUM" | "HIGH";

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

const BAND_THRESHOLDS = { LOW: 2.5, MEDIUM: 10.0 } as const;
const FLOOD_THRESHOLD = 10.0;
const ESP32_FLOOD_THRESHOLD_CM = 3.5;
const SECTOR_RADIUS = 380;

const ORIGIN = { lat: 15.5937, lng: 73.8087, label: "Mapusa" };
const DESTINATION = { lat: 15.5669, lng: 73.8235, label: "Carrem" };
const WAYPOINT = { lat: 15.5848, lng: 73.8068, label: "Guirim" };

const FLOOD_ZONE_CENTER = { lat: 15.579, lng: 73.8165 };
const FLOOD_ZONE_RADIUS_DEG = 0.018;

const MOCK_SECTORS: Omit<GridSector, "band">[] = [
  {
    id: "GOA-07",
    name: "St. Xaviers Catchment",
    lat: 15.585,
    lng: 73.822,
    mmPerHour: 7.8,
    humidity: 91,
    windKph: 22,
    updatedAt: Date.now(),
  },
];

const BAND_STYLE: Record<
  RainfallBand,
  { fill: string; stroke: string; text: string; label: string; sub: string }
> = {
  NONE: {
    fill: "rgba(255,255,255,0)",
    stroke: "rgba(255,255,255,0.04)",
    text: "#4a5060",
    label: "No Rain",
    sub: "0 mm/hr",
  },
  LOW: {
    fill: "rgba(71,226,102,0.14)",
    stroke: "#47e266",
    text: "#5deb78",
    label: "Light Drizzle",
    sub: "< 2.5 mm/hr",
  },
  MEDIUM: {
    fill: "rgba(255,214,10,0.14)",
    stroke: "#ffd60a",
    text: "#ffe033",
    label: "Steady Rain",
    sub: "2.5–10 mm/hr",
  },
  HIGH: {
    fill: "rgba(255,69,58,0.22)",
    stroke: "#ff453a",
    text: "#ff6b63",
    label: "Cloudburst",
    sub: "> 10 mm/hr",
  },
};

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8b91a0" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1a2030" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e2a3a" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6e7681" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#243048" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#aac7ff" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#071020" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#2d5a8e" }],
  },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#1e2633" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#c9d1d9" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#0d1117" }],
  },
];

function classifyBand(mm: number): RainfallBand {
  if (mm <= 0) return "NONE";
  if (mm < BAND_THRESHOLDS.LOW) return "LOW";
  if (mm < BAND_THRESHOLDS.MEDIUM) return "MEDIUM";
  return "HIGH";
}

function addBand(s: Omit<GridSector, "band">): GridSector {
  return { ...s, band: classifyBand(s.mmPerHour) };
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    if (window.__googleMapsLoaded) {
      const wait = setInterval(() => {
        if (window.google?.maps) {
          clearInterval(wait);
          resolve();
        }
      }, 80);
      return;
    }
    window.__googleMapsLoaded = true;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Maps script."));
    document.head.appendChild(script);
  });
}

export default function RouteSimView(): React.ReactElement {
  const { activeLayout, liveDistance } = useAppStore();
  const isGlass = activeLayout === ThemeVariant.GLASSMORPHISM;

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const rainfallOverlays = useRef<{ circle: any; marker: any }[]>([]);
  const directRouteRenderer = useRef<any>(null);
  const blockedRouteRenderer = useRef<any>(null);
  const altRouteRenderer = useRef<any>(null);
  const waypointMarkerRef = useRef<any>(null);
  const liveTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState("");
  const [sectors, setSectors] = useState<GridSector[]>([]);
  const [simRain, setSimRain] = useState(0);
  const [simActive, setSimActive] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [liveMode, setLiveMode] = useState(false);
  const [pingOn, setPingOn] = useState(true);

  type RouteMode = "normal" | "flooding" | "rerouted";
  const [routeMode, setRouteMode] = useState<RouteMode>("normal");
  const prevFloodState = useRef(false);

  const displaySectors = useMemo<GridSector[]>(() => {
    if (!simActive || sectors.length === 0) return sectors;
    return sectors.map((s, i) => {
      const variance = 0.6 + ((i * 37) % 80) / 100;
      const mm = parseFloat((simRain * variance).toFixed(2));
      return addBand({ ...s, mmPerHour: mm, updatedAt: Date.now() });
    });
  }, [sectors, simRain, simActive]);

  const isRouteFlooded = useMemo(() => {
    const isEsp32Flooded =
      liveDistance !== null && liveDistance < ESP32_FLOOD_THRESHOLD_CM;
    const isSimFlooded = displaySectors.some(
      (s) =>
        s.band === "HIGH" &&
        Math.abs(s.lat - FLOOD_ZONE_CENTER.lat) < FLOOD_ZONE_RADIUS_DEG &&
        Math.abs(s.lng - FLOOD_ZONE_CENTER.lng) < FLOOD_ZONE_RADIUS_DEG,
    );
    return isEsp32Flooded || isSimFlooded;
  }, [displaySectors, liveDistance]);

  const highSectors = useMemo(
    () => displaySectors.filter((s) => s.band === "HIGH"),
    [displaySectors],
  );
  const bandCount = (band: RainfallBand) =>
    displaySectors.filter((s) => s.band === band).length;

  // ── Load Google Maps ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapsApiKey) {
      setMapsError("VITE_MAPS_API_KEY is not set in your .env file.");
      return;
    }
    loadGoogleMapsScript(mapsApiKey)
      .then(() => setMapsReady(true))
      .catch((e: Error) => setMapsError(e.message));
  }, []);

  // ── Init map + renderers ────────────────────────────────────────────
  useEffect(() => {
    if (!mapsReady || !mapDivRef.current || mapRef.current) return;
    const G = window.google.maps;

    mapRef.current = new G.Map(mapDivRef.current, {
      center: { lat: 15.58, lng: 73.816 },
      zoom: 14,
      styles: DARK_MAP_STYLE,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      zoomControlOptions: { position: G.ControlPosition.RIGHT_CENTER },
    });

    // Direct (normal) route renderer — cyan
    directRouteRenderer.current = new G.DirectionsRenderer({
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#00c8ff",
        strokeWeight: 6,
        strokeOpacity: 0.92,
        zIndex: 10,
      },
    });
    directRouteRenderer.current.setMap(mapRef.current);

    // Blocked route renderer — red dashed
    blockedRouteRenderer.current = new G.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#ff3a2e",
        strokeWeight: 5,
        strokeOpacity: 0.8,
        zIndex: 9,
      },
    });
    blockedRouteRenderer.current.setMap(mapRef.current);

    // Alternate rerouted renderer — bright cyan
    altRouteRenderer.current = new G.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: "#00c8ff",
        strokeWeight: 6,
        strokeOpacity: 0.95,
        zIndex: 11,
      },
    });
    altRouteRenderer.current.setMap(mapRef.current);

    // Draw the initial direct route immediately
    drawDirectRoute();
  }, [mapsReady]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── DirectionsService helpers ───────────────────────────────────────
  const drawDirectRoute = useCallback(() => {
    if (!window.google?.maps || !mapRef.current) return;
    const G = window.google.maps;
    const svc = new G.DirectionsService();

    svc.route(
      {
        origin: { lat: ORIGIN.lat, lng: ORIGIN.lng },
        destination: { lat: DESTINATION.lat, lng: DESTINATION.lng },
        travelMode: G.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === "OK" && directRouteRenderer.current) {
          directRouteRenderer.current.setDirections(result);
        }
      },
    );

    // Clear anything that doesn't belong in normal mode
    if (blockedRouteRenderer.current) {
      blockedRouteRenderer.current.setDirections({ routes: [] });
    }
    if (altRouteRenderer.current) {
      altRouteRenderer.current.setDirections({ routes: [] });
    }
    if (waypointMarkerRef.current) {
      waypointMarkerRef.current.setMap(null);
      waypointMarkerRef.current = null;
    }
  }, []);

  const drawFloodedReroute = useCallback(() => {
    if (!window.google?.maps || !mapRef.current) return;
    const G = window.google.maps;
    const svc = new G.DirectionsService();

    // Blocked direct route (red)
    svc.route(
      {
        origin: { lat: ORIGIN.lat, lng: ORIGIN.lng },
        destination: { lat: DESTINATION.lat, lng: DESTINATION.lng },
        travelMode: G.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === "OK" && blockedRouteRenderer.current) {
          blockedRouteRenderer.current.setDirections(result);
        }
        // Hide the normal direct renderer once blocked one is drawn
        if (directRouteRenderer.current) {
          directRouteRenderer.current.setDirections({ routes: [] });
        }
      },
    );

    // Alternate route via waypoint (cyan)
    svc.route(
      {
        origin: { lat: ORIGIN.lat, lng: ORIGIN.lng },
        destination: { lat: DESTINATION.lat, lng: DESTINATION.lng },
        waypoints: [
          {
            location: { lat: WAYPOINT.lat, lng: WAYPOINT.lng },
            stopover: true,
          },
        ],
        optimizeWaypoints: false,
        travelMode: G.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === "OK" && altRouteRenderer.current) {
          altRouteRenderer.current.setDirections(result);
        }
      },
    );

    // Waypoint circle marker
    if (waypointMarkerRef.current) {
      waypointMarkerRef.current.setMap(null);
    }
    waypointMarkerRef.current = new G.Marker({
      position: { lat: WAYPOINT.lat, lng: WAYPOINT.lng },
      map: mapRef.current,
      icon: {
        path: G.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#00c8ff",
        fillOpacity: 1,
        strokeColor: "#0d1117",
        strokeWeight: 2.5,
      },
      zIndex: 20,
    });
  }, []);

  // ── React to flood state changes ────────────────────────────────────
  useEffect(() => {
    if (!mapsReady) return;

    if (isRouteFlooded && !prevFloodState.current) {
      prevFloodState.current = true;
      setRouteMode("rerouted");
      drawFloodedReroute();
    }

    if (!isRouteFlooded && prevFloodState.current) {
      prevFloodState.current = false;
      setRouteMode("normal");
      drawDirectRoute();
    }
  }, [isRouteFlooded, mapsReady, drawDirectRoute, drawFloodedReroute]);

  // ── Rainfall overlay circles ────────────────────────────────────────
  const clearRainfallOverlays = useCallback(() => {
    rainfallOverlays.current.forEach((o) => {
      o.circle.setMap(null);
      o.marker.setMap(null);
    });
    rainfallOverlays.current = [];
  }, []);

  const drawRainfallOverlays = useCallback(
    (data: GridSector[]) => {
      if (!mapRef.current) return;
      clearRainfallOverlays();
      const G = window.google.maps;

      data.forEach((sector) => {
        if (sector.band === "NONE") return;
        const style = BAND_STYLE[sector.band];

        const circle = new G.Circle({
          map: mapRef.current,
          center: { lat: sector.lat, lng: sector.lng },
          radius: SECTOR_RADIUS,
          fillColor: style.stroke,
          fillOpacity: sector.band === "HIGH" ? 0.18 : 0.12,
          strokeColor: style.stroke,
          strokeWeight: 1.5,
          strokeOpacity: 0.7,
          zIndex: 5,
        });

        if (sector.band === "HIGH") {
          let w = 1.5;
          let dir = 1;
          const pulse = setInterval(() => {
            if (!circle.getMap()) {
              clearInterval(pulse);
              return;
            }
            w += dir * 0.12;
            if (w > 3.5 || w < 1.5) dir *= -1;
            circle.setOptions({ strokeWeight: w });
          }, 80);
        }

        const marker = new G.Marker({
          map: mapRef.current,
          position: { lat: sector.lat, lng: sector.lng },
          icon: { path: G.SymbolPath.CIRCLE, scale: 0 },
          label: {
            text: `${sector.mmPerHour.toFixed(1)}`,
            color: style.text,
            fontFamily: "monospace",
            fontSize: "9px",
            fontWeight: "700",
          },
          zIndex: 6,
        });

        rainfallOverlays.current.push({ circle, marker });
      });
    },
    [clearRainfallOverlays],
  );

  useEffect(() => {
    if (mapsReady && displaySectors.length > 0) {
      drawRainfallOverlays(displaySectors);
    }
  }, [displaySectors, mapsReady, drawRainfallOverlays]);

  // ── Data loading ────────────────────────────────────────────────────
  const loadData = useCallback(
    async (force = false) => {
      if (fetching && !force) return;
      setFetching(true);
      try {
        const loaded = MOCK_SECTORS.map((s) =>
          addBand({
            ...s,
            mmPerHour: parseFloat(
              (s.mmPerHour * (0.85 + Math.random() * 0.3)).toFixed(2),
            ),
            updatedAt: Date.now(),
          }),
        );
        setSectors(loaded);
        setLastRefresh(new Date());
      } finally {
        setFetching(false);
      }
    },
    [fetching],
  );

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (liveTimer.current) {
      clearInterval(liveTimer.current);
      liveTimer.current = null;
    }
    if (liveMode) {
      liveTimer.current = setInterval(() => loadData(true), 60_000);
    }
    return () => {
      if (liveTimer.current) clearInterval(liveTimer.current);
    };
  }, [liveMode, loadData]);

  useEffect(() => {
    const iv = setInterval(() => setPingOn((v) => !v), 900);
    return () => clearInterval(iv);
  }, []);

  useEffect(
    () => () => {
      clearRainfallOverlays();
      if (liveTimer.current) clearInterval(liveTimer.current);
    },
    [clearRainfallOverlays],
  );

  // ── UI helpers ──────────────────────────────────────────────────────
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const pill = (
    color: string,
    bg: string,
    border: string,
  ): React.CSSProperties => ({
    fontFamily: "monospace",
    fontSize: 8,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: bg,
    color,
    border: `1px solid ${border}`,
    whiteSpace: "nowrap",
  });

  const monoLabel: React.CSSProperties = {
    fontFamily: "monospace",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "#8b91a0",
  };

  const routeInfo =
    routeMode === "rerouted"
      ? { time: "11", dist: "4.4 km", stops: 1, color: "#00c8ff" }
      : { time: "7", dist: "2.6 km", stops: 0, color: "#00c8ff" };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Syne', 'Space Grotesk', sans-serif",
        background: "#080c12",
        color: "#e2e8f0",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes fadein     { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slidein    { from{opacity:0;transform:translateX(14px)} to{opacity:1;transform:translateX(0)} }
        @keyframes scanbar    { 0%{top:-3px} 100%{top:100%} }
        @keyframes routeflash { 0%,100%{opacity:1} 50%{opacity:0.25} }
        @keyframes floodpulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,58,46,0.5)} 60%{box-shadow:0 0 0 10px rgba(255,58,46,0)} }
        .row-hover:hover { background: rgba(170,199,255,0.04) !important; }
        .ctl-btn:hover:not(:disabled) { filter: brightness(1.12); }
        .ctl-btn:active:not(:disabled){ transform: scale(0.96); }
        input[type=range].rslider {
          width:100%; height:3px; -webkit-appearance:none; appearance:none; outline:none; cursor:pointer; border-radius:2px;
          background: linear-gradient(to right, var(--tc,#aac7ff) var(--pct,0%), #1e2636 var(--pct,0%));
        }
        input[type=range].rslider::-webkit-slider-thumb {
          -webkit-appearance:none; width:14px; height:14px; border-radius:50%;
          background: var(--tc,#aac7ff); border:2px solid #080c12;
          box-shadow: 0 0 8px var(--tc,rgba(170,199,255,0.6)); cursor:pointer;
        }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:2px; }
      `}</style>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside
        style={{
          width: 390,
          minWidth: 390,
          height: "100%",
          overflowY: "auto",
          background: isGlass
            ? "rgba(8,12,18,0.80)"
            : "linear-gradient(175deg,#0e131c 0%,#080c12 100%)",
          backdropFilter: isGlass ? "blur(24px)" : undefined,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "22px 20px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  flexShrink: 0,
                  background:
                    "linear-gradient(135deg,rgba(0,200,255,0.15),rgba(71,226,102,0.08))",
                  border: "1px solid rgba(0,200,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 2,
                    background:
                      "linear-gradient(to right,transparent,rgba(0,200,255,0.5),transparent)",
                    animation: "scanbar 2.2s linear infinite",
                  }}
                />
                <CloudRain size={17} color="#00c8ff" />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#f0f6ff",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                  }}
                >
                  FloodVision Radar
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#8b91a0",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginTop: 3,
                  }}
                >
                  Live Route · Mapusa, Goa
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button
                onClick={() => setLiveMode((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.18s",
                  background: liveMode
                    ? "rgba(71,226,102,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: liveMode
                    ? "1px solid rgba(71,226,102,0.22)"
                    : "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <Radio size={10} color={liveMode ? "#47e266" : "#5a6070"} />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: liveMode ? "#47e266" : "#5a6070",
                  }}
                >
                  {liveMode ? "LIVE" : "PAUSED"}
                </span>
              </button>
              <button
                onClick={() => loadData(true)}
                disabled={fetching}
                className="ctl-btn"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: fetching ? "not-allowed" : "pointer",
                  opacity: fetching ? 0.5 : 1,
                }}
              >
                <RefreshCw
                  size={13}
                  color="#8b91a0"
                  style={{
                    animation: fetching ? "spin 0.8s linear infinite" : "none",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Maps error */}
          {mapsError && (
            <div
              style={{
                background: "rgba(255,69,58,0.08)",
                border: "1px solid rgba(255,69,58,0.2)",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "#ff6b63",
                  lineHeight: 1.7,
                }}
              >
                <strong>⚠ Maps Error</strong>
                <br />
                {mapsError}
              </div>
            </div>
          )}

          {/* Last refresh */}
          {lastRefresh && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: liveMode ? "#47e266" : "#ffd60a",
                    boxShadow: liveMode ? "0 0 5px #47e266" : "none",
                  }}
                />
                <span style={{ ...monoLabel, fontSize: 8, color: "#4a5060" }}>
                  Mock Data · Goa Sectors
                </span>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: "#3a4050",
                }}
              >
                {fmtTime(lastRefresh)}
              </span>
            </div>
          )}

          {/* ── Route Status Card ── */}
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              border:
                routeMode === "rerouted"
                  ? "1px solid rgba(255,58,46,0.28)"
                  : "1px solid rgba(0,200,255,0.18)",
              animation: "fadein 0.35s ease",
            }}
          >
            {/* Card header */}
            <div
              style={{
                padding: "11px 14px",
                background:
                  routeMode === "rerouted"
                    ? "rgba(255,58,46,0.09)"
                    : "rgba(0,200,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {routeMode === "rerouted" ? (
                  <RouteOff size={13} color="#ff3a2e" />
                ) : (
                  <Navigation size={13} color="#00c8ff" />
                )}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: routeMode === "rerouted" ? "#ff6b63" : "#00c8ff",
                  }}
                >
                  {routeMode === "flooding"
                    ? "⚠ FLOOD DETECTED — CALCULATING…"
                    : routeMode === "rerouted"
                      ? "FLOOD REROUTE ACTIVE"
                      : "DIRECT ROUTE"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: routeMode === "rerouted" ? "#ff6b63" : "#00c8ff",
                  }}
                >
                  {routeInfo.time} min
                </span>
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#4a5060",
                  }}
                >
                  {routeInfo.dist}
                </span>
              </div>
            </div>

            {/* Route stops */}
            <div
              style={{
                background: "rgba(255,255,255,0.015)",
                padding: "13px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#00c8ff",
                    border: "2px solid #080c12",
                    boxShadow: "0 0 6px #00c8ff33",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#d0daea" }}
                >
                  {ORIGIN.label}
                </span>
              </div>

              {routeMode !== "rerouted" && (
                <div
                  style={{
                    marginLeft: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 1.5,
                      height: 18,
                      background:
                        "linear-gradient(to bottom,rgba(0,200,255,0.4),rgba(0,200,255,0.1))",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      color: "#3a4050",
                    }}
                  >
                    via direct road
                  </span>
                </div>
              )}

              {routeMode === "rerouted" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    animation: "slidein 0.4s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      marginLeft: 3,
                      gap: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 1.5,
                        height: 9,
                        background: "rgba(0,200,255,0.25)",
                      }}
                    />
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: "rgba(0,200,255,0.15)",
                        border: "1.5px solid #00c8ff",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        width: 1.5,
                        height: 9,
                        background: "rgba(0,200,255,0.25)",
                      }}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#00c8ff",
                      }}
                    >
                      {WAYPOINT.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontSize: 8,
                        color: "#3a4050",
                        marginTop: 2,
                      }}
                    >
                      alternate waypoint · avoids flood zone
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <MapPin size={11} color="#ff6b63" style={{ flexShrink: 0 }} />
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#d0daea" }}
                >
                  {DESTINATION.label}
                </span>
              </div>
            </div>

            {/* Blocked warning */}
            {routeMode === "rerouted" && (
              <div
                style={{
                  borderTop: "1px solid rgba(255,58,46,0.14)",
                  background: "rgba(255,58,46,0.06)",
                  padding: "8px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  animation: "slidein 0.5s ease",
                }}
              >
                <AlertTriangle
                  size={10}
                  color="#ff3a2e"
                  style={{
                    flexShrink: 0,
                    animation: "routeflash 1.5s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#cc4040",
                    lineHeight: 1.6,
                  }}
                >
                  {liveDistance !== null &&
                  liveDistance < ESP32_FLOOD_THRESHOLD_CM
                    ? `Direct path blocked · ESP32 Sensor detects water level at ${liveDistance.toFixed(1)} cm`
                    : `Direct path blocked · flood zone exceeds ${FLOOD_THRESHOLD} mm/hr`}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right,transparent,rgba(255,255,255,0.06),transparent)",
            }}
          />

          {/* ── Intensity Legend ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={monoLabel}>Intensity Bands</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(["NONE", "LOW", "MEDIUM", "HIGH"] as RainfallBand[]).map(
                (band) => {
                  const s = BAND_STYLE[band];
                  const c = bandCount(band);
                  return (
                    <div
                      key={band}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${band !== "NONE" ? s.stroke + "2a" : "rgba(255,255,255,0.04)"}`,
                        borderRadius: 9,
                        padding: "8px 11px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                        }}
                      >
                        <div
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: s.fill,
                            border: `1.5px solid ${s.stroke}`,
                            flexShrink: 0,
                          }}
                        />
                        <div>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: 10,
                              fontWeight: 700,
                              color: s.text,
                            }}
                          >
                            {band}
                          </div>
                          <div
                            style={{
                              fontFamily: "monospace",
                              fontSize: 8,
                              color: "#4a5060",
                              marginTop: 1,
                            }}
                          >
                            {s.label} · {s.sub}
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 11,
                          fontWeight: 700,
                          color: c > 0 ? s.text : "#2a3040",
                          background: c > 0 ? s.fill : "rgba(255,255,255,0.02)",
                          border: `1px solid ${c > 0 ? s.stroke + "33" : "rgba(255,255,255,0.05)"}`,
                          borderRadius: 6,
                          padding: "2px 8px",
                          minWidth: 26,
                          textAlign: "center",
                        }}
                      >
                        {c}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right,transparent,rgba(255,255,255,0.06),transparent)",
            }}
          />

          {/* ── Simulation Slider ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Activity size={13} color="#aac7ff" />
                <span style={monoLabel}>Simulate Rain</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {simActive &&
                  (() => {
                    const b = classifyBand(simRain);
                    const s = BAND_STYLE[b];
                    return (
                      <span style={pill(s.text, s.fill, s.stroke + "55")}>
                        {b}
                      </span>
                    );
                  })()}
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#aac7ff",
                  }}
                >
                  {simRain.toFixed(1)}
                  <span style={{ fontSize: 9, color: "#4a5060" }}> mm/hr</span>
                </span>
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={60}
              step={0.5}
              value={simRain}
              className="rslider"
              style={
                {
                  "--pct": `${(simRain / 60) * 100}%`,
                  "--tc":
                    simRain < BAND_THRESHOLDS.LOW
                      ? "#aac7ff"
                      : simRain < BAND_THRESHOLDS.MEDIUM
                        ? "#ffd60a"
                        : "#ff453a",
                } as React.CSSProperties
              }
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setSimRain(v);
                if (!simActive) setSimActive(true);
                const pct = (v / 60) * 100;
                const tc =
                  v < BAND_THRESHOLDS.LOW
                    ? "#aac7ff"
                    : v < BAND_THRESHOLDS.MEDIUM
                      ? "#ffd60a"
                      : "#ff453a";
                e.currentTarget.style.setProperty("--pct", pct + "%");
                e.currentTarget.style.setProperty("--tc", tc);
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {[
                ["0", "#47e266", "NONE"],
                ["2.5", "#ffd60a", "LOW"],
                ["10", "#ff8800", "MED"],
                ["60", "#ff453a", "HIGH"],
              ].map(([v, c, l]) => (
                <span
                  key={l}
                  style={{ fontFamily: "monospace", fontSize: 8, color: c }}
                >
                  {v} {l}
                </span>
              ))}
            </div>

            {/* Threshold hint */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: "rgba(255,58,46,0.05)",
                border: "1px solid rgba(255,58,46,0.14)",
                borderRadius: 8,
                padding: "7px 11px",
              }}
            >
              <AlertTriangle
                size={10}
                color={
                  simRain >= FLOOD_THRESHOLD && simActive
                    ? "#ff3a2e"
                    : "#2a3040"
                }
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color:
                    simRain >= FLOOD_THRESHOLD && simActive
                      ? "#ff6b63"
                      : "#2a3040",
                  lineHeight: 1.6,
                }}
              >
                Drag above {FLOOD_THRESHOLD} mm/hr → triggers flood reroute
              </span>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setSimActive((v) => !v)}
                className="ctl-btn"
                style={{
                  flex: 1,
                  padding: "8px 0",
                  borderRadius: 9,
                  cursor: "pointer",
                  fontFamily: "monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.09em",
                  background: simActive
                    ? "rgba(170,199,255,0.12)"
                    : "rgba(255,255,255,0.03)",
                  border: simActive
                    ? "1px solid rgba(170,199,255,0.28)"
                    : "1px solid rgba(255,255,255,0.07)",
                  color: simActive ? "#aac7ff" : "#4a5060",
                  transition: "all 0.18s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <ScanLine size={11} />
                {simActive ? "Sim ON" : "Sim OFF"}
              </button>
              {simActive && (
                <button
                  onClick={() => {
                    setSimRain(0);
                    setSimActive(false);
                  }}
                  className="ctl-btn"
                  style={{
                    padding: "8px 13px",
                    borderRadius: 9,
                    cursor: "pointer",
                    background: "rgba(255,58,46,0.07)",
                    border: "1px solid rgba(255,58,46,0.18)",
                    color: "#ff6b63",
                    fontFamily: "monospace",
                    fontSize: 9,
                    fontWeight: 700,
                    transition: "all 0.15s",
                  }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background:
                "linear-gradient(to right,transparent,rgba(255,255,255,0.06),transparent)",
            }}
          />

          {/* ── Sector Node List ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={monoLabel}>Sector Nodes</span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: "#3a4050",
                }}
              >
                {displaySectors.length} active
              </span>
            </div>

            {fetching && displaySectors.length === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 0",
                }}
              >
                <span
                  style={{
                    width: 11,
                    height: 11,
                    border: "2px solid rgba(170,199,255,0.15)",
                    borderTopColor: "#aac7ff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: "#4a5060",
                  }}
                >
                  Loading…
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {displaySectors.map((sector) => {
                const bs = BAND_STYLE[sector.band];
                const isFloodZone =
                  sector.band === "HIGH" &&
                  Math.abs(sector.lat - FLOOD_ZONE_CENTER.lat) <
                    FLOOD_ZONE_RADIUS_DEG &&
                  Math.abs(sector.lng - FLOOD_ZONE_CENTER.lng) <
                    FLOOD_ZONE_RADIUS_DEG;
                return (
                  <div
                    key={sector.id}
                    className="row-hover"
                    onClick={() => {
                      if (!mapRef.current) return;
                      mapRef.current.panTo({
                        lat: sector.lat,
                        lng: sector.lng,
                      });
                      mapRef.current.setZoom(15);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 11px",
                      borderRadius: 10,
                      cursor: "pointer",
                      border: isFloodZone
                        ? "1px solid rgba(255,58,46,0.25)"
                        : "1px solid rgba(255,255,255,0.04)",
                      background: isFloodZone
                        ? "rgba(255,58,46,0.04)"
                        : "rgba(255,255,255,0.015)",
                      transition: "background 0.14s",
                      animation: "fadein 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: bs.fill,
                          border: `1.5px solid ${bs.stroke}`,
                          boxShadow:
                            sector.band === "HIGH"
                              ? `0 0 5px ${bs.stroke}88`
                              : "none",
                          animation: isFloodZone
                            ? "floodpulse 1.6s ease-in-out infinite"
                            : "none",
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: isFloodZone ? "#ff8b85" : "#c0cad8",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {sector.name}
                          {isFloodZone ? " ⚠" : ""}
                        </div>
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: 8,
                            color: "#3a4050",
                            marginTop: 1,
                          }}
                        >
                          {sector.id} · {sector.humidity}% RH · {sector.windKph}{" "}
                          kph
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 3,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          color: bs.text,
                          lineHeight: 1,
                        }}
                      >
                        {sector.mmPerHour.toFixed(1)}
                        <span
                          style={{
                            fontSize: 8,
                            color: "#3a4050",
                            fontWeight: 400,
                          }}
                        >
                          {" "}
                          mm/h
                        </span>
                      </span>
                      <span style={pill(bs.text, bs.fill, bs.stroke + "44")}>
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

      {/* ══════════════ MAP ══════════════ */}
      <div style={{ flex: 1, position: "relative", height: "100%" }}>
        <div ref={mapDivRef} style={{ width: "100%", height: "100%" }} />

        {/* Bands legend overlay */}
        {mapsReady && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              zIndex: 20,
              background: "rgba(8,12,18,0.90)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "11px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                fontWeight: 700,
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 2,
              }}
            >
              Rainfall Bands
            </span>
            {(["LOW", "MEDIUM", "HIGH"] as RainfallBand[]).map((band) => {
              const s = BAND_STYLE[band];
              return (
                <div
                  key={band}
                  style={{ display: "flex", alignItems: "center", gap: 7 }}
                >
                  <div
                    style={{
                      width: 11,
                      height: 11,
                      borderRadius: "50%",
                      background: s.fill,
                      border: `1.5px solid ${s.stroke}`,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      color: s.text,
                    }}
                  >
                    {band}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      color: "#3a4050",
                    }}
                  >
                    {s.sub}
                  </span>
                </div>
              );
            })}
            <div
              style={{
                marginTop: 4,
                paddingTop: 6,
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    width: 26,
                    height: 3,
                    background: "#00c8ff",
                    borderRadius: 2,
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#00c8ff",
                  }}
                >
                  Active Route
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div
                  style={{
                    width: 26,
                    height: 3,
                    background: "#ff3a2e",
                    borderRadius: 2,
                    opacity: 0.8,
                  }}
                />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#ff6b63",
                  }}
                >
                  Blocked Route
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Flood alert + ETA card — top right */}
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 30,
            display: "flex",
            flexDirection: "column",
            gap: 7,
            maxWidth: 270,
          }}
        >
          {routeMode === "rerouted" && (
            <div
              style={{
                background: "rgba(255,58,46,0.11)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,58,46,0.28)",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                boxShadow: "0 0 24px rgba(255,58,46,0.12)",
                animation: "slidein 0.4s ease",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ff3a2e",
                  boxShadow: "0 0 8px #ff3a2e",
                  flexShrink: 0,
                  opacity: pingOn ? 1 : 0.15,
                  transition: "opacity 0.2s",
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#ff6b63",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  ⚡ Flood Reroute Active
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#882222",
                    marginTop: 2,
                  }}
                >
                  Direct path blocked · alternate calculated
                </div>
              </div>
              <AlertTriangle
                size={14}
                color="#ff3a2e"
                style={{
                  marginLeft: "auto",
                  flexShrink: 0,
                  opacity: pingOn ? 1 : 0.2,
                  transition: "opacity 0.2s",
                }}
              />
            </div>
          )}

          {mapsReady && (
            <div
              style={{
                background: "rgba(8,12,18,0.92)",
                backdropFilter: "blur(12px)",
                border:
                  routeMode === "rerouted"
                    ? "1px solid rgba(255,58,46,0.18)"
                    : "1px solid rgba(0,200,255,0.18)",
                borderRadius: 12,
                padding: "13px 16px",
                animation: "fadein 0.4s ease",
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 8,
                  color: "#3a4050",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 9,
                }}
              >
                {routeMode === "rerouted" ? "Alternate Route" : "Route Summary"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 26,
                      fontWeight: 700,
                      color: routeMode === "rerouted" ? "#ff6b63" : "#00c8ff",
                      lineHeight: 1,
                    }}
                  >
                    {routeInfo.time}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      color: "#4a5060",
                    }}
                  >
                    min
                  </div>
                </div>
                <div
                  style={{
                    width: 1,
                    height: 34,
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#c0cad8",
                      lineHeight: 1,
                    }}
                  >
                    {routeInfo.dist}
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      color: "#4a5060",
                    }}
                  >
                    distance
                  </div>
                </div>
                {routeMode === "rerouted" && (
                  <>
                    <div
                      style={{
                        width: 1,
                        height: 34,
                        background: "rgba(255,255,255,0.06)",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#ffd60a",
                          lineHeight: 1,
                        }}
                      >
                        +1
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: 8,
                          color: "#4a5060",
                        }}
                      >
                        stop
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <span
                  style={{ fontSize: 10, fontWeight: 600, color: "#c0cad8" }}
                >
                  Mapusa Bus Stand
                </span>
                <ArrowRight
                  size={9}
                  color={routeMode === "rerouted" ? "#ff3a2e" : "#00c8ff"}
                />
                {routeMode === "rerouted" && (
                  <>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#00c8ff",
                      }}
                    >
                      Guirim
                    </span>
                    <ArrowRight size={9} color="#00c8ff" />
                  </>
                )}
                <span
                  style={{ fontSize: 10, fontWeight: 600, color: "#c0cad8" }}
                >
                  Carrem
                </span>
              </div>
            </div>
          )}

          {highSectors.map((s) => (
            <div
              key={s.id}
              onClick={() => {
                if (!mapRef.current) return;
                mapRef.current.panTo({ lat: s.lat, lng: s.lng });
                mapRef.current.setZoom(15);
              }}
              style={{
                background: "rgba(8,12,18,0.92)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,58,46,0.18)",
                borderLeft: "3px solid #ff3a2e",
                borderRadius: 10,
                padding: "9px 13px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                animation: "slidein 0.4s ease",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#e2e8f0",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#5a6070",
                    marginTop: 2,
                  }}
                >
                  {s.id}
                </div>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#ff6b63",
                  flexShrink: 0,
                }}
              >
                {s.mmPerHour.toFixed(1)}
                <span style={{ fontSize: 8, color: "#5a2020" }}> mm/h</span>
              </span>
            </div>
          ))}
        </div>

        {/* Loading / error state */}
        {!mapsReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              background: "#080c12",
            }}
          >
            <div
              style={{
                background: "rgba(10,14,22,0.95)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20,
                padding: "36px 44px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div style={{ position: "relative", width: 54, height: 54 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid rgba(0,200,255,0.15)",
                    borderTopColor: "#00c8ff",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 7,
                    borderRadius: "50%",
                    border: "2px solid rgba(71,226,102,0.1)",
                    borderTopColor: "#47e266",
                    animation: "spin 1.5s linear infinite reverse",
                  }}
                />
                <CloudRain
                  size={18}
                  color="#00c8ff"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                  }}
                />
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f6ff" }}>
                {mapsError ? "Maps Error" : "Initialising FloodVision…"}
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#4a5060",
                  lineHeight: 1.8,
                  maxWidth: 280,
                }}
              >
                {mapsError || "Loading Google Maps and meteorological grid…"}
              </div>
            </div>
          </div>
        )}

        {/* Bottom HUD */}
        {mapsReady && displaySectors.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 18,
              left: 18,
              zIndex: 20,
              background: "rgba(8,12,18,0.90)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              animation: "fadein 0.4s ease",
            }}
          >
            {[
              { band: "HIGH" as RainfallBand, Icon: Zap },
              { band: "MEDIUM" as RainfallBand, Icon: Droplets },
              { band: "LOW" as RainfallBand, Icon: Waves },
              { band: "NONE" as RainfallBand, Icon: Wind },
            ].map(({ band, Icon }) => {
              const s = BAND_STYLE[band];
              const c = bandCount(band);
              return (
                <div
                  key={band}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <Icon size={10} color={c > 0 ? s.text : "#2a3040"} />
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 9,
                      fontWeight: 700,
                      color: c > 0 ? s.text : "#2a3040",
                    }}
                  >
                    {c}
                  </span>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: 8,
                      color: "#2a3040",
                      textTransform: "uppercase",
                    }}
                  >
                    {band}
                  </span>
                </div>
              );
            })}
            {simActive && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                  paddingLeft: 14,
                }}
              >
                <ScanLine size={9} color="#aac7ff" />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#aac7ff",
                    textTransform: "uppercase",
                  }}
                >
                  SIM {simRain.toFixed(1)} mm/h
                </span>
              </div>
            )}
            {routeMode === "rerouted" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  borderLeft: "1px solid rgba(255,255,255,0.06)",
                  paddingLeft: 14,
                }}
              >
                <RouteOff size={9} color="#ff3a2e" />
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 8,
                    color: "#ff6b63",
                    textTransform: "uppercase",
                    animation: "routeflash 1.5s ease-in-out infinite",
                  }}
                >
                  REROUTED
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
