import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  Timer, 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Zap, 
  Music, 
  Coffee, 
  Check, 
  Infinity as InfIcon,
  HelpCircle,
  Volume2,
  VolumeX
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

interface FocusModeProps {
  onNavigate: (view: string) => void;
}

export const FocusMode: React.FC<FocusModeProps> = ({ onNavigate }) => {
  const { user, profile, updateProfileStats } = useAuth();

  // Active configurations
  const [sessionType, setSessionType] = useState<"Focus" | "Short Break" | "Long Break">("Focus");
  const [totalSeconds, setTotalSeconds] = useState(25 * 60); // 25 mins Focus default
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  // Stats
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Audio helper simulation
  const [ambientHum, setAmbientHum] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Sync clock left whenever sessionType switches
  useEffect(() => {
    let minutes = 25;
    if (sessionType === "Short Break") minutes = 5;
    if (sessionType === "Long Break") minutes = 15;

    setTotalSeconds(minutes * 60);
    setSecondsLeft(minutes * 60);
    setIsActive(false);
  }, [sessionType]);

  // Main countdown stopwatch interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && secondsLeft === 0) {
      handleSessionCompletion();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  // Simulated ambient hum play (White/Brown noise synthesis via Web Audio API)
  useEffect(() => {
    if (ambientHum) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;

        // Formulate low-pass filter for soothing brown noise vibe
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(80, ctx.currentTime); // Deep humming target
        
        // Low pass filter
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(100, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        gain.gain.setValueAtTime(0.012, ctx.currentTime); // Keep very soft and non-disruptive
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } catch (err) {
        console.warn("Web Audio API not supported inside user browser environment:", err);
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
        } catch (e) {}
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          if (audioContextRef.current.state !== "closed") {
            audioContextRef.current.close();
          }
        } catch (e) {
          console.warn("Failed to close AudioContext:", e);
        }
        audioContextRef.current = null;
      }
      gainNodeRef.current = null;
    };
  }, [ambientHum]);

  const handleSessionCompletion = async () => {
    setIsActive(false);
    setAmbientHum(false);

    if (sessionType === "Focus") {
      setSessionsCompleted(prev => prev + 1);
      toast.success("Focus Session Complete! Commencing rewarding procedures...", { duration: 4000 });

      // Trigger stats upgrade back to Google Firestore storage
      if (user) {
        // study credit mapping (25 minutes = ~0.42 Hours studied credit)
        const hrsIncrement = 0.42; 
        const fpsIncrement = 5;

        try {
          await updateProfileStats(hrsIncrement, fpsIncrement);

          // Record study logs history to Firestore database
          await addDoc(collection(db, "analytics"), {
            ownerId: user.uid,
            date: new Date().toISOString().split("T")[0],
            hoursStudied: hrsIncrement,
            focusScore: (profile?.focusScore || 100) + fpsIncrement > 100 ? 100 : (profile?.focusScore || 100) + fpsIncrement,
            quizPerformance: 100, // Perfect focus evaluation rating
            completedAssignments: 0,
            createdAt: serverTimestamp()
          });

          toast.success("Profile score bumped: +5 FPS credit point & streak preserved!", { icon: "🔥" });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, "users");
        }
      }

      // Auto toggle Short Break transition helper
      setSessionType("Short Break");
    } else {
      toast.success("Break elapsed! Ready to jump back to focused study?", { icon: "💡" });
      setSessionType("Focus");
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setAmbientHum(false);
    let minutes = 25;
    if (sessionType === "Short Break") minutes = 5;
    if (sessionType === "Long Break") minutes = 15;
    setSecondsLeft(minutes * 60);
  };

  const formatTime = (secs: number) => {
    const min = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${min < 10 ? "0" : ""}${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // Calc circle stroke percentage mapping
  const strokePct = (secondsLeft / totalSeconds) * 283;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 select-none bg-[#0F172A] min-h-screen">
      
      {/* Header board */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Timer className="h-4 w-4 animate-spin" style={{ animationDuration: "12s" }} />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Immersive Isolated Room</span>
        </div>
        <h1 className="text-2xl font-black text-white">Focus Room & Pomodoro Core</h1>
        <p className="text-xs text-slate-450 mt-1">
          Isolate distraction factors. Completing active focus sessions increments profile hours, builds streaks, and increases analytics scoring.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Timer Gauge (Takes 7 columns in large screens) */}
        <div className="md:col-span-8 flex flex-col items-center">
          
          {/* Main stopwatch gauge container */}
          <div className="relative w-72 h-72 rounded-full border border-slate-800 bg-[#1E293B]/40 p-6 flex flex-col justify-center items-center shadow-[0_0_50px_rgba(99,102,241,0.06)] backdrop-blur-xl">
            
            {/* Circle ticking stroke layout svg */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="125"
                className="stroke-slate-900 fill-transparent"
                strokeWidth="4"
              />
              <circle
                cx="144"
                cy="144"
                r="125"
                className="stroke-indigo-500 fill-transparent transition-all"
                strokeWidth="4"
                strokeDasharray="785"
                strokeDashoffset={strokePct - 785}
              />
            </svg>

            {/* Inner dynamic readout */}
            <div className="relative text-center space-y-2 z-10">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-extrabold px-3 py-1 bg-indigo-500/10 border border-indigo-400/20 rounded-full">
                {sessionType}
              </span>
              <h1 className="text-5xl font-extrabold text-white font-mono tracking-tight pt-1">
                {formatTime(secondsLeft)}
              </h1>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide block">
                {ambientHum ? "Focus Wave Hum Active" : "Ambient sound muted"}
              </span>
            </div>

          </div>

          {/* Selector controllers */}
          <div className="flex space-x-2.5 mt-8 bg-slate-900/60 p-1 border border-slate-850 rounded-lg">
            {(["Focus", "Short Break", "Long Break"] as const).map(type => (
              <button
                key={type}
                onClick={() => setSessionType(type)}
                className={`px-3.5 py-1.5 rounded text-[10px] font-mono tracking-wider uppercase transition-all cursor-pointer ${
                  sessionType === type ? "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-500/10" : "text-slate-400 hover:text-white"
                }`}
              >
                {type === "Focus" ? "Study Focus" : type}
              </button>
            ))}
          </div>

        </div>

        {/* Right Info panels (Takes 5 columns in large screens) */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Active commands toggler */}
          <div className="rounded-3xl border border-slate-800 bg-[#1E293B]/35 p-6 space-y-5 shadow-[0_0_30px_rgba(99,102,241,0.02)]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Switches & Filters</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleTimer}
                className={`py-3.5 px-3 rounded-xl border.5 text-xs font-mono font-bold uppercase text-center cursor-pointer transition-all flex items-center justify-center space-x-1.5 ${
                  isActive 
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400" 
                    : "border-indigo-500/30 bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
                id="focus-play-btn"
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-white" />
                    <span>Start study</span>
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="py-3.5 px-3 rounded-xl border border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-mono font-bold uppercase text-center transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                id="focus-reset-btn"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Simulated Brown Hum speaker toggler */}
            <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-850 rounded-xl">
              <div className="flex items-center space-x-2.5">
                <Music className="h-4.5 w-4.5 text-slate-400" />
                <div>
                  <h4 className="text-xs font-bold text-slate-300">Ambient Sine Wave</h4>
                  <p className="text-[9px] text-slate-500">Filters distracting noises</p>
                </div>
              </div>
              
              <button
                onClick={() => setAmbientHum(!ambientHum)}
                className={`p-1.5 rounded transition-all cursor-pointer border ${
                  ambientHum 
                    ? "bg-indigo-500/15 border-indigo-400/40 text-indigo-400 animate-pulse" 
                    : "bg-slate-900 border-slate-850 text-slate-550 hover:text-slate-200"
                }`}
                id="focus-hum-toggle"
              >
                {ambientHum ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Active study log feedback points */}
          <div className="rounded-3xl border border-slate-800 bg-[#1E293B]/35 p-6 space-y-4 shadow-[0_0_30px_rgba(99,102,241,0.02)]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Academic Core Rewards</h3>
            <div className="space-y-3.5 text-xs text-slate-350">
              <div className="flex justify-between items-center">
                <span>Streak preserves:</span>
                <strong className="text-orange-400 flex items-center space-x-1 font-bold">
                  <Flame className="h-3.5 w-3.5 fill-orange-400" />
                  <span>{profile?.streak || 1} Days Active</span>
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Session Credit:</span>
                <strong className="text-emerald-400 font-bold">+0.42 Hours Study</strong>
              </div>
              <div className="flex justify-between items-center border-t border-slate-900 pt-3">
                <span className="text-slate-500 text-[10px]">Study loops ticked off today:</span>
                <span className="font-mono bg-slate-950 border border-slate-850 px-2.5 py-0.5 rounded text-[11px] font-extrabold text-indigo-400">
                  {sessionsCompleted} Done
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
