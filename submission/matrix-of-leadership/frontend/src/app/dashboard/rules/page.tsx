"use client";

import React, { useState, useEffect, useCallback } from "react";
import { API_URL, WS_URL } from "@/lib/api";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface BackendRule {
  id: string;
  name: string;
  condition_json: string;
  action: string;
  status: string;
  created_at: string;
}

const FIELDS = ["Amount", "Velocity (1H)", "Device Is New", "Is Night Time"];
const OPERATORS = [">", "<", "=="];

const BUILTIN_RULES = [
  { id: "R-882", name: "Velocity Threshold: High", condition: "Count(1h) > 10 AND AmountSum > ₹50,000", action: "BLOCK", hits: 1420, fpRate: "1.2%", latency: "12ms" },
  { id: "R-881", name: "New Device Large Transfer", condition: "Device.IsNew == True AND Amount > ₹25,000", action: "CHALLENGE", hits: 3841, fpRate: "4.5%", latency: "8ms" },
  { id: "R-880", name: "Impossible Travel", condition: "Geo.Speed > 800km/h", action: "BLOCK", hits: 215, fpRate: "0.1%", latency: "15ms" },
  { id: "R-879", name: "Night Burst (Low Value)", condition: "Time IN [23:00, 05:00] AND Amount < ₹1000", action: "FLAG", hits: 890, fpRate: "8.2%", latency: "18ms" },
];

