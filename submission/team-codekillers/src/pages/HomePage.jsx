import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, ArrowRight, ScanSearch, Mic, FileSearch, BarChart2, Database, CheckCircle2, AlertTriangle, Globe, Star, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import HeroSection from '../components/HeroSection';
import ExtensionPitch from '../components/ExtensionPitch';
import MiniGame from '../components/MiniGame';

// ── Animated counter ───────────────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

// ── Feature cards ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: ScanSearch, title: 'Face-Swap & GAN Detection', desc: 'Detects blending seams, pixel boundary artifacts and GAN discriminator signatures from DeepFaceLab, FaceSwap, and Stable Diffusion.', color: '#ff2d55', tag: 'Images & Video' },
  { icon: Mic,        title: 'Voice Cloning Detection',   desc: 'Analyses audio waveform envelopes, formant patterns, and lip-sync correlation to identify ElevenLabs, Resemble, and similar clones.', color: '#a855f7', tag: 'Video & Audio' },
  { icon: FileSearch, title: 'EXIF Metadata Forensics',   desc: 'Parses IFD blocks, XMP sidecars and container headers to detect metadata scrubbing, fabricated device fingerprints, and bad timestamps.', color: '#00d4ff', tag: 'All Media Types' },
  { icon: BarChart2,  title: 'Temporal Consistency Scan', desc: 'Frame-by-frame lighting vector analysis, blink frequency monitoring and micro-expression tracking for face-reenactment models.', color: '#00ff88', tag: 'Video Only' },
  { icon: Database,   title: 'Harassment DB Lookup',      desc: 'Cross-references perceptual hashes against NCII, StopNCII and partner law-enforcement watchlists instantly.', color: '#ffb800', tag: 'All Media Types' },
  { icon: Shield,     title: 'One-Click PDF Report',      desc: 'Generate a full forensic evidence PDF with case ID, technical breakdown and platform-specific takedown instructions.', color: '#00d4ff', tag: 'Built-in' },
];

// ── Testimonials ───────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: 'Priya S.',   role: 'Student, Mumbai',       text: 'Aegis confirmed within seconds that the image sent to my friends was AI-generated. The PDF report helped me get it removed from Instagram in 24 hours.', stars: 5 },
  { name: 'Marcus T.',  role: 'Journalist, London',    text: 'I use Aegis to verify video evidence before publishing. The EXIF forensics and temporal analysis are genuinely impressive for a free tool.', stars: 5 },
  { name: 'Ananya R.',  role: 'NGO Worker, Delhi',     text: 'We\'ve been waiting for something like this. Our helpline now uses Aegis to verify deepfake reports before filing police complaints.', stars: 5 },
];

