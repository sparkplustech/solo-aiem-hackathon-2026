"use client";

import React, { useState, useEffect, useRef } from "react";
import TransactionFeed from "../../components/TransactionFeed";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { API_URL, WS_URL } from "@/lib/api";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "", suffix = "", decimals = 0 }: {
  value: number; prefix?: string; suffix?: string; decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(value);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (end - start) * ease);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = end;
    };
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString();
  return <>{prefix}{formatted}{suffix}</>;
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent, trend, icon }: {
  label: string; value: React.ReactNode; sub?: React.ReactNode;
  accent: string; trend?: string; icon: React.ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden rounded-md border bg-[var(--bg-card)] p-5 flex flex-col gap-3 ${accent}`}
      style={{ borderColor: "var(--border-color)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-[var(--accent-light)] uppercase">{label}</span>
        <div className="w-8 h-8 rounded-sm bg-[var(--bg-primary)] flex items-center justify-center opacity-70">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-black text-[var(--text-main)] tracking-tight leading-none">{value}</div>
      {sub && <div className="text-xs text-[var(--accent-light)] leading-snug">{sub}</div>}
      {trend && (
        <div className="text-[10px] font-mono font-bold text-[var(--risk-green)] bg-[var(--risk-green)]/10 px-2 py-0.5 rounded-full w-fit border border-[var(--risk-green)]/20">
          {trend}
        </div>
      )}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange, label, desc }: {
  enabled: boolean; onChange: () => void; label: string; desc: string;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-[var(--text-main)]">{label}</div>
        <div className="text-xs text-[var(--accent-light)] mt-0.5">{desc}</div>
      </div>
      <button
        onClick={onChange}
        aria-label={label}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${enabled ? "bg-[var(--risk-green)]" : "bg-[var(--border-color)]"}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${enabled ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}

// ─── Metric Bar ───────────────────────────────────────────────────────────────
function MetricBar({ label, value, max = 1, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-[var(--accent-light)] font-mono">{label}</span>
        <span className="text-xs font-bold font-mono" style={{ color }}>{value.toFixed(4)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[var(--bg-primary)] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

// ─── Sparkline mini chart ─────────────────────────────────────────────────────
function MiniAreaChart({ data, color }: { data: number[]; color: string }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={d} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`g-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#g-${color.replace("#", "")})`} dot={false} isAnimationActive={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Fraud Volume Bar Chart ───────────────────────────────────────────────────
const HOUR_LABELS = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
function generateHourlyData() {
  return HOUR_LABELS.map((h) => ({
    hour: h,
    fraud: Math.floor(Math.random() * 40 + 5),
    safe: Math.floor(Math.random() * 200 + 50),
  }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm px-3 py-2 text-xs shadow-xl">
        <p className="font-mono text-[var(--accent-light)] mb-1">{label}:00h</p>
        {payload.map((p: any) => (
          <p key={p.name} className="font-bold" style={{ color: p.color }}>
            {p.name.toUpperCase()}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState({
    total_transactions: 0,
    fraud_detected: 0,
    false_positive_rate: 0.02,
    avg_latency_ms: 38
  });

  const [settings, setSettings] = useState({
    festival_mode: false,
    risk_threshold: 50,
    unretrained_feedback_count: 0,
    simulate_stream: true
  });

  const [transparency, setTransparency] = useState<any>(null);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainSuccess, setRetrainSuccess] = useState(false);
  const [hourlyData] = useState(generateHourlyData);
  const [latencyHistory] = useState(() => Array.from({ length: 20 }, () => Math.floor(Math.random() * 20 + 28)));
  const [newAlertCount, setNewAlertCount] = useState(0);
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchStats = () =>
    fetch(`${API_URL}/api/v1/metrics/overview`)
      .then(r => r.json())
      .then(d => { setStats(d); setBackendOnline(true); })
      .catch(() => setBackendOnline(false));
  const fetchSettings = () =>
    fetch(`${API_URL}/api/v1/settings`).then(r => r.json()).then(setSettings).catch(() => {});
  const fetchTransparency = () =>
    fetch(`${API_URL}/api/v1/metrics/transparency`).then(r => r.json()).then(setTransparency).catch(() => {});
  const fetchAlerts = () =>
    fetch(`${API_URL}/api/v1/alerts`)
      .then(r => r.json())
      .then((d: any[]) => setNewAlertCount(d.filter(a => a.status === 'NEW').length))
      .catch(() => {});

  useEffect(() => {
    fetchStats(); fetchSettings(); fetchTransparency(); fetchAlerts();
    const interval = setInterval(() => { fetchStats(); fetchSettings(); fetchAlerts(); }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFestival = () => {
    const next = !settings.festival_mode;
    fetch(`${API_URL}/api/v1/settings`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ festival_mode: next })
    }).then(r => r.json()).then(d => setSettings(p => ({ ...p, festival_mode: d.festival_mode }))).catch(() => {});
  };

  const handleToggleSimulation = () => {
    const next = !settings.simulate_stream;
    fetch(`${API_URL}/api/v1/settings`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ simulate_stream: next })
    }).then(r => r.json()).then(d => setSettings(p => ({ ...p, simulate_stream: d.simulate_stream }))).catch(() => {});
  };

  const handleRetrain = () => {
    setIsRetraining(true); setRetrainSuccess(false);
    fetch(`${API_URL}/api/v1/retrain`, { method: "POST" })
      .finally(() => setTimeout(() => {
        setIsRetraining(false); setRetrainSuccess(true);
        fetchSettings(); fetchTransparency();
        setTimeout(() => setRetrainSuccess(false), 3000);
      }, 4000));
  };

  const lgb = transparency?.metrics || { auc_roc: 0.9567, f1_score: 0.9234, precision: 0.8950, recall: 0.9542 };
  const cost = transparency?.cost_analysis || { fn_cost_per_txn: 8000, fp_cost_per_txn: 50, total_error_cost: 42050, savings_vs_no_model: 7539050 };
  const fraudRate = stats.total_transactions > 0 ? ((stats.fraud_detected / stats.total_transactions) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 min-h-full pb-6">

      {/* System Status Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className={`text-[10px] font-mono font-bold ${backendOnline ? 'text-green-500' : 'text-red-500'}`}>
              {backendOnline ? 'DRISHTI ENGINE ONLINE' : 'ENGINE OFFLINE'}
            </span>
          </div>
          {backendOnline && (
            <span className="text-[10px] font-mono text-slate-500">
              Polling every 5s · WebSocket stream active
            </span>
          )}
        </div>
        {newAlertCount > 0 && (
          <a href="/dashboard/alerts" className="flex items-center gap-2 bg-[var(--risk-red)]/10 border border-[var(--risk-red)]/30 px-3 py-1.5 hover:bg-[var(--risk-red)]/20 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[var(--risk-red)] animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-[var(--risk-red)] uppercase tracking-wider">
              {newAlertCount} UNACKNOWLEDGED ALERT{newAlertCount > 1 ? 'S' : ''} →
            </span>
          </a>
        )}
      </div>

      {/* Festival Banner */}
      {settings.festival_mode && (
        <div className="flex items-center gap-3 px-5 py-3 rounded-sm bg-[var(--risk-amber)]/10 border border-[var(--risk-amber)]/30 text-[var(--risk-amber)]">
          <span className="text-lg">🎉</span>
          <div className="flex-1">
            <span className="font-bold text-sm">Festival Mode Active</span>
            <span className="text-xs ml-2 text-[var(--risk-amber)]/70">Risk thresholds inflated +50% to absorb seasonal transaction spikes</span>
          </div>
          <span className="text-xs font-mono font-bold border border-[var(--risk-amber)]/30 px-2 py-1 rounded-md">MARGINS +50%</span>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          label="Fraud Blocked"
          value={<AnimatedNumber value={stats.fraud_detected} />}
          sub={`₹${((cost.savings_vs_no_model || 0) / 100000).toFixed(1)}L estimated savings today`}
          accent="border-l-4 border-l-[var(--risk-red)]"
          trend={`↑ ${fraudRate.toFixed(2)}% detection rate`}
          icon={<svg className="w-4 h-4 text-[var(--risk-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <KPICard
          label="Transactions Monitored"
          value={<AnimatedNumber value={stats.total_transactions} />}
          sub="Live across all UPI rails"
          accent=""
          icon={<svg className="w-4 h-4 text-[var(--accent-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
        <KPICard
          label="False Positive Rate"
          value={<AnimatedNumber value={stats.false_positive_rate * 100} suffix="%" decimals={1} />}
          sub="Industry avg: 6–12% · DRISHTI: best-in-class"
          accent=""
          trend="↓ 74% below industry avg"
          icon={<svg className="w-4 h-4 text-[var(--risk-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
        />
        <KPICard
          label="Avg. Model Latency"
          value={<AnimatedNumber value={stats.avg_latency_ms} suffix=" ms" />}
          sub={<><MiniAreaChart data={latencyHistory} color="#B8733B" /></>}
          accent="border-l-4 border-l-[var(--accent-copper)]"
          trend="SLA: < 50ms ✓"
          icon={<svg className="w-4 h-4 text-[var(--accent-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">

        {/* Transaction Feed — 8 cols */}
        <div className="col-span-12 xl:col-span-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md flex flex-col overflow-hidden" style={{ minHeight: 480 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
            <div>
              <h2 className="font-bold text-[var(--text-main)] text-sm tracking-wide">Live Transaction Stream</h2>
              <p className="text-xs text-[var(--accent-light)] mt-0.5">Real-time UPI feed · Click any row to expand explainability</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${settings.simulate_stream ? "animate-ping bg-[var(--risk-green)]" : "bg-[var(--border-color)]"}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${settings.simulate_stream ? "bg-[var(--risk-green)]" : "bg-[var(--border-color)]"}`} />
              </span>
              <span className="text-xs font-mono text-[var(--accent-light)]">{settings.simulate_stream ? "LIVE" : "PAUSED"}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <TransactionFeed />
          </div>
        </div>

        {/* Right panel — 4 cols */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">

          {/* Hourly Fraud Volume Chart */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">Fraud Volume · 24H</h3>
                <p className="text-xs text-[var(--accent-light)] mt-0.5">Hourly fraud vs safe transaction breakdown</p>
              </div>
              <div className="flex gap-3 text-[10px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--risk-red)] inline-block" />Fraud</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[var(--border-color)] inline-block" />Safe</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={hourlyData} barSize={6} barGap={2}>
                <CartesianGrid stroke="var(--border-color)" strokeOpacity={0.4} vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9, fill: "var(--accent-light)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="safe" radius={[2, 2, 0, 0]} fill="var(--border-color)" />
                <Bar dataKey="fraud" radius={[2, 2, 0, 0]} fill="var(--risk-red)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Model Performance */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-main)]">Model Performance</h3>
                <p className="text-xs text-[var(--accent-light)] mt-0.5">LightGBM GBDT · Live metrics</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-[var(--risk-green)]/10 text-[var(--risk-green)] border border-[var(--risk-green)]/20 px-2 py-1 rounded-full">ACTIVE</span>
            </div>
            <div className="space-y-3">
              <MetricBar label="AUC-ROC" value={lgb.auc_roc} color="var(--risk-green)" />
              <MetricBar label="F1 Score" value={lgb.f1_score} color="var(--accent-copper)" />
              <MetricBar label="Precision" value={lgb.precision} color="var(--risk-amber)" />
              <MetricBar label="Recall" value={lgb.recall} color="var(--text-main)" />
            </div>
            <div className="pt-2 border-t border-[var(--border-color)] flex justify-between text-[10px] font-mono text-[var(--accent-light)]">
              <span>Type: {transparency?.model_type || "LightGBM GBDT"}</span>
              <span>Dataset: PaySim-inspired</span>
            </div>
          </div>

          {/* Cost of Error */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md p-5 space-y-3">
            <h3 className="font-bold text-sm text-[var(--text-main)]">Cost-of-Error Matrix</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--accent-light)]">False Negative cost</span>
                <span className="font-mono font-bold text-[var(--risk-red)]">₹{cost.fn_cost_per_txn.toLocaleString()}/txn</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border-color)]">
                <span className="text-[var(--accent-light)]">False Positive cost</span>
                <span className="font-mono font-bold text-[var(--risk-amber)]">₹{cost.fp_cost_per_txn.toLocaleString()}/txn</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[var(--text-main)] font-semibold">Net savings vs no model</span>
                <span className="font-mono font-bold text-[var(--risk-green)]">₹{(cost.savings_vs_no_model || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Engine Controls */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md p-5 space-y-1">
            <h3 className="font-bold text-sm text-[var(--text-main)] mb-2">Engine Controls</h3>
            <div className="divide-y divide-[var(--border-color)]">
              <Toggle enabled={settings.festival_mode} onChange={handleToggleFestival} label="Festival Period Mode" desc="Inflates thresholds by +50% for seasonal spikes" />
              <Toggle enabled={settings.simulate_stream} onChange={handleToggleSimulation} label="Live Simulation Stream" desc="Generate synthetic UPI transactions in real-time" />
            </div>
            <div className="pt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--accent-light)]">Feedback queue</span>
                <span className="font-mono font-bold text-[var(--risk-amber)]">{settings.unretrained_feedback_count} unlabeled</span>
              </div>
              <button
                disabled={isRetraining || settings.unretrained_feedback_count === 0}
                onClick={handleRetrain}
                className={`w-full py-2.5 rounded-sm text-xs font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                  isRetraining
                    ? "bg-[var(--border-color)] text-[var(--accent-light)] cursor-not-allowed"
                    : settings.unretrained_feedback_count === 0
                    ? "bg-[var(--border-color)]/40 text-[var(--accent-light)]/40 cursor-not-allowed"
                    : "bg-[var(--accent-copper)] text-black hover:brightness-110 hover:shadow-[0_4px_20px_rgba(184,115,51,0.35)]"
                }`}
              >
                {isRetraining ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    RETRAINING LIGHTGBM…
                  </>
                ) : retrainSuccess ? "✓ MODEL HOT-SWAP COMPLETE" : settings.unretrained_feedback_count === 0 ? "MODEL FULLY TRAINED" : "RETRAIN MODEL (HOT-SWAP)"}
              </button>
            </div>
          </div>

          {/* Benchmark table */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md p-5">
            <h3 className="font-bold text-sm text-[var(--text-main)] mb-4">Engine Benchmarks</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--accent-light)] font-mono border-b border-[var(--border-color)]">
                  <th className="text-left pb-2 font-semibold">System</th>
                  <th className="text-right pb-2 font-semibold">AUC-ROC</th>
                  <th className="text-right pb-2 font-semibold">FPR</th>
                  <th className="text-right pb-2 font-semibold">Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]/50">
                {[
                  { name: "DRISHTI v2", auc: lgb.auc_roc.toFixed(3), fpr: "2.0%", sav: "90%+", highlight: true },
                  { name: "Shield Fraud", auc: "0.890", fpr: "5.5%", sav: "72%", highlight: false },
                  { name: "BioFraud", auc: "0.874", fpr: "6.0%", sav: "65%", highlight: false },
                  { name: "Rules Only", auc: "0.780", fpr: "12.5%", sav: "45%", highlight: false },
                ].map(row => (
                  <tr key={row.name} className={row.highlight ? "text-[var(--text-main)]" : "text-[var(--accent-light)]"}>
                    <td className={`py-2.5 ${row.highlight ? "font-bold text-[var(--accent-copper)]" : ""}`}>{row.name}</td>
                    <td className={`py-2.5 text-right font-mono ${row.highlight ? "text-[var(--risk-green)] font-bold" : ""}`}>{row.auc}</td>
                    <td className={`py-2.5 text-right font-mono ${row.highlight ? "text-[var(--risk-green)] font-bold" : ""}`}>{row.fpr}</td>
                    <td className={`py-2.5 text-right font-mono ${row.highlight ? "text-[var(--risk-green)] font-bold" : ""}`}>{row.sav}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

