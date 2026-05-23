import { create } from 'zustand';
import { SensorNode, TelemetryLog, AlertItem, SystemStats, ThemeVariant, OptimizerParam } from './types';

// ─── ESP32 live-data types ─────────────────────────────────────────────────
export interface ChartPoint {
  time: string;
  distance_cm: number;
}

export type ESP32Status = 'connecting' | 'live' | 'offline';

interface AppState {
  currentView: 'landing' | 'dashboard' | 'route-sim' | 'sensors' | 'architect' | 'ai-analysis' | 'rain-radar' | 'simulation' | 'report' | 'settings';
  activeTheme: 'dark' | 'light';
  activeLayout: ThemeVariant;

  // ─── ESP32 real sensor state ──────────────────────────────────────────────
  esp32Status: ESP32Status;
  liveDistance: number | null;          // latest reading in cm
  chartHistory: ChartPoint[];           // rolling 60-point graph buffer
  lastPollLatencyMs: number;            // round-trip ms of the last fetch

  // ─── Sensor nodes (now driven by real ESP32 data) ─────────────────────────
  sensorNodes: SensorNode[];
  selectedNodeId: string;
  telemetryLogs: TelemetryLog[];
  alerts: AlertItem[];
  systemStats: SystemStats;

  // Optimizer view state
  startPoint: string;
  destination: string;
  maxDepthTolerance: number;
  optimizerParam: OptimizerParam;
  routeCalculated: boolean;
  isCalculatingRoute: boolean;
  routeViability: {
    duration: string;
    distance: string;
    maxDepthExposure: string;
    status: 'optimal' | 'hazardous' | 'blocked';
  } | null;

  // AI analysis state
  aiRiskLevel: number;
  aiWaterIncrement: number;
  aiDrainStatus: 'stable' | 'blocked';
  isScanningAI: boolean;
  mobileSidebarOpen: boolean;
  activeToast: string | null;
  isSyncing: boolean;
  toggleSync: () => void;

  // ─── Actions ──────────────────────────────────────────────────────────────
  setView: (view: AppState['currentView']) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setLayout: (layout: ThemeVariant) => void;
  setSelectedNodeId: (id: string) => void;
  addAlert: (alert: Omit<AlertItem, 'id' | 'timestamp' | 'active'>) => void;
  dismissAlert: (id: string) => void;
  dispatchMaintenance: (nodeId: string) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  showToast: (message: string | null) => void;

  // Optimizer actions
  setStartPoint: (point: string) => void;
  setDestination: (point: string) => void;
  setMaxDepthTolerance: (depth: number) => void;
  setOptimizerParam: (param: OptimizerParam) => void;
  calculateRoute: () => void;

  // Scanner actions
  rescanAI: () => void;
  setFocusArea: () => void;

  // ─── ESP32 live data action ───────────────────────────────────────────────
  updateFromESP32: (payload: {
    status: 'connected' | 'no_data';
    flood_alert: boolean;
    latest: { timestamp: string; distance_cm: number; is_flood_alert: boolean } | null;
    readings: { timestamp: string; distance_cm: number; is_flood_alert: boolean }[];
    latencyMs: number;
  }) => void;

  setESP32Status: (status: ESP32Status) => void;
}

// ─── Static initial sensor node (the real ESP32) ──────────────────────────────
const LIVE_NODE: SensorNode = {
  id: 'ESP32-LIVE',
  name: 'ESP32-HC-SR04',
  location: 'Rehan Lab — HC-SR04',
  waterLevel: 0,
  trend: 'stable',
  rate: 0,
  status: 'info',
  lastSeen: 'Connecting...',
  cpuTemp: 0,
  heapUsage: '— / —',
  uptime: '—',
  latitude: 50,
  longitude: 50,
};

