"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { API_URL, WS_URL } from "@/lib/api";

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Jaipur"];
const DEVICES = ["iPhone 13", "Samsung S22", "Unknown Device", "OnePlus 9", "MacBook Pro", "Windows PC"];
const NAMES = ["Rahul Sharma", "Priya Patel", "Amit Kumar", "Neha Gupta", "Vikram Singh", "Anjali Desai"];

const generateMockTransactions = (count: number) => {
  return Array.from({ length: count }, (_, i) => {
    const amount = Math.floor(Math.random() * 95000) + 100;
    let riskLevel = "green";
    let riskScore = Math.random() * 30;
    if (Math.random() > 0.85) { riskLevel = "red"; riskScore = 75 + Math.random() * 24; }
    else if (Math.random() > 0.6) { riskLevel = "amber"; riskScore = 31 + Math.random() * 43; }
    const timestamp = new Date();
    timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 1440));
    return {
      id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp, sender: `${NAMES[Math.floor(Math.random() * NAMES.length)].split(' ')[0].toLowerCase()}@okhdfcbank`,
      receiver: `merchant${Math.floor(Math.random() * 999)}@ybl`, amount,
      riskScore: riskScore.toFixed(1), riskLevel,
      device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
      city: CITIES[Math.floor(Math.random() * CITIES.length)],
      isNight: timestamp.getHours() >= 23 || timestamp.getHours() <= 5,
      isNewDevice: Math.random() > 0.8,
      shapFeatures: [
        { feature: "amount_vs_avg", contribution: (Math.random() * 20).toFixed(1) },
        { feature: "velocity_1h", contribution: (Math.random() * 15).toFixed(1) },
        { feature: "device_trust", contribution: (Math.random() * 10).toFixed(1) }
      ]
    };
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

const MOCK_DATA = generateMockTransactions(150);

function StatCard({ label, value, trend }: { label: string, value: string, trend?: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 flex flex-col justify-center">
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="flex items-end gap-2 mt-1">
        <span className="text-2xl font-black text-white">{value}</span>
        {trend && <span className="text-xs font-mono text-[var(--accent-copper)] mb-1">{trend}</span>}
      </div>
    </div>
  );
}

type TxnRow = ReturnType<typeof generateMockTransactions>[0];

function mapBackendTxn(r: any): TxnRow {
  return {
    id: r.id || r.transaction_id || "—",
    timestamp: new Date(r.created_at || r.timestamp || Date.now()),
    sender: r.sender_upi || r.sender || "—",
    receiver: r.receiver_upi || r.receiver || "—",
    amount: Number(r.amount) || 0,
    riskScore: String(r.risk_score ?? "—"),
    riskLevel: r.risk_level || "green",
    device: r.device_id || "Unknown",
    city: r.lat ? `${r.lat.toFixed(2)},${r.lon?.toFixed(2)}` : "—",
    isNight: false,
    isNewDevice: false,
    shapFeatures: r.top_shap_features || [],
  };
}

export default function TransactionsPage() {
  const [txnData, setTxnData] = useState<TxnRow[]>(MOCK_DATA);
  const [backendOnline, setBackendOnline] = useState(false);
  const [newRowIds, setNewRowIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<TxnRow | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const itemsPerPage = 15;

  // Initial REST fetch
  const fetchTxns = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/transactions`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.length > 0) {
        setTxnData(data.map(mapBackendTxn));
        setBackendOnline(true);
      }
    } catch {
      setBackendOnline(false);
    }
  }, []);

  // WebSocket for live streaming
  useEffect(() => {
    fetchTxns();

    const connect = () => {
      const ws = new WebSocket(`${WS_URL}/ws/transactions`);
      wsRef.current = ws;

      ws.onopen = () => setBackendOnline(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "explanation_ready") return;
          const row = mapBackendTxn(msg);
          setTxnData(prev => [row, ...prev.slice(0, 499)]);
          setNewRowIds(prev => { const s = new Set(prev); s.add(row.id); setTimeout(() => setNewRowIds(p => { const n = new Set(p); n.delete(row.id); return n; }), 2000); return s; });
        } catch { /* ignore parse errors */ }
      };

      ws.onclose = () => {
        setBackendOnline(false);
        setTimeout(connect, 5000); // Reconnect after 5s
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, [fetchTxns]);

  const filters = ["All", "Red Risk", "Amber Risk", "Green Risk", "New Device", "Night Txn"];

  // Filter and Sort Logic
  const processedData = useMemo(() => {
    let filtered = txnData;

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(lower) ||
        t.sender.toLowerCase().includes(lower) ||
        t.receiver.toLowerCase().includes(lower)
      );
    }

    if (activeFilter !== "All") {
      if (activeFilter === "Red Risk") filtered = filtered.filter(t => t.riskLevel === "red");
      if (activeFilter === "Amber Risk") filtered = filtered.filter(t => t.riskLevel === "amber");
      if (activeFilter === "Green Risk") filtered = filtered.filter(t => t.riskLevel === "green");
      if (activeFilter === "New Device") filtered = filtered.filter(t => t.isNewDevice);
      if (activeFilter === "Night Txn") filtered = filtered.filter(t => t.isNight);
    }

    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        let valA: any = a[sortConfig.key as keyof typeof a];
        let valB: any = b[sortConfig.key as keyof typeof b];
        if (sortConfig.key === 'amount' || sortConfig.key === 'riskScore') { valA = Number(valA); valB = Number(valB); }
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, activeFilter, sortConfig, txnData]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const paginatedData = processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const totalAmount = txnData.reduce((acc, t) => acc + t.amount, 0);
  const flaggedCount = txnData.filter(t => t.riskLevel === 'red').length;
  const fraudRate = txnData.length > 0 ? ((flaggedCount / txnData.length) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex h-full relative overflow-hidden">
      <div className={`flex-1 flex flex-col h-full space-y-4 transition-all duration-300 ${selectedTxn ? 'pr-96' : ''}`}>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Transaction Explorer</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">Live transaction feed. Searchable, filterable, sortable.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className={backendOnline ? 'text-green-500' : 'text-slate-500'}>
              {backendOnline ? `LIVE STREAM — ${txnData.length} transactions` : 'OFFLINE — Mock data'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total Volume" value={txnData.length.toLocaleString()} />
          <StatCard label="Flagged (Red)" value={flaggedCount.toString()} trend={`${fraudRate}% rate`} />
          <StatCard label="Avg Ticket" value={txnData.length > 0 ? `₹${Math.floor(totalAmount / txnData.length).toLocaleString()}` : '—'} />
          <StatCard label="Total Value" value={`₹${totalAmount.toLocaleString()}`} />
        </div>

        {/* Search & Filters */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4 rounded-sm flex flex-col gap-4 shadow-lg">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Search by UPI ID, Transaction ID..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-[#0a0a0a] border border-slate-700/50 rounded-sm py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-copper)] transition-all"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {filters.map(f => (
              <button 
                key={f}
                onClick={() => { setActiveFilter(f); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all border ${
                  activeFilter === f 
                    ? 'bg-[var(--accent-copper)]/10 text-[var(--accent-copper)] border-[var(--accent-copper)]/50' 
                    : 'bg-black/20 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm overflow-hidden flex flex-col shadow-2xl relative">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-[#0a0a0a] text-[var(--accent-light)] font-mono sticky top-0 z-10 ">
                <tr>
                  {['timestamp', 'sender', 'amount', 'riskScore', 'city'].map((key) => (
                    <th key={key} className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort(key)}>
                      <div className="flex items-center gap-1">
                        {key === 'timestamp' ? 'Time' : key === 'riskScore' ? 'Risk' : key.charAt(0).toUpperCase() + key.slice(1)}
                        {sortConfig?.key === key && (
                          <span className="text-[var(--accent-copper)]">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {paginatedData.map((txn) => (
                  <tr
                    key={txn.id}
                    onClick={() => setSelectedTxn(txn)}
                    className={`hover:bg-white/[0.02] cursor-pointer transition-all group ${
                      selectedTxn?.id === txn.id ? 'bg-[var(--accent-copper)]/5 border-l-2 border-[var(--accent-copper)]' : ''
                    } ${newRowIds.has(txn.id) ? 'bg-green-500/10 border-l-2 border-green-500' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs opacity-70">
                      {txn.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{txn.sender}</td>
                    <td className="px-6 py-4 font-mono text-[var(--accent-copper)]">₹{txn.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-16 rounded-full bg-slate-800 overflow-hidden`}>
                          <div 
                            className={`h-full ${txn.riskLevel === 'red' ? 'bg-[var(--risk-red)] shadow-sm' : txn.riskLevel === 'amber' ? 'bg-[var(--risk-amber)]' : 'bg-[var(--risk-green)]'}`}
                            style={{ width: `${Math.min(100, Number(txn.riskScore))}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-xs">{txn.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs opacity-80">{txn.city}</td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider ${
                         txn.riskLevel === 'red' ? 'bg-[var(--risk-red)]/10 text-[var(--risk-red)] border border-[var(--risk-red)]/20' :
                         txn.riskLevel === 'amber' ? 'bg-[var(--risk-amber)]/10 text-[var(--risk-amber)] border border-[var(--risk-amber)]/20' :
                         'bg-[var(--risk-green)]/10 text-[var(--risk-green)] border border-[var(--risk-green)]/20'
                       }`}>
                         {txn.riskLevel}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {paginatedData.length === 0 && (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 font-mono text-sm mt-10">
                 No transactions found matching criteria.
               </div>
            )}
          </div>
          
          {/* Pagination Bar */}
          <div className="bg-[#0a0a0a] border-t border-[var(--border-color)] p-4 flex items-center justify-between text-xs font-mono text-[var(--accent-light)]">
            <span>Showing {(currentPage-1)*itemsPerPage + 1} to {Math.min(currentPage*itemsPerPage, processedData.length)} of {processedData.length} entries</span>
            <div className="flex gap-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)} className="px-3 py-1 bg-[#0a0a0a] border border-slate-700 rounded hover:text-white disabled:opacity-30 transition-colors">Prev</button>
              <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p+1)} className="px-3 py-1 bg-[#0a0a0a] border border-slate-700 rounded hover:text-white disabled:opacity-30 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Drawer (Slide-in) */}
      <div className={`absolute top-0 right-0 h-full w-96 bg-[#0a0a0a] border-l border-[var(--border-color)] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${selectedTxn ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedTxn && (
          <>
            <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center bg-[#0a0a0a] ">
              <div>
                <h3 className="font-mono text-[var(--accent-light)] text-xs tracking-widest">TXN DETAILS</h3>
                <p className="font-mono text-white text-sm mt-1">{selectedTxn.id}</p>
              </div>
              <button onClick={() => setSelectedTxn(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {/* Core Details */}
              <div className="bg-[#111] border border-slate-800 rounded-sm p-4 space-y-3 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-mono">Amount</span>
                  <span className="text-lg font-black text-[var(--accent-copper)]">₹{selectedTxn.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-mono">Time</span>
                  <span className="text-sm font-mono text-slate-300">{selectedTxn.timestamp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-mono">Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                         selectedTxn.riskLevel === 'red' ? 'bg-[var(--risk-red)]/10 text-[var(--risk-red)]' :
                         selectedTxn.riskLevel === 'amber' ? 'bg-[var(--risk-amber)]/10 text-[var(--risk-amber)]' :
                         'bg-[var(--risk-green)]/10 text-[var(--risk-green)]'
                       }`}>{selectedTxn.riskLevel} RISK</span>
                </div>
              </div>

              {/* Entities */}
              <div>
                <h4 className="text-[10px] font-mono tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">ENTITIES</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs">S</div>
                    <div>
                      <p className="text-xs text-slate-500">Sender</p>
                      <p className="font-mono text-sm text-slate-200">{selectedTxn.sender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs">R</div>
                    <div>
                      <p className="text-xs text-slate-500">Receiver</p>
                      <p className="font-mono text-sm text-slate-200">{selectedTxn.receiver}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Context */}
              <div>
                <h4 className="text-[10px] font-mono tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">CONTEXT</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#111] p-3 rounded-sm border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Device</p>
                    <p className="text-xs text-slate-300 mt-1 truncate">{selectedTxn.device}</p>
                  </div>
                  <div className="bg-[#111] p-3 rounded-sm border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Location</p>
                    <p className="text-xs text-slate-300 mt-1 truncate">{selectedTxn.city}</p>
                  </div>
                  {selectedTxn.isNewDevice && (
                    <div className="col-span-2 bg-[var(--risk-amber)]/10 border border-[var(--risk-amber)]/20 p-3 rounded-sm flex items-center gap-2">
                       <svg className="w-4 h-4 text-[var(--risk-amber)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                       <span className="text-xs text-[var(--risk-amber)] font-mono">Unrecognized Device Fingerprint</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Explainability */}
              <div>
                <h4 className="text-[10px] font-mono tracking-widest text-slate-500 mb-3 border-b border-slate-800 pb-2">SHAP EXPLANATION</h4>
                <div className="space-y-3">
                  {selectedTxn.shapFeatures.map((f: any, i: number) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-slate-400">{f.feature}</span>
                        <span className="text-[var(--accent-copper)]">+{f.contribution}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--accent-copper)]" style={{ width: `${Math.min(100, Number(f.contribution) * 5)}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border-color)] bg-black">
               <button className="w-full py-3 bg-white hover:bg-slate-200 text-black font-bold font-mono text-sm rounded-sm transition-colors shadow-sm">
                 INVESTIGATE
               </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}

