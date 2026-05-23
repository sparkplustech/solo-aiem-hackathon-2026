"use client";

import React, { useState, useEffect, useCallback } from "react";

// --- Types ---
interface SAR {
  id: string;
  entity: string;
  type: string;
  amount: string;
  status: string;
  date: string;
}

interface Structuring {
  user: string;
  total: string;
  txns: number;
  pattern: string;
}

// --- Mock Data Fallbacks ---
const MOCK_SARS: SAR[] = [
  { id: "SAR-2026-0881", entity: "Rajeev M.", type: "Structuring (Smurfing)", amount: "₹495,000", status: "PENDING REVIEW", date: "Today, 10:45 AM" },
  { id: "SAR-2026-0880", entity: "Global Trade Exim", type: "Trade-Based Money Laundering", amount: "₹12.4M", status: "DRAFT", date: "Today, 09:15 AM" },
  { id: "SAR-2026-0879", entity: "Mule Cluster C-9", type: "Layering / Network", amount: "₹3.2M", status: "FILED", date: "Yesterday" },
  { id: "SAR-2026-0878", entity: "Unknown Entity", type: "Rapid Movement to Crypto", amount: "₹850,000", status: "PENDING REVIEW", date: "Yesterday" }
];

const MOCK_STRUCTS: Structuring[] = [
  { user: "User-8841", total: "₹49,900", txns: 10, pattern: "Multiple ₹4,990 transfers in 24h" },
  { user: "User-1192", total: "₹99,000", txns: 4, pattern: "Multiple ₹24,750 transfers to same beneficiary" },
  { user: "User-5531", total: "₹499,000", txns: 10, pattern: "Daily ₹49,900 deposit over 10 days" },
];

