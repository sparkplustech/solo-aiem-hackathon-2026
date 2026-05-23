"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

// --- Mock Data ---
const timeSeriesData = Array.from({ length: 30 }, (_, i) => ({
  date: `May ${i + 1}`,
  total: Math.floor(Math.random() * 5000) + 2000,
  flagged: Math.floor(Math.random() * 300) + 50,
}));

const riskDistribution = [
  { name: 'Red Risk', value: 423, color: 'var(--risk-red)' },
  { name: 'Amber Risk', value: 1205, color: 'var(--risk-amber)' },
  { name: 'Green Risk', value: 8372, color: 'var(--risk-green)' },
];

const patterns = [
  { name: "New Device + Night Burst", count: 184, trend: "up", perc: 85 },
  { name: "Mule Funnel Activity", count: 92, trend: "up", perc: 65 },
  { name: "Velocity Threshold Breach", count: 76, trend: "down", perc: 45 },
  { name: "OTP Relay Indicator", count: 41, trend: "down", perc: 25 },
];

const cities = [
  { name: "Mumbai", count: 145 },
  { name: "Delhi", count: 98 },
  { name: "Bangalore", count: 72 },
  { name: "Hyderabad", count: 45 },
];

function StatCard({ title, value, sub, sparklineColor }: { title: string, value: string, sub: string, sparklineColor?: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 shadow-lg relative overflow-hidden group">
      <div className="relative z-10">
        <h3 className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-widest mb-1">{title}</h3>
        <div className="text-3xl font-black text-[var(--text-main)]">{value}</div>
        <div className="text-[10px] font-mono mt-2 text-slate-400">{sub}</div>
      </div>
      {sparklineColor && (
        <div className="absolute bottom-0 left-0 w-full h-1">
          <div className="h-full bg-current opacity-50" style={{ color: sparklineColor, width: '100%' }}></div>
        </div>
      )}
    </div>
  );
}

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("7D");

  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in overflow-y-auto pr-2 scrollbar-hide">
      
      {/* Header & Controls */}
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)]">Risk Analytics & Reports</h2>
          <p className="text-sm text-[var(--accent-light)] font-mono mt-1">Live AI model telemetry and fraud trend analysis.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-1.5 border border-[var(--accent-copper)] text-[var(--accent-copper)] text-xs font-mono font-bold hover:bg-[var(--accent-copper)] hover:text-black transition-colors rounded-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            EXPORT PDF
          </button>
          <div className="flex bg-[#111] p-1 rounded-sm border border-slate-800">
          {["1H", "6H", "24H", "7D", "30D"].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 text-xs font-mono rounded-md transition-all ${
                timeRange === range 
                  ? 'bg-[var(--accent-copper)] text-black font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Model Precision" value="97.8%" sub="+0.4% from last week" sparklineColor="var(--risk-green)" />
        <StatCard title="False Positive Rate" value="1.2%" sub="-0.1% from last week" sparklineColor="var(--risk-amber)" />
        <StatCard title="Avg Latency" value="24ms" sub="P99: 45ms" sparklineColor="var(--accent-copper)" />
        <StatCard title="Auto-Blocked" value="₹1.4M" sub="Saved today" sparklineColor="var(--risk-red)" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Trend Chart (2 columns) */}
        <div className="col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 shadow-lg flex flex-col min-h-[350px]">
          <h3 className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-widest mb-4">Fraud Volume Trend ({timeRange})</h3>
          <div className="flex-1 w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--risk-red)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--risk-red)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-copper)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-copper)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="date" stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
                <Area type="monotone" dataKey="total" stroke="var(--accent-copper)" fillOpacity={1} fill="url(#colorTotal)" />
                <Area type="monotone" dataKey="flagged" stroke="var(--risk-red)" fillOpacity={1} fill="url(#colorFlagged)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution (1 column) */}
        <div className="col-span-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 shadow-lg flex flex-col">
          <h3 className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-widest mb-4">Risk Distribution</h3>
          <div className="flex-1 w-full h-full relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: 'var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-2xl font-black">{10000}</p>
                <p className="text-[9px] font-mono text-slate-500 tracking-widest">TOTAL</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {riskDistribution.map(r => (
              <div key={r.name} className="flex justify-between items-center text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }}></div>
                  <span className="text-slate-300">{r.name}</span>
                </div>
                <span className="text-white">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Patterns (1.5 columns) */}
        <div className="col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 shadow-lg">
          <h3 className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-widest mb-4">Top AI-Identified Patterns</h3>
          <div className="space-y-4">
            {patterns.map((p, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 text-center text-[10px] font-mono text-slate-500">#{i+1}</div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-200">{p.name}</span>
                    <span className="text-xs font-mono text-slate-400">{p.count} instances</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent-copper)]" style={{ width: `${p.perc}%` }}></div>
                  </div>
                </div>
                <div className="w-8 text-center">
                  {p.trend === 'up' 
                    ? <span className="text-[var(--risk-red)]">↑</span> 
                    : <span className="text-[var(--risk-green)]">↓</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geo Hotspots (1.5 columns) */}
        <div className="col-span-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-5 shadow-lg">
          <h3 className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-widest mb-4">Geographic Hotspots</h3>
          <div className="space-y-4">
            {cities.map((c, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-800/50 pb-2 last:border-0">
                <span className="text-sm text-slate-300">{c.name}</span>
                <span className="text-xs font-mono text-[var(--risk-red)]">{c.count} flags</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

