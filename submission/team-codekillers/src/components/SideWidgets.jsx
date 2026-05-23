import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Globe, AlertTriangle, TrendingUp, ShieldOff,
  Wifi, Server, Lock, Zap, Clock
} from 'lucide-react';

const LIVE_EVENTS = [
  { country: 'IN', city: 'Mumbai',    type: 'Deepfake Detected',    color: '#ff2d55', icon: ShieldOff },
  { country: 'US', city: 'New York',  type: 'Face-Swap Flagged',    color: '#ff2d55', icon: AlertTriangle },
  { country: 'BR', city: 'São Paulo', type: 'Media Verified Clean', color: '#00ff88', icon: Lock },
  { country: 'GB', city: 'London',    type: 'GAN Artifact Found',   color: '#ff2d55', icon: ShieldOff },
  { country: 'DE', city: 'Berlin',    type: 'Authentic Confirmed',  color: '#00ff88', icon: Lock },
  { country: 'AU', city: 'Sydney',    type: 'Voice Clone Detected', color: '#ffb800', icon: Zap },
  { country: 'JP', city: 'Tokyo',     type: 'EXIF Scrub Detected',  color: '#ff2d55', icon: AlertTriangle },
  { country: 'CA', city: 'Toronto',   type: 'Media Verified Clean', color: '#00ff88', icon: Lock },
  { country: 'FR', city: 'Paris',     type: 'Deepfake Detected',    color: '#ff2d55', icon: ShieldOff },
  { country: 'SG', city: 'Singapore', type: 'Inconclusive Scan',    color: '#ffb800', icon: Activity },
];

const PLATFORM_STATS = [
  { label: 'Instagram',  pct: 34, color: '#a855f7' },
  { label: 'WhatsApp',   pct: 28, color: '#00ff88' },
  { label: 'Telegram',   pct: 19, color: '#00d4ff' },
  { label: 'Snapchat',   pct: 11, color: '#ffb800' },
  { label: 'Other',      pct: 8,  color: '#475569' },
];

function timeString() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function SideWidgets() {
  const [events, setEvents]   = useState(() => LIVE_EVENTS.slice(0, 4).map((e, i) => ({ ...e, id: i, ago: `${i * 12 + 8}s ago` })));
  const [tick, setTick]       = useState(0);
  const [serverTime, setTime] = useState(timeString);

  // Rotate live events
  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1);
      const next = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      setEvents(prev => [
        { ...next, id: Date.now(), ago: 'just now' },
        ...prev.slice(0, 4),
      ]);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setTime(timeString()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4">

      {/* ── Live global feed ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="rounded-2xl border border-slate-800/60 bg-slate-900/40 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/60 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 text-xs font-mono font-bold tracking-wider">GLOBAL THREAT FEED</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-mono">LIVE</span>
          </div>
        </div>

        {/* Event stream */}
        <div className="p-3 space-y-1.5 min-h-[220px]">
          <AnimatePresence initial={false}>
            {events.map((ev) => {
              const Icon = ev.icon;
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                  style={{
                    background: `${ev.color}08`,
                    borderColor: `${ev.color}20`,
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ev.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: ev.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: ev.color }}>{ev.type}</p>
                    <p className="text-slate-500 text-xs">{ev.city}, {ev.country}</p>
                  </div>
                  <span className="text-slate-600 text-xs font-mono flex-shrink-0">{ev.ago}</span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Source platform breakdown ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 text-xs font-mono font-bold tracking-wider">SOURCE PLATFORMS</span>
          <span className="ml-auto text-slate-600 text-xs font-mono">This week</span>
        </div>
        <div className="space-y-3">
          {PLATFORM_STATS.map((p, i) => (
            <div key={p.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-xs">{p.label}</span>
                <span className="text-xs font-mono font-bold" style={{ color: p.color }}>{p.pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}60` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.pct}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── System status ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 text-xs font-mono font-bold tracking-wider">SYSTEM STATUS</span>
          <span className="ml-auto text-slate-500 text-xs font-mono">{serverTime}</span>
        </div>
        <div className="space-y-2.5">
          {[
            { label: 'GAN Detector',      status: 'Operational', latency: '12ms',  color: '#00ff88' },
            { label: 'EXIF Parser',       status: 'Operational', latency: '4ms',   color: '#00ff88' },
            { label: 'Temporal Scanner',  status: 'Operational', latency: '38ms',  color: '#00ff88' },
            { label: 'Harassment DB',     status: 'Operational', latency: '21ms',  color: '#00ff88' },
            { label: 'Report Generator',  status: 'Operational', latency: '2ms',   color: '#00ff88' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3 py-2 border-b border-slate-800/40 last:border-0">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ backgroundColor: s.color }} />
              <span className="text-slate-400 text-xs flex-1">{s.label}</span>
              <span className="text-xs font-mono" style={{ color: s.color }}>{s.status}</span>
              <span className="text-slate-600 text-xs font-mono w-10 text-right">{s.latency}</span>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
