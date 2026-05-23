"use client";

import React, { useState, useEffect, useCallback } from "react";
import { API_URL, WS_URL } from "@/lib/api";

type AlertSeverity = 'critical' | 'high' | 'medium';
type AlertStatus = 'NEW' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

interface Alert {
  id: string;
  txn_id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
  created_at: string;
}

const MOCK_ALERTS: Alert[] = [
  { id: "ALT-9284", txn_id: "txn_abc123", severity: "critical", title: "Mule Ring Activity Detected", description: "Cluster of 5 new accounts in Mumbai funneling funds to a single node within 2 hours.", status: "NEW", created_at: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: "ALT-9283", txn_id: "txn_def456", severity: "high", title: "Velocity Breach: High Frequency", description: "14 transactions initiated from a new device fingerprint in Jaipur within 3 minutes.", status: "INVESTIGATING", created_at: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: "ALT-9282", txn_id: "txn_ghi789", severity: "critical", title: "Impossible Travel Anomaly", description: "Account accessed from Delhi and Bangalore within 45 minutes. Transactions flagged.", status: "NEW", created_at: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "ALT-9281", txn_id: "txn_jkl012", severity: "medium", title: "Night Burst Transfer", description: "Multiple transfers just below ₹50,000 threshold between 2:00 AM and 3:30 AM.", status: "RESOLVED", created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: "ALT-9280", txn_id: "txn_mno345", severity: "high", title: "OTP Relay Pattern", description: "Consistent 15-second delay between OTP generation and submission across 3 different IPs.", status: "NEW", created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
];

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col gap-1">
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-black ${color}`}>{value}</span>
    </div>
  );
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/alerts`);
      if (!res.ok) throw new Error("Backend unavailable");
      const data: Alert[] = await res.json();
      setAlerts(data.length > 0 ? data : MOCK_ALERTS);
      setBackendOnline(true);
    } catch {
      setAlerts(MOCK_ALERTS);
      setBackendOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleAction = async (id: string, action: string) => {
    // Optimistic UI update
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: action as AlertStatus } : a));

    if (backendOnline) {
      try {
        await fetch(`${API_URL}/api/v1/alerts/${id}/action`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
      } catch { /* Ignore network errors, UI already updated */ }
    }
  };

  const filtered = alerts.filter(a => {
    if (filter === "NEW") return a.status === "NEW";
    if (filter === "CRITICAL") return a.severity === "critical";
    if (filter === "INVESTIGATING") return a.status === "INVESTIGATING";
    return true;
  });

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      <div className="flex-1 flex flex-col h-full space-y-4 min-w-0">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Alert Triage Center</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">Real-time fraud alert queue. Acknowledge, investigate or dismiss.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className={backendOnline ? 'text-green-500' : 'text-slate-500'}>
              {backendOnline ? 'LIVE — Auto-refreshing every 10s' : 'OFFLINE — Showing mock data'}
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Critical NEW" value={alerts.filter(a => a.severity === 'critical' && a.status === 'NEW').length} color="text-[var(--risk-red)]" />
          <StatCard label="High Priority" value={alerts.filter(a => a.severity === 'high').length} color="text-[var(--risk-amber)]" />
          <StatCard label="Under Review" value={alerts.filter(a => a.status === 'INVESTIGATING').length} color="text-blue-400" />
          <StatCard label="Resolved" value={alerts.filter(a => a.status === 'RESOLVED').length} color="text-[var(--risk-green)]" />
        </div>

        {/* Filters */}
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          {["ALL", "NEW", "CRITICAL", "INVESTIGATING"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-[10px] font-mono tracking-widest transition-all border ${
                filter === f
                  ? 'bg-white text-black border-white font-bold'
                  : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
              }`}>
              {f}
            </button>
          ))}
          <span className="ml-auto text-[10px] font-mono text-slate-500 self-center">{filtered.length} alerts</span>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pb-6">
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-[var(--accent-copper)] border-t-transparent animate-spin"></div>
              <span className="text-xs font-mono text-slate-500">Fetching alerts from backend…</span>
            </div>
          )}

          {!loading && filtered.map(alert => (
            <div key={alert.id} className={`bg-[var(--bg-card)] border border-[var(--border-color)] flex overflow-hidden hover:border-slate-600 transition-colors group ${
              alert.status === 'RESOLVED' || alert.status === 'DISMISSED' ? 'opacity-50' : ''
            }`}>
              {/* Severity bar */}
              <div className={`w-1.5 flex-shrink-0 ${
                alert.severity === 'critical' ? 'bg-[var(--risk-red)]' :
                alert.severity === 'high' ? 'bg-[var(--risk-amber)]' : 'bg-slate-500'
              }`}></div>

              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 bg-black px-1.5 py-0.5 border border-slate-800">{alert.id}</span>
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">{timeAgo(alert.created_at)}</span>
                </div>

                <p className="text-xs text-slate-400 mb-3">{alert.description}</p>

                {alert.txn_id && (
                  <p className="text-[10px] font-mono text-slate-600 mb-3">TXN: {alert.txn_id}</p>
                )}

                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 border ${
                    alert.status === 'NEW' ? 'border-blue-500/40 text-blue-400 bg-blue-500/10' :
                    alert.status === 'INVESTIGATING' ? 'border-[var(--accent-copper)]/40 text-[var(--accent-copper)] bg-[var(--accent-copper)]/10' :
                    alert.status === 'RESOLVED' ? 'border-green-500/40 text-green-400 bg-green-500/10' :
                    'border-slate-700 text-slate-500 bg-slate-800/50'
                  }`}>
                    {alert.status}
                  </span>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {alert.status === 'NEW' && (
                      <>
                        <button onClick={() => handleAction(alert.id, 'INVESTIGATING')}
                          className="text-[10px] font-mono font-bold bg-white text-black px-3 py-1.5 hover:bg-slate-200 transition-colors">
                          ACKNOWLEDGE
                        </button>
                        <button onClick={() => handleAction(alert.id, 'DISMISSED')}
                          className="text-[10px] font-mono border border-slate-600 text-slate-400 px-3 py-1.5 hover:bg-slate-800 transition-colors">
                          DISMISS
                        </button>
                      </>
                    )}
                    {alert.status === 'INVESTIGATING' && (
                      <button onClick={() => handleAction(alert.id, 'RESOLVED')}
                        className="text-[10px] font-mono font-bold bg-[var(--risk-green)]/20 text-[var(--risk-green)] border border-[var(--risk-green)] px-3 py-1.5 hover:bg-[var(--risk-green)] hover:text-black transition-colors">
                        MARK RESOLVED
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20 text-slate-600 font-mono text-xs">No alerts match the current filter.</div>
          )}
        </div>
      </div>

      {/* Right Panel: Live Timeline */}
      <div className="w-72 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-slate-800 bg-[#0a0a0a]">
          <h3 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Activity Log</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-800"></div>
            <div className="space-y-5">
              {alerts.slice(0, 8).map((a, i) => (
                <div key={i} className="flex gap-4 pl-1">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-0.5 relative z-10 border-2 border-[#0d0d0d] ${
                    a.severity === 'critical' ? 'bg-[var(--risk-red)]' :
                    a.severity === 'high' ? 'bg-[var(--risk-amber)]' : 'bg-slate-500'
                  }`}></div>
                  <div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {a.status === 'INVESTIGATING' ? 'Analyst acknowledged' : a.status === 'RESOLVED' ? 'System resolved' : 'New alert generated'}: {a.id}
                    </p>
                    <p className="text-[10px] font-mono text-slate-600 mt-0.5">{timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
