import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, AlertCircle, Film, Image, ChevronRight, Clock } from 'lucide-react';

function getStatusConfig(status, score) {
  if (status === 'flagged') return {
    icon: AlertTriangle,
    badgeClass: 'badge-flagged',
    color: '#ff2d55',
    glow: 'rgba(255,45,85,0.15)',
    border: 'rgba(255,45,85,0.2)',
    label: score >= 99 ? `${score}% FLAGGED` : `${score}% DEEPFAKE`,
  };
  if (status === 'verified') return {
    icon: CheckCircle2,
    badgeClass: 'badge-verified',
    color: '#00ff88',
    glow: 'rgba(0,255,136,0.08)',
    border: 'rgba(0,255,136,0.15)',
    label: `${score}% AI PROB`,
  };
  return {
    icon: AlertCircle,
    badgeClass: 'badge-processing',
    color: '#ffb800',
    glow: 'rgba(255,184,0,0.08)',
    border: 'rgba(255,184,0,0.2)',
    label: `${score}% UNCERTAIN`,
  };
}

function FileIcon({ type }) {
  if (type.startsWith('video')) return <Film className="w-5 h-5 text-purple-400" />;
  return <Image className="w-5 h-5 text-cyan-400" />;
}

function timeAgo(isoStr) {
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ScanHistory({ scans, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-xs font-mono font-semibold tracking-wider">RECENT SCANS</span>
        </div>
        <div className="h-px flex-1 bg-slate-800" />
        <span className="text-slate-500 text-xs font-mono">{scans.length} records</span>
      </div>

      <div className="space-y-3">
        {scans.map((scan, i) => {
          const cfg = getStatusConfig(scan.status, scan.score);
          const StatusIcon = cfg.icon;

          return (
            <motion.button
              key={scan.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              whileHover={{ scale: 1.005, x: 2 }}
              whileTap={{ scale: 0.998 }}
              onClick={() => onSelect(scan)}
              className="w-full rounded-2xl border p-5 text-left group transition-all duration-200 hover:bg-slate-800/30"
              style={{
                background: `linear-gradient(135deg, ${cfg.glow}, transparent)`,
                borderColor: cfg.border,
              }}
            >
              <div className="flex items-center gap-4">
                {/* File type icon */}
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0">
                  <FileIcon type={scan.type} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white text-base font-semibold truncate">{scan.filename}</p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold ${cfg.badgeClass}`}>
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-slate-400 text-xs">{scan.platform}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-400 text-xs">{scan.size}</span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-slate-400 text-xs font-mono">{timeAgo(scan.timestamp)}</span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
              </div>

              {/* Score bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scan.score}%` }}
                    transition={{ duration: 0.8, delay: 0.1 + i * 0.07, ease: 'easeOut' }}
                  />
                </div>
                <StatusIcon className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
