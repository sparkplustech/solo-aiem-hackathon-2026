import { useAppStore } from '../store';
import { ThemeVariant } from '../types';
import { 
  Shield,
  Eye,
  CloudRain,
  Sliders,
  Database,
  Trophy,
  Camera,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar() {
  const { 
    currentView, 
    setView, 
    activeLayout,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAppStore();

  const menuItems = [
    { id: 'dashboard' as const,    label: 'Dashboard',         icon: Shield,    color: 'text-cyan-400',   activeBg: 'bg-cyan-500/10',   activeBorder: 'border-cyan-400' },
    { id: 'ai-analysis' as const,  label: 'AI Street Analysis',icon: Eye,       color: 'text-purple-400', activeBg: 'bg-purple-500/10', activeBorder: 'border-purple-400' },
    { id: 'rain-radar' as const,   label: 'Rain Radar',        icon: CloudRain, color: 'text-blue-400',   activeBg: 'bg-blue-500/10',   activeBorder: 'border-blue-400' },
    { id: 'route-sim' as const,    label: 'Route Optimizer',   icon: Sliders,   color: 'text-emerald-400',activeBg: 'bg-emerald-500/10',activeBorder: 'border-emerald-400' },
    { id: 'sensors' as const,      label: 'IoT Telemetry',     icon: Database,  color: 'text-orange-400', activeBg: 'bg-orange-500/10', activeBorder: 'border-orange-400' },
    { id: 'simulation' as const,   label: 'Simulation',        icon: Trophy,    color: 'text-yellow-400', activeBg: 'bg-yellow-500/10', activeBorder: 'border-yellow-400' },
    { id: 'report' as const,       label: 'Report',            icon: Camera,    color: 'text-pink-400',   activeBg: 'bg-pink-500/10',   activeBorder: 'border-pink-400' },
  ];

  const panelStyle = activeLayout === ThemeVariant.GLASSMORPHISM 
    ? 'glass-panel text-on-surface' 
    : 'neu-extrude text-on-surface';

  return (
    <aside className={`w-[280px] md:w-[290px] flex-shrink-0 border-r border-white/10 ${panelStyle} flex-col justify-between pt-10 pb-6 h-screen overflow-y-auto no-scrollbar z-50 transition-all duration-300 fixed lg:relative inset-y-0 left-0 lg:translate-x-0 ${mobileSidebarOpen ? 'flex translate-x-0 shadow-2xl' : 'hidden lg:flex -translate-x-full lg:translate-x-0'}`}>
      
      {/* Brand Header */}
      <div className="px-6 mb-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_#47e266]"></div>
            <span className="text-[10px] font-mono text-outline uppercase tracking-widest">
              VIGILANT MODE ACTIVE
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Flood Vision
          </h2>
          <p className="font-mono text-[10px] text-outline mt-1 uppercase">
            Station ID: ALPHA-01
          </p>
        </div>

        {/* Mobile Close Button */}
        <button 
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-lg border border-white/10 bg-white/5 text-outline hover:text-white transition-colors cursor-pointer"
          title="Close Navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        <div className="px-3 mb-2 text-xs font-mono tracking-widest text-[#8b91a0] uppercase">
          Command Center
        </div>
        {menuItems.slice(0, 5).map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-4 transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${item.activeBg} ${item.color} border-l-4 ${item.activeBorder} font-bold`
                  : 'text-[#c0c6d6]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Community section divider */}
        <div className="px-3 pt-4 mb-2 text-xs font-mono tracking-widest text-[#8b91a0] uppercase border-t border-white/5">
          Community
        </div>
        {menuItems.slice(5).map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-4 transition-all duration-200 cursor-pointer ${
                isActive
                  ? `${item.activeBg} ${item.color} border-l-4 ${item.activeBorder} font-bold`
                  : 'text-[#c0c6d6]/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.id === 'simulation' && (
                <span className="ml-auto text-[8px] bg-yellow-500/20 text-yellow-400 font-mono px-1.5 py-0.5 rounded uppercase tracking-wider">
                  NEW
                </span>
              )}
              {item.id === 'report' && (
                <span className="ml-auto text-[8px] bg-pink-500/20 text-pink-400 font-mono px-1.5 py-0.5 rounded uppercase tracking-wider">
                  LIVE
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Links */}
      <div className="px-6 mt-6">
        <div className="border-t border-white/5 pt-4 flex items-center justify-between text-xs text-outline font-mono">
          <button onClick={() => setView('architect')} className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
            <HelpCircle className="h-4 w-4 text-primary" />
            <span>Support Docs</span>
          </button>
          <button onClick={() => setView('settings')} className="hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
            <LogOut className="h-4 w-4 text-outline" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
