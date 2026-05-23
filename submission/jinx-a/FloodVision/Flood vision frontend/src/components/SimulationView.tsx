import { useState } from 'react';
import { useAppStore } from '../store';
import { ThemeVariant } from '../types';
import {
  Trophy, Camera, Droplets, Star, Award, Users, MapPin,
  Zap, ChevronRight, Shield, Medal, Target, Heart, CheckCircle2,
  ArrowRight, Sparkles
} from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Priya Sharma',    points: 1240, badge: 'guardian', reports: 47, accuracy: 94 },
  { rank: 2, name: 'Arjun Nair',      points: 980,  badge: 'guardian', reports: 38, accuracy: 91 },
  { rank: 3, name: 'Divya Menon',     points: 750,  badge: 'guardian', reports: 29, accuracy: 89 },
  { rank: 4, name: 'Ravi Patel',      points: 520,  badge: 'reporter', reports: 22, accuracy: 85 },
  { rank: 5, name: 'Sneha Kulkarni',  points: 390,  badge: 'reporter', reports: 17, accuracy: 82 },
];

const BADGE_ICONS: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  guardian: { icon: <Shield className="h-4 w-4" />, color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/40', label: 'Flood Guardian' },
  reporter: { icon: <Medal className="h-4 w-4" />,  color: 'text-blue-400 bg-blue-500/20 border-blue-500/40',    label: 'Reporter'       },
  rookie:   { icon: <Star className="h-4 w-4" />,   color: 'text-slate-400 bg-slate-500/20 border-slate-500/40', label: 'Rookie'         },
};

export default function SimulationView() {
  const { activeLayout, setView } = useAppStore();
  const isGlass = activeLayout === ThemeVariant.GLASSMORPHISM;

  const [activeTab, setActiveTab] = useState<'leaderboard'>('leaderboard');

  const panelBase = isGlass
    ? 'bg-[#0d1117]/60 backdrop-blur-xl border border-white/10'
    : 'bg-[#141313] border border-white/5';

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative space-y-8 no-scrollbar text-white bg-[#05070a]">
      {/* Ambient background */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-[1300px] mx-auto space-y-8">

        {/* ── HERO HEADER ── */}
        <header className="border-b border-white/10 pb-8">
          <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-6">
            <div className="space-y-3">


              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
                Community{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Simulation
                </span>
              </h1>
              <p className="text-slate-400 font-mono text-sm max-w-xl leading-relaxed">
                Turn every citizen into a flood sensor. Crowd-sourced real-time data, gamified engagement, and community-driven flood prevention.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-4 flex-wrap">
              {[
                { label: 'Active Reporters', value: '2,341', icon: <Users className="h-4 w-4 text-cyan-400" /> },
                { label: 'Reports Today',    value: '128',   icon: <Camera className="h-4 w-4 text-pink-400" /> },
              ].map(s => (
                <div key={s.label} className={`${panelBase} rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]`}>
                  {s.icon}
                  <div>
                    <p className="text-lg font-bold font-sans">{s.value}</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>



        {/* ── TAB PANEL ── */}
        <div className={`${panelBase} rounded-2xl overflow-hidden`}>
          {/* Tab bar */}
          <div className="flex border-b border-white/10 bg-black/20">
            {[
              { id: 'leaderboard' as const, label: 'Leaderboard',    icon: <Trophy className="h-4 w-4" />,  color: 'text-yellow-400 border-yellow-400' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? `${tab.color} bg-white/5`
                    : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* ── Leaderboard Tab ── */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-yellow-300">Top Flood Guardians</h3>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Simulation Data Preview</span>
                </div>
                <div className="space-y-3">
                  {MOCK_LEADERBOARD.map(person => {
                    const badge = BADGE_ICONS[person.badge];
                    return (
                      <div key={person.rank} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                        person.rank <= 3 ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/3 border-white/5'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black font-mono ${
                          person.rank === 1 ? 'bg-yellow-400 text-black' :
                          person.rank === 2 ? 'bg-slate-300 text-black' :
                          person.rank === 3 ? 'bg-orange-400 text-black' :
                          'bg-white/10 text-white'
                        }`}>
                          {person.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-sm text-white">{person.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{person.reports} reports · {person.accuracy}% accuracy</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${badge.color}`}>
                          {badge.icon}
                          <span className="hidden sm:inline">{badge.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black font-mono text-yellow-400">{person.points}</p>
                          <p className="text-[10px] font-mono text-slate-500">pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setView('report')}
                    className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 font-mono transition-colors cursor-pointer"
                  >
                    View live leaderboard with real data <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