const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    station: 'System Boot',
    message: 'FloodVision started. Waiting for ESP32 telemetry...',
    timestamp: 'Just now',
    severity: 'info',
    active: true
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'dashboard',
  activeTheme: 'dark',
  activeLayout: ThemeVariant.GLASSMORPHISM,

  // ESP32 real-time state
  esp32Status: 'connecting',
  liveDistance: null,
  chartHistory: [],
  lastPollLatencyMs: 0,

  // Single real sensor node
  sensorNodes: [LIVE_NODE],
  selectedNodeId: 'ESP32-LIVE',
  telemetryLogs: [],
  alerts: INITIAL_ALERTS,
  systemStats: {
    totalSensors: 1,
    activeNodes: 0,
    offlineCount: 0,
    latencyMs: 0,
  },

  startPoint: 'Station ALPHA-01 (Current)',
  destination: '',
  maxDepthTolerance: 0.5,
  optimizerParam: OptimizerParam.LOWEST_RISK,
  routeCalculated: false,
  isCalculatingRoute: false,
  routeViability: null,

  aiRiskLevel: 78,
  aiWaterIncrement: 12,
  aiDrainStatus: 'blocked',
  isScanningAI: false,
  mobileSidebarOpen: false,
  activeToast: null,
  isSyncing: true,

  // ─── ESP32 update action ─────────────────────────────────────────────────
  updateFromESP32: (payload) => {
    const state = get();
    const { latest, flood_alert, readings, latencyMs } = payload;

    if (!latest) return;

    const distanceCm = latest.distance_cm;
    const ts = latest.timestamp;

    // Determine node status from distance
    const nodeStatus: SensorNode['status'] =
      distanceCm < 10 ? 'critical' :
      distanceCm < 30 ? 'warning' :
      distanceCm < 50 ? 'info' : 'stable';

    const trend: SensorNode['trend'] = (() => {
      const prev = state.liveDistance;
      if (prev === null) return 'stable';
      if (distanceCm < prev - 1) return 'falling';   // water rising (distance shrinking)
      if (distanceCm > prev + 1) return 'rising';    // water falling
      return 'stable';
    })();

    // Build chart history from the server's rolling readings (newest first → reverse for chart)
    const newChartHistory: ChartPoint[] = readings
      .slice()
      .reverse()
      .map(r => ({ time: r.timestamp, distance_cm: r.distance_cm }));

    // Build a new telemetry log entry
    const newLog: TelemetryLog = {
      id: `telem-${Date.now()}`,
      timestamp: ts,
      nodeName: 'ESP32-HC-SR04',
      waterLevel: parseFloat((distanceCm / 100).toFixed(3)),
      rssi: -55,   // WiFi RSSI not read in this firmware; placeholder
      temp: 0,
      status: flood_alert ? 'FLOOD_ALERT' : 'SYNC_OK',
      message: flood_alert ? `⚠ Distance ${distanceCm.toFixed(1)}cm < threshold` : undefined,
    };

    // Trigger flood alert once (avoid spam) — only if just crossed the threshold
    const wasFlooding = state.sensorNodes[0]?.status === 'critical' || state.sensorNodes[0]?.status === 'warning';
    const isNowFlooding = flood_alert;

    if (isNowFlooding && !wasFlooding) {
      get().addAlert({
        station: 'ESP32-HC-SR04 (Live)',
        message: `⚠ FLOOD ALERT: Object/water detected at ${distanceCm.toFixed(1)} cm — threshold is 30 cm!`,
        severity: 'critical',
      });
    }

    set({
      liveDistance: distanceCm,
      esp32Status: 'live',
      chartHistory: newChartHistory,
      lastPollLatencyMs: latencyMs,
      sensorNodes: [{
        ...LIVE_NODE,
        waterLevel: parseFloat(distanceCm.toFixed(1)),
        trend,
        status: nodeStatus,
        lastSeen: ts,
        cpuTemp: 0,
        heapUsage: '—',
        uptime: '—',
      }],
      telemetryLogs: [newLog, ...state.telemetryLogs].slice(0, 40),
      systemStats: {
        totalSensors: 1,
        activeNodes: 1,
        offlineCount: flood_alert ? 1 : 0,
        latencyMs,
      },
    });
  },

  setESP32Status: (status) => set({ esp32Status: status }),

  // ─── Standard actions ────────────────────────────────────────────────────
  setView: (view) => set({ currentView: view, mobileSidebarOpen: false }),
  setTheme: (theme) => set({ activeTheme: theme }),
  setLayout: (layout) => set({ activeLayout: layout }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleSync: () => set((state) => ({ isSyncing: !state.isSyncing })),

  showToast: (message) => {
    set({ activeToast: message });
    if (message) {
      setTimeout(() => {
        if (get().activeToast === message) set({ activeToast: null });
      }, 6000);
    }
  },

  addAlert: (alert) => {
    const newAlert: AlertItem = {
      ...alert,
      id: `alert-${Date.now()}`,
      timestamp: 'Just now',
      active: true
    };
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      systemStats: {
        ...state.systemStats,
        offlineCount: alert.severity === 'critical'
          ? state.systemStats.offlineCount + 1
          : state.systemStats.offlineCount
      }
    }));
  },

  dismissAlert: (id) => {
    set((state) => {
      const alert = state.alerts.find(a => a.id === id);
      const isCritical = alert?.severity === 'critical';
      return {
        alerts: state.alerts.map((a) => a.id === id ? { ...a, active: false } : a),
        systemStats: {
          ...state.systemStats,
          offlineCount: isCritical ? Math.max(0, state.systemStats.offlineCount - 1) : state.systemStats.offlineCount
        }
      };
    });
  },

  dispatchMaintenance: (nodeId) => {
    const nodeName = get().sensorNodes.find(n => n.id === nodeId)?.name || nodeId;
    const now = new Date();
    const ts = now.toLocaleTimeString();

    const newTelem: TelemetryLog = {
      id: `telem-${Date.now()}`,
      timestamp: ts,
      nodeName: nodeName,
      waterLevel: 0,
      rssi: -50,
      temp: 0,
      status: 'MAINTENANCE',
      message: `AI DISPATCH: Maintenance unit dispatched to ${nodeName}`,
    };

    set((state) => ({
      telemetryLogs: [newTelem, ...state.telemetryLogs],
    }));
  },

  setStartPoint: (point) => set({ startPoint: point }),
  setDestination: (point) => set({ destination: point }),
  setMaxDepthTolerance: (depth) => set({ maxDepthTolerance: depth }),
  setOptimizerParam: (param) => set({ optimizerParam: param }),

  calculateRoute: () => {
    set({ isCalculatingRoute: true, routeCalculated: false });
    setTimeout(() => {
      const isLowestRisk = get().optimizerParam === OptimizerParam.LOWEST_RISK;
      set({
        isCalculatingRoute: false,
        routeCalculated: true,
        routeViability: {
          duration: isLowestRisk ? '42 min' : '28 min',
          distance: isLowestRisk ? '18.4 km' : '15.1 km',
          maxDepthExposure: isLowestRisk ? '0.3m' : '0.8m',
          status: isLowestRisk ? 'optimal' : 'hazardous'
        }
      });

      if (!isLowestRisk) {
        get().addAlert({
          station: 'Route Sim Warning',
          message: 'Selected path exposes vehicle to 0.8m standing water level inside River delta.',
          severity: 'warning'
        });
      }
    }, 1500);
  },

  rescanAI: () => {
    set({ isScanningAI: true });
    setTimeout(() => {
      const isNowStable = Math.random() > 0.6;
      set({
        isScanningAI: false,
        aiRiskLevel: isNowStable ? 42 : Math.floor(65 + Math.random() * 25),
        aiWaterIncrement: isNowStable ? 4 : Math.floor(8 + Math.random() * 8),
        aiDrainStatus: isNowStable ? 'stable' : 'blocked',
      });
    }, 1800);
  },

  setFocusArea: () => {
    set((state) => ({
      aiWaterIncrement: Math.max(2, state.aiWaterIncrement - 5)
    }));
  },
}));