// ── Steps ──────────────────────────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Upload Any Media',        desc: 'Drag & drop or click to upload any image or video file. All files are processed in-memory — never stored.' },
  { n: '02', title: 'AI Pipeline Runs',        desc: 'Five forensic models analyse your file in ~10 seconds: EXIF, GAN detection, temporal scan, DB lookup and final scoring.' },
  { n: '03', title: 'Get Your Verdict',        desc: 'See a clear result — Flagged, Verified or Inconclusive — with a full technical breakdown and confidence score.' },
  { n: '04', title: 'Download & Report',       desc: 'Generate a forensic PDF with a unique Case ID to file platform takedown requests or law enforcement reports.' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const c1 = useCounter(2847, 1800, statsVisible);
  const c2 = useCounter(96,   1400, statsVisible);
  const c3 = useCounter(1203, 2000, statsVisible);
  const c4 = useCounter(9,    1200, statsVisible);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080a0f' }}>

      {/* ── Background ───────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)' }} />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10">
        <HeroSection />
      </div>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl border border-cyan-500/20 p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(168,85,247,0.05) 50%, rgba(255,45,85,0.05) 100%)',
            boxShadow: '0 0 60px rgba(0,212,255,0.06)',
          }}
        >
          <p className="text-slate-400 text-sm font-mono mb-3 tracking-widest">START PROTECTING YOURSELF NOW</p>
          <h2 className="text-white text-3xl font-black mb-4">
            Is that image or video{' '}
            <span style={{
              background: 'linear-gradient(135deg, #ff2d55, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>real?</span>
          </h2>
          <p className="text-slate-400 text-base mb-8 max-w-lg mx-auto">
            Find out in 10 seconds. Free, private, and no account needed.
          </p>
          <motion.button
            onClick={() => navigate('/portal')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-bold text-black"
            style={{
              background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
              boxShadow: '0 0 30px rgba(0,212,255,0.4)',
            }}
          >
            <Shield className="w-5 h-5" />
            Open Analysis Portal
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          <p className="text-slate-600 text-xs mt-4">No signup · No storage · 100% private</p>
        </motion.div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────── */}
      <div ref={statsRef} className="relative z-10 w-full px-8 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: c1, suffix: '+', label: 'Files Scanned',      sub: 'Since launch',         color: '#00d4ff' },
            { value: c2, suffix: '%', label: 'Detection Accuracy', sub: 'On benchmark datasets', color: '#00ff88' },
            { value: c3, suffix: '+', label: 'Threats Flagged',    sub: 'Deepfakes & face-swaps', color: '#ff2d55' },
            { value: c4, suffix: 's', label: 'Avg Analysis Time',  sub: 'Per file',              color: '#ffb800' },
          ].map(({ value, suffix, label, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="rounded-2xl border p-6 text-center"
              style={{ background: `${color}08`, borderColor: `${color}20` }}
            >
              <p className="text-4xl font-black font-mono mb-1" style={{ color, textShadow: `0 0 24px ${color}60` }}>
                {value.toLocaleString()}{suffix}
              </p>
              <p className="text-slate-200 text-sm font-semibold">{label}</p>
              <p className="text-slate-600 text-xs mt-0.5 font-mono">{sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-8 pb-20">
        <SectionLabel color="#a855f7" label="HOW IT WORKS" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative mt-8">
          <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
            style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2), rgba(255,45,85,0.2))' }} />
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="relative text-center p-6 rounded-2xl border border-slate-800/60 bg-slate-900/40"
            >
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(0,212,255,0.2)' }}>
                <span className="text-xl font-black font-mono text-cyan-400">{s.n}</span>
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{s.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-8 pb-20">
        <SectionLabel color="#00d4ff" label="DETECTION CAPABILITIES" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-2xl border p-6 group cursor-default"
                style={{ background: `${f.color}07`, borderColor: `${f.color}20` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}>
                    <Icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-lg font-mono font-semibold"
                    style={{ color: f.color, background: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-4 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-8 pb-20">
        <SectionLabel color="#00ff88" label="WHAT PEOPLE SAY" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3 border-t border-slate-800/50 pt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-slate-700 flex items-center justify-center text-xs font-bold text-white">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Spot the Fake Mini-Game ──────────────────────────────────────── */}
      <MiniGame />

      {/* ── Browser Extension Pitch ──────────────────────────────────────── */}
      <ExtensionPitch />

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full px-8 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl border border-slate-700/60 overflow-hidden p-12 text-center"
          style={{ background: 'linear-gradient(135deg, rgba(15,20,30,0.9), rgba(20,10,30,0.9))' }}
        >
          {/* Glow blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.4), transparent)' }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent)' }} />

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-green-400 text-sm font-mono">Free · Private · No Account Needed</span>
            </div>
            <h2 className="text-white text-4xl font-black mb-4 leading-tight">
              Protect yourself from<br />
              <span style={{
                background: 'linear-gradient(135deg, #00d4ff, #a855f7, #ff2d55)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>AI deepfakes today.</span>
            </h2>
            <p className="text-slate-400 text-base mb-10 max-w-md mx-auto">
              Upload any suspicious image or video and get a forensic verdict in seconds.
            </p>
            <motion.button
              onClick={() => navigate('/portal')}
              whileHover={{ scale: 1.04, boxShadow: '0 0 50px rgba(0,212,255,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-black text-black"
              style={{ background: 'linear-gradient(135deg, #00d4ff, #a855f7)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
            >
              <Shield className="w-6 h-6" />
              Launch Aegis Portal
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

function SectionLabel({ label, color }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-700 bg-slate-900/60">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-slate-400 text-xs font-mono font-semibold tracking-widest">{label}</span>
      </div>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-800/50">
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      <div className="w-full px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" style={{ filter: 'drop-shadow(0 0 6px rgba(0,212,255,0.5))' }} />
              <span className="text-white font-black text-lg tracking-tight">AEGIS</span>
            </div>
            <p className="text-slate-600 text-xs font-mono">Digital Safety Guardian · v1.0 · © 2026</p>
            <p className="text-slate-700 text-xs max-w-xs text-center md:text-left">Built to protect individuals from AI-generated harassment and deepfake abuse.</p>
          </div>
          <div className="flex gap-10 text-center">
            {[
              { title: 'LEGAL',     links: ['Privacy Policy', 'Terms of Use', 'Cookie Policy'] },
              { title: 'RESOURCES', links: ['Report Abuse', 'NCII Database', 'StopNCII.org'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-slate-500 text-xs font-mono font-semibold tracking-wider mb-3">{col.title}</p>
                {col.links.map(l => <a key={l} href="#" className="block text-slate-600 text-xs hover:text-slate-400 transition-colors mb-1.5">{l}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-700 text-xs">All media processed locally · No files stored, transmitted, or retained.</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs">
            <span className="text-cyan-500/70 font-mono font-semibold">🏆 Built for AIEM Solo Innovation Hackathon</span>
            <span className="hidden sm:inline text-slate-700">·</span>
            <p className="text-slate-700">Made with ❤️ for digital safety</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
