import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, AlertTriangle, CheckCircle2, AlertCircle, FileText,
  Download, ExternalLink, Shield, Eye, Layers, Clock,
  Database, BarChart3, ChevronDown, ChevronRight, Copy, Check,
  Cpu, Hash, Zap
} from 'lucide-react';
import { generateForensicPDF } from '../utils/generatePDF';

export default function ResultModal({ result, onClose }) {
  const [reportGenerated, setReportGenerated] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSection, setExpandedSection] = useState('verdict');

  const isFlagged = result.status === 'flagged';
  const isVerified = result.status === 'verified';
  const isInconclusive = result.status === 'inconclusive';

  const scoreColor = isFlagged ? '#ff2d55' : isVerified ? '#00ff88' : '#ffb800';
  const scoreBg = isFlagged ? 'rgba(255,45,85,0.1)' : isVerified ? 'rgba(0,255,136,0.08)' : 'rgba(255,184,0,0.08)';
  const scoreBorder = isFlagged ? 'rgba(255,45,85,0.3)' : isVerified ? 'rgba(0,255,136,0.3)' : 'rgba(255,184,0,0.3)';
  const scoreGlow = isFlagged ? 'rgba(255,45,85,0.4)' : isVerified ? 'rgba(0,255,136,0.4)' : 'rgba(255,184,0,0.4)';

  // Stable caseId — generated once per modal open, never changes on re-render
  const caseIdRef = useRef(
    `AGS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  );
  const caseId = caseIdRef.current;

  const handleGenerateReport = () => {
    setGeneratingReport(true);
    setTimeout(() => {
      setGeneratingReport(false);
      setReportGenerated(true);
      // Auto-download the PDF as soon as compilation animation finishes
      try {
        generateForensicPDF(result, caseId);
      } catch (e) {
        console.error('PDF generation failed:', e);
      }
    }, 2800);
  };

  const handleDownload = useCallback(() => {
    try {
      generateForensicPDF(result, caseId);
    } catch (e) {
      console.error('PDF generation failed:', e);
    }
  }, [result, caseId]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const forensicSections = [
    { id: 'exif', icon: Hash, label: 'EXIF & Metadata Analysis', content: result.forensics.exif },
    { id: 'face', icon: Layers, label: 'Facial Blending & GAN Detection', content: result.forensics.faceBlend },
    { id: 'temporal', icon: Clock, label: 'Temporal Consistency Scan', content: result.forensics.temporal },
    { id: 'database', icon: Database, label: 'Harassment Database Query', content: result.forensics.database },
    { id: 'verdict', icon: Eye, label: 'Final Forensic Verdict', content: result.forensics.verdict },
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border"
          style={{
            background: '#0d1117',
            borderColor: scoreBorder,
            boxShadow: `0 0 60px ${scoreGlow}, 0 0 120px ${scoreGlow.replace('0.4', '0.1')}`,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          {/* Top accent line */}
          <div className="h-1 w-full rounded-t-2xl" style={{
            background: isFlagged
              ? 'linear-gradient(90deg, #ff2d55, #ff6b35)'
              : isVerified
              ? 'linear-gradient(90deg, #00ff88, #00d4ff)'
              : 'linear-gradient(90deg, #ffb800, #ff6b35)',
          }} />

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: scoreBg, border: `1px solid ${scoreBorder}` }}>
                {isFlagged ? (
                  <AlertTriangle className="w-5 h-5" style={{ color: scoreColor }} />
                ) : isVerified ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: scoreColor }} />
                ) : (
                  <AlertCircle className="w-5 h-5" style={{ color: scoreColor }} />
                )}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Forensic Analysis Complete</h2>
                <p className="text-slate-500 text-xs font-mono mt-0.5">Case ID: {caseId}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Score card */}
            <div className="rounded-xl border p-5" style={{ background: scoreBg, borderColor: scoreBorder }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-slate-400 text-xs font-mono mb-1">AUTHENTICITY SCORE</p>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-black font-mono" style={{ color: scoreColor, textShadow: `0 0 20px ${scoreColor}` }}>
                      {result.score}%
                    </span>
                    <span className="text-slate-400 text-sm mb-2">
                      {isFlagged ? 'AI Probability' : isVerified ? 'AI Probability' : 'Confidence'}
                    </span>
                  </div>
                </div>

                {/* Radial gauge */}
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.score / 100)}`}
                      initial={{ strokeDashoffset: `${2 * Math.PI * 40}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 40 * (1 - result.score / 100)}` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
                      style={{ filter: `drop-shadow(0 0 6px ${scoreColor})` }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold font-mono" style={{ color: scoreColor }}>
                      {isFlagged ? '⚠' : isVerified ? '✓' : '?'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status label */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: scoreColor }} />
                <span className="text-sm font-semibold" style={{ color: scoreColor }}>{result.label}</span>
              </div>

              {/* Metadata strip */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  { label: 'FILE', value: result.filename },
                  { label: 'PLATFORM', value: result.platform },
                  { label: 'SIZE', value: result.size },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-black/30 px-3 py-2">
                    <p className="text-slate-600 text-xs font-mono">{label}</p>
                    <p className="text-slate-300 text-xs font-medium truncate mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Forensic breakdown */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="text-white font-semibold text-sm">Forensic Breakdown</h3>
                <div className="h-px flex-1 bg-slate-800" />
              </div>

              <div className="space-y-2">
                {forensicSections.map(({ id, icon: Icon, label, content }) => (
                  <div key={id} className="rounded-xl border border-slate-800 overflow-hidden">
                    <button
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/50 transition-colors text-left"
                      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <span className="text-slate-200 text-sm font-medium flex-1">{label}</span>
                      {expandedSection === id
                        ? <ChevronDown className="w-4 h-4 text-slate-500" />
                        : <ChevronRight className="w-4 h-4 text-slate-500" />
                      }
                    </button>
                    <AnimatePresence>
                      {expandedSection === id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-1">
                            <div className="rounded-lg bg-slate-950/60 border border-slate-800/60 p-3 relative group">
                              <p className="text-slate-300 text-xs font-mono leading-relaxed">{content}</p>
                              <button
                                onClick={() => handleCopy(content, id)}
                                className="absolute top-2 right-2 w-6 h-6 rounded bg-slate-800/60 hover:bg-slate-700 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                              >
                                {copiedId === id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Takedown Report */}
              {!reportGenerated ? (
                <motion.button
                  className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all"
                  style={{
                    background: isFlagged
                      ? 'linear-gradient(135deg, rgba(255,45,85,0.2), rgba(255,107,53,0.15))'
                      : 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
                    border: `1px solid ${isFlagged ? 'rgba(255,45,85,0.4)' : 'rgba(0,212,255,0.3)'}`,
                    color: isFlagged ? '#ff2d55' : '#00d4ff',
                    boxShadow: generatingReport ? `0 0 20px ${scoreGlow}` : 'none',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                >
                  {generatingReport ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Cpu className="w-5 h-5" />
                      </motion.div>
                      <span>Compiling Forensic Evidence...</span>
                      <motion.span
                        className="font-mono text-xs"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        ▋
                      </motion.span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Generate Takedown Report
                      <span className="text-xs opacity-60 ml-1">· PDF for Instagram / WhatsApp</span>
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold text-sm">Takedown Report Generated</span>
                    </div>
                    <span className="text-emerald-500 text-xs font-mono">{caseId}.pdf</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                    Your forensic report contains case ID, authenticity score, technical evidence, and platform-specific reporting instructions for expedited content removal.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      Platform Guide
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Scan Another File
                </button>
                <button className="py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Save to Case File
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
