import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Globe, Lock } from 'lucide-react';

// Animated counter hook
function useCounter(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

const THREATS = [
  '🚨 New deepfake campaign detected — targeting college students in Mumbai',
  '⚠️  AI voice-cloning used in financial fraud — 3 cases reported today',
  '🔴 Synthetic face-swap content circulating on Telegram — flagged by Aegis',
  '⚠️  WhatsApp scam: AI-generated "family emergency" videos spreading',
  '🚨 Dating app profile pic fraud detected — GAN-generated faces confirmed',
  '🔴 Sextortion deepfake surge — 12% rise this week across South Asia',
];

export default function HeroSection({ onScrollToUpload }) {
  const [threatIdx, setThreatIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  // Rotate threat ticker
  useEffect(() => {
    const id = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setThreatIdx(i => (i + 1) % THREATS.length);
        setTickerVisible(true);
      }, 400);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  // Trigger counters when hero is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCounter(2847, 1800, inView);
  const c2 = useCounter(98,   1400, inView);
  const c3 = useCounter(1203, 2000, inView);

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* ── Ambient background glows ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.15) 0%, transparent 65%)' }} />
        <div className="absolute top-20 left-0 w-[400px] h-[400px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
        <div className="absolute top-10 right-0 w-[350px] h-[350px] rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(255,45,85,0.06) 0%, transparent 70%)' }} />
      </div>

      {/* ── Live threat ticker ───────────────────────────────────────────── */}
      <div className="relative border-b border-slate-800/60 bg-slate-950/60 backdrop-blur-sm">
        <div className="w-full px-8 py-2.5 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-xs font-mono font-bold tracking-widest">LIVE THREATS</span>
          </div>
          <div className="h-4 w-px bg-slate-700" />
          <motion.p
            key={threatIdx}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: tickerVisible ? 1 : 0, y: tickerVisible ? 0 : -6 }}
            transition={{ duration: 0.3 }}
            className="text-slate-400 text-xs truncate"
          >
            {THREATS[threatIdx]}
          </motion.p>
          <div className="flex-shrink-0 ml-auto flex items-center gap-1.5">
            <Globe className="w-3 h-3 text-slate-600" />
            <span className="text-slate-600 text-xs font-mono">Global Feed</span>
          </div>
        </div>
      </div>

      {/* ── Main hero content ────────────────────────────────────────────── */}
      <div className="w-full px-8 pt-16 pb-14">
        <div className="flex flex-col lg:flex-row items-center gap-12">

          {/* Left: Text content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400 text-xs font-mono font-semibold tracking-wider">AI-POWERED FORENSIC DETECTION</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none tracking-tight mb-5"
            >
              <span className="text-white">Detect.</span>{' '}
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Verify.</span>{' '}
              <span style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #ff2d55 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Protect.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-400 text-lg leading-relaxed max-w-xl mb-8"
            >
              Upload any suspicious image or video to instantly verify if it's an AI deepfake or face-swap. 
              Get a full forensic report you can use to report harassment.
            </motion.p>

            {/* Trust pills */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10"
            >
              {[
                { icon: Lock, label: 'No Data Stored', color: '#00ff88' },
                { icon: Zap, label: '~10s Analysis', color: '#00d4ff' },
                { icon: Shield, label: '96%+ Accuracy', color: '#a855f7' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-slate-300 text-sm font-medium">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Animated counters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex gap-8 justify-center lg:justify-start"
            >
              {[
                { value: c1, suffix: '+', label: 'Files Scanned', color: '#00d4ff' },
                { value: c2, suffix: '%', label: 'Detection Rate', color: '#00ff88' },
                { value: c3, suffix: '+', label: 'Threats Flagged', color: '#ff2d55' },
              ].map(({ value, suffix, label, color }) => (
                <div key={label} className="text-center lg:text-left">
                  <p className="text-3xl font-black font-mono" style={{ color, textShadow: `0 0 20px ${color}60` }}>
                    {value.toLocaleString()}{suffix}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Animated shield orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, type: 'spring', damping: 20 }}
            className="flex-shrink-0 relative"
          >
            <ShieldOrb />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ShieldOrb() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Outer pulse rings */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-500/10"
          style={{ width: `${60 + i * 50}px`, height: `${60 + i * 50}px` }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ duration: 3, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Rotating orbit ring */}
      <motion.div
        className="absolute w-52 h-52 rounded-full border border-dashed border-cyan-500/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        {/* Orbit dot */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-400"
          style={{ boxShadow: '0 0 12px rgba(0,212,255,0.8)' }} />
      </motion.div>

      {/* Second orbit (reverse) */}
      <motion.div
        className="absolute w-40 h-40 rounded-full border border-dashed border-purple-500/20"
        animate={{ rotate: -360 }}
        transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
      >
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-400"
          style={{ boxShadow: '0 0 10px rgba(168,85,247,0.8)' }} />
      </motion.div>

      {/* Central glowing hexagon / shield */}
      <div className="relative z-10 w-28 h-28 flex items-center justify-center">
        {/* Glow */}
        <div className="absolute inset-0 rounded-2xl blur-2xl opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.4), rgba(168,85,247,0.3), transparent)' }} />
        {/* Card */}
        <div className="relative w-24 h-24 rounded-2xl border border-cyan-500/40 bg-slate-900/80 flex items-center justify-center"
          style={{ boxShadow: '0 0 40px rgba(0,212,255,0.25), inset 0 0 20px rgba(0,212,255,0.05)' }}>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="w-12 h-12 text-cyan-400" style={{ filter: 'drop-shadow(0 0 12px rgba(0,212,255,0.7))' }} />
          </motion.div>
        </div>

        {/* Floating mini badges */}
        {[
          { label: 'AI', color: '#ff2d55', top: '-2rem', left: '4rem' },
          { label: 'OK', color: '#00ff88', top: '4rem',  left: '-2.5rem' },
          { label: '!',  color: '#ffb800', top: '5.5rem', left: '5rem' },
        ].map(({ label, color, top, left }) => (
          <motion.div
            key={label}
            className="absolute w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black font-mono border"
            style={{
              top, left, color,
              borderColor: `${color}50`,
              background: `${color}15`,
              boxShadow: `0 0 10px ${color}40`,
            }}
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2 + Math.random(), repeat: Infinity, ease: 'easeInOut', delay: Math.random() }}
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
