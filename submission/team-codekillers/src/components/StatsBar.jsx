import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle2, TrendingUp, Clock, Zap } from 'lucide-react';

const stats = [
  {
    label: 'Files Analyzed',
    value: '2,847',
    change: '+12 today',
    icon: Zap,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.08)',
    border: 'rgba(0,212,255,0.2)',
  },
  {
    label: 'Deepfakes Caught',
    value: '1,203',
    change: '42.3% detection rate',
    icon: AlertTriangle,
    color: '#ff2d55',
    bg: 'rgba(255,45,85,0.08)',
    border: 'rgba(255,45,85,0.2)',
  },
  {
    label: 'Verified Authentic',
    value: '1,491',
    change: '52.4% cleared',
    icon: CheckCircle2,
    color: '#00ff88',
    bg: 'rgba(0,255,136,0.06)',
    border: 'rgba(0,255,136,0.2)',
  },
  {
    label: 'Avg Analysis Time',
    value: '9.8s',
    change: 'Per file',
    icon: Clock,
    color: '#ffb800',
    bg: 'rgba(255,184,0,0.08)',
    border: 'rgba(255,184,0,0.2)',
  },
];

export default function StatsBar() {
  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="rounded-2xl border p-5"
            style={{ background: stat.bg, borderColor: stat.border }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg, border: `1px solid ${stat.border}` }}>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
            </div>
            <p className="text-3xl font-black font-mono" style={{ color: stat.color, textShadow: `0 0 18px ${stat.color}` }}>
              {stat.value}
            </p>
            <p className="text-slate-300 text-sm font-semibold mt-1.5">{stat.label}</p>
            <p className="text-slate-500 text-xs mt-0.5 font-mono">{stat.change}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
