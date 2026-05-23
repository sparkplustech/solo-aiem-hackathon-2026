import React, { useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../store";
import { ThemeVariant } from "../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Database,
  Wifi,
  WifiOff,
  Cpu,
  Clock,
  Radio,
  Terminal,
  Volume2,
  AlertTriangle,
  RefreshCw,
  Hammer,
  Activity,
  Gauge,
  Loader2,
  BellRing,
} from "lucide-react";

// ─── Flood threshold (keep in sync with Django FLOOD_THRESHOLD_CM) ───────────
const FLOOD_THRESHOLD_CM = 3.5;
const MAX_SENSOR_HEIGHT_CM = 15.0; // Assume sensor is 15cm from bottom of drain

export default function SensorsView() {
  const {
    sensorNodes,
    selectedNodeId,
    setSelectedNodeId,
    telemetryLogs,
    systemStats,
    activeLayout,
    dispatchMaintenance,
    showToast,
    esp32Status,
    liveDistance,
    chartHistory,
    lastPollLatencyMs,
    updateFromESP32,
    setESP32Status,
    addAlert,
  } = useAppStore();

  const isGlass = activeLayout === ThemeVariant.GLASSMORPHISM;
  const panelStyle = isGlass
    ? "glass-panel text-on-surface"
    : "neu-extrude text-on-surface";
  const innerCardStyle = isGlass
    ? "bg-white/5 border border-white/10"
    : "neu-recess";

  const activeNode = sensorNodes[0];

  // ─── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = () => {
    if (esp32Status === "live") {
      return (
        <span className="flex items-center gap-1.5 text-[#47e266] font-mono text-[10px] uppercase font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#47e266] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#47e266]" />
          </span>
          LIVE
        </span>
      );
    }
    if (esp32Status === "connecting") {
      return (
        <span className="flex items-center gap-1.5 text-yellow-400 font-mono text-[10px] uppercase font-semibold">
          <Loader2 className="h-3 w-3 animate-spin" />
          CONNECTING
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-brand-danger font-mono text-[10px] uppercase font-semibold">
        <WifiOff className="h-3 w-3" />
        OFFLINE
      </span>
    );
  };

  // ─── Flood alert banner ────────────────────────────────────────────────────
  const isFloodAlert =
    liveDistance !== null && liveDistance < FLOOD_THRESHOLD_CM;

  const handleBroadcastAlert = () => {
    showToast(
      `AUDIBLE ALARM BROADCAST SENT TO ESP32 NODE: ${activeNode?.name} (${activeNode?.location})! Low-frequency alerts triggered.`,
    );
  };

  // ─── Chart colour: red if flood (low distance), blue if normal ────────────
  const chartColor = isFloodAlert ? "#FF453A" : "#aac7ff";

  // Format chart data label: shorten to HH:MM:SS
  const chartData = chartHistory.map((p) => ({
    time: p.time,
    distance_cm: parseFloat(p.distance_cm.toFixed(1)),
  }));

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-10 py-8 space-y-8 no-scrollbar text-left select-none pb-20">
      {/* ─── FLOOD ALERT BANNER ──────────────────────────────────────────────── */}
      {isFloodAlert && (
        <div className="rounded-2xl border border-brand-danger/60 bg-brand-danger/10 p-4 flex items-center gap-4 animate-pulse">
          <BellRing className="h-7 w-7 text-brand-danger shrink-0 animate-bounce" />
          <div>
            <p className="font-bold text-brand-danger font-mono uppercase tracking-widest text-sm">
              ⚠ FLOOD ALERT — Water Level Critical
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Distance reading is{" "}
              <strong className="text-white">
                {liveDistance?.toFixed(1)} cm
              </strong>{" "}
              — below the {FLOOD_THRESHOLD_CM} cm safety threshold. Water may be
              reaching sensor level!
            </p>
          </div>
        </div>
      )}

      {/* ─── HEADER STATS ───────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Connected sensors */}
        <div className={`${panelStyle} rounded-2xl p-5 flex flex-col gap-1.5`}>
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider block font-semibold">
            Telemetry Feed Source
          </span>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-white">
              {systemStats.totalSensors}
            </h3>
            <span className="text-[10px] bg-secondary/20 text-secondary font-mono px-2 py-0.5 rounded font-semibold">
              ESP32-HC-SR04
            </span>
          </div>
          <p className="text-[10px] text-outline pt-1 border-t border-white/5 mt-2">
            Physical ultrasonic sensor node via WiFi
          </p>
        </div>

        {/* Online sensors */}
        <div className={`${panelStyle} rounded-2xl p-5 flex flex-col gap-1.5`}>
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider block font-semibold">
            Sensor Status
          </span>
          <div className="flex justify-between items-baseline mt-2">
            <h3
              className={`text-2xl font-bold font-mono tracking-tight ${esp32Status === "live" ? "text-secondary" : "text-brand-danger"}`}
            >
              {esp32Status === "live" ? "1" : "0"}
            </h3>
            <StatusBadge />
          </div>
          <p className="text-[10px] text-outline pt-1 border-t border-white/5 mt-2">
            Real-time HC-SR04 ultrasonic readings
          </p>
        </div>

        {/* Flood alert indicator */}
        <div className={`${panelStyle} rounded-2xl p-5 flex flex-col gap-1.5`}>
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider block font-semibold">
            Flood Alert Status
          </span>
          <div className="flex justify-between items-baseline mt-2">
            <h3
              className={`text-2xl font-bold font-mono tracking-tight ${isFloodAlert ? "text-brand-danger" : "text-secondary"}`}
            >
              {isFloodAlert ? "ALERT" : "SAFE"}
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${isFloodAlert ? "bg-brand-danger/20 text-brand-danger animate-pulse" : "bg-secondary/20 text-secondary"}`}
            >
              {isFloodAlert
                ? `< ${FLOOD_THRESHOLD_CM} CM`
                : `≥ ${FLOOD_THRESHOLD_CM} CM`}
            </span>
          </div>
          <p className="text-[10px] text-outline pt-1 border-t border-white/5 mt-2">
            Threshold: object closer than {FLOOD_THRESHOLD_CM} cm = flood
          </p>
        </div>

        {/* Ping / latency */}
        <div className={`${panelStyle} rounded-2xl p-5 flex flex-col gap-1.5`}>
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider block font-semibold">
            Poll Latency
          </span>
          <div className="flex justify-between items-baseline mt-2">
            <h3 className="text-2xl font-bold font-mono tracking-tight text-primary">
              {lastPollLatencyMs}ms
            </h3>
            <span className="text-[10px] text-outline font-mono">
              Django/espdata
            </span>
          </div>
          <p className="text-[10px] text-outline pt-1 border-t border-white/5 mt-2">
            Frontend ↔ Django round-trip time
          </p>
        </div>
      </section>

      {/* ─── LIVE DISTANCE GAUGE + CHART ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart (8 cols) */}
        <div
          className={`col-span-1 lg:col-span-8 ${panelStyle} rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-xl`}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-3 gap-3">
            <div>
              <h3 className="font-bold text-lg text-white font-sans flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Real-Time Distance — HC-SR04</span>
              </h3>
              <p className="text-[10px] text-outline font-mono uppercase mt-0.5">
                Live feed from ESP32 @ 10.111.152.66 → Django /espdata/
              </p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge />
              {liveDistance !== null && (
                <div className="flex items-center gap-4 bg-white/5 px-4 py-1.5 rounded-lg border border-white/10">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-outline uppercase tracking-wider">Distance</span>
                    <span className={`text-xl font-black font-mono tracking-tight ${isFloodAlert ? "text-brand-danger" : "text-white"}`}>
                      {liveDistance.toFixed(1)}
                      <span className="text-xs font-normal text-outline ml-1">cm</span>
                    </span>
                  </div>
                  
                  <div className="w-px h-8 bg-white/10"></div>
                  
                  <div className="flex flex-col items-start">
                    <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-wider">Water Level</span>
                    <span className="text-xl font-black font-mono tracking-tight text-cyan-400">
                      {Math.max(0, MAX_SENSOR_HEIGHT_CM - liveDistance).toFixed(1)}
                      <span className="text-xs font-normal text-cyan-400/60 ml-1">cm</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-60 mt-4">
            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-outline">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  Waiting for ESP32 data...
                </p>
                <p className="text-[10px] font-mono text-outline/60">
                  Make sure the ESP32 is powered and connected to {'"'}Rehan
                  {`'`}s Laptop{'"'} hotspot
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorDist" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={chartColor}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  {/* Flood threshold reference line */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#8b91a0"
                    fontSize={9}
                    fontFamily="monospace"
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#8b91a0"
                    fontSize={10}
                    fontFamily="monospace"
                    unit=" cm"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#201f1f",
                      borderColor: "rgba(255,255,255,0.1)",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    labelStyle={{ fontWeight: "bold" }}
                    formatter={(val: number) => [
                      `${val.toFixed(1)} cm`,
                      "Distance",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="distance_cm"
                    stroke={chartColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDist)"
                    name="Distance (cm)"
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart footer */}
          <div className="flex justify-between items-center text-[10px] text-outline font-mono">
            <span>SENSOR: HC-SR04 | TRIG=GPIO5 ECHO=GPIO18 | INTERVAL: 1s</span>
            <span
              className={
                isFloodAlert
                  ? "text-brand-danger font-bold animate-pulse"
                  : "text-secondary"
              }
            >
              THRESHOLD: {FLOOD_THRESHOLD_CM} CM
            </span>
          </div>
        </div>

        {/* Diagnostic Feed (4 cols) */}
        <div
          className={`col-span-1 lg:col-span-4 ${panelStyle} rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-xl`}
        >
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-bold text-base text-white font-sans flex items-center gap-2">
              <Cpu className="h-5 w-5 text-[#47e266] shrink-0" />
              <span>Diagnostic Feed</span>
            </h3>
            <span className="text-[10px] font-mono text-outline mt-0.5 block uppercase">
              UPLINK: {activeNode?.name ?? "—"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Live Distance */}
            <div
              className={`${innerCardStyle} rounded-xl p-3 flex justify-between items-center`}
            >
              <div className="flex items-center gap-3">
                <Gauge
                  className={`h-4 w-4 ${isFloodAlert ? "text-brand-danger" : "text-primary"}`}
                />
                <div>
                  <span className="text-[10px] font-mono text-outline block leading-none">
                    Live Distance
                  </span>
                  <span
                    className={`text-lg font-bold font-mono mt-0.5 block ${isFloodAlert ? "text-brand-danger" : "text-white"}`}
                  >
                    {liveDistance !== null
                      ? `${liveDistance.toFixed(1)} cm`
                      : "—"}
                  </span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-1 rounded ${isFloodAlert ? "bg-brand-danger/20 text-brand-danger font-bold" : "bg-white/5 text-outline"}`}
              >
                {isFloodAlert ? "FLOOD" : "NORMAL"}
              </span>
            </div>

            {/* Last timestamp */}
            <div
              className={`${innerCardStyle} rounded-xl p-3 flex justify-between items-center`}
            >
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-secondary" />
                <div>
                  <span className="text-[10px] font-mono text-outline block leading-none">
                    Last Reading
                  </span>
                  <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                    {activeNode?.lastSeen ?? "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Connection status */}
            <div
              className={`${innerCardStyle} rounded-xl p-3 flex justify-between items-center`}
            >
              <div className="flex items-center gap-3">
                <Wifi
                  className={`h-4 w-4 ${esp32Status === "live" ? "text-[#47e266]" : "text-brand-danger"}`}
                />
                <div>
                  <span className="text-[10px] font-mono text-outline block leading-none">
                    WiFi Link
                  </span>
                  <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                    {esp32Status === "live"
                      ? "Rehan's Laptop"
                      : esp32Status === "connecting"
                        ? "Connecting..."
                        : "No Signal"}
                  </span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-1 rounded ${esp32Status === "live" ? "bg-[#47e266]/10 text-secondary" : "bg-brand-danger/10 text-brand-danger"}`}
              >
                {esp32Status.toUpperCase()}
              </span>
            </div>

            {/* Logs count */}
            <div
              className={`${innerCardStyle} rounded-xl p-3 flex justify-between items-center`}
            >
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-primary" />
                <div>
                  <span className="text-[10px] font-mono text-outline block leading-none">
                    Readings Stored
                  </span>
                  <span className="text-sm font-semibold text-white font-mono mt-0.5 block">
                    {systemStats.totalSensors > 0
                      ? `${telemetryLogs.length} in session`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch button */}
          <button
            onClick={() => {
              dispatchMaintenance(activeNode?.id ?? "ESP32-LIVE");
              showToast(
                `MAINTENANCE TEAM DISPATCHED TO ${activeNode?.location}! Rapid response unit routing scheduled.`,
              );
            }}
            className="w-full py-2.5 border border-brand-warning/30 hover:bg-brand-warning/5 active:bg-brand-warning/10 text-brand-warning uppercase font-mono tracking-widest text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Hammer className="h-4 w-4" />
            DISPATCH CREW OVERRIDE
          </button>
        </div>
      </section>

      {/* ─── SYSLOG + EMERGENCY BROADCAST ────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Emergency Broadcast Button (5 cols) */}
        <div
          className={`col-span-1 lg:col-span-5 ${panelStyle} rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-xl text-center relative overflow-hidden`}
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-brand-danger to-transparent animate-pulse" />

          <div className="space-y-2">
            <h3 className="font-bold text-lg text-white font-sans flex items-center justify-center gap-2">
              <Volume2 className="h-5 w-5 text-brand-danger animate-bounce shrink-0" />
              <span>Audible Alarm Override</span>
            </h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed font-sans">
              Manually trigger the flood warning alarm system. This will
              broadcast a push notification and audible alert to all connected
              nodes.
            </p>
          </div>

          <div className="py-2 flex justify-center">
            <button
              onClick={handleBroadcastAlert}
              className="h-28 w-28 rounded-full border-4 border-brand-danger/30 hover:border-brand-danger/60 bg-brand-danger/10 hover:bg-brand-danger/20 pulse-danger active:scale-95 transition-all text-brand-danger font-mono text-xs uppercase tracking-widest flex flex-col justify-center items-center gap-2 cursor-pointer shadow-inner"
            >
              <Volume2 className="h-8 w-8 text-brand-danger" />
              <span className="text-[10px] font-bold">ACTIVATE</span>
            </button>
          </div>

          <p className="text-[10px] text-outline font-mono uppercase">
            ESP32 NODE: HC-SR04 @ 10.111.152.66
          </p>
        </div>

        {/* Syslog Terminal (7 cols) */}
        <div
          className={`col-span-1 lg:col-span-7 ${panelStyle} rounded-2xl p-6 flex flex-col justify-between gap-4 shadow-xl relative`}
        >
          <div className="border-b border-white/5 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-base text-white font-sans flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <span>Realtime Syslog — ESP32 HTTP Feed</span>
            </h3>
            <StatusBadge />
          </div>

          {/* Live log feed */}
          <div className="bg-[#0e0e0e] border border-white/5 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs text-on-surface-variant/90 space-y-2 text-left select-text">
            {telemetryLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-outline">
                <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
                <span className="text-[10px] uppercase tracking-widest">
                  Awaiting ESP32 data packets...
                </span>
              </div>
            ) : (
              telemetryLogs.map((log) => (
                <div
                  key={log.id}
                  className={`py-1 flex flex-col sm:flex-row gap-2 border-b border-white/2 transition-colors duration-200 ${
                    log.status === "FLOOD_ALERT"
                      ? "bg-brand-danger/10 text-brand-danger font-semibold"
                      : ""
                  }`}
                >
                  <span className="text-outline shrink-0">
                    [{log.timestamp}]
                  </span>
                  <span className="text-[#ffb691] font-semibold shrink-0">
                    {log.nodeName}:
                  </span>
                  <span className="text-white flex-grow truncate">
                    DIST=
                    {log.waterLevel !== undefined
                      ? `${(log.waterLevel * 100).toFixed(1)}cm`
                      : "—"}
                    {log.message ? ` | ${log.message}` : ""}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                      log.status === "FLOOD_ALERT"
                        ? "bg-brand-danger/30 text-brand-danger font-bold"
                        : log.status === "MAINTENANCE"
                          ? "bg-brand-warning/20 text-brand-warning font-semibold"
                          : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-between items-center text-[10px] text-outline font-mono">
            <span>ENDPOINT: GET /espdata/latest/ | POST /espdata/reading/</span>
            <span
              className={`${esp32Status === "live" ? "text-secondary" : "text-brand-danger"}`}
            >
              {esp32Status === "live"
                ? "● RECEIVING"
                : esp32Status === "connecting"
                  ? "◌ CONNECTING"
                  : "✗ NO SIGNAL"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
