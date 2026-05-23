import { useAppStore } from '../store';
import { ThemeVariant } from '../types';
import {
  Sun, Moon, Layers, Download, Shield, Cpu, Wifi,
  Database, RefreshCw, Settings, Zap, Monitor, Palette
} from 'lucide-react';

export default function SettingsView() {
  const {
    activeLayout, setLayout,
    activeTheme, setTheme,
    systemStats,
    showToast,
    isSyncing, toggleSync,
  } = useAppStore();

  const isGlass = activeLayout === ThemeVariant.GLASSMORPHISM;

  const panelBase = isGlass
    ? 'bg-[#0d1117]/60 backdrop-blur-xl border border-white/10'
    : 'bg-[#141313] border border-white/5';

  const handleLayoutToggle = () => {
    setLayout(activeLayout === ThemeVariant.GLASSMORPHISM ? ThemeVariant.NEUMORPHISM : ThemeVariant.GLASSMORPHISM);
    showToast(`UI style switched to ${activeLayout === ThemeVariant.GLASSMORPHISM ? 'Neumorphism' : 'Glassmorphism'} mode.`);
  };

  const handleThemeToggle = () => {
    const next = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    showToast(`Theme switched to ${next} mode.`);
  };

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      systemStats,
      layout: activeLayout,
      theme: activeTheme,
      station: 'ALPHA-01',
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floodvision-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${systemStats.totalSensors} sensor node configuration. Station latency: ${systemStats.latencyMs}ms.`);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative space-y-6 no-scrollbar text-white bg-[#05070a]">
      {/* Background */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1200px] mx-auto space-y-8">

        {/* Header */}
        <header className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8 text-indigo-400" />
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Settings</span>
            </h1>
          </div>
          <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">
            FloodVision Control Panel · Station ALPHA-01
          </p>
        </header>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* ── APPEARANCE ── */}
          <div className={`${panelBase} rounded-2xl p-6 space-y-5 col-span-1 xl:col-span-2`}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <Palette className="h-4 w-4 text-indigo-400" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-300">Appearance</h2>
            </div>

            {/* Design Dualism Toggle */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Design Style</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase">Design Dualism · Active Mode</p>
                </div>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono px-2 py-1 rounded uppercase border border-indigo-500/20">
                  {activeLayout}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setLayout(ThemeVariant.GLASSMORPHISM); showToast('Glassmorphism style activated.'); }}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 justify-center ${
                    activeLayout === ThemeVariant.GLASSMORPHISM
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Monitor className="h-4 w-4" />
                  Glassmorphism
                </button>
                <button
                  onClick={() => { setLayout(ThemeVariant.NEUMORPHISM); showToast('Neumorphism style activated.'); }}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 justify-center ${
                    activeLayout === ThemeVariant.NEUMORPHISM
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  Neumorphism
                </button>
              </div>

              <button
                onClick={handleLayoutToggle}
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600/30 to-purple-600/20 hover:from-indigo-600/50 hover:to-purple-600/40 text-white border border-white/10 rounded-xl transition-all cursor-pointer text-sm font-semibold uppercase tracking-widest"
              >
                Toggle Morph UI Style
              </button>
            </div>

            {/* Theme Mode */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Theme Mode</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase">
                    Currently: {activeTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border font-semibold text-sm transition-all cursor-pointer ${
                    activeTheme === 'dark'
                      ? 'bg-slate-800/60 border-slate-600/40 text-slate-200 hover:bg-slate-700/60'
                      : 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200 hover:bg-yellow-500/30'
                  }`}
                >
                  {activeTheme === 'dark'
                    ? <><Moon className="h-4 w-4 text-indigo-400" /> Dark</>
                    : <><Sun className="h-4 w-4 text-yellow-400" /> Light</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* ── SYSTEM INFO ── */}
          <div className={`${panelBase} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                <Cpu className="h-4 w-4 text-cyan-400" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-300">System Info</h2>
            </div>

            {[
              { label: 'Total Sensors', value: systemStats.totalSensors, icon: <Shield className="h-3.5 w-3.5 text-cyan-400" /> },
              { label: 'Active Nodes', value: systemStats.activeNodes, icon: <Wifi className="h-3.5 w-3.5 text-emerald-400" /> },
              { label: 'Alert Count', value: systemStats.offlineCount, icon: <Zap className="h-3.5 w-3.5 text-orange-400" /> },
              { label: 'Latency', value: `${systemStats.latencyMs}ms`, icon: <Database className="h-3.5 w-3.5 text-purple-400" /> },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase">
                  {row.icon}
                  {row.label}
                </div>
                <span className="text-sm font-bold font-mono">{row.value}</span>
              </div>
            ))}

            <div className="pt-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 uppercase">Station Online · ALPHA-01</span>
            </div>
          </div>

          {/* ── TELEMETRY SYNC ── */}
          <div className={`${panelBase} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-300">Telemetry Sync</h2>
            </div>

            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <p className="text-xs font-mono text-slate-400 mb-3 uppercase">Simulation Link Status</p>
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${
                isSyncing ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-800/40 border-white/10'
              }`}>
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <p className={`text-sm font-bold ${isSyncing ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {isSyncing ? 'SIM LINK ONLINE' : 'SIM LINK PAUSED'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                    {isSyncing ? 'Real-time data streaming active' : 'Sync paused — no live data'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleSync}
                className={`w-full mt-3 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isSyncing
                    ? 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                {isSyncing ? 'Pause Sync' : 'Resume Sync'}
              </button>
            </div>
          </div>

          {/* ── DATA EXPORT ── */}
          <div className={`${panelBase} rounded-2xl p-6 space-y-4 col-span-1 xl:col-span-2`}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Download className="h-4 w-4 text-blue-400" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-300">Data Export</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs font-mono text-slate-400 uppercase mb-2">Sensor Configuration</p>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Export current sensor node configuration, calibration data, and system statistics as a JSON payload.
                </p>
                <button
                  onClick={handleExport}
                  className="w-full py-3 bg-gradient-to-r from-blue-600/30 to-cyan-600/20 hover:from-blue-600/50 hover:to-cyan-600/40 text-white border border-blue-500/30 rounded-xl transition-all cursor-pointer text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Dataset (JSON)
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <p className="text-xs font-mono text-slate-400 uppercase mb-2">System Report</p>
                <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
                  Generate a full diagnostic report including alert history, telemetry logs, and performance metrics.
                </p>
                <button
                  onClick={() => showToast('Diagnostic report generated and queued for download.')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600/30 to-indigo-600/20 hover:from-purple-600/50 hover:to-indigo-600/40 text-white border border-purple-500/30 rounded-xl transition-all cursor-pointer text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
