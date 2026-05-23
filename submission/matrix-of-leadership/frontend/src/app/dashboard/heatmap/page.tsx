"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

import indiaTopo from "../../../../public/india.topo.json";
import { API_URL, WS_URL } from "@/lib/api";
const GEO_URL = indiaTopo;

const INDIAN_CITIES = [
  { name: "Mumbai", coords: [72.87, 19.07] as [number, number] },
  { name: "Delhi", coords: [77.21, 28.63] as [number, number] },
  { name: "Bangalore", coords: [77.59, 12.97] as [number, number] },
  { name: "Chennai", coords: [80.27, 13.08] as [number, number] },
  { name: "Kolkata", coords: [88.36, 22.57] as [number, number] },
  { name: "Hyderabad", coords: [78.47, 17.38] as [number, number] },
  { name: "Pune", coords: [73.85, 18.52] as [number, number] },
  { name: "Ahmedabad", coords: [72.57, 23.02] as [number, number] },
  { name: "Jaipur", coords: [75.78, 26.91] as [number, number] },
  { name: "Lucknow", coords: [80.94, 26.84] as [number, number] },
];

function generateMockPoints() {
  const cityData: any[] = [];
  INDIAN_CITIES.forEach((city) => {
    const count = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < count; i++) {
      const jitterLat = (Math.random() - 0.5) * 2;
      const jitterLon = (Math.random() - 0.5) * 2;
      const risk = Math.random();
      cityData.push({
        id: `${city.name}_${i}`,
        lat: city.coords[1] + jitterLat,
        lon: city.coords[0] + jitterLon,
        amount: Math.floor(Math.random() * 150000) + 1000,
        risk_level: risk > 0.75 ? "red" : risk > 0.45 ? "yellow" : "green",
        risk_score: Math.floor(risk * 100),
        city: city.name,
        sender_upi: `user${Math.floor(Math.random() * 9999)}@ybl`,
        receiver_upi: `merchant${Math.floor(Math.random() * 999)}@paytm`,
        timestamp: new Date(Date.now() - Math.random() * 3600000 * 6).toISOString(),
      });
    }
  });
  return cityData;
}

