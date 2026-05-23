import { useAppStore } from '../store';
import { ThemeVariant } from '../types';
import { Bell, Settings, ShieldAlert, RefreshCw, Menu } from 'lucide-react';

export default function Header() {
  const { 
    setView, 
    activeLayout,
    isSyncing,
    toggleSync,
    alerts,
    addAlert,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    showToast
  } = useAppStore();

  const activeAlertsCount = alerts.filter(a => a.active).length;

  const headerStyle = activeLayout === ThemeVariant.GLASSMORPHISM
    ? 'bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]'
    : 'bg-[#141313] border-b border-outline-variant/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)]';

  const triggerUrgentAlert = () => {
    addAlert({
      station: 'CMD BROADCAST OVERRIDE',
      message: 'MANUAL OVERRIDE: Emergency protocols activated. Drainage sectors 4 through 9 automated evacuation routing engaged.',
      severity: 'critical'
    });
    showToast("Master Emergency Broadcast sent successfully! Local disaster mitigation teams have been mobilized automatically via ESP32 telemetry nodes.");
  };

  return (
    <header className={`h-18 flex items-center justify-between px-4 md:px-6 shrink-0 z-50 sticky top-0 w-full ${headerStyle} transition-all duration-300`}>
      
      {/* Left: Mobile menu trigger + Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="lg:hidden p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/15 text-outline hover:text-white transition-colors cursor-pointer"
          title="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button 
          onClick={() => setView('dashboard')}
          className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#47e266] cursor-pointer"
        >
          Flood Vision Live
        </button>
      </div>

      {/* Center: SIM LINK status pill */}
      <div className="hidden sm:flex items-center gap-3 bg-surface-container-highest/60 border border-white/5 rounded-full px-4 py-1.5">
        <button 
          onClick={toggleSync}
          className={`cursor-pointer transition-transform duration-500 hover:rotate-180 flex items-center gap-2 ${
            isSyncing ? 'text-secondary font-semibold' : 'text-outline'
          }`}
          title="Toggle telemetry background live syncing simulator"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-mono tracking-wider">
            {isSyncing ? 'SIM LINK ONLINE' : 'SIM LINK PAUSED'}
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Emergency Protocol Button */}
        <button
          onClick={triggerUrgentAlert}
          className="bg-danger text-white hover:bg-danger/90 active:scale-98 transition-all px-3 md:px-4 py-2 rounded-full font-sans text-xs font-semibold shadow-[0_0_15px_rgba(255,69,58,0.4)] cursor-pointer flex items-center gap-2"
        >
          <ShieldAlert className="h-4 w-4 animate-bounce" />
          <span className="hidden md:inline">EMERGENCY PROTOCOL</span>
          <span className="md:hidden">SOS</span>
        </button>

        {/* Live Notification Bell */}
        <button 
          onClick={() => setView('sensors')}
          className="text-outline hover:text-white transition-colors relative cursor-pointer p-1.5 hover:bg-white/5 rounded-full"
          title="Alerts"
        >
          <Bell className="h-5 w-5" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-danger rounded-full pulse-danger shadow-[0_0_8px_rgba(255,69,58,0.8)]"></span>
          )}
        </button>

        {/* Settings Icon — opens SettingsView */}
        <button 
          onClick={() => setView('settings')} 
          className="text-outline hover:text-white transition-colors cursor-pointer p-1.5 hover:bg-white/5 rounded-full"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
