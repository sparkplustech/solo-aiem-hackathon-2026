/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from './store';
import { ThemeVariant } from './types';

// Import Modular View components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AIAnalysisView from './components/AIAnalysisView';
import RainRadarView from './components/RainRadarView';
import RouteSimView from './components/RouteSimView';
import SensorsView from './components/SensorsView';
import ArchitectDocsView from './components/ArchitectDocsView';
import SettingsView from './components/SettingsView';
import SimulationView from './components/SimulationView';
import ReportView from './components/ReportView';

export default function App() {
  const { 
    currentView, 
    activeTheme, 
    activeLayout,
    mobileSidebarOpen, 
    setMobileSidebarOpen,
    activeToast,
    showToast
  } = useAppStore();

  // Render view router helper
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'ai-analysis':
        return <AIAnalysisView />;
      case 'rain-radar':
        return <RainRadarView />;
      case 'route-sim':
        return <RouteSimView />;
      case 'sensors':
        return <SensorsView />;
      case 'architect':
        return <ArchitectDocsView />;
      case 'settings':
        return <SettingsView />;
      case 'simulation':
        return <SimulationView />;
      case 'report':
        return <ReportView />;
      default:
        return <DashboardView />;
    }
  };

  const appThemeClass = activeTheme === 'dark' 
    ? 'dark bg-[#141313] text-on-surface' 
    : 'light bg-[#e5e2e1] text-current';

  // ─── Global ESP32 Polling & Flood Notifications ───────────────────────────
  const floodNotifiedRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const triggerFloodNotification = useCallback((distanceCm: number) => {
    if (floodNotifiedRef.current) return;
    floodNotifiedRef.current = true;

    const msg = `⚠ FLOOD ALERT! Sensor reads ${distanceCm.toFixed(1)} cm — water level is critically high!`;
    showToast(msg);

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🚨 FloodVision — FLOOD ALERT', {
        body: msg,
        icon: '/favicon.ico',
      });
    }

    try {
      const ctx = new window.AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch (_) { /* audio blocked */ }

  }, [showToast]);

  useEffect(() => {
    let cancelled = false;
    const ESP32_BACKEND = 'http://localhost:8000/espdata';
    const POLL_INTERVAL_MS = 1000;

    const poll = async () => {
      const start = performance.now();
      try {
        const res = await fetch(`${ESP32_BACKEND}/latest/`);
        const latencyMs = Math.round(performance.now() - start);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        if (data.status === 'no_data') {
          useAppStore.getState().setESP32Status('connecting');
          return;
        }

        useAppStore.getState().updateFromESP32({ ...data, latencyMs });

        if (data.flood_alert) {
          triggerFloodNotification(data.latest?.distance_cm ?? 0);
        } else {
          floodNotifiedRef.current = false;
        }

      } catch (err) {
        if (!cancelled) {
          useAppStore.getState().setESP32Status('offline');
        }
      }
    };

    poll();
    pollTimerRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [triggerFloodNotification]);

  return (
    <div className={`min-h-screen w-screen flex overflow-hidden font-sans transition-colors duration-300 relative ${appThemeClass}`}>
      {/* Dynamic Liquid Glass Background Fluid Blobs */}
      {activeLayout === ThemeVariant.GLASSMORPHISM && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-[45vw] h-[45vw] rounded-full bg-cyan-500/15 dark:bg-cyan-500/10 blur-[110px] sm:blur-[140px] liquid-blob-1" />
          <div className="absolute top-1/2 right-1/4 w-[40vw] h-[40vw] rounded-full bg-blue-600/15 dark:bg-blue-600/10 blur-[130px] sm:blur-[160px] liquid-blob-2" />
          <div className="absolute bottom-1/4 left-1/3 w-[35vw] h-[35vw] rounded-full bg-emerald-500/12 dark:bg-emerald-500/8 blur-[100px] sm:blur-[130px] liquid-blob-3" />
        </div>
      )}

      {/* Dynamic Non-blocking In-App Toast notification */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-xs sm:max-w-sm w-[calc(100vw-32px)] sm:w-full bg-[#141313]/95 backdrop-blur-md border border-[#aac7ff]/40 text-white p-4 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-start gap-3 animate-bounce-subtle pointer-events-auto">
          <div className="h-2 w-2 rounded-full bg-[#47e266] shrink-0 mt-1.5 animate-ping" />
          <div className="flex-grow text-xs font-sans flex flex-col gap-0.5 text-left">
            <span className="font-bold tracking-widest text-[#aac7ff] font-mono text-[9px] uppercase">
              System Event Command Push
            </span>
            <p className="text-white/95 leading-relaxed font-sans font-medium text-[11px]">
              {activeToast}
            </p>
          </div>
          <button 
            onClick={() => showToast(null)} 
            className="text-[#9ea4b6] hover:text-white transition-colors cursor-pointer text-xs font-extrabold px-1 font-mono shrink-0 ml-1"
            title="Dismiss Notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Sidebar Back-drop Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setMobileSidebarOpen(false)} 
        />
      )}

      {/* Dynamic left side navigation */}
      <Sidebar />

      {/* Main functional container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Dynamic Warning and Header tools */}
        <Header />

        {/* Scrollable View boundaries */}
        <main className="flex-1 min-h-0 flex flex-col relative overflow-y-auto overflow-x-hidden no-scrollbar">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
