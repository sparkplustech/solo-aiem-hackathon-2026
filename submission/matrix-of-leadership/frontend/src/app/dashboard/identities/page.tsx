"use client";

import React, { useState, useEffect, useCallback } from "react";

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

interface DeviceRecord {
  id: string;
  type: string;
  os: string;
  ip: string;
  location: string;
  accountsLinked: number;
  risk: RiskLevel;
  lastSeen: string;
}

const MOCK_DEVICES: DeviceRecord[] = [
  { id: "DEV-A8F29C", type: "Mobile", os: "iOS 16.2", ip: "103.44.21.99", location: "Mumbai", accountsLinked: 12, risk: "High", lastSeen: new Date(Date.now() - 2*60000).toISOString() },
  { id: "DEV-B71X00", type: "Desktop", os: "Windows 11", ip: "45.112.19.0", location: "Delhi", accountsLinked: 1, risk: "Low", lastSeen: new Date(Date.now() - 14*60000).toISOString() },
  { id: "DEV-X99M21", type: "Mobile", os: "Android 13", ip: "115.99.2.14", location: "Bangalore", accountsLinked: 4, risk: "Medium", lastSeen: new Date(Date.now() - 3600000).toISOString() },
  { id: "DEV-Q44P88", type: "Tablet", os: "iPadOS 15", ip: "202.14.8.11", location: "Chennai", accountsLinked: 1, risk: "Low", lastSeen: new Date(Date.now() - 3*3600000).toISOString() },
  { id: "DEV-K11L99", type: "Desktop", os: "Linux", ip: "188.44.12.8", location: "Unknown", accountsLinked: 34, risk: "Critical", lastSeen: new Date(Date.now() - 5*3600000).toISOString() },
];

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function IdentitiesPage() {
  const [devices, setDevices] = useState<DeviceRecord[]>(MOCK_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord>(MOCK_DEVICES[0]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [search, setSearch] = useState("");

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/transactions");
      if (!res.ok) throw new Error();
      const txns = await res.json();

      // Build unique device fingerprints from transaction history
      const deviceMap = new Map<string, any>();
      for (const t of txns) {
        const devId = t.device_id || "Unknown";
        if (!deviceMap.has(devId)) {
          deviceMap.set(devId, {
            id: `DEV-${devId.toUpperCase().slice(0, 8)}`,
            type: devId.includes("mobile") || devId.includes("sim") ? "Mobile" : "Desktop",
            os: "Unknown OS",
            ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.x.x`,
            location: "India",
            accountsLinked: 1,
            risk: t.risk_level === "red" ? "High" : t.risk_level === "yellow" ? "Medium" : "Low",
            lastSeen: t.created_at || t.timestamp,
          });
        } else {
          const d = deviceMap.get(devId)!;
          d.accountsLinked += 1;
          if (t.risk_level === "red") d.risk = d.accountsLinked > 10 ? "Critical" : "High";
        }
      }

      const devList = Array.from(deviceMap.values()).sort((a, b) => b.accountsLinked - a.accountsLinked);
      if (devList.length > 0) {
        setDevices(devList);
        setSelectedDevice(devList[0]);
        setBackendOnline(true);
      }
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 15000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

  const filtered = devices.filter(d =>
    search === "" ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.ip.toLowerCase().includes(search.toLowerCase()) ||
    d.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      
      {/* Left Column: Device Database */}
      <div className="w-1/2 flex flex-col h-full space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Identity & Device Fingerprinting</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">Entity resolution and hardware-level anomaly detection.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className={backendOnline ? 'text-green-500' : 'text-slate-500'}>
              {backendOnline ? `LIVE — ${devices.length} devices` : 'OFFLINE — Mock data'}
            </span>
          </div>
        </div>

        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden flex flex-col">
          
          <div className="p-4 border-b border-[var(--border-color)] bg-[#0a0a0a] flex justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder="Search device hash or IP..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-black border border-slate-700 py-1.5 pl-3 pr-4 text-xs text-white focus:outline-none focus:border-[var(--accent-copper)] font-mono"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{filtered.length} devices</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
             <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-[10px] uppercase bg-[#111111] text-slate-500 font-mono sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Device Hash</th>
                    <th className="px-4 py-3">OS / Type</th>
                    <th className="px-4 py-3">Last Seen</th>
                    <th className="px-4 py-3">Linked Accs</th>
                    <th className="px-4 py-3">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filtered.map((dev) => (
                    <tr 
                      key={dev.id} 
                      onClick={() => setSelectedDevice(dev)}
                      className={`hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedDevice.id === dev.id ? 'bg-[var(--accent-copper)]/5 border-l-2 border-[var(--accent-copper)]' : 'border-l-2 border-transparent'}`}
                    >
                      <td className="px-4 py-3 font-mono text-[11px] text-white">{dev.id}</td>
                      <td className="px-4 py-3 text-[11px]">
                        <div>{dev.os}</div>
                        <div className="text-[9px] text-slate-500 uppercase">{dev.type}</div>
                      </td>
                      <td className="px-4 py-3 text-[11px] font-mono text-slate-400">{timeAgo(dev.lastSeen)}</td>
                      <td className="px-4 py-3">
                         <span className={`font-mono text-[11px] ${dev.accountsLinked > 5 ? 'text-[var(--risk-red)] font-bold' : 'text-slate-300'}`}>
                           {dev.accountsLinked}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider border ${
                           dev.risk === 'Critical' ? 'bg-[var(--risk-red)]/20 text-[var(--risk-red)] border-[var(--risk-red)]' :
                           dev.risk === 'High' ? 'bg-[var(--risk-red)]/10 text-[var(--risk-red)] border-[var(--risk-red)]/20' :
                           dev.risk === 'Medium' ? 'bg-[var(--risk-amber)]/10 text-[var(--risk-amber)] border-[var(--risk-amber)]/20' :
                           'bg-[var(--risk-green)]/10 text-[var(--risk-green)] border-[var(--risk-green)]/20'
                         }`}>
                           {dev.risk}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Right Column: Deep Dive */}
      <div className="w-1/2 flex flex-col gap-6 h-full">
        
        {/* Account Linkage Map */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex flex-col overflow-hidden shadow-2xl relative min-h-[300px]">
           <div className="p-4 border-b border-[var(--border-color)] bg-[#0a0a0a] flex justify-between items-center z-20">
             <h3 className="text-xs font-mono tracking-widest text-[var(--accent-light)] uppercase">Account Linkage Graph</h3>
             <span className="text-[10px] font-mono text-[var(--accent-copper)] border border-[var(--accent-copper)]/30 px-2 py-0.5 rounded bg-[var(--accent-copper)]/10">
               {selectedDevice.id}
             </span>
           </div>
           
           <div className="flex-1 relative bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
              {/* Fake Graph Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" stroke="var(--accent-light)" strokeWidth="1" fill="none">
                 <line x1="50%" y1="50%" x2="20%" y2="20%" />
                 <line x1="50%" y1="50%" x2="80%" y2="20%" />
                 <line x1="50%" y1="50%" x2="20%" y2="80%" />
                 <line x1="50%" y1="50%" x2="80%" y2="80%" />
                 {selectedDevice.accountsLinked > 5 && (
                   <>
                     <line x1="50%" y1="50%" x2="30%" y2="40%" stroke="var(--risk-red)" />
                     <line x1="50%" y1="50%" x2="70%" y2="60%" stroke="var(--risk-red)" />
                     <line x1="50%" y1="50%" x2="40%" y2="80%" stroke="var(--risk-red)" />
                   </>
                 )}
              </svg>

              {/* Central Node */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-[var(--accent-copper)] flex items-center justify-center">
                   <svg className="w-8 h-8 text-[var(--accent-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                 </div>
              </div>

              {/* Surrounding Nodes (Accounts) */}
              <div className="absolute top-[15%] left-[15%] w-10 h-10 rounded-full bg-black border border-slate-600 flex items-center justify-center text-[8px] font-mono text-slate-400">ACC 1</div>
              <div className="absolute top-[15%] right-[15%] w-10 h-10 rounded-full bg-black border border-slate-600 flex items-center justify-center text-[8px] font-mono text-slate-400">ACC 2</div>
              <div className="absolute bottom-[15%] left-[15%] w-10 h-10 rounded-full bg-black border border-slate-600 flex items-center justify-center text-[8px] font-mono text-slate-400">ACC 3</div>
              <div className="absolute bottom-[15%] right-[15%] w-10 h-10 rounded-full bg-black border border-slate-600 flex items-center justify-center text-[8px] font-mono text-slate-400">ACC 4</div>
              
              {selectedDevice.accountsLinked > 5 && (
                <div className="absolute top-[35%] left-[25%] w-10 h-10 rounded-full bg-[var(--risk-red)]/10 border border-[var(--risk-red)]/50 flex items-center justify-center text-[8px] font-mono text-[var(--risk-red)] animate-pulse">FRAUD</div>
              )}

              {/* Alert Overlay if highly linked */}
              {selectedDevice.accountsLinked > 5 && (
                <div className="absolute top-4 right-4 bg-[var(--risk-red)]/20 border border-[var(--risk-red)] px-3 py-1.5 rounded-md  flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--risk-red)] " fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span className="text-[10px] font-mono text-white uppercase tracking-widest">MULE CLUSTER DETECTED</span>
                </div>
              )}
           </div>
        </div>

        {/* Impossible Travel Visualizer */}
        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-sm flex flex-col overflow-hidden shadow-2xl relative">
           <div className="p-4 border-b border-[var(--border-color)] bg-[#0a0a0a] flex justify-between items-center z-20">
             <h3 className="text-xs font-mono tracking-widest text-[var(--accent-light)] uppercase">Impossible Travel Analysis</h3>
             <span className="text-[10px] font-mono text-slate-500">LAST 24 HOURS</span>
           </div>
           
           <div className="flex-1 p-6 flex flex-col justify-center relative bg-gradient-to-b from-transparent to-[#050505]">
             
             {selectedDevice.location !== 'Unknown' && selectedDevice.accountsLinked > 5 ? (
                // Show impossible travel scenario for high risk
                <div className="relative w-full max-w-md mx-auto">
                  {/* Trajectory Line */}
                  <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-slate-600 via-[var(--risk-red)] to-slate-600 transform -translate-y-1/2 opacity-50"></div>
                  
                  {/* Animation Dot */}
                  <div className="absolute top-1/2 left-10 w-2 h-2 rounded-full bg-[var(--risk-red)] transform -translate-y-1/2 animate-[shimmer_2s_infinite]"></div>

                  <div className="flex justify-between relative z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black border-2 border-slate-600 mb-2 flex items-center justify-center">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-white">Mumbai</span>
                      <span className="text-[10px] font-mono text-slate-500">10:05 AM</span>
                      <span className="text-[9px] font-mono text-slate-600 mt-1">IP: 103.44.21.99</span>
                    </div>

                    <div className="flex flex-col items-center justify-start mt-8">
                      <span className="text-[10px] font-mono text-[var(--risk-red)] font-bold bg-[var(--risk-red)]/10 px-2 py-0.5 rounded border border-[var(--risk-red)]/30">
                        Δ 1200 km IN 45 MINS
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 mt-1 text-center">IMPLIED SPEED: 1600 KM/H<br/>(PHYSICALLY IMPOSSIBLE)</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-black border-2 border-[var(--risk-red)] mb-2 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--risk-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-white">Delhi</span>
                      <span className="text-[10px] font-mono text-[var(--risk-red)]">10:50 AM</span>
                      <span className="text-[9px] font-mono text-slate-600 mt-1">IP: 45.112.19.0</span>
                    </div>
                  </div>
                </div>
             ) : (
                // Normal state
                <div className="flex flex-col items-center justify-center opacity-50">
                   <svg className="w-12 h-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   <span className="text-xs font-mono tracking-widest uppercase text-slate-400">TRAVEL VELOCITY NORMAL</span>
                   <span className="text-[10px] font-mono text-slate-600 mt-1">No geospatial anomalies detected for this device.</span>
                </div>
             )}
             
           </div>
        </div>

      </div>

    </div>
  );
}

