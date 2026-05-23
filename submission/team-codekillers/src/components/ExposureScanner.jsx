import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShieldCheck, AlertOctagon, Loader2, Globe, Database } from 'lucide-react';

export default function ExposureScanner() {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle, scanning, safe, flagged

  const handleScan = () => {
    if (!input.trim()) return;
    
    setStatus('scanning');
    
    // Simulate API delay for dramatic effect
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      // Hardcoded "demo" logic for the hackathon
      if (lowerInput.includes('demo') || lowerInput.includes('target')) {
        setStatus('flagged');
      } else {
        setStatus('safe');
      }
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-6 mt-8 overflow-hidden relative"
    >
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Globe className="w-5 h-5 text-purple-400" />
        </div>
        
        <div className="flex-1 w-full">
          <h4 className="text-white text-base font-bold mb-1">Dark Web Exposure Scanner</h4>
          <p className="text-slate-400 text-sm mb-4">
            Proactively check if your likeness has been targeted on known deepfake forums or illicit NCII databases.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono">
                @
              </span>
              <input
                type="text"
                placeholder="instagram_handle or email"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && status !== 'scanning' && handleScan()}
                disabled={status === 'scanning'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
              />
            </div>
            <button
              onClick={handleScan}
              disabled={status === 'scanning' || !input.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {status === 'scanning' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Scan Now
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {status === 'scanning' && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 text-xs font-mono text-purple-400/80 bg-purple-500/5 px-4 py-2.5 rounded-lg border border-purple-500/10"
              >
                <Database className="w-3.5 h-3.5 animate-pulse" />
                <span className="animate-pulse">Querying StopNCII & Dark Web OSINT nodes...</span>
              </motion.div>
            )}

            {status === 'safe' && (
              <motion.div
                key="safe"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/10"
              >
                <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-green-400 font-semibold text-sm">Safe — No Exposure Found</p>
                  <p className="text-green-500/80 text-xs mt-1">
                    Your handle ({input}) does not appear in any known digital harassment or synthetic media databases.
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'flagged' && (
              <motion.div
                key="flagged"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10"
              >
                <AlertOctagon className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-semibold text-sm">Warning — Potential Matches Found</p>
                  <p className="text-red-500/80 text-xs mt-1 mb-2">
                    Aegis found 2 potential instances of synthetic media associated with this target profile on illicit networks.
                  </p>
                  <button className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded border border-red-500/20 transition-colors">
                    Generate Takedown Request
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