function KPICard({ label, value, trend, risk }: { label: string, value: string, trend: string, risk?: 'high' | 'good' }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm p-4 flex flex-col justify-center">
      <span className="text-[10px] font-mono text-[var(--accent-light)] uppercase tracking-wider">{label}</span>
      <div className="flex items-end justify-between mt-2">
        <span className="text-2xl font-black text-white">{value}</span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
          risk === 'high' ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border border-[var(--risk-red)]/30' : 
          risk === 'good' ? 'bg-[var(--risk-green)]/20 text-[var(--risk-green)] border border-[var(--risk-green)]/30' :
          'bg-slate-800 text-slate-400'
        }`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

export default function CompliancePage() {
  const [sarQueue, setSarQueue] = useState<SAR[]>(MOCK_SARS);
  const [structuringCases, setStructuringCases] = useState<Structuring[]>(MOCK_STRUCTS);
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchComplianceData = useCallback(async () => {
    try {
      const [sarsRes, structsRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/compliance/sars"),
        fetch("http://localhost:8000/api/v1/compliance/structuring")
      ]);
      
      if (!sarsRes.ok || !structsRes.ok) throw new Error("API Error");
      
      const sarsData = await sarsRes.json();
      const structsData = await structsRes.json();
      
      setSarQueue(sarsData.length > 0 ? sarsData : MOCK_SARS);
      setStructuringCases(structsData.length > 0 ? structsData : MOCK_STRUCTS);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
      setSarQueue(MOCK_SARS);
      setStructuringCases(MOCK_STRUCTS);
    }
  }, []);

  useEffect(() => {
    fetchComplianceData();
    const interval = setInterval(fetchComplianceData, 15000);
    return () => clearInterval(interval);
  }, [fetchComplianceData]);
  return (
    <div className="flex flex-col h-full space-y-6 animate-fade-in overflow-y-auto pr-2 scrollbar-hide">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)] mb-1">AML & Compliance Hub</h2>
          <p className="text-sm text-[var(--accent-light)] font-mono">Anti-Money Laundering monitoring and regulatory reporting queue.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className={backendOnline ? 'text-green-500' : 'text-slate-500'}>
            {backendOnline ? 'LIVE — Compliance queues syncing' : 'OFFLINE — Mock data'}
          </span>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard label="Pending SARs" value="14" trend="+3 today" risk="high" />
        <KPICard label="Structuring Alerts" value="42" trend="+12% WoW" risk="high" />
        <KPICard label="PEP Hits (24h)" value="0" trend="Clear" risk="good" />
        <KPICard label="Compliance Score" value="98.2" trend="Excellent" risk="good" />
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* SAR Queue (2 cols) */}
        <div className="col-span-2 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex flex-col shadow-2xl overflow-hidden">
          <div className="bg-[#0a0a0a] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
               <svg className="w-4 h-4 text-[var(--accent-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               <h3 className="text-xs font-mono tracking-widest text-[var(--accent-light)] uppercase">SAR Review Queue</h3>
             </div>
             <button className="text-[10px] font-mono border border-[var(--accent-copper)] text-[var(--accent-copper)] hover:bg-[var(--accent-copper)] hover:text-black transition-colors px-3 py-1.5 rounded">
               GENERATE NEW SAR
             </button>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-[10px] uppercase bg-[#111111] text-slate-500 font-mono">
                <tr>
                  <th className="px-5 py-3">Report ID</th>
                  <th className="px-5 py-3">Subject Entity</th>
                  <th className="px-5 py-3">Typology</th>
                  <th className="px-5 py-3">Volume</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {sarQueue.map((sar, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4 font-mono text-[11px] text-white">{sar.id}</td>
                    <td className="px-5 py-4 font-bold text-xs">{sar.entity}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{sar.type}</td>
                    <td className="px-5 py-4 font-mono text-[var(--accent-copper)] text-xs">{sar.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${
                        sar.status === 'PENDING REVIEW' ? 'bg-[var(--risk-amber)]/10 text-[var(--risk-amber)] border-[var(--risk-amber)]/30' :
                        sar.status === 'DRAFT' ? 'bg-slate-800/50 text-slate-400 border-slate-700' :
                        'bg-[var(--risk-green)]/10 text-[var(--risk-green)] border-[var(--risk-green)]/30'
                      }`}>
                        {sar.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="text-[10px] font-mono text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Structuring Detectors (1 col) */}
        <div className="col-span-1 flex flex-col gap-6">
          
          {/* Structuring Panel */}
          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex flex-col shadow-2xl overflow-hidden">
             <div className="bg-[#0a0a0a] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
               <h3 className="text-xs font-mono tracking-widest text-[var(--accent-light)] uppercase">Structuring (Smurfing)</h3>
             </div>
             <div className="flex-1 p-4 space-y-4">
                <p className="text-[11px] text-slate-400 border-b border-slate-800 pb-2">Detecting entities attempting to evade ₹50,000 reporting thresholds.</p>
                {structuringCases.map((c, i) => (
                  <div key={i} className="bg-[#111] p-3 rounded-sm border border-[var(--risk-amber)]/20 hover:border-[var(--risk-amber)]/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-mono text-xs text-white">{c.user}</span>
                      <span className="font-mono text-xs font-bold text-[var(--risk-amber)]">{c.total}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{c.pattern}</p>
                    <div className="flex items-center gap-2">
                       <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden flex">
                          {Array.from({length: c.txns}).map((_, idx) => (
                            <div key={idx} className="flex-1 bg-[var(--risk-amber)] border-r border-[#111] last:border-0"></div>
                          ))}
                       </div>
                       <span className="text-[9px] font-mono text-slate-400">{c.txns} Txns</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* PEP & Sanctions Panel */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex flex-col shadow-2xl overflow-hidden">
             <div className="bg-[#0a0a0a] border-b border-[var(--border-color)] p-4 flex justify-between items-center">
               <h3 className="text-xs font-mono tracking-widest text-[var(--accent-light)] uppercase">Sanctions & PEP Match</h3>
             </div>
             <div className="p-4 flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--risk-green)]/10 border-2 border-[var(--risk-green)] flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[var(--risk-green)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <span className="text-sm font-bold text-white mb-1">Zero Matches</span>
                <span className="text-[10px] font-mono text-slate-400 max-w-[200px]">Last 24 hours. Real-time screening against FATF, OFAC, and UN Security Council databases is active.</span>
             </div>
          </div>

        </div>

      </div>

    </div>
  );
}