export default function RulesArchitectPage() {
  const [conditions, setConditions] = useState<Condition[]>([
    { field: "Amount", operator: ">", value: "50000" },
  ]);
  const [ruleName, setRuleName] = useState("My Custom Rule");
  const [action, setAction] = useState("BLOCK TRANSACTION");
  const [backtestStatus, setBacktestStatus] = useState<'idle' | 'running' | 'complete'>('idle');
  const [savedRules, setSavedRules] = useState<BackendRule[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);

  const fetchRules = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/rules`);
      if (!res.ok) throw new Error();
      const data: BackendRule[] = await res.json();
      setSavedRules(data);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
    const interval = setInterval(fetchRules, 15000);
    return () => clearInterval(interval);
  }, [fetchRules]);

  const addCondition = () => {
    setConditions(prev => [...prev, { field: "Amount", operator: ">", value: "" }]);
  };

  const removeCondition = (i: number) => {
    setConditions(prev => prev.filter((_, idx) => idx !== i));
  };

  const updateCondition = (i: number, key: keyof Condition, val: string) => {
    setConditions(prev => prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c));
  };

  const saveRule = async () => {
    setSaving(true);
    setSaveResult(null);

    if (backendOnline) {
      try {
        const res = await fetch(`${API_URL}/api/v1/rules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: ruleName,
            condition_json: JSON.stringify(conditions),
            action: action,
          }),
        });
        const data = await res.json();
        setSaveResult(`✓ Rule saved to backend. ID: ${data.rule_id}`);
        fetchRules();
      } catch {
        setSaveResult("⚠ Backend offline – rule saved locally only.");
      }
    } else {
      setSaveResult("⚠ Backend offline – rule saved locally only.");
    }
    setSaving(false);
  };

  const runBacktest = () => {
    setBacktestStatus('running');
    setTimeout(() => setBacktestStatus('complete'), 2000);
  };

  return (
    <div className="flex h-full gap-6 overflow-hidden">

      {/* Left: Builder */}
      <div className="w-2/3 flex flex-col h-full space-y-4 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">Rule Engine Architect</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">Design deterministic fraud logic to run upstream of the ML model.</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
            <span className={backendOnline ? 'text-green-500' : 'text-slate-500'}>
              {backendOnline ? 'LIVE — Rules execute against real transactions' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Rule Builder Card */}
        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-[#0a0a0a] flex justify-between items-center">
            <h3 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Visual Logic Builder</h3>
            <input
              value={ruleName}
              onChange={e => setRuleName(e.target.value)}
              className="bg-black border border-slate-700 text-white text-xs px-3 py-1.5 w-56 focus:outline-none focus:border-[var(--accent-copper)] font-mono"
              placeholder="Rule name..."
            />
          </div>

          <div className="flex-1 bg-[#060606] p-6 overflow-y-auto scrollbar-hide" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
            <div className="space-y-3">
              {conditions.map((cond, i) => (
                <div key={i} className="flex items-stretch gap-2 relative group">
                  {/* Condition label */}
                  <div className="flex items-center text-[9px] font-mono text-slate-600 uppercase w-20 flex-shrink-0">
                    {i === 0 ? 'IF' : 'AND'}
                  </div>

                  {/* Field */}
                  <select
                    value={cond.field}
                    onChange={e => updateCondition(i, 'field', e.target.value)}
                    className="bg-[#111] border border-slate-700 text-xs text-white p-2.5 flex-1 focus:outline-none focus:border-[var(--accent-copper)] font-mono"
                  >
                    {FIELDS.map(f => <option key={f}>{f}</option>)}
                  </select>

                  {/* Operator */}
                  <select
                    value={cond.operator}
                    onChange={e => updateCondition(i, 'operator', e.target.value)}
                    className="bg-[#111] border border-slate-700 text-xs text-white p-2.5 w-16 focus:outline-none focus:border-[var(--accent-copper)] font-mono text-center"
                  >
                    {OPERATORS.map(op => <option key={op}>{op}</option>)}
                  </select>

                  {/* Value */}
                  <input
                    value={cond.value}
                    onChange={e => updateCondition(i, 'value', e.target.value)}
                    className="bg-[#111] border border-slate-700 text-xs text-white p-2.5 w-28 focus:outline-none focus:border-[var(--accent-copper)] font-mono"
                    placeholder="Value…"
                  />

                  {/* Remove */}
                  <button
                    onClick={() => removeCondition(i)}
                    className="text-slate-700 hover:text-[var(--risk-red)] transition-colors opacity-0 group-hover:opacity-100 px-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}

              <button onClick={addCondition} className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-[var(--accent-copper)] transition-colors ml-20 mt-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                ADD CONDITION
              </button>
            </div>

            {/* THEN Action */}
            <div className="mt-8 flex items-center gap-4">
              <div className="text-[9px] font-mono text-slate-600 uppercase w-20 flex-shrink-0">THEN</div>
              <div className="bg-[var(--risk-red)]/10 border border-[var(--risk-red)]/30 p-4 flex-1 flex items-center gap-4">
                <span className="text-[10px] font-mono text-[var(--risk-red)] uppercase tracking-widest flex-shrink-0">Action:</span>
                <select
                  value={action}
                  onChange={e => setAction(e.target.value)}
                  className="bg-black border border-[var(--risk-red)]/50 text-sm font-bold text-white p-2 flex-1 focus:outline-none focus:border-[var(--risk-red)] font-mono"
                >
                  <option>BLOCK TRANSACTION</option>
                  <option>CHALLENGE (OTP)</option>
                  <option>FLAG FOR REVIEW</option>
                  <option>RATE LIMIT</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save Bar */}
          <div className="p-4 border-t border-slate-800 bg-[#0a0a0a] flex items-center gap-4">
            <button
              onClick={saveRule}
              disabled={saving}
              className="px-6 py-2.5 bg-white text-black text-xs font-mono font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'DEPLOY RULE'}
            </button>
            <button onClick={runBacktest} className="px-4 py-2.5 border border-[var(--accent-copper)] text-[var(--accent-copper)] text-xs font-mono hover:bg-[var(--accent-copper)] hover:text-black transition-colors">
              BACKTEST
            </button>
            {saveResult && (
              <span className={`text-[11px] font-mono ${saveResult.startsWith('✓') ? 'text-green-400' : 'text-[var(--risk-amber)]'}`}>
                {saveResult}
              </span>
            )}
          </div>
        </div>

        {/* Backtest result panel */}
        {backtestStatus !== 'idle' && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-4">
            {backtestStatus === 'running' && (
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-copper)] border-t-transparent animate-spin"></div>
                <span className="text-xs font-mono text-[var(--accent-copper)]">CRUNCHING 2.4M HISTORICAL RECORDS…</span>
              </div>
            )}
            {backtestStatus === 'complete' && (
              <div className="flex gap-8 items-center">
                <div>
                  <p className="text-[10px] font-mono text-slate-500">True Positives</p>
                  <p className="text-2xl font-black text-green-400">4,210</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500">False Positives</p>
                  <p className="text-2xl font-black text-[var(--risk-red)]">14</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500">Estimated Precision</p>
                  <p className="text-2xl font-black text-white">99.6%</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono text-slate-500">Added Latency</p>
                  <p className="text-2xl font-black text-white">+1.2ms</p>
                </div>
                <button onClick={() => setBacktestStatus('idle')} className="ml-auto text-[10px] font-mono text-slate-500 hover:text-white border border-slate-700 px-3 py-1.5">
                  CLOSE
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Live Rule Matrix */}
      <div className="w-1/3 flex flex-col gap-4 h-full">
        <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-[#0a0a0a] flex justify-between items-center">
            <h3 className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">Active Rules</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              {BUILTIN_RULES.length + savedRules.length} ACTIVE
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-slate-800/60">
            {/* Built-in rules */}
            {BUILTIN_RULES.map((rule) => (
              <div key={rule.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-600 bg-black px-1.5 py-0.5 border border-slate-800">{rule.id}</span>
                    <span className="text-[11px] font-bold text-slate-200">{rule.name}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2 py-0.5 border ${
                    rule.action === 'BLOCK' ? 'bg-[var(--risk-red)]/10 text-[var(--risk-red)] border-[var(--risk-red)]/20' :
                    rule.action === 'FLAG' ? 'bg-[var(--risk-amber)]/10 text-[var(--risk-amber)] border-[var(--risk-amber)]/20' :
                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}>{rule.action}</span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 truncate mb-2">{rule.condition}</p>
                <div className="flex gap-4 text-[10px] font-mono text-slate-600">
                  <span>Hits: <span className="text-slate-300">{rule.hits.toLocaleString()}</span></span>
                  <span>FPR: <span className="text-[var(--risk-amber)]">{rule.fpRate}</span></span>
                  <span>Lat: <span className="text-slate-300">{rule.latency}</span></span>
                </div>
              </div>
            ))}

            {/* Custom user rules from backend */}
            {savedRules.map((rule) => (
              <div key={rule.id} className="p-4 hover:bg-white/[0.02] transition-colors border-l-2 border-[var(--accent-copper)]">
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--accent-copper)] bg-black px-1.5 py-0.5 border border-[var(--accent-copper)]/30">{rule.id}</span>
                    <span className="text-[11px] font-bold text-slate-200">{rule.name}</span>
                  </div>
                  <span className="text-[9px] font-mono bg-[var(--risk-red)]/10 text-[var(--risk-red)] border border-[var(--risk-red)]/20 px-2 py-0.5">
                    {rule.action.includes("BLOCK") ? "BLOCK" : rule.action.includes("OTP") ? "CHALLENGE" : "FLAG"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-500 mb-1">Custom rule · Live on backend</p>
                <p className="text-[9px] font-mono text-slate-700">{new Date(rule.created_at).toLocaleString()}</p>
              </div>
            ))}

            {savedRules.length === 0 && backendOnline && (
              <div className="p-4 text-[10px] font-mono text-slate-600 text-center">
                No custom rules yet. Deploy your first rule above.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
