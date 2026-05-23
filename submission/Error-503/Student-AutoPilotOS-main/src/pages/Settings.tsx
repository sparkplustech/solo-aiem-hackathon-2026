import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { 
  Settings as SettingsIcon, 
  User, 
  Trash2, 
  TrendingDown, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Sliders,
  LogOut,
  Infinity as InfIcon,
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Clock
} from "lucide-react";
import { motion } from "motion/react";
import toast from "react-hot-toast";

interface SettingsProps {
  onNavigate: (view: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { user, profile, updateProfileStats, logout } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [level, setLevel] = useState("Undergraduate - Year 2");
  const [updating, setUpdating] = useState(false);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !user) return;

    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim()
      });
      toast.success("Profile moniker updated successfully!");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetMetrics = async () => {
    const confirm = window.confirm("Are you sure you want to reset your local study telemetry? This will clear study hours and focus scores.");
    if (!confirm || !user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        streak: 1,
        focusScore: 100,
        totalStudyHours: 0
      });
      toast.success("Syllabus telemetry reset initiated.");
      window.location.reload();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, "users");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 select-none bg-slate-950/10 min-h-screen">
      
      {/* Header board */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <SettingsIcon className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold font-semibold">Workspace Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-white">OS Settings</h1>
        <p className="text-xs text-slate-450 mt-1">
          Manage academic identity handles, wipe diagnostic scores, or configure local telemetry weights.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Profile Card details edit */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Student Moniker Edit</h3>
          
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={profile?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"}
                alt="Profile Avatar"
                className="h-14 w-14 rounded-full border border-indigo-500/20"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-200">{profile?.displayName}</h4>
                <p className="text-[10px] font-mono text-slate-500">{level}</p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Moniker Handlers</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Student Name"
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                id="settings-displayname-input"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Academic Enlistment Rating</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-slate-300 focus:outline-none appearance-none"
              >
                <option>Undergraduate - Year 1</option>
                <option>Undergraduate - Year 2</option>
                <option>Postgraduate Research</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full rounded bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-mono text-[10px] font-bold uppercase py-2.5 transition-all text-center cursor-pointer"
              id="settings-save-profile"
            >
              {updating ? "Saving Moniker..." : "Commit Identity"}
            </button>
          </form>
        </div>

        {/* Database administration & clear logs */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Academic Core Diagnostics</h3>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleResetMetrics}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-850 hover:border-red-500/20 text-left transition-all group cursor-pointer"
                id="settings-reset-metrics"
              >
                <div className="flex items-center space-x-3 text-xs leading-normal">
                  <RefreshCw className="h-4.5 w-4.5" />
                  <div>
                    <h4 className="text-xs font-bold">Wipe Local Study Telemetry</h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Clears streak counter metrics models</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onNavigate("landing");
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-950/40 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-left transition-all cursor-pointer"
                id="settings-logout"
              >
                <div className="flex items-center space-x-3 text-xs leading-normal">
                  <LogOut className="h-4.5 w-4.5" />
                  <div>
                    <h4 className="text-xs font-bold">Exit Operating System</h4>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">Disconnect academic browser token caches</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Secure Firebase specification disclaimer indicator */}
          <div className="rounded-xl border border-slate-850 p-4 bg-slate-950/40 space-y-1.5 flex items-start space-x-2.5">
            <Cpu className="h-5 w-5 text-indigo-400 shrink-0" />
            <div className="text-[10px] text-slate-500 font-mono leading-normal select-text">
              <p className="font-bold text-slate-450 uppercase mb-0.5">AutoPilot OS Security specifications</p>
              Your student profile variables, summaries index database, and assignments metadata lists are actively protected by Firebase Security Rules with Zero-Trust constraints.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
