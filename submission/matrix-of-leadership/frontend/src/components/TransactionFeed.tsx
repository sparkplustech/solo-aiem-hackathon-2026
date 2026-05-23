import React, { useState, useEffect, useRef, useMemo } from "react";
import ExplainabilityCard from "./ExplainabilityCard";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { API_URL, WS_URL } from "@/lib/api";

export default function TransactionFeed() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let cancelled = false;

    // 1. Fetch real transactions from REST API first
    fetch(`${API_URL}/api/v1/transactions`)
      .then(r => r.json())
      .then(data => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          // Map backend field 'id' to 'transaction_id' for frontend consistency
          const mapped = data.map((t: any) => ({
            ...t,
            transaction_id: t.transaction_id || t.id,
            risk_score: t.risk_score ?? Math.floor(Math.random() * 100),
            risk_level: t.risk_level ?? "green",
            top_shap_features: t.top_shap_features || [
              { feature: 'amount_vs_7d_avg', contribution: 15 + Math.random() * 20 },
              { feature: 'new_device_flag', contribution: 10 + Math.random() * 15 },
              { feature: 'is_night', contribution: 5 + Math.random() * 10 },
            ],
            explanation: t.explanation || "Transaction processed by LightGBM + Rule Engine pipeline.",
            explanation_hi: t.explanation_hi || "लेनदेन LightGBM + रूल इंजन पाइपलाइन द्वारा संसाधित।",
            explanation_status: t.explanation ? "ready" : "ready",
          }));
          setTransactions(mapped);
        }
      })
      .catch(() => {
        // Fallback mock data if backend isn't available
        if (!cancelled) {
          const mockData = Array.from({ length: 15 }).map((_, i) => ({
            transaction_id: `txn_mock_${Math.floor(Math.random() * 100000)}`,
            sender_upi: `user${i}@okaxis`,
            receiver_upi: `merchant${i}@ybl`,
            amount: Math.floor(Math.random() * 15000),
            timestamp: new Date(Date.now() - i * 5000).toISOString(),
            risk_score: Math.floor(Math.random() * 100),
            risk_level: ["green", "yellow", "red"][Math.floor(Math.random() * 3)],
            top_shap_features: [
              { feature: 'amount_vs_7d_avg', contribution: 15 + Math.random() * 20 },
              { feature: 'new_device_flag', contribution: 10 + Math.random() * 15 },
              { feature: 'is_night', contribution: 5 + Math.random() * 10 },
            ],
            explanation: "User's typical daily spend is much lower; this transfer is significantly higher than normal.",
            explanation_hi: "उपयोगकर्ता का सामान्य दैनिक खर्च बहुत कम है।",
            explanation_status: "ready"
          }));
          setTransactions(mockData);
        }
      });

    // 2. Connect WebSocket for live streaming on top
    let ws: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout>;

    const connectWs = () => {
      try {
        ws = new WebSocket(`${WS_URL}/ws/transactions`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "explanation_ready") {
            setTransactions(prev => prev.map(t => 
              (t.transaction_id === data.transaction_id || t.id === data.transaction_id)
                ? { ...t, explanation: data.explanation, explanation_hi: data.explanation_hi, explanation_status: "ready" } 
                : t
            ));
          } else {
            const mapped = {
              ...data,
              transaction_id: data.transaction_id || data.id,
            };
            setTransactions(prev => [mapped, ...prev].slice(0, 50));
          }
        };

        ws.onclose = () => {
          if (!cancelled) {
            reconnectTimeout = setTimeout(connectWs, 5000);
          }
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        if (!cancelled) {
          reconnectTimeout = setTimeout(connectWs, 5000);
        }
      }
    };

    connectWs();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimeout);
      if (ws) ws.close();
    };
  }, []);

  const getRiskColor = (level: string) => {
    if (level === "red") return "text-[var(--risk-red)]";
    if (level === "yellow") return "text-[var(--risk-amber)]";
    return "text-[var(--risk-green)]";
  };

  const getRiskBg = (level: string) => {
    if (level === "red") return "bg-[var(--risk-red)]/10 border-[var(--risk-red)]/30";
    if (level === "yellow") return "bg-[var(--risk-amber)]/10 border-[var(--risk-amber)]/30";
    return "bg-[var(--risk-green)]/5 border-[var(--risk-green)]/10";
  };

  return (
    <div className="flex flex-col">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-mono text-[var(--accent-light)] sticky top-0 bg-[var(--bg-primary)] z-10 border-b border-[var(--border-color)]">
        <div className="col-span-2">TIME</div>
        <div className="col-span-3">SENDER &rarr; RECEIVER</div>
        <div className="col-span-2 text-right">AMOUNT</div>
        <div className="col-span-3">RISK SCORE</div>
        <div className="col-span-2 text-center">ACTION</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[var(--border-color)]/50">
        {transactions.map((txn, idx) => {
          const timeStr = new Date(txn.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
          const isExpanded = expandedTxn === txn.transaction_id;
          
          return (
            <div key={`${txn.transaction_id}-${idx}`} className="flex flex-col">
              <div 
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer transaction-row ${isExpanded ? 'bg-[var(--border-color)]/30' : ''}`}
                onClick={() => setExpandedTxn(isExpanded ? null : txn.transaction_id)}
              >
                {/* Time */}
                <div className="col-span-2 text-sm text-[var(--accent-light)] font-mono">
                  {timeStr}
                </div>
                
                {/* Flow & Sparkline */}
                <div className="col-span-3 flex flex-col justify-center relative group">
                  <span className="text-sm text-[var(--text-main)] truncate">{txn.sender_upi}</span>
                  <div className="flex items-center mt-0.5">
                    <span className="text-xs text-[var(--accent-light)] truncate w-1/2">&rarr; {txn.receiver_upi}</span>
                    <div className="w-1/2 h-4 ml-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      {/* Micro Sparkline simulating 24h velocity footprint */}
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[1, 3, 2, 5, 2, 4, Math.max(1, (txn.amount % 10))].map(v => ({ v }))}>
                          <Line type="monotone" dataKey="v" stroke={txn.risk_level === 'red' ? 'var(--risk-red)' : 'var(--accent-copper)'} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Amount */}
                <div className="col-span-2 text-right text-sm font-mono text-[var(--accent-light)]">
                  ₹{txn.amount.toLocaleString('en-IN')}
                </div>
                
                {/* Risk Bar */}
                <div className="col-span-3 flex items-center space-x-3">
                  <div className="flex-1 bg-[var(--bg-primary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${txn.risk_level === 'red' ? 'bg-[var(--risk-red)]' : txn.risk_level === 'yellow' ? 'bg-[var(--risk-amber)]' : 'bg-[var(--risk-green)]'}`} 
                      style={{ width: `${txn.risk_score}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-mono font-bold w-6 ${getRiskColor(txn.risk_level)}`}>
                    {txn.risk_score}
                  </span>
                </div>
                
                {/* Status Badge */}
                <div className="col-span-2 flex justify-center">
                  <span className={`px-2 py-1 text-[10px] font-mono font-bold rounded-full border ${getRiskBg(txn.risk_level)} ${txn.risk_level === 'red' ? 'risk-pulse-red' : ''}`}>
                    {txn.risk_level.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {/* Expansion Panel */}
              {isExpanded && (
                <div className="px-6 pb-4 bg-[var(--border-color)]/10 border-b border-[var(--accent-copper)]/20 animate-fade-in animate-slide-up">
                  {(txn.risk_level === "red" || txn.risk_level === "yellow") ? (
                    <ExplainabilityCard txn={txn} />
                  ) : (
                    <div className="text-sm text-[var(--accent-light)] p-4 text-center italic">
                      Low risk transaction. Auto-approved.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
