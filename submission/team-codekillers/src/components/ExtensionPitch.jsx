import { motion } from 'framer-motion';
import { AppWindow, Shield, EyeOff, Bell, ArrowRight } from 'lucide-react';

export default function ExtensionPitch() {
  return (
    <div className="relative z-10 w-full px-8 pb-24">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-orange-400 text-xs font-mono font-semibold tracking-widest">PRODUCT ROADMAP</span>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-slate-700/60 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(15,20,30,0.9), rgba(10,15,25,0.9))' }}
      >
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.4), transparent)' }} />

        <div className="flex flex-col items-center text-center p-8 lg:p-16 relative z-10">
          
          {/* Top Content */}
          <div className="max-w-3xl flex flex-col items-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-5 py-2 rounded-full border border-orange-500/30 bg-orange-500/10">
              <AppWindow className="w-6 h-6 text-orange-400" />
              <span className="text-orange-400 font-mono text-base font-bold tracking-widest">COMING SOON</span>
            </div>
            <h2 className="text-white text-4xl md:text-5xl font-black mb-6 leading-tight">
              Aegis for Chrome.<br />
              <span className="text-slate-400">Protection on autopilot.</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
              Don't wait until you're suspicious. The Aegis browser extension seamlessly integrates into Twitter, Instagram, and WhatsApp Web. It automatically scans images in your feed and blurs malicious deepfakes before you even see them.
            </p>

            <ul className="flex flex-wrap justify-center gap-6 mb-10">
              {[
                { icon: EyeOff, text: 'Auto-blur malicious media' },
                { icon: Shield, text: 'Real-time GAN scanning' },
                { icon: Bell, text: 'Instant targeted alerts' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 bg-slate-900/50 border border-slate-700/50 px-4 py-2 rounded-xl">
                  <item.icon className="w-5 h-5 text-cyan-400" />
                  <span className="text-slate-300 text-sm font-medium">{item.text}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button className="px-8 py-4 rounded-xl bg-slate-100 hover:bg-white text-black font-bold text-base transition-colors flex items-center gap-3">
                Join the Waitlist
                <ArrowRight className="w-5 h-5" />
              </button>
              <span className="text-slate-500 text-sm font-mono mt-2 sm:mt-0">1,402 currently in line</span>
            </div>
          </div>

          {/* Bottom Content: Browser Mockup */}
          <div className="relative w-full max-w-4xl mx-auto mt-4">
            <div className="rounded-xl border border-slate-700/80 bg-slate-900/80 overflow-hidden shadow-2xl">
              {/* Browser Bar */}
              <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="ml-4 w-64 h-6 bg-slate-800/50 rounded flex items-center px-3">
                  <span className="text-slate-500 text-xs font-mono">twitter.com/feed</span>
                </div>
              </div>
              
              {/* Browser Content */}
              <div className="p-6 md:p-10 text-left">
                {/* Fake Tweet 1 */}
                <div className="flex gap-4 mb-8 opacity-40">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0" />
                  <div className="flex-1 space-y-3 pt-1">
                    <div className="w-40 h-3 bg-slate-800 rounded" />
                    <div className="w-full h-2 bg-slate-800 rounded" />
                    <div className="w-5/6 h-2 bg-slate-800 rounded" />
                  </div>
                </div>

                {/* Fake Tweet 2 (Blocked) */}
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 pt-1">
                    <div className="w-32 h-3 bg-slate-700 rounded mb-4" />
                    
                    {/* Blocked Media Container */}
                    <div className="w-full max-w-2xl aspect-video rounded-xl border border-red-500/30 bg-red-500/5 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA0IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50" />
                      
                      <div className="relative z-10 w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-red-400" />
                      </div>
                      <p className="relative z-10 text-red-400 font-bold text-lg mb-1">
                        Malicious Deepfake Blocked
                      </p>
                      <p className="relative z-10 text-red-400/70 text-sm mb-5">
                        Aegis detected 98% GAN artifacts in this media.
                      </p>
                      <button className="relative z-10 px-6 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-sm font-semibold border border-red-500/30 transition-colors">
                        View Anyway
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Floating Extension Icon Badge */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 md:-right-10 w-24 h-24 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex items-center justify-center z-20"
              style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.5), 0 0 20px rgba(0,212,255,0.2)' }}
            >
              <Shield className="w-12 h-12 text-cyan-400" />
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-orange-500 border-2 border-slate-900" />
            </motion.div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
