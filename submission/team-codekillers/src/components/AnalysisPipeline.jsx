import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Clock, ChevronRight, Cpu, Database, Eye, Layers, BarChart3 } from 'lucide-react';
import { ANALYSIS_STEPS } from '../data/mockData';

const STEP_ICONS = [Eye, Layers, Clock, Database, BarChart3];

export default function AnalysisPipeline({ file, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);

  useEffect(() => {
    if (!file) return;
    let stepIdx = 0;
    let totalTime = ANALYSIS_STEPS.reduce((s, step) => s + step.duration, 0);
    let elapsed = 0;

    const runStep = (idx) => {
      if (idx >= ANALYSIS_STEPS.length) {
        setTimeout(() => onComplete(), 400);
        return;
      }
      setCurrentStep(idx);
      setStepProgress(0);

      const step = ANALYSIS_STEPS[idx];
      const startElapsed = elapsed;
      const startTime = Date.now();
      let animFrame;

      const tick = () => {
        const delta = Date.now() - startTime;
        const sp = Math.min(100, (delta / step.duration) * 100);
        setStepProgress(sp);
        const overallPct = Math.min(100, ((startElapsed + (delta / step.duration) * step.duration) / totalTime) * 100);
        setProgress(overallPct);

        if (delta < step.duration) {
          animFrame = requestAnimationFrame(tick);
        } else {
          elapsed += step.duration;
          setCompletedSteps((prev) => [...prev, idx]);
          runStep(idx + 1);
        }
      };

      animFrame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(animFrame);
    };

    const cleanup = runStep(0);
    return cleanup;
  }, [file, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Analysis Pipeline</h3>
            <p className="text-slate-500 text-xs font-mono">AEGIS-FORENSIC-v4.2.1</p>
          </div>
        </div>
        {/* File badge */}
        <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 max-w-[200px] truncate">
          <p className="text-slate-300 text-xs font-mono truncate">{file?.name}</p>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="px-6 py-3 border-b border-slate-800/50 bg-slate-900/30">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-mono">OVERALL PROGRESS</span>
          <span className="text-cyan-400 font-mono font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
              boxShadow: '0 0 10px rgba(0,212,255,0.5)',
            }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-6 space-y-4">
        {ANALYSIS_STEPS.map((step, idx) => {
          const Icon = STEP_ICONS[idx];
          const isCompleted = completedSteps.includes(idx);
          const isActive = currentStep === idx && !isCompleted;
          const isPending = idx > currentStep || (idx === currentStep && isCompleted);
          const isDone = isCompleted;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: isPending && !isDone ? 0.35 : 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`rounded-xl border p-4 transition-all duration-500 ${
                isActive
                  ? 'border-cyan-500/40 bg-cyan-500/5'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-slate-800 bg-slate-900/30'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step icon / status */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isDone
                    ? 'bg-emerald-500/20 border border-emerald-500/30'
                    : isActive
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-slate-800 border border-slate-700'
                }`}>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-slate-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-semibold ${
                      isDone ? 'text-emerald-300' : isActive ? 'text-white' : 'text-slate-500'
                    }`}>
                      {step.label}
                    </p>
                    {isDone && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded flex-shrink-0"
                      >
                        DONE
                      </motion.span>
                    )}
                    {isActive && (
                      <span className="text-xs font-mono text-cyan-400 flex-shrink-0">
                        {Math.round(stepProgress)}%
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                    {step.subLabel}
                  </p>

                  {/* Step progress bar */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2.5"
                    >
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            width: `${stepProgress}%`,
                            background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                            boxShadow: '0 0 8px rgba(0,212,255,0.6)',
                          }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      {/* Live feed text */}
                      <motion.p
                        className="text-xs font-mono text-cyan-500/70 mt-1.5 truncate"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        &gt; {getLiveText(idx, stepProgress)}
                      </motion.p>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-6 pb-4 text-center">
        <p className="text-slate-600 text-xs font-mono">
          ⚡ Running on-device — zero data transmitted externally
        </p>
      </div>
    </motion.div>
  );
}

function getLiveText(stepIdx, pct) {
  const lines = [
    ['Mounting file buffer...', 'Parsing EXIF IFD blocks...', 'Extracting GPS tags...', 'Scanning for metadata scrub signatures...'],
    ['Loading facial landmark model...', 'Running GAN discriminator pass...', 'Analyzing blending seam frequencies...', 'Mapping DCT coefficient anomalies...'],
    ['Sampling keyframes 1–30...', 'Measuring lighting vector consistency...', 'Detecting micro-expression suppression...', 'Correlating blink interval data...'],
    ['Hashing content fingerprint...', 'Querying NCII database...', 'Cross-referencing harassment watchlists...', 'Checking law enforcement flags...'],
    ['Aggregating model outputs...', 'Computing Bayesian confidence score...', 'Applying safety threshold...', 'Finalizing verdict...'],
  ][stepIdx] || ['Processing...'];
  const i = Math.min(lines.length - 1, Math.floor((pct / 100) * lines.length));
  return lines[i];
}
