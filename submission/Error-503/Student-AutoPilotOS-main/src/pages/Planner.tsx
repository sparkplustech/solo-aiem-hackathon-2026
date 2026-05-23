import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, handleFirestoreError, OperationType } from "../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { generatePlan } from "../services/api";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { 
  Calendar, 
  Sparkles, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Plus, 
  X, 
  AlertTriangle,
  FolderMinus,
  CalendarDays,
  Bookmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";

interface PlannerProps {
  onNavigate: (view: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [subjects, setSubjects] = useState<string[]>(["Mathematics", "Computer Science", "Physics"]);
  const [newSubject, setNewSubject] = useState("");
  const [weakSubjects, setWeakSubjects] = useState<string[]>(["Physics"]);
  const [newWeakSubject, setNewWeakSubject] = useState("");
  const [examDates, setExamDates] = useState("Midterms start in 14 days");
  const [availableHours, setAvailableHours] = useState(4);

  // Generative result study plan
  const [planResult, setPlanResult] = useState<{
    subjects: string[];
    dailySchedule: { time: string; activity: string; notes: string }[];
    revisionPlan: { day: string; subject: string; topics: string; hours: number }[];
    subjectPriorities: { subject: string; priority: "High" | "Medium" | "Low"; reason: string }[];
  } | null>(null);
  const [saved, setSaved] = useState(false);

  const handleAddSubject = () => {
    if (!newSubject.trim()) return;
    if (subjects.includes(newSubject.trim())) {
      toast.error("Subject already cataloged!");
      return;
    }
    setSubjects(prev => [...prev, newSubject.trim()]);
    setNewSubject("");
  };

  const handleRemoveSubject = (sub: string) => {
    setSubjects(prev => prev.filter(s => s !== sub));
  };

  const handleAddWeakSubject = () => {
    if (!newWeakSubject.trim()) return;
    if (weakSubjects.includes(newWeakSubject.trim())) {
      toast.error("Weak subject already cataloged!");
      return;
    }
    setWeakSubjects(prev => [...prev, newWeakSubject.trim()]);
    setNewWeakSubject("");
  };

  const handleRemoveWeakSubject = (sub: string) => {
    setWeakSubjects(prev => prev.filter(s => s !== sub));
  };

  const handleFormulatePlan = async () => {
    if (subjects.length === 0) {
      toast.error("Please add at least one subject to prioritize academic structures!");
      return;
    }

    setLoading(true);
    setPlanResult(null);
    setSaved(false);

    try {
      const apiPlan = await generatePlan(subjects, examDates, availableHours, weakSubjects);
      setPlanResult(apiPlan);
      toast.success("AI Study plan activated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate dynamic planner map.");
    } finally {
      setLoading(false);
    }
  };

  const savePlanToFirebase = async () => {
    if (!user || !planResult || saving) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "planner"), {
        ownerId: user.uid,
        subjects: planResult.subjects,
        dailySchedule: planResult.dailySchedule,
        revisionPlan: planResult.revisionPlan,
        subjectPriorities: planResult.subjectPriorities,
        weakSubjects: weakSubjects,
        createdAt: serverTimestamp()
      });
      setSaved(true);
      toast.success("Current Planner cataloged securely inside your profile!");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, "planner");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 select-none bg-slate-950/10 min-h-screen">
      
      {/* Header board */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Calendar className="h-4 w-4" />
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Temporal Optimization</span>
        </div>
        <h1 className="text-2xl font-black text-white">Smart Study Planner</h1>
        <p className="text-xs text-slate-450 mt-1">
          AutoPilot's dynamic study planner maps your week's milestone deadlines against available hours to produce resilient schedules.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="rounded-2xl border border-slate-800 bg-slate-900/30 py-20 flex justify-center items-center"
          >
            <LoadingSpinner label="Formulating optimum academic agenda map..." />
          </motion.div>
        ) : !planResult ? (
          // Ingest Form
          <motion.div
            key="form"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
          >
            {/* Left Box: Subjects checklist management */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-2 border-b border-slate-900 pb-2">Academic Enlistment</h3>
              
              {/* Active subjects */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-slate-500">Course Syllabus Targets</label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-850 bg-slate-950/40 min-h-[50px]">
                  {subjects.map(s => (
                    <span key={s} className="inline-flex items-center space-x-1 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-2.5 py-1 rounded">
                      <span>{s}</span>
                      <button onClick={() => handleRemoveSubject(s)} className="hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2 pt-1.5">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="Add new course..."
                    className="flex-1 bg-slate-900 border border-slate-800/80 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-indigo-500/50"
                  />
                  <button onClick={handleAddSubject} className="bg-indigo-500 hover:bg-indigo-600 text-white rounded p-2 cursor-pointer"><Plus className="h-4.5 w-4.5" /></button>
                </div>
              </div>

              {/* Weak Subjects list */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-mono text-slate-500">Identified Difficult Areas</span>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-slate-850 bg-slate-950/40 min-h-[50px]">
                  {weakSubjects.map(w => (
                    <span key={w} className="inline-flex items-center space-x-1 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/15 px-2.5 py-1 rounded">
                      <span>{w}</span>
                      <button onClick={() => handleRemoveWeakSubject(w)} className="hover:text-white cursor-pointer"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2 pt-1.5">
                  <input
                    type="text"
                    value={newWeakSubject}
                    onChange={e => setNewWeakSubject(e.target.value)}
                    placeholder="Target weak syllabus area..."
                    className="flex-1 bg-slate-900 border border-slate-800/80 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:border-amber-500/50"
                  />
                  <button onClick={handleAddWeakSubject} className="bg-amber-500 hover:bg-amber-600 text-white rounded p-2 cursor-pointer"><Plus className="h-4.5 w-4.5" /></button>
                </div>
              </div>
            </div>

            {/* Right Box: milestones exam schedules & study speed constraints */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono mb-2 border-b border-slate-900 pb-2">Constraints & Milestones</h3>
              
              {/* Milestones prompt */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-mono text-slate-500 block">Exam Milestones & Dates</label>
                <input
                  type="text"
                  value={examDates}
                  onChange={e => setExamDates(e.target.value)}
                  placeholder="e.g. Finals start on 2026-06-15"
                  className="w-full bg-slate-900 border border-slate-800/80 rounded px-3 py-2 text-xs text-white placeholder-slate-550 focus:outline-none"
                  id="exam-dates-input"
                />
              </div>

              {/* Study Hours input */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] uppercase font-mono text-slate-500 flex justify-between">
                  <span>Target Available Daily Study (Hours)</span>
                  <span className="text-indigo-400 font-bold">{availableHours} Hrs/Day</span>
                </label>
                <div className="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-lg border border-slate-850">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={availableHours}
                    onChange={e => setAvailableHours(Number(e.target.value))}
                    className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    id="study-hours-range"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-850">
                <button
                  onClick={handleFormulatePlan}
                  className="rounded bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 px-6 py-3 text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2 cursor-pointer"
                  id="activate-plan-btn"
                >
                  <Sparkles className="h-4.5 w-4.5 animate-spin" />
                  <span>Synthesize Custom Agenda</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* High-Fidelity Timetables Output */
          <motion.div
            key="results"
            className="space-y-6"
          >
            {/* Save / command bar */}
            <div className="flex items-center justify-between bg-slate-900 border border-slate-850 p-4 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active agenda compiled</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPlanResult(null)}
                  className="text-[10px] font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded bg-slate-950 border border-slate-800 transition-all cursor-pointer"
                >
                  Configure Agenda Parameters
                </button>
                <button
                  onClick={savePlanToFirebase}
                  disabled={saved || saving}
                  className={`text-[10px] font-mono font-bold px-4.5 py-1.5 rounded transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer ${
                    saved 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                      : "bg-indigo-500 text-white hover:bg-indigo-600 border border-transparent shadow shadow-indigo-500/20"
                  }`}
                  id="save-plan-btn"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>{saved ? "Plan Cataloged" : "Catalog Active Plan"}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Daily Schedule grid (Takes 7 grids) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">High-Fidelity Daily Schedule</h3>
                  <div className="space-y-3">
                    {planResult.dailySchedule.map((sch, sIdx) => (
                      <div key={sIdx} className="bg-slate-950/50 border border-slate-900 rounded-xl p-3.5 flex items-start space-x-4">
                        <div className="bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold px-2 py-1 rounded border border-indigo-400/20 shrink-0">
                          {sch.time}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200">{sch.activity}</h4>
                          <p className="text-[10px] text-slate-450 mt-1">{sch.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority and revision parameters (Takes 5 grids) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Subject Priorities Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2 font-semibold">Priority Syllabus Matrix</h3>
                  <div className="space-y-3">
                    {planResult.subjectPriorities.map((prior, pIdx) => {
                      const isHigh = prior.priority === "High";
                      const isMedium = prior.priority === "Medium";
                      
                      let badgeClasses = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                      if (isMedium) badgeClasses = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                      if (prior.priority === "Low") badgeClasses = "bg-slate-900 text-slate-400 border-slate-800";

                      return (
                        <div key={pIdx} className="bg-slate-950/40 p-3 rounded-lg border border-slate-900/60 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-200">{prior.subject}</span>
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badgeClasses}`}>
                              {prior.priority}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-normal font-sans">{prior.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Revision Plan */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-900 pb-2">Target Revision Milestone</h3>
                  <div className="space-y-2.5">
                    {planResult.revisionPlan.map((rev, rIdx) => (
                      <div key={rIdx} className="flex justify-between items-center text-xs p-2 rounded hover:bg-slate-900 transition-all">
                        <div>
                          <strong className="text-[10px] font-mono text-indigo-400">{rev.day}</strong>
                          <h5 className="text-[11px] font-bold text-slate-200 mt-0.5">{rev.subject} - {rev.topics}</h5>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold">{rev.hours} Hrs</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
