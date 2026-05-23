import { motion } from 'framer-motion';
import { Shield, Activity, Lock, Cpu } from 'lucide-react';

export default function Header() {
  return (
    <header className="glass border-b border-slate-800/50 sticky top-0 z-50">
      <div className="w-full px-8 py-5 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shield-glow">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-aegis-bg animate-pulse" style={{backgroundColor: '#00ff88'}} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-tight">
              AEGIS
            </h1>
            <p className="text-slate-500 text-xs font-mono tracking-widest mt-0.5">DIGITAL SAFETY GUARDIAN</p>
          </div>
        </motion.div>

        {/* Status indicators */}
        <motion.div
          className="hidden md:flex items-center gap-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <StatusPill icon={<Activity className="w-3 h-3" />} label="Systems Operational" color="green" />
          <StatusPill icon={<Lock className="w-3 h-3" />} label="End-to-End Encrypted" color="blue" />
          <StatusPill icon={<Cpu className="w-3 h-3" />} label="Local Processing" color="amber" />
        </motion.div>

        {/* Threat level */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="text-right hidden sm:block">
            <p className="text-slate-500 text-xs font-mono">GLOBAL THREAT LEVEL</p>
            <p className="text-amber-400 text-sm font-bold font-mono" style={{color:'#ffb800', textShadow:'0 0 8px rgba(255,184,0,0.6)'}}>ELEVATED</p>
          </div>
          <div className="flex gap-1 items-end h-6">
            {[3, 5, 4, 7, 5, 6, 4, 7, 6].map((h, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ height: `${h * 3}px`, backgroundColor: i > 5 ? '#ffb800' : '#1f2937' }}
                animate={{ height: [`${h * 3}px`, `${(h + 2) * 3}px`, `${h * 3}px`] }}
                transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </header>
  );
}

function StatusPill({ icon, label, color }) {
  const colors = {
    green: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };
  const dotColors = {
    green: '#00ff88',
    blue: '#00d4ff',
    amber: '#ffb800',
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${colors[color]}`}>
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: dotColors[color] }} />
      {icon}
      {label}
    </div>
  );
}
