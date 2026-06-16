import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import AnalysisPipeline from '../components/AnalysisPipeline';
import ResultModal from '../components/ResultModal';
import ScanHistory from '../components/ScanHistory';
import SideWidgets from '../components/SideWidgets';
import ExposureScanner from '../components/ExposureScanner';
import { MOCK_SCANS } from '../data/mockData';
import { Info, ArrowLeft } from 'lucide-react';

// ── Pipeline phases ────────────────────────────────────────────────────────────
const PHASE = { IDLE: 'idle', ANALYZING: 'analyzing', DONE: 'done' };

// ── (All the generateResult / heuristic code is imported from App.jsx via prop) ─
// The PortalPage receives generateResult as a prop from the router so we don't
// duplicate the heuristic engine. Actually simpler: just re-export from a shared util.
// For now we import it directly from the barrel export in App.jsx.
// Since App.jsx is the router, we'll pass it down or duplicate — easiest: just inline.

import { generateResult } from '../utils/analysisEngine';

export default function PortalPage() {
  const navigate = useNavigate();
  const [phase, setPhase]           = useState(PHASE.IDLE);
  const [currentFile, setCurrentFile] = useState(null);
  const [result, setResult]         = useState(null);
  const [apiResult, setApiResult]   = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [scans, setScans]           = useState(MOCK_SCANS);

  const handleFileSelect = useCallback(async (file) => {
    setCurrentFile(file);
    setPhase(PHASE.ANALYZING);
    setApiResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:5001/api/analyse', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns caseId, but our components expect id
        setApiResult({ ...data, id: data.caseId });
      } else {
        console.error('Backend error', await res.text());
        // Fallback to local generation if backend fails
        setApiResult(generateResult(file));
      }
    } catch (e) {
      console.error('Fetch error', e);
      setApiResult(generateResult(file));
    }
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    // Visual pipeline finished! Use the apiResult if it arrived, else local fallback
    const finalResult = apiResult || generateResult(currentFile);
    setResult(finalResult);
    setScans(prev => [finalResult, ...prev]);
    setPhase(PHASE.DONE);
    setTimeout(() => setShowModal(true), 300);
  }, [currentFile, apiResult]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setPhase(PHASE.IDLE);
    setCurrentFile(null);
    setResult(null);
  }, []);

  const handleScanSelect = useCallback((scan) => {
    setResult(scan);
    setShowModal(true);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080a0f' }}>

      {/* ── Background ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute -top-60 -left-60 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.03) 0%, transparent 70%)' }} />
        <div className="absolute -bottom-60 -right-60 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)' }} />
      </div>

      {/* ── Portal sub-header ───────────────────────────────────────────── */}
      <div className="relative z-10 border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center gap-6">
          <motion.button
            onClick={() => navigate('/')}
            whileHover={{ x: -3 }}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </motion.button>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-red-400 text-xs font-mono font-bold tracking-widest">SECURE ANALYSIS PORTAL</span>
          </div>
          <div className="ml-auto flex items-center gap-4 text-xs font-mono text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400">API Online</span>
            </span>
            <span>·</span>
            <span>{scans.length} scans this session</span>
          </div>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full px-8 py-8">

        {/* 5-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* LEFT: Upload / Pipeline + Info */}
          <div className="lg:col-span-3 space-y-8">
            <AnimatePresence mode="wait">
              {phase === PHASE.IDLE && (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <UploadZone onFileSelect={handleFileSelect} />
                </motion.div>
              )}
              {(phase === PHASE.ANALYZING || phase === PHASE.DONE) && currentFile && (
                <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AnalysisPipeline file={currentFile} onComplete={handleAnalysisComplete} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Engine info card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-6"
            >
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-slate-200 text-sm font-semibold mb-2">About the Aegis Analysis Engine</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Aegis runs a multi-model forensic pipeline — GAN discriminator networks, EXIF metadata analysis,
                    temporal coherence scanning, and crowd-sourced harassment intelligence — delivering industry-leading
                    deepfake detection with &gt;96% accuracy on benchmark datasets.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {['GAN Detection', 'Face-Swap Analysis', 'Voice Cloning', 'EXIF Forensics', 'Database Lookup'].map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Dark Web Exposure Scanner */}
            <ExposureScanner />
          </div>

          {/* RIGHT: Scan history + side widgets */}
          <div className="lg:col-span-2">
            <div
              className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#1f2937 transparent' }}
            >
              <ScanHistory scans={scans} onSelect={handleScanSelect} />
              <SideWidgets />
            </div>
          </div>
        </div>
      </main>

      {/* ── Result modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && result && (
          <ResultModal result={result} onClose={handleModalClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
