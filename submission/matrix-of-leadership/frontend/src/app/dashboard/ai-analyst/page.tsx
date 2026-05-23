"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
  sql?: string;
  chartData?: any[];
};

export default function AIAnalystPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "DRISHTI Core initialized. Direct database access granted. How can I assist your investigation today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // The active data shown in the right workspace panel
  const [activeWorkspace, setActiveWorkspace] = useState<{sql?: string, chartData?: any[]}>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && (lastMsg.sql || lastMsg.chartData)) {
      setActiveWorkspace({ sql: lastMsg.sql, chartData: lastMsg.chartData });
    }
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      setLoadingStep(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingStep(s => (s + 1) % 3);
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const query = customInput !== undefined ? customInput : input;
    if (!query.trim()) return;

    const userMsg: Message = { role: "user", content: query };
    setMessages(prev => [...prev, userMsg]);
    if (customInput === undefined) setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMsg.content })
      });
      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.reply,
        sql: data.sql,
        chartData: data.chartData
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "CRITICAL: Connection to DRISHTI Core lost. Please verify the backend API is active." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadingText = ["Translating intent...", "Executing query...", "Analyzing results..."][loadingStep];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col">
        <h2 className="text-2xl font-black tracking-tight text-[var(--text-main)] flex items-center gap-3">
          <svg className="w-6 h-6 text-[var(--accent-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          DRISHTI AI Analyst
        </h2>
        <p className="text-sm text-[var(--accent-light)] font-mono mt-1">
          Natural language interrogation via DRISHTI Core.
        </p>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 min-h-0 flex gap-6">
        
        {/* Left Column: Chat Thread */}
        <div className="w-1/2 flex flex-col bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md overflow-hidden relative">
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative z-10">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                onClick={() => {
                  if (msg.sql || msg.chartData) {
                    setActiveWorkspace({ sql: msg.sql, chartData: msg.chartData });
                  }
                }}
              >
                <div className={`max-w-[85%] rounded-md p-5 relative group ${
                  msg.role === 'user' 
                    ? 'bg-[#1e293b] text-white border border-slate-600 rounded-tr-sm' 
                    : msg.role === 'system'
                    ? 'bg-[rgba(107,90,77,0.3)] text-[var(--text-main)] border-l-2 border-[var(--accent-copper)] rounded-tl-sm font-mono text-sm'
                    : 'bg-[#0a0a0a] text-slate-200 border border-slate-800 rounded-tl-sm transition-all ' + ((msg.sql || msg.chartData) ? 'hover:border-[var(--accent-copper)]/60 cursor-pointer' : '')
                }`}>
                  {msg.role !== 'system' && (
                    <div className="flex items-center mb-3 gap-2 opacity-70 border-b border-white/5 pb-2">
                      {msg.role === 'user' ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 text-[var(--accent-copper)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      )}
                      <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                        {msg.role === 'user' ? 'Operator' : 'DRISHTI Core'}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-[14.5px] leading-relaxed whitespace-pre-wrap font-sans tracking-wide">
                    {msg.content}
                    {idx === messages.length - 1 && msg.role === 'assistant' && !isLoading && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent-copper)] animate-pulse align-middle opacity-50"></span>
                    )}
                  </div>

                  {msg.role === 'assistant' && (msg.sql || msg.chartData) && (
                    <div className="mt-4 pt-3 border-t border-slate-800/50 text-[10px] text-[var(--accent-copper)] font-mono flex justify-between items-center opacity-80 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        VISUALIZATION GENERATED
                      </div>
                      <span className="text-slate-500 group-hover:text-[var(--accent-copper)] transition-colors">CLICK TO MOUNT →</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-[#111111] border border-[var(--accent-copper)]/30 rounded-md rounded-tl-sm p-4 flex items-center gap-3 w-72 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-copper)]/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-copper)] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-copper)]"></span>
                  </div>
                  <span className="text-xs font-mono text-[var(--accent-copper)] tracking-wider">{loadingText}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 border-t border-[var(--border-color)] bg-[#0a0a0a]/80 backdrop-blur-2xl relative z-20">
            <form onSubmit={(e) => handleSubmit(e)} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask DRISHTI e.g. 'Show me the top 5 high-risk cities today'"
                className="w-full bg-black border border-slate-700/50 rounded-sm py-4 pl-5 pr-16 text-white text-sm focus:outline-none focus:border-[var(--accent-copper)] focus:bg-[#111] transition-all placeholder:text-slate-600"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-2 bottom-2 w-12 bg-slate-800 hover:bg-[var(--accent-copper)] hover:text-black text-slate-400 rounded-sm flex items-center justify-center transition-all disabled:opacity-30 disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </form>
            <div className="flex flex-wrap gap-2 mt-4 px-1">
              <button onClick={() => handleSubmit(undefined, "Show me all red risk transactions from new devices")} className="group flex items-center gap-2 text-[10px] font-mono bg-white/5 hover:bg-[var(--accent-copper)]/10 text-slate-400 hover:text-[var(--accent-copper)] border border-white/5 hover:border-[var(--accent-copper)]/30 px-3 py-1.5 rounded-full transition-all">
                <svg className="w-3 h-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Red risk from new devices
              </button>
              <button onClick={() => handleSubmit(undefined, "What is the average latency of the LightGBM model?")} className="group flex items-center gap-2 text-[10px] font-mono bg-white/5 hover:bg-[var(--accent-copper)]/10 text-slate-400 hover:text-[var(--accent-copper)] border border-white/5 hover:border-[var(--accent-copper)]/30 px-3 py-1.5 rounded-full transition-all">
                <svg className="w-3 h-3 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Avg ML latency?
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Data Workspace */}
        <div className="w-1/2 flex flex-col gap-6">
          <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-md flex flex-col overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-[#111111]  border-b border-[var(--border-color)] px-4 py-3 flex items-center justify-between z-20 relative">
              <div className="flex items-center gap-3 text-xs font-mono text-[var(--accent-light)] uppercase tracking-widest">
                <span className={`w-2 h-2 rounded-full mr-2 transition-colors duration-500 ${activeWorkspace.chartData ? 'bg-[var(--risk-green)]' : 'bg-slate-600'}`}></span>
                Live Data Visualization
              </div>
              {activeWorkspace.chartData && (
                <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
                  {activeWorkspace.chartData.length} DATAPOINTS MOUNTED
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6 relative flex flex-col justify-end bg-gradient-to-b from-transparent to-[#111]">
              {activeWorkspace.chartData ? (
                <div className="w-full h-full animate-fade-in relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeWorkspace.chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-copper)" stopOpacity={1} />
                          <stop offset="100%" stopColor="var(--accent-copper)" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="label" stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis stroke="#ffffff30" tick={{ fill: '#ffffff50', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} dx={-10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', borderColor: 'var(--accent-copper)', borderRadius: '8px', color: '#fff', fontSize: '12px', boxShadow: '0 0 20px rgba(184,115,59,0.2)' }}
                        itemStyle={{ color: 'var(--accent-copper)', fontWeight: 'bold' }}
                        cursor={{ fill: 'var(--accent-copper)', opacity: 0.05 }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGradient)">
                        {activeWorkspace.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity cursor-crosshair" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-[#0a0a0a]">
                  {/* High-tech standby state */}
                  <div className="relative flex items-center justify-center w-64 h-64">
                    <div className="absolute inset-0 border-[0.5px] border-slate-800 rounded-full animate-[ping_4s_linear_infinite] opacity-20"></div>
                    <div className="absolute inset-4 border-[0.5px] border-slate-800 rounded-full animate-[ping_4s_linear_infinite_1s] opacity-20"></div>
                    <div className="absolute inset-8 border border-[var(--border-color)] rounded-full border-dashed animate-[spin_20s_linear_infinite] opacity-30"></div>
                    
                    <svg className="w-12 h-12 text-slate-700 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  
                  <div className="flex flex-col items-center mt-6 gap-2">
                    <span className="font-mono text-sm uppercase tracking-[0.3em] text-slate-500">System Standby</span>
                    <span className="font-mono text-[10px] text-slate-700 max-w-[250px] text-center">Execute a query in the thread to mount multidimensional data visualization pipelines.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