function PulsingDot({ risk_level }: { risk_level: string }) {
  if (risk_level !== "red") return null;
  return (
    <>
      <circle r={10} fill="#E05243" fillOpacity={0} stroke="#E05243" strokeWidth={1}>
        <animate attributeName="r" from={4} to={14} dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="opacity" from={0.8} to={0} dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle r={7} fill="#E05243" fillOpacity={0} stroke="#E05243" strokeWidth={0.8}>
        <animate attributeName="r" from={3} to={10} dur="1.8s" begin="0.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" from={0.6} to={0} dur="1.8s" begin="0.4s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col">
      <span style={{ color }} className="text-2xl font-black tracking-tight font-mono">
        {value}
      </span>
      <span className="text-[10px] text-[var(--accent-light)] font-mono tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

const riskColor = (level: string) =>
  level === "red" ? "#E05243" : level === "yellow" ? "#F0A04B" : "#7D9C65";
const riskLabel = (level: string) =>
  level === "red" ? "HIGH RISK" : level === "yellow" ? "MEDIUM RISK" : "LOW RISK";

export default function HeatmapPage() {
  const [points, setPoints] = useState<any[]>([]);
  const [tooltip, setTooltip] = useState<{
    content: any;
    x: number;
    y: number;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "red" | "yellow" | "green">("all");
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [liveStream, setLiveStream] = useState<any[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/heatmap`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.length > 0) setPoints(d);
        else setPoints(generateMockPoints());
        setLoading(false);
      })
      .catch(() => {
        setPoints(generateMockPoints());
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // simulate live stream
  useEffect(() => {
    const stream = points.filter((p) => p.risk_level === "red").slice(0, 6);
    setLiveStream(stream);
  }, [points]);

  const filtered = filter === "all" ? points : points.filter((p) => p.risk_level === filter);

  const stats = {
    total: points.length,
    high: points.filter((p) => p.risk_level === "red").length,
    medium: points.filter((p) => p.risk_level === "yellow").length,
    low: points.filter((p) => p.risk_level === "green").length,
    totalAmount: points.reduce((s, p) => s + (p.amount || 0), 0),
  };

  const handleMouseMove = (e: React.MouseEvent, pt: any) => {
    const container = mapRef.current?.getBoundingClientRect();
    if (!container) return;
    setTooltip({
      content: pt,
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
    setHoveredId(pt.id);
  };

  return (
    <div className="flex flex-col h-full gap-4 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">
            India Fraud{" "}
            <span className="text-[var(--accent-copper)]">Heatmap</span>
          </h2>
          <p className="text-sm text-[var(--accent-light)] mt-0.5">
            Real-time geospatial distribution of flagged UPI transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Filters */}
          {(["all", "red", "yellow", "green"] as const).map((f) => {
            const colors: Record<string, string> = {
              all: "var(--accent-copper)",
              red: "#E05243",
              yellow: "#F0A04B",
              green: "#7D9C65",
            };
            const labels: Record<string, string> = {
              all: "All",
              red: "High Risk",
              yellow: "Medium",
              green: "Low Risk",
            };
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  borderColor: isActive ? colors[f] : "var(--border-color)",
                  color: isActive ? colors[f] : "var(--accent-light)",
                  background: isActive
                    ? `${colors[f]}18`
                    : "transparent",
                  boxShadow: isActive
                    ? `0 0 12px ${colors[f]}30`
                    : "none",
                }}
                className="px-3 py-1.5 rounded-sm border text-xs font-bold font-mono tracking-wider transition-all duration-200"
              >
                {labels[f]}
              </button>
            );
          })}
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded-sm border border-[var(--border-color)] text-xs font-bold font-mono tracking-wider text-[var(--accent-light)] hover:text-[var(--text-main)] hover:border-[var(--accent-copper)] transition-all flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            REFRESH
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-5 gap-4 p-5 rounded-md border"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-color)",
        }}
      >
        <StatBadge label="Total Nodes" value={stats.total} color="var(--text-main)" />
        <StatBadge label="High Risk" value={stats.high} color="#E05243" />
        <StatBadge label="Medium Risk" value={stats.medium} color="#F0A04B" />
        <StatBadge label="Low Risk" value={stats.low} color="#7D9C65" />
        <StatBadge
          label="Total Volume"
          value={`₹${(stats.totalAmount / 100000).toFixed(1)}L`}
          color="var(--accent-copper)"
        />
      </div>

      {/* Main content: map + side panel */}
      <div className="flex-1 grid grid-cols-[1fr_340px] gap-4 min-h-0">
        {/* Map */}
        <div
          ref={mapRef}
          className="relative rounded-md border overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at 50% 60%, #1e2840 0%, #111318 60%, var(--bg-primary) 100%)",
            borderColor: "var(--border-color)",
          }}
        >
          {/* Grid lines overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-[var(--bg-primary)]/70 ">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-t-[var(--accent-copper)] border-[var(--border-color)] rounded-full animate-spin" />
                <span className="text-xs text-[var(--accent-light)] font-mono tracking-wider">
                  LOADING HEATMAP DATA...
                </span>
              </div>
            </div>
          )}

          {/* SVG Glow Filter */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <filter id="glow-red">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-amber">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 1050, center: [83, 23] }}
            className="w-full h-full"
          >
            <ZoomableGroup zoom={zoom}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#1a2035"
                      stroke="#253050"
                      strokeWidth={0.4}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#212b45", outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {/* City labels */}
              {INDIAN_CITIES.map((city) => (
                <Marker key={city.name} coordinates={city.coords}>
                  <text
                    textAnchor="middle"
                    dy={-8}
                    style={{
                      fill: "rgba(168, 163, 157, 0.4)",
                      fontSize: "5px",
                      fontFamily: "JetBrains Mono, monospace",
                      letterSpacing: "0.5px",
                      userSelect: "none",
                    }}
                  >
                    {city.name.toUpperCase()}
                  </text>
                </Marker>
              ))}

              {/* Data points */}
              {filtered.map((pt) => {
                const isHovered = hoveredId === pt.id;
                const baseR = Math.max(3, Math.min(10, pt.amount / 15000));
                const color = riskColor(pt.risk_level);
                return (
                  <Marker key={pt.id} coordinates={[pt.lon, pt.lat]}>
                    <g
                      style={{ cursor: "pointer" }}
                      onMouseMove={(e) => handleMouseMove(e as any, pt)}
                      onMouseLeave={() => {
                        setTooltip(null);
                        setHoveredId(null);
                      }}
                    >
                      <PulsingDot risk_level={pt.risk_level} />
                      <circle
                        r={isHovered ? baseR * 1.6 : baseR}
                        fill={color}
                        fillOpacity={isHovered ? 0.95 : pt.risk_level === "red" ? 0.85 : 0.55}
                        stroke={isHovered ? "white" : color}
                        strokeWidth={isHovered ? 1 : 0}
                        filter={`url(#glow-${pt.risk_level === "red" ? "red" : "amber"})`}
                        style={{ transition: "all 0.2s ease" }}
                      />
                    </g>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
              className="w-8 h-8 rounded-sm border border-[var(--border-color)] bg-[var(--bg-card)]/80  text-[var(--text-main)] flex items-center justify-center hover:border-[var(--accent-copper)] transition-all text-sm font-bold"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.5, 0.8))}
              className="w-8 h-8 rounded-sm border border-[var(--border-color)] bg-[var(--bg-card)]/80  text-[var(--text-main)] flex items-center justify-center hover:border-[var(--accent-copper)] transition-all text-sm font-bold"
            >
              −
            </button>
            <button
              onClick={() => setZoom(1)}
              className="w-8 h-8 rounded-sm border border-[var(--border-color)] bg-[var(--bg-card)]/80  text-[var(--accent-light)] flex items-center justify-center hover:border-[var(--accent-copper)] transition-all"
              title="Reset zoom"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div
            className="absolute bottom-4 left-4 z-10 flex flex-col gap-2 p-3 rounded-sm border"
            style={{
              background: "rgba(27, 26, 25, 0.85)",
              backdropFilter: "blur(12px)",
              borderColor: "var(--border-color)",
            }}
          >
            {[
              { color: "#E05243", label: "High Risk", pulse: true },
              { color: "#F0A04B", label: "Medium Risk", pulse: false },
              { color: "#7D9C65", label: "Low Risk", pulse: false },
            ].map(({ color, label, pulse }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-4 h-4">
                  {pulse && (
                    <span
                      className="absolute inline-flex w-full h-full rounded-full opacity-50"
                      style={{ background: color, animation: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite" }}
                    />
                  )}
                  <span className="relative inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                </div>
                <span className="text-[10px] text-[var(--accent-light)] font-mono">{label}</span>
              </div>
            ))}
            <div className="border-t border-[var(--border-color)]/50 mt-1 pt-1">
              <span className="text-[9px] text-[var(--accent-light)]/60 font-mono">Bubble size = amount</span>
            </div>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              ref={tooltipRef}
              className="absolute z-50 pointer-events-none"
              style={{
                left: Math.min(tooltip.x + 16, (mapRef.current?.clientWidth ?? 600) - 220),
                top: Math.max(tooltip.y - 100, 8),
              }}
            >
              <div
                className="w-52 rounded-sm border p-4 shadow-2xl"
                style={{
                  background: "rgba(27, 26, 25, 0.95)",
                  backdropFilter: "blur(16px)",
                  borderColor:
                    tooltip.content.risk_level === "red"
                      ? "rgba(224,82,67,0.5)"
                      : tooltip.content.risk_level === "yellow"
                      ? "rgba(240,160,75,0.5)"
                      : "rgba(125,156,101,0.5)",
                  boxShadow: `0 8px 32px ${
                    tooltip.content.risk_level === "red"
                      ? "rgba(224,82,67,0.2)"
                      : "rgba(0,0,0,0.4)"
                  }`,
                }}
              >
                {/* Risk badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded"
                    style={{
                      color: riskColor(tooltip.content.risk_level),
                      background: `${riskColor(tooltip.content.risk_level)}18`,
                      border: `1px solid ${riskColor(tooltip.content.risk_level)}40`,
                    }}
                  >
                    {riskLabel(tooltip.content.risk_level)}
                  </span>
                  <span className="text-[9px] text-[var(--accent-light)] font-mono">
                    Score: {tooltip.content.risk_score ?? "—"}
                  </span>
                </div>

                {/* City */}
                <div className="text-sm font-bold text-[var(--text-main)] mb-1">
                  📍 {tooltip.content.city ?? "Unknown City"}
                </div>
                <div className="text-[10px] text-[var(--accent-light)] font-mono mb-3">
                  {tooltip.content.lat?.toFixed(4)}°N, {tooltip.content.lon?.toFixed(4)}°E
                </div>

                {/* Amount */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-[var(--accent-light)] font-mono">AMOUNT</span>
                  <span className="text-sm font-bold text-[var(--text-main)] font-mono">
                    ₹{(tooltip.content.amount ?? 0).toLocaleString("en-IN")}
                  </span>
                </div>

                {/* UPI */}
                {tooltip.content.sender_upi && (
                  <div className="flex flex-col gap-1 border-t border-[var(--border-color)]/40 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-[9px] text-[var(--accent-light)] font-mono">FROM</span>
                      <span className="text-[9px] text-[var(--text-main)] font-mono truncate ml-2 max-w-[120px]">
                        {tooltip.content.sender_upi}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[9px] text-[var(--accent-light)] font-mono">TO</span>
                      <span className="text-[9px] text-[var(--text-main)] font-mono truncate ml-2 max-w-[120px]">
                        {tooltip.content.receiver_upi}
                      </span>
                    </div>
                  </div>
                )}
                {tooltip.content.timestamp && (
                  <div className="text-[8px] text-[var(--accent-light)]/60 font-mono mt-2">
                    {new Date(tooltip.content.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4 overflow-hidden">
          {/* City hotspot breakdown */}
          <div
            className="rounded-md border p-4"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-[var(--accent-light)]">
                CITY HOTSPOTS
              </h3>
              <span className="text-[9px] text-[var(--accent-light)]/50 font-mono">by fraud volume</span>
            </div>
            <div className="space-y-2">
              {INDIAN_CITIES.map((city) => {
                const cityPoints = points.filter((p) => p.city === city.name);
                const redCount = cityPoints.filter((p) => p.risk_level === "red").length;
                const totalVol = cityPoints.reduce((s, p) => s + (p.amount || 0), 0);
                const pct = points.length ? (cityPoints.length / points.length) * 100 : 0;
                if (cityPoints.length === 0) return null;
                return (
                  <div key={city.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {redCount > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E05243] flex-shrink-0" />
                        )}
                        <span className="text-xs text-[var(--text-main)] font-medium">{city.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {redCount > 0 && (
                          <span className="text-[9px] text-[#E05243] font-mono">{redCount} ⚠</span>
                        )}
                        <span className="text-[9px] text-[var(--accent-light)] font-mono">
                          ₹{(totalVol / 1000).toFixed(0)}K
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-[var(--border-color)]/50 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-1 rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background:
                            redCount > 2
                              ? "linear-gradient(90deg, #E05243, #F0A04B)"
                              : redCount > 0
                              ? "#F0A04B"
                              : "#7D9C65",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Alerts Feed */}
          <div
            className="flex-1 rounded-md border p-4 flex flex-col overflow-hidden"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-xs font-bold font-mono tracking-widest text-[var(--accent-light)]">
                LIVE ALERTS
              </h3>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E05243]">
                  <span className="block w-1.5 h-1.5 rounded-full bg-[#E05243] animate-ping" />
                </span>
                <span className="text-[9px] text-[#E05243] font-mono">LIVE</span>
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
              {liveStream.length === 0 ? (
                <div className="text-xs text-[var(--accent-light)]/50 font-mono text-center py-8">
                  No active alerts
                </div>
              ) : (
                liveStream.map((pt, i) => (
                  <div
                    key={pt.id || i}
                    className="rounded-sm border p-3 transition-all hover:border-[#E05243]/40"
                    style={{
                      background: "rgba(224,82,67,0.04)",
                      borderColor: "rgba(224,82,67,0.2)",
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-[var(--text-main)]">
                          📍 {pt.city}
                        </span>
                        <span className="text-[9px] text-[var(--accent-light)] font-mono truncate max-w-[150px]">
                          {pt.sender_upi}
                        </span>
                      </div>
                      <span className="text-sm font-black text-[#E05243] font-mono">
                        ₹{(pt.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[8px] text-[var(--accent-light)]/60 font-mono">
                        {pt.timestamp
                          ? new Date(pt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </span>
                      <span
                        className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
                        style={{ color: "#E05243", background: "rgba(224,82,67,0.12)", border: "1px solid rgba(224,82,67,0.3)" }}
                      >
                        SCORE {pt.risk_score ?? "—"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

